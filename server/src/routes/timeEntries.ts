import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// Operates on a time entry by id. Nested list/create live under the projects
// router (/api/projects/:id/time-entries).
const router = Router();

const updateSchema = z.object({
  description: z.string().min(1).optional(),
  hours: z.number().positive().optional(),
  date: z.string().optional(),
});

function owned(id: string, userId: string) {
  return prisma.timeEntry.findFirst({
    where: { id, project: { client: { userId } } },
    select: { id: true },
  });
}

// PUT /api/time-entries/:id
router.put('/:id', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  if (!(await owned(req.params.id, req.userId!))) {
    res.status(404).json({ error: 'Time entry not found' });
    return;
  }
  const data: { description?: string; hours?: number; date?: Date } = {
    description: parsed.data.description,
    hours: parsed.data.hours,
  };
  if (parsed.data.date) data.date = new Date(parsed.data.date);
  const entry = await prisma.timeEntry.update({ where: { id: req.params.id }, data });
  res.json({ entry });
});

// DELETE /api/time-entries/:id
router.delete('/:id', async (req, res) => {
  if (!(await owned(req.params.id, req.userId!))) {
    res.status(404).json({ error: 'Time entry not found' });
    return;
  }
  await prisma.timeEntry.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
