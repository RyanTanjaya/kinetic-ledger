import { api } from '../lib/api';
import { Client, Project, Invoice, InvoiceStatus } from '../types';

// Map the API's UPPERCASE invoice status to the UI's title-case union.
const STATUS_MAP: Record<string, InvoiceStatus> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Clients list ──────────────────────────────────────────────────────────
export async function fetchClients(): Promise<Client[]> {
  const r = await api.get('/api/clients');
  return (r.data.clients as any[]).map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    totalBilled: c.totalBilled ?? 0,
    projectCount: c.projectCount ?? 0,
  }));
}

export interface ClientInput {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
}

export async function createClient(input: ClientInput): Promise<void> {
  await api.post('/api/clients', input);
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/api/clients/${id}`);
}

export interface ClientUpdate {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export async function updateClient(id: string, input: ClientUpdate): Promise<void> {
  await api.put(`/api/clients/${id}`, input);
}

// ── Client detail (maps DB shapes -> the UI's frontend types) ──────────────
export interface ClientDetailData {
  client: Client;
  projects: Project[];
  invoices: Invoice[];
}

export async function fetchClientDetail(id: string): Promise<ClientDetailData> {
  const r = await api.get(`/api/clients/${id}`);
  const c = r.data.client;

  const client: Client = {
    id: c.id,
    name: c.name,
    company: c.company ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    totalBilled: 0,
  };

  const projects: Project[] = (c.projects ?? []).map((p: any) => ({
    id: p.id,
    clientId: c.id,
    clientName: c.name,
    title: p.title,
    description: p.description ?? '',
    status: p.status,
    hourlyRate: p.hourlyRate,
    totalHours: p.totalHours ?? 0,
    budget: p.totalBudget ?? undefined,
  }));

  const invoices: Invoice[] = (c.invoices ?? []).map((inv: any) => ({
    id: inv.invoiceNumber,
    dbId: inv.id,
    clientId: c.id,
    clientName: c.name,
    clientCompany: c.company ?? undefined,
    issueDate: formatDate(inv.issuedAt),
    dueDate: formatDate(inv.dueDate),
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

  return { client, projects, invoices };
}
