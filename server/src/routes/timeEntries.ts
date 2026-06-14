import { Router } from 'express';

// TODO (Step 5): implement time-entry CRUD.
// Planned endpoints (see project4 plan):
//   GET    /api/projects/:projectId/time-entries
//   POST   /api/projects/:projectId/time-entries
//   PUT    /api/time-entries/:id
//   DELETE /api/time-entries/:id
const router = Router();

router.all('*', (_req, res) => {
  res.status(501).json({ error: 'Time entries API not implemented yet' });
});

export default router;
