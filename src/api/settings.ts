import { api } from '../lib/api';
import { ProfileSettings } from '../types';

export async function fetchSettings(): Promise<ProfileSettings> {
  const r = await api.get('/api/settings');
  const s = r.data.settings;
  return {
    displayName: s.displayName ?? '',
    businessName: s.businessName ?? '',
    email: s.email ?? '',
    logoUrl: s.logoUrl ?? '',
    currency: s.currency ?? 'USD',
    invoicePrefix: s.invoicePrefix ?? 'INV',
    paymentTerms: s.paymentTerms ?? 'Net 30',
    defaultNotes: s.defaultNotes ?? '',
  };
}

export async function updateSettings(input: ProfileSettings): Promise<void> {
  await api.put('/api/settings', {
    displayName: input.displayName,
    businessName: input.businessName,
    currency: input.currency,
    logoUrl: input.logoUrl,
    invoicePrefix: input.invoicePrefix,
    paymentTerms: input.paymentTerms,
    defaultNotes: input.defaultNotes,
  });
}
