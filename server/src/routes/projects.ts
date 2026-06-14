import { Router } from 'express';

// TODO (Step 4): implement project CRUD.
// Planned endpoints (see project4 plan):
//   GET    /api/clients/:clientId/projects
//   POST   /api/clients/:clientId/projects
//   GET    /api/projects/:id
//   PUT    /api/projects/:id
//   DELETE /api/projects/:id
const router = Router();

router.all('*', (_req, res) => {
  res.status(501).json({ error: 'Projects API not implemented yet' });
});

export default router;
