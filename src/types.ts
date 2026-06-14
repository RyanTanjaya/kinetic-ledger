// Shared types for full-featured Kinetic Ledger

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalBilled: number;
  projectCount?: number; // present when loaded from the clients list API
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  hourlyRate: number;
  totalHours: number;
  budget?: number;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g. "INV-013"
  clientId: string;
  clientName: string;
  clientCompany?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  lineItems: LineItem[];
  notes?: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  date: string;
  description: string;
  hours: number;
  earnings: number;
}

export interface ProfileSettings {
  displayName: string;
  businessName: string;
  email: string;
  logoUrl?: string;
  currency: string;
  invoicePrefix: string;
  paymentTerms: string;
  defaultNotes: string;
}
