import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Mounted behind requireAuth, so req.userId is always set here.
const router = Router();

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().optional(),
  phone: z.string().optional(),
});

// GET /api/clients?search=
router.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const clients = await prisma.client.findMany({
    where: {
      userId: req.userId!,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { projects: true } } },
  });
  res.json({ clients });
});

// POST /api/clients
router.post('/', async (req, res) => {
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const { name, email, company, phone } = parsed.data;
  const client = await prisma.client.create({
    data: {
      userId: req.userId!,
      name,
      email: email || null,
      company: company || null,
      phone: phone || null,
    },
  });
  res.status(201).json({ client });
});

// GET /api/clients/:id  (with projects + recent invoices)
router.get('/:id', async (req, res) => {
  const client = await prisma.client.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: {
      projects: { orderBy: { createdAt: 'desc' } },
      invoices: { orderBy: { issuedAt: 'desc' }, take: 10 },
    },
  });
  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }
  res.json({ client });
});

// PUT /api/clients/:id
router.put('/:id', async (req, res) => {
  const parsed = clientSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  // Verify ownership before mutating.
  const owned = await prisma.client.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true },
  });
  if (!owned) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }
  const client = await prisma.client.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json({ client });
});

// DELETE /api/clients/:id  (cascades to projects, time entries, invoices)
router.delete('/:id', async (req, res) => {
  const owned = await prisma.client.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true },
  });
  if (!owned) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }
  await prisma.client.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
