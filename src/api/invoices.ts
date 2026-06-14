import { api } from '../lib/api';
import { Invoice, InvoiceStatus } from '../types';

const STATUS_MAP: Record<string, InvoiceStatus> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Maps a DB invoice (with client + items) to the UI Invoice shape.
// id is the human invoice number; dbId is the database id used for mutations.
export function mapInvoice(inv: any): Invoice {
  return {
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
  };
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const r = await api.get('/api/invoices');
  return (r.data.invoices as any[]).map(mapInvoice);
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceInput {
  clientId: string;
  issueDate?: string;
  dueDate: string;
  notes?: string;
  status?: InvoiceStatus;
  items: InvoiceItemInput[];
}

export async function createInvoice(input: InvoiceInput): Promise<void> {
  await api.post('/api/invoices', input);
}

export async function markInvoicePaid(id: string): Promise<void> {
  await api.patch(`/api/invoices/${id}/mark-paid`);
}

export async function deleteInvoice(id: string): Promise<void> {
  await api.delete(`/api/invoices/${id}`);
}
