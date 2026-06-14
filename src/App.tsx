import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Settings as SettingsIcon, 
  Clock, 
  Download, 
  HelpCircle,
  FileText,
  Plus,
  TrendingUp,
  X,
  User,
  Sparkles,
  Award,
  LogOut
} from 'lucide-react';
import { Client, Project, Invoice, TimeEntry, ProfileSettings } from './types';
import { 
  INITIAL_CLIENT_LIST, 
  INITIAL_PROJECTS, 
  INITIAL_INVOICES, 
  INITIAL_TIME_ENTRIES, 
  INITIAL_SETTINGS 
} from './data/mockData';

// Import subcomponents
import PortalDashboard from './components/PortalDashboard';
import ClientsList from './components/ClientsList';
import ClientDetail from './components/ClientDetail';
import InvoiceGenerator from './components/InvoiceGenerator';
import InvoiceList from './components/InvoiceList';
import TimeLog from './components/TimeLog';
import PortalSettings from './components/PortalSettings';
import LandingPage from './components/LandingPage';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('landing'); // landing | dashboard | clients | invoices | settings
  const [activeClientId, setActiveClientId] = useState<string | null>(null); // For drilling down into details
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null); // For drilling down into time logs
  
  // App Core Database States
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENT_LIST);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(INITIAL_TIME_ENTRIES);
  const [settings, setSettings] = useState<ProfileSettings>(INITIAL_SETTINGS);

  // Quick Action feedback
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Currency utility helper
  const getCurrencySymbol = (curr: string) => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      SGD: 'S$',
      AUD: 'A$',
      MYR: 'RM'
    };
    return symbolMap[curr] || '$';
  };

  const formatCurrency = (val: number) => {
    const symbol = getCurrencySymbol(settings.currency);
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Navigation controller helper
  const handleNavigate = (view: string, targetId?: string) => {
    if (view === 'client-detail' && targetId) {
      setActiveClientId(targetId);
      setActiveTab('client-detail');
    } else if (view === 'time-log' && targetId) {
      setActiveProjectId(targetId);
      setActiveTab('time-log');
    } else {
      setActiveTab(view);
      setActiveClientId(null);
      setActiveProjectId(null);
    }
  };

  // Add Client Callback
  const handleAddClient = (newClient: Omit<Client, 'id' | 'totalBilled'>) => {
    const clientRecord: Client = {
      ...newClient,
      id: `c-${Date.now()}`,
      totalBilled: 0
    };
    setClients([clientRecord, ...clients]);
  };

  // Delete Client Callback
  const handleDeleteClient = (clientId: string) => {
    if (confirm("Are you sure you want to delete this client? All linked projects and invoices will be deleted.")) {
      setClients(clients.filter(c => c.id !== clientId));
      setProjects(projects.filter(p => p.clientId !== clientId));
      setInvoices(invoices.filter(i => i.clientId !== clientId));
      setTimeEntries(timeEntries.filter(t => t.clientId !== clientId));
      if (activeClientId === clientId) {
        setActiveTab('clients');
        setActiveClientId(null);
      }
    }
  };

  // Add Project Callback
  const handleAddProject = (newProj: Omit<Project, 'id' | 'clientId' | 'clientName' | 'totalHours'>) => {
    if (!activeClientId) return;
    const client = clients.find(c => c.id === activeClientId);
    if (!client) return;

    const projectRecord: Project = {
      ...newProj,
      id: `p-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      totalHours: 0
    };
    setProjects([projectRecord, ...projects]);
  };

  // Add Time Log Entry Callback
  const handleAddLog = (newLog: Omit<TimeEntry, 'id' | 'projectId' | 'projectTitle' | 'clientId' | 'clientName' | 'earnings'>) => {
    if (!activeProjectId) return;
    const project = projects.find(p => p.id === activeProjectId);
    if (!project) return;

    const logRecord: TimeEntry = {
      ...newLog,
      id: `te-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      clientId: project.clientId,
      clientName: project.clientName,
      earnings: newLog.hours * project.hourlyRate
    };

    // Update time entries
    setTimeEntries([logRecord, ...timeEntries]);

    // Reactively update the hours total inside the Projects array!
    setProjects(projects.map(p => {
      if (p.id === project.id) {
        return {
          ...p,
          totalHours: p.totalHours + newLog.hours
        };
      }
      return p;
    }));
  };

  // Delete Time Log Entry
  const handleDeleteLog = (logId: string) => {
    const log = timeEntries.find(t => t.id === logId);
    if (!log) return;

    setTimeEntries(timeEntries.filter(t => t.id !== logId));

    // Reactively deduct hours from relevant project
    setProjects(projects.map(p => {
      if (p.id === log.projectId) {
        return {
          ...p,
          totalHours: Math.max(0, p.totalHours - log.hours)
        };
      }
      return p;
    }));
  };

  // Auto Invoice ID Calculator based on settings prefix (INV-...)
  const getNextInvoiceId = () => {
    const prefix = settings.invoicePrefix || 'INV';
    const parsedNums = invoices
      .map(inv => {
        const match = inv.id.match(new RegExp(`${prefix}-0*(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);
    
    const nextNum = parsedNums.length > 0 ? Math.max(...parsedNums) + 1 : 13;
    const padded = String(nextNum).padStart(3, '0');
    return `${prefix}-${padded}`;
  };

  // Save / Add Invoice
  const handleSaveInvoice = (newInv: Invoice) => {
    setInvoices([newInv, ...invoices]);
    setActiveTab('invoices');
  };

  // Mark invoice paid
  const handleMarkInvoicePaid = (invoiceId: string) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: 'Paid' as const };
      }
      return inv;
    }));
  };

  // Delete Invoice
  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm("Are you sure you want to delete this invoice draft?")) {
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
    }
  };

  // HTML Printable file output for "Invoice Download"
  const handleDownloadInvoice = (invoice: Invoice) => {
    // We render a beautiful high-fidelity, printable HTML markup containing exact responsive Invoice 
    // styles, then package it as a downloadable attachment or open it. This allows exact paper print inside the sandboxed environment!
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
        
        <!-- print banner non-printable -->
        <div class="no-print bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between text-xs mb-8">
          <div>
            <h4 class="font-bold">📄 Responsive Document Print Command</h4>
            <p class="text-slate-400 mt-0.5">Ready to export to professional PDF or transfer direct to physical client records.</p>
          </div>
          <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 font-bold px-4 py-2 rounded-lg transition-colors">
            Print / Save to PDF
          </button>
        </div>

        <!-- invoice sheet header -->
        <div class="flex justify-between items-start border-b border-slate-100 pb-8">
          <div>
            <div class="h-10 w-10 bg-slate-900 text-white font-mono font-bold flex items-center justify-center rounded-xl text-sm mb-3">
              ${settings.businessName ? settings.businessName.slice(0, 2).toUpperCase() : "RD"}
            </div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">${settings.businessName || "Ryan Dev Studio"}</h1>
            <p class="text-sm text-slate-400 mt-1">${settings.email}</p>
          </div>

          <div class="text-right">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">INVOICE DOCUMENT</span>
            <h2 class="text-2xl font-mono font-extrabold text-slate-900 mt-1">${invoice.id}</h2>
          </div>
        </div>

        <!-- metadata coordinates -->
        <div class="grid grid-cols-2 gap-8 pt-4">
          <div>
            <span class="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Bill To:</span>
            <div class="mt-2 text-sm">
              <strong class="text-slate-900 text-base block">${invoice.clientName}</strong>
              ${invoice.clientCompany ? `<span class="text-slate-500 block text-xs mt-0.5">${invoice.clientCompany}</span>` : ''}
              <span class="text-slate-400 block font-mono text-xs mt-1">Acme contract recipient</span>
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

        <!-- line items tabular layout -->
        <div class="pt-6 space-y-4">
          <div class="grid grid-cols-12 border-b border-slate-200 pb-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-400">
            <div class="col-span-8">Description of Works</div>
            <div class="col-span-1 text-center">Qty</div>
            <div class="col-span-1 text-right">Rate</div>
            <div class="col-span-2 text-right">Line Total</div>
          </div>

          <div class="divide-y divide-slate-100 min-h-[8rem]">
            ${invoice.lineItems.map(item => `
              <div class="grid grid-cols-12 py-3.5 text-sm font-medium">
                <div class="col-span-8 text-slate-800">${item.description}</div>
                <div class="col-span-1 text-center font-mono text-slate-500">${item.qty}</div>
                <div class="col-span-1 text-right font-mono text-slate-500">${symbol}${item.unitPrice}</div>
                <div class="col-span-2 text-right font-mono font-bold text-slate-900">${symbol}${(item.qty * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            `).join('')}
          </div>

          <!-- aggregate bottom border -->
          <div class="border-t-2 border-slate-900 pt-5 flex justify-between items-center bg-transparent">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Billed Fees:</span>
            <span class="text-2xl font-mono font-black text-slate-950">${symbol}${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <!-- footer information -->
        ${invoice.notes ? `
          <div class="border-t border-slate-100 pt-6 text-xs text-slate-500 leading-relaxed max-w-xl">
            <span class="block font-bold text-slate-650 uppercase tracking-wider text-[9px] mb-1">Terms & Banking Coordinates</span>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <div class="pt-8 border-t border-slate-50 text-[10px] text-slate-400 text-center font-mono">
          Secured with Kinetic Ledger. Generated on ${dateToday}. Thank you.
        </div>

      </div>

    </body>
    </html>
    `;

    // Make file downloadable in client browser in one click
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.id}_${invoice.clientName.replace(/\s+/g, '_')}_Invoice.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show simulated preview toast
    setPreviewInvoice(invoice);
  };

  // Find preselected objects
  const drilledClient = clients.find(c => c.id === activeClientId);
  const drilledProject = projects.find(p => p.id === activeProjectId);

  // Public marketing landing page — shown before entering the app. Renders full-bleed with no app chrome.
  if (activeTab === 'landing') {
    return <LandingPage onEnter={() => handleNavigate('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-16">
      
      {/* GLOBAL BANNER HEADER */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between sm:px-10 h-20">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center font-sans font-extrabold text-sm text-white shadow-md shadow-slate-150">
              K
            </div>
            <div>
              <span className="font-display font-black text-sm uppercase tracking-wider text-slate-900 block leading-none">
                Kinetic Ledger
              </span>
              <span className="font-mono text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5 block">
                SaaS Dashboard
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            <button 
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center gap-1.5 py-1 transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'text-slate-900 border-b-2 border-slate-900' : 'hover:text-slate-650 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={13} />
              Dashboard
            </button>

            <button 
              onClick={() => handleNavigate('clients')}
              className={`flex items-center gap-1.5 py-1 transition-all cursor-pointer ${
                activeTab === 'clients' || activeTab === 'client-detail' ? 'text-slate-900 border-b-2 border-slate-900' : 'hover:text-slate-900'
              }`}
            >
              <Users size={13} />
              Clients
            </button>

            <button 
              onClick={() => handleNavigate('invoices')}
              className={`flex items-center gap-1.5 py-1 transition-all cursor-pointer ${
                activeTab === 'invoices' || activeTab === 'invoice-generator' ? 'text-slate-900 border-b-2 border-slate-900' : 'hover:text-slate-900'
              }`}
            >
              <Receipt size={13} />
              Invoices
            </button>

            <button 
              onClick={() => handleNavigate('settings')}
              className={`flex items-center gap-1.5 py-1 transition-all cursor-pointer ${
                activeTab === 'settings' ? 'text-slate-900 border-b-2 border-slate-900' : 'hover:text-slate-900'
              }`}
            >
              <SettingsIcon size={13} />
              Settings
            </button>
          </div>

          {/* User profile capsule info */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block font-sans font-bold text-xs text-slate-650 text-slate-800">
              {settings.displayName}
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-150 border-slate-250 flex items-center justify-center font-sans font-bold text-xs text-slate-650 text-slate-800 uppercase shadow-inner">
              {settings.displayName.slice(0, 2).toUpperCase()}
            </div>
            <button
              onClick={() => setActiveTab('landing')}
              title="Log out"
              aria-label="Log out"
              className="ml-1 p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE FLOATING FIXED TAB BAR */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-40 bg-slate-900/95 text-white/70 shadow-2xl rounded-2xl border border-slate-800 px-6 py-3 flex justify-between items-center backdrop-blur-lg">
        <button 
          onClick={() => handleNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'dashboard' ? 'text-white scale-110 font-bold' : ''}`}
        >
          <LayoutDashboard size={15} />
          <span className="text-[9px]">Home</span>
        </button>

        <button 
          onClick={() => handleNavigate('clients')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'clients' || activeTab === 'client-detail' ? 'text-white scale-110 font-bold' : ''}`}
        >
          <Users size={15} />
          <span className="text-[9px]">Clients</span>
        </button>

        <button 
          onClick={() => handleNavigate('invoices')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'invoices' || activeTab === 'invoice-generator' ? 'text-white scale-110 font-bold' : ''}`}
        >
          <Receipt size={15} />
          <span className="text-[9px]">Invoices</span>
        </button>

        <button 
          onClick={() => handleNavigate('settings')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'settings' ? 'text-white scale-110' : ''}`}
        >
          <SettingsIcon size={15} />
          <span className="text-[9px]">Config</span>
        </button>
      </div>

      {/* MAIN CONTAINER VIEWS SWAPPER */}
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        
        {activeTab === 'dashboard' && (
          <PortalDashboard
            invoices={invoices}
            projects={projects}
            settings={settings}
            onNavigate={handleNavigate}
            onDownloadInvoice={handleDownloadInvoice}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsList
            clients={clients}
            projects={projects}
            invoices={invoices}
            settings={settings}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
            onNavigateToClient={(id) => handleNavigate('client-detail', id)}
          />
        )}

        {activeTab === 'client-detail' && drilledClient && (
          <ClientDetail
            client={drilledClient}
            projects={projects.filter(p => p.clientId === drilledClient.id)}
            invoices={invoices.filter(i => i.clientId === drilledClient.id)}
            settings={settings}
            onBackToList={() => handleNavigate('clients')}
            onAddProject={handleAddProject}
            onNavigateToInvoiceGenerator={(clientId) => {
              setActiveClientId(clientId);
              setActiveTab('invoice-generator');
            }}
            onNavigateToTimeLog={(projectId) => handleNavigate('time-log', projectId)}
            onDownloadInvoice={handleDownloadInvoice}
            onMarkInvoicePaid={handleMarkInvoicePaid}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}

        {activeTab === 'invoice-generator' && (
          <InvoiceGenerator
            clients={clients}
            settings={settings}
            preselectedClientId={activeClientId || undefined}
            nextInvoiceId={getNextInvoiceId()}
            onBackToList={() => handleNavigate('invoices')}
            onSaveInvoice={handleSaveInvoice}
            onDownloadInvoice={handleDownloadInvoice}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            settings={settings}
            onNavigateToCreate={() => {
              setActiveClientId(null);
              setActiveTab('invoice-generator');
            }}
            onDownloadInvoice={handleDownloadInvoice}
            onMarkPaid={handleMarkInvoicePaid}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}

        {activeTab === 'time-log' && drilledProject && (
          <TimeLog
            project={drilledProject}
            timeEntries={timeEntries}
            settings={settings}
            onBackToClient={(clientId) => handleNavigate('client-detail', clientId)}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {activeTab === 'settings' && (
          <PortalSettings
            settings={settings}
            onSaveSettings={setSettings}
          />
        )}

      </main>

      {/* STUNNING DOWNLOAD INVOICE SIMULATED PROMPT COMPONENT */}
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

            <h3 className="font-sans font-extrabold text-slate-900 tracking-tight text-lg">
              Invoice Generated Successfully
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your HTML printable file document package has been compiled. 
            </p>

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

            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
              * The download has started automatically in your browser. Feel choice to open the HTML document to print/render direct to PDF in supreme resolution.
            </p>

            <button
              onClick={() => setPreviewInvoice(null)}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold transition-all"
            >
              Return to Workspace
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
