import { ArrowUpRight, TrendingUp, FileText, Folder, CheckCircle, Clock, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { Invoice, Project, ProfileSettings } from '../types';

export interface DashboardStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  outstandingAmount: number;
  activeProjects: number;
  totalClients: number;
  monthlyData: { name: string; amount: number }[];
  recentInvoices: Invoice[];
}

interface DashboardProps {
  stats: DashboardStats;
  settings: ProfileSettings;
  onNavigate: (view: string, targetId?: string) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
}

export default function PortalDashboard({
  stats,
  settings,
  onNavigate,
  onDownloadInvoice
}: DashboardProps) {

  // Format currency dynamically
  const formatCurrency = (val: number) => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      SGD: 'S$',
      AUD: 'A$',
      MYR: 'RM'
    };
    const symbol = symbolMap[settings.currency] || '$';
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // All figures are aggregated server-side (GET /api/dashboard/stats).
  const recentInvoices = stats.recentInvoices;
  const chartData = stats.monthlyData;
  const maxAmount = Math.max(1, ...chartData.map(d => d.amount));

  return (
    <div className="space-y-10 animate-fade-in" id="dashboard-screen">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
          Welcome back, {settings.displayName || "Ryan"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Here is a high-fidelity snapshot of your freelance operations today.
        </p>
      </div>

      {/* Grid of four stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Earnings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-950 tracking-tight">
              {formatCurrency(stats.totalEarnings)}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-green-500 font-bold">↑ 12.4%</span> All time
            </p>
          </div>
        </div>

        {/* Card 2: This Month */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono">This Month</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-950 tracking-tight">
              {formatCurrency(stats.thisMonthEarnings)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Currently June 2026
            </p>
          </div>
        </div>

        {/* Card 3: Outstanding */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono">Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-950 tracking-tight">
              {formatCurrency(stats.outstandingAmount)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Awaiting payment
            </p>
          </div>
        </div>

        {/* Card 4: Active Projects */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Folder size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-950 tracking-tight">
              {stats.activeProjects}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Across all clients
            </p>
          </div>
        </div>

      </div>

      {/* Main Content Row: Monthly Revenue Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Monthly Revenue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Last 12 months (Fiscal Year 2026)</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="w-2.5 h-2.5 roundedbg bg-slate-900 rounded-sm inline-block"></span>
            <span>PROYECTED / INVOICED REVENUE</span>
          </div>
        </div>

        {/* Minimal Vector SVG Bar Chart */}
        <div className="h-48 flex items-end gap-3 pt-6 border-b border-slate-100 relative">
          
          {/* Y Axis Grid lines */}
          <div className="absolute inset-x-0 top-0 border-t border-slate-50 text-[9px] font-mono text-slate-300"></div>
          <div className="absolute inset-x-0 top-1/4 border-t border-slate-50 text-[9px] font-mono text-slate-300"></div>
          <div className="absolute inset-x-0 top-2/4 border-t border-slate-50 text-[9px] font-mono text-slate-300"></div>
          <div className="absolute inset-x-0 top-3/4 border-t border-slate-50 text-[9px] font-mono text-slate-300 font-medium"></div>

          {chartData.map((d, idx) => {
            const pct = d.amount ? (d.amount / maxAmount) * 100 : 0;
            const isFuture = d.amount === 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                {/* Tooltip on Hover */}
                {d.amount > 0 && (
                  <div className="absolute bottom-[calc(100%+8px)] bg-slate-900 text-white font-mono text-[9px] px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {formatCurrency(d.amount)}
                  </div>
                )}
                
                {/* The Bar */}
                <div 
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isFuture 
                      ? 'bg-transparent border border-dashed border-slate-100' 
                      : d.name === 'Jun' 
                        ? 'bg-slate-900 group-hover:bg-slate-800' 
                        : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}
                  style={{ height: `${pct * 0.85}%`, minHeight: d.amount ? '12px' : '0px' }}
                ></div>
                
                {/* X Axis Name */}
                <span className={`text-[10px] font-mono font-medium mt-3 ${
                  d.name === 'Jun' ? 'text-slate-900 font-bold' : 'text-slate-400'
                }`}>
                  {d.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Invoices</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quick access to recent billings</p>
          </div>
          <button 
            onClick={() => onNavigate('invoices')}
            className="text-xs font-semibold text-slate-900 flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                <th className="pb-3 font-mono">Invoice #</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.map((inv) => {
                // Color mapping for badges
                const statusStyles: Record<string, string> = {
                  Draft: 'bg-slate-50 text-slate-600 border-slate-100',
                  Sent: 'bg-sky-50 text-sky-800 border-sky-100',
                  Paid: 'bg-emerald-50 text-emerald-800 border-emerald-100',
                  Overdue: 'bg-rose-50 text-rose-800 border-rose-100'
                };

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">{inv.id}</td>
                    <td className="py-3.5 font-sans font-semibold text-slate-700">{inv.clientName}</td>
                    <td className="py-3.5 font-mono font-semibold text-slate-900">{formatCurrency(inv.amount)}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyles[inv.status] || ''}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className={`py-3.5 font-sans text-slate-500 ${inv.status === 'Overdue' ? 'text-rose-500 font-bold' : ''}`}>
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 text-right">
                      <button 
                        onClick={() => onDownloadInvoice(inv)}
                        className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1 text-[10px] font-bold transition-all ml-auto hover:text-slate-900 hover:border-slate-350"
                        title="Download PDF Invoice"
                      >
                        <Download size={12} />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
