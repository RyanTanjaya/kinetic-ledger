import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

const STATUS_TO_DB: Record<string, 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE'> = {
  Draft: 'DRAFT',
  Sent: 'SENT',
  Paid: 'PAID',
  Overdue: 'OVERDUE',
};

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const createSchema = z.object({
  clientId: z.string().min(1),
  issueDate: z.string().optional(),
  dueDate: z.string(),
  notes: z.string().optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue']).optional(),
  items: z.array(itemSchema).min(1, 'At least one line item is required'),
});

// GET /api/invoices?status=&clientId=
router.get('/', async (req, res) => {
  const where: { userId: string; clientId?: string; status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' } = {
    userId: req.userId!,
  };
  if (typeof req.query.clientId === 'string') where.clientId = req.query.clientId;
  if (typeof req.query.status === 'string' && STATUS_TO_DB[req.query.status]) {
    where.status = STATUS_TO_DB[req.query.status];
  }
  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { issuedAt: 'desc' },
    include: { client: true, items: true },
  });
  res.json({ invoices });
});

// POST /api/invoices  (auto invoice number + server-side totals)
router.post('/', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { clientId, issueDate, dueDate, notes, status, items } = parsed.data;

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: req.userId! },
    select: { id: true },
  });
  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  // Next invoice number for this user: max existing numeric suffix + 1.
  const existing = await prisma.invoice.findMany({
    where: { userId: req.userId! },
    select: { invoiceNumber: true },
  });
  let maxNum = 0;
  for (const e of existing) {
    const m = e.invoiceNumber.match(/(\d+)/);
    if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
  }
  const invoiceNumber = `INV-${String(maxNum + 1).padStart(3, '0')}`;
  const total = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  const invoice = await prisma.invoice.create({
    data: {
      user: { connect: { id: req.userId! } },
      client: { connect: { id: clientId } },
      invoiceNumber,
      status: status ? STATUS_TO_DB[status] : 'DRAFT',
      totalAmount: total,
      issuedAt: issueDate ? new Date(issueDate) : new Date(),
      dueDate: new Date(dueDate),
      notes: notes ?? null,
      items: {
        create: items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.quantity * it.unitPrice,
        })),
      },
    },
    include: { items: true, client: true },
  });
  res.status(201).json({ invoice });
});

// GET /api/invoices/:id
router.get('/:id', async (req, res) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { items: true, client: true },
  });
  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }
  res.json({ invoice });
});

// PATCH /api/invoices/:id/mark-paid
router.patch('/:id/mark-paid', async (req, res) => {
  const owned = await prisma.invoice.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true },
  });
  if (!owned) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: 'PAID', paidAt: new Date() },
  });
  res.json({ invoice });
});

// DELETE /api/invoices/:id  (drafts only)
router.delete('/:id', async (req, res) => {
  const inv = await prisma.invoice.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true, status: true },
  });
  if (!inv) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }
  if (inv.status !== 'DRAFT') {
    res.status(400).json({ error: 'Only draft invoices can be deleted' });
    return;
  }
  await prisma.invoice.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
