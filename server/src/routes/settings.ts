import { Router } from 'express';

// TODO (Step 9): implement settings.
// Planned endpoints (see project4 plan):
//   GET /api/settings   -> user profile (name, businessName, currency, logoUrl)
//   PUT /api/settings   -> update { name?, businessName?, currency?, logoUrl? }
const router = Router();

router.all('*', (_req, res) => {
  res.status(501).json({ error: 'Settings API not implemented yet' });
});

export default router;
