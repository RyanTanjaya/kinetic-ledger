import { createContext, useContext, useState, type ReactNode } from 'react';
import { X, Download } from 'lucide-react';
import { Client, Project, Invoice, TimeEntry, ProfileSettings } from '../types';
import {
  INITIAL_CLIENT_LIST,
  INITIAL_PROJECTS,
  INITIAL_INVOICES,
  INITIAL_TIME_ENTRIES,
  INITIAL_SETTINGS,
} from './mockData';

// App-wide data layer. For now this holds the original mock data + handlers
// (lifted out of App.tsx). Screens that haven't been wired to the live API yet
// read from here. As each backend resource lands (Steps 3–9) we replace the
// relevant slice with TanStack Query calls.
interface DataContextValue {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  timeEntries: TimeEntry[];
  settings: ProfileSettings;
  getCurrencySymbol: (curr: string) => string;
  formatCurrency: (val: number) => string;
  addClient: (c: Omit<Client, 'id' | 'totalBilled'>) => void;
  deleteClient: (id: string) => void;
  addProject: (clientId: string, p: Omit<Project, 'id' | 'clientId' | 'clientName' | 'totalHours'>) => void;
  addLog: (projectId: string, log: Omit<TimeEntry, 'id' | 'projectId' | 'projectTitle' | 'clientId' | 'clientName' | 'earnings'>) => void;
  deleteLog: (id: string) => void;
  saveInvoice: (inv: Invoice) => void;
  markInvoicePaid: (id: string) => void;
  deleteInvoice: (id: string) => void;
  saveSettings: (s: ProfileSettings) => void;
  getNextInvoiceId: () => string;
  downloadInvoice: (inv: Invoice) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENT_LIST);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(INITIAL_TIME_ENTRIES);
  const [settings, setSettings] = useState<ProfileSettings>(INITIAL_SETTINGS);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const getCurrencySymbol = (curr: string) => {
    const symbolMap: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', SGD: 'S$', AUD: 'A$', MYR: 'RM' };
    return symbolMap[curr] || '$';
  };

  const formatCurrency = (val: number) => {
    const symbol = getCurrencySymbol(settings.currency);
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const addClient = (newClient: Omit<Client, 'id' | 'totalBilled'>) => {
    const record: Client = { ...newClient, id: `c-${Date.now()}`, totalBilled: 0 };
    setClients((prev) => [record, ...prev]);
  };

  const deleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? All linked projects and invoices will be deleted.')) {
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      setProjects((prev) => prev.filter((p) => p.clientId !== clientId));
      setInvoices((prev) => prev.filter((i) => i.clientId !== clientId));
      setTimeEntries((prev) => prev.filter((t) => t.clientId !== clientId));
    }
  };

  const addProject = (clientId: string, newProj: Omit<Project, 'id' | 'clientId' | 'clientName' | 'totalHours'>) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;
    const record: Project = { ...newProj, id: `p-${Date.now()}`, clientId: client.id, clientName: client.name, totalHours: 0 };
    setProjects((prev) => [record, ...prev]);
  };

  const addLog = (projectId: string, newLog: Omit<TimeEntry, 'id' | 'projectId' | 'projectTitle' | 'clientId' | 'clientName' | 'earnings'>) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const record: TimeEntry = {
      ...newLog,
      id: `te-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      clientId: project.clientId,
      clientName: project.clientName,
      earnings: newLog.hours * project.hourlyRate,
    };
    setTimeEntries((prev) => [record, ...prev]);
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, totalHours: p.totalHours + newLog.hours } : p)));
  };

  const deleteLog = (logId: string) => {
    const log = timeEntries.find((t) => t.id === logId);
    if (!log) return;
    setTimeEntries((prev) => prev.filter((t) => t.id !== logId));
    setProjects((prev) => prev.map((p) => (p.id === log.projectId ? { ...p, totalHours: Math.max(0, p.totalHours - log.hours) } : p)));
  };

  const getNextInvoiceId = () => {
    const prefix = settings.invoicePrefix || 'INV';
    const parsedNums = invoices
      .map((inv) => {
        const match = inv.id.match(new RegExp(`${prefix}-0*(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num) => num > 0);
    const nextNum = parsedNums.length > 0 ? Math.max(...parsedNums) + 1 : 13;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  };

  const saveInvoice = (newInv: Invoice) => setInvoices((prev) => [newInv, ...prev]);

  const markInvoicePaid = (invoiceId: string) =>
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'Paid' as const } : inv)));

  const deleteInvoice = (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice draft?')) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    }
  };

  const saveSettings = (s: ProfileSettings) => setSettings(s);

  // Renders a printable HTML invoice and triggers a one-click download.
  const downloadInvoice = (invoice: Invoice) => {
    const symbol = getCurrencySymbol(settings.currency);
    const dateToday = new Date().toLocaleDateString('en-US');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.id} - ${invoice.clientName}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
        }
      </style>
    </head>
    <body class="bg-slate-50 text-slate-800 p-8 min-h-screen flex flex-col justify-between">

      <div class="max-w-4xl mx-auto bg-white p-12 rounded-3xl border border-slate-100 shadow-xl space-y-8 my-6">

        <div class="no-print bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between text-xs mb-8">
          <div>
            <h4 class="font-bold">📄 Responsive Document Print Command</h4>
            <p class="text-slate-400 mt-0.5">Ready to export to professional PDF or transfer direct to physical client records.</p>
          </div>
          <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 font-bold px-4 py-2 rounded-lg transition-colors">
            Print / Save to PDF
          </button>
        </div>

        <div class="flex justify-between items-start border-b border-slate-100 pb-8">
          <div>
            <div class="h-10 w-10 bg-slate-900 text-white font-mono font-bold flex items-center justify-center rounded-xl text-sm mb-3">
              ${settings.businessName ? settings.businessName.slice(0, 2).toUpperCase() : 'RD'}
            </div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">${settings.businessName || 'Ryan Dev Studio'}</h1>
            <p class="text-sm text-slate-400 mt-1">${settings.email}</p>
          </div>

          <div class="text-right">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">INVOICE DOCUMENT</span>
            <h2 class="text-2xl font-mono font-extrabold text-slate-900 mt-1">${invoice.id}</h2>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8 pt-4">
          <div>
            <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Bill To:</span>
            <div class="mt-2 text-sm">
              <strong class="text-slate-900 text-base block">${invoice.clientName}</strong>
              ${invoice.clientCompany ? `<span class="text-slate-500 block text-xs mt-0.5">${invoice.clientCompany}</span>` : ''}
            </div>
          </div>

          <div class="space-y-2 text-right text-xs">
            <div>
              <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date Issued:</span>
              <span class="font-mono font-bold text-slate-800 ml-2">${invoice.issueDate}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment Due:</span>
              <span class="font-mono font-bold text-slate-900 ml-2">${invoice.dueDate}</span>
            </div>
          </div>
        </div>

        <div class="pt-6 space-y-4">
          <div class="grid grid-cols-12 border-b border-slate-200 pb-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
            <div class="col-span-8">Description of Works</div>
            <div class="col-span-1 text-center">Qty</div>
            <div class="col-span-1 text-right">Rate</div>
            <div class="col-span-2 text-right">Line Total</div>
          </div>

          <div class="divide-y divide-slate-100 min-h-[8rem]">
            ${invoice.lineItems
              .map(
                (item) => `
              <div class="grid grid-cols-12 py-3.5 text-sm font-medium">
                <div class="col-span-8 text-slate-800">${item.description}</div>
                <div class="col-span-1 text-center font-mono text-slate-500">${item.qty}</div>
                <div class="col-span-1 text-right font-mono text-slate-500">${symbol}${item.unitPrice}</div>
                <div class="col-span-2 text-right font-mono font-bold text-slate-900">${symbol}${(item.qty * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="border-t-2 border-slate-900 pt-5 flex justify-between items-center bg-transparent">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Billed Fees:</span>
            <span class="text-2xl font-mono font-black text-slate-950">${symbol}${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        ${
          invoice.notes
            ? `
          <div class="border-t border-slate-100 pt-6 text-xs text-slate-500 leading-relaxed max-w-xl">
            <span class="block font-bold text-slate-600 uppercase tracking-wider text-[9px] mb-1">Terms & Banking Coordinates</span>
            <p>${invoice.notes}</p>
          </div>
        `
            : ''
        }

        <div class="pt-8 border-t border-slate-50 text-[10px] text-slate-400 text-center font-mono">
          Secured with Kinetic Ledger. Generated on ${dateToday}. Thank you.
        </div>

      </div>

    </body>
    </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.id}_${invoice.clientName.replace(/\s+/g, '_')}_Invoice.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setPreviewInvoice(invoice);
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        projects,
        invoices,
        timeEntries,
        settings,
        getCurrencySymbol,
        formatCurrency,
        addClient,
        deleteClient,
        addProject,
        addLog,
        deleteLog,
        saveInvoice,
        markInvoicePaid,
        deleteInvoice,
        saveSettings,
        getNextInvoiceId,
        downloadInvoice,
      }}
    >
      {children}

      {/* Invoice-generated confirmation modal (global overlay). */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setPreviewInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Download size={22} />
            </div>

            <h3 className="font-sans font-extrabold text-slate-900 tracking-tight text-lg">Invoice Generated Successfully</h3>
            <p className="text-xs text-slate-400 mt-1">Your HTML printable file document package has been compiled.</p>

            <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 font-mono text-[10px] text-slate-500">
              <div className="flex justify-between">
                <span>Invoice ID:</span>
                <strong className="text-slate-900">{previewInvoice.id}</strong>
              </div>
              <div className="flex justify-between">
                <span>Recipient client:</span>
                <strong className="text-slate-950 font-sans">{previewInvoice.clientName}</strong>
              </div>
              <div className="flex justify-between max-w-full">
                <span>Total amount:</span>
                <strong className="text-slate-900">{formatCurrency(previewInvoice.amount)}</strong>
              </div>
            </div>

            <button
              onClick={() => setPreviewInvoice(null)}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold transition-all"
            >
              Return to Workspace
            </button>
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
