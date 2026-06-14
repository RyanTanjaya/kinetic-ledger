import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Project endpoints. Nested create/list live under the clients router
// (/api/clients/:id/projects); these operate on an existing project by id.
const router = Router();

const projectUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  hourlyRate: z.number().nonnegative().optional(),
  totalBudget: z.number().nonnegative().nullable().optional(),
});

// GET /api/projects/:id  (project + client + time entries + total hours)
router.get('/:id', async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { id: req.params.id, client: { userId: req.userId! } },
    include: { client: true, timeEntries: { orderBy: { date: 'desc' } } },
  });
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const totalHours = project.timeEntries.reduce((sum, t) => sum + t.hours, 0);
  res.json({ project: { ...project, totalHours } });
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  const parsed = projectUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const owned = await prisma.project.findFirst({
    where: { id: req.params.id, client: { userId: req.userId! } },
    select: { id: true },
  });
  if (!owned) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  const project = await prisma.project.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ project });
});

// DELETE /api/projects/:id  (cascades to its time entries)
router.delete('/:id', async (req, res) => {
  const owned = await prisma.project.findFirst({
    where: { id: req.params.id, client: { userId: req.userId! } },
    select: { id: true },
  });
  if (!owned) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  await prisma.project.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
