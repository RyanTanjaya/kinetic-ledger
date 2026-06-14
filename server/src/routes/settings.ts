import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

function toSettings(u: {
  name: string;
  businessName: string | null;
  email: string;
  logoUrl: string | null;
  currency: string;
  invoicePrefix: string;
  paymentTerms: string;
  defaultNotes: string;
}) {
  return {
    displayName: u.name,
    businessName: u.businessName ?? '',
    email: u.email,
    logoUrl: u.logoUrl ?? '',
    currency: u.currency,
    invoicePrefix: u.invoicePrefix,
    paymentTerms: u.paymentTerms,
    defaultNotes: u.defaultNotes,
  };
}

// GET /api/settings
router.get('/', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ settings: toSettings(user) });
});

const updateSchema = z.object({
  displayName: z.string().min(1).optional(),
  businessName: z.string().optional(),
  currency: z.string().optional(),
  logoUrl: z.string().optional(),
  invoicePrefix: z.string().optional(),
  paymentTerms: z.string().optional(),
  defaultNotes: z.string().optional(),
});

// PUT /api/settings  (email is read-only)
router.put('/', async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    return;
  }
  const d = parsed.data;
  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: {
      name: d.displayName,
      businessName: d.businessName,
      currency: d.currency,
      logoUrl: d.logoUrl,
      invoicePrefix: d.invoicePrefix,
      paymentTerms: d.paymentTerms,
      defaultNotes: d.defaultNotes,
    },
  });
  res.json({ settings: toSettings(user) });
});

export default router;
