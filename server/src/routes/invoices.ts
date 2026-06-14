import { Router } from 'express';

// TODO (Step 7): implement invoice CRUD with auto-incrementing invoice numbers
// and server-side totals.
// Planned endpoints (see project4 plan):
//   GET    /api/invoices?status=&clientId=
//   POST   /api/invoices
//   GET    /api/invoices/:id
//   PUT    /api/invoices/:id
//   PATCH  /api/invoices/:id/mark-paid
//   DELETE /api/invoices/:id
const router = Router();

router.all('*', (_req, res) => {
  res.status(501).json({ error: 'Invoices API not implemented yet' });
});

export default router;
