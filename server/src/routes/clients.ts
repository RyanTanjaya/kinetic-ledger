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

  // Sum PAID invoices per client for the "total billed" column.
  const billed = await prisma.invoice.groupBy({
    by: ['clientId'],
    where: { userId: req.userId!, status: 'PAID' },
    _sum: { totalAmount: true },
  });
  const billedByClient: Record<string, number> = {};
  for (const b of billed) billedByClient[b.clientId] = b._sum.totalAmount ?? 0;

  const result = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    projectCount: c._count.projects,
    totalBilled: billedByClient[c.id] ?? 0,
  }));

  res.json({ clients: result });
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
      invoices: { orderBy: { issuedAt: 'desc' }, include: { items: true } },
    },
  });
  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  // Attach total logged hours per project (sum of its time entries).
  const projectIds = client.projects.map((p) => p.id);
  const hours = projectIds.length
    ? await prisma.timeEntry.groupBy({
        by: ['projectId'],
        where: { projectId: { in: projectIds } },
        _sum: { hours: true },
      })
    : [];
  const hoursByProject: Record<string, number> = {};
  for (const h of hours) hoursByProject[h.projectId] = h._sum.hours ?? 0;

  const projects = client.projects.map((p) => ({ ...p, totalHours: hoursByProject[p.id] ?? 0 }));

  res.json({ client: { ...client, projects } });
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

// ── Nested: create a project under a client ────────────────────────────────
const projectCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).default('ACTIVE'),
  hourlyRate: z.number().nonnegative().default(0),
  totalBudget: z.number().nonnegative().optional(),
});

// POST /api/clients/:id/projects
router.post('/:id/projects', async (req, res) => {
  const owned = await prisma.client.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    select: { id: true },
  });
  if (!owned) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }
  const parsed = projectCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const project = await prisma.project.create({
    data: {
      client: { connect: { id: req.params.id } },
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      hourlyRate: parsed.data.hourlyRate,
      totalBudget: parsed.data.totalBudget,
    },
  });
  res.status(201).json({ project });
});

export default router;
