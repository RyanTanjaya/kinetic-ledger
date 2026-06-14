import { Router } from 'express';

// TODO (Step 6): implement dashboard stats.
// Planned endpoint (see project4 plan):
//   GET /api/dashboard/stats
//     -> { totalEarnings, thisMonthEarnings, outstandingAmount,
//          activeProjects, totalClients, monthlyData[] }
const router = Router();

router.all('*', (_req, res) => {
  res.status(501).json({ error: 'Dashboard API not implemented yet' });
});

export default router;
