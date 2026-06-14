import { api } from '../lib/api';
import { Invoice, InvoiceStatus } from '../types';

export interface DashboardStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  outstandingAmount: number;
  activeProjects: number;
  totalClients: number;
  monthlyData: { name: string; amount: number }[];
  recentInvoices: Invoice[];
}

const STATUS_MAP: Record<string, InvoiceStatus> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const r = await api.get('/api/dashboard/stats');
  const s = r.data.stats;
  const recentInvoices: Invoice[] = (s.recentInvoices ?? []).map((inv: any) => ({
    id: inv.invoiceNumber,
    dbId: inv.id,
    clientId: inv.clientId,
    clientName: inv.client?.name ?? '',
    clientCompany: inv.client?.company ?? undefined,
    issueDate: fmtDate(inv.issuedAt),
    dueDate: fmtDate(inv.dueDate),
    amount: inv.totalAmount,
    status: STATUS_MAP[inv.status] ?? 'Draft',
    lineItems: (inv.items ?? []).map((it: any) => ({
      id: it.id,
      description: it.description,
      qty: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    })),
    notes: inv.notes ?? undefined,
  }));
  return { ...s, recentInvoices };
}
