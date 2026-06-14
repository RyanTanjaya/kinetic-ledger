import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  const userId = req.userId!;

  const [paidAgg, outstandingAgg, activeProjects, totalClients, recent, paidForChart] = await Promise.all([
    prisma.invoice.aggregate({ where: { userId, status: 'PAID' }, _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ where: { userId, status: { in: ['SENT', 'OVERDUE'] } }, _sum: { totalAmount: true } }),
    prisma.project.count({ where: { client: { userId }, status: 'ACTIVE' } }),
    prisma.client.count({ where: { userId } }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      take: 5,
      include: { client: true, items: true },
    }),
    prisma.invoice.findMany({ where: { userId, status: 'PAID' }, select: { totalAmount: true, issuedAt: true } }),
  ]);

  const now = new Date();

  const thisMonthEarnings = paidForChart
    .filter((i) => i.issuedAt.getFullYear() === now.getFullYear() && i.issuedAt.getMonth() === now.getMonth())
    .reduce((s, i) => s + i.totalAmount, 0);

  // Trailing 12 months of PAID revenue.
  const monthlyData: { name: string; amount: number }[] = [];
  for (let k = 11; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const amount = paidForChart
      .filter((i) => i.issuedAt.getFullYear() === d.getFullYear() && i.issuedAt.getMonth() === d.getMonth())
      .reduce((s, i) => s + i.totalAmount, 0);
    monthlyData.push({ name: MONTHS[d.getMonth()], amount });
  }

  res.json({
    stats: {
      totalEarnings: paidAgg._sum.totalAmount ?? 0,
      thisMonthEarnings,
      outstandingAmount: outstandingAgg._sum.totalAmount ?? 0,
      activeProjects,
      totalClients,
      monthlyData,
      recentInvoices: recent, // mapped to UI shape on the frontend
    },
  });
});

export default router;
