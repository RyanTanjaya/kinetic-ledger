import { useState, useMemo } from 'react';
import { Plus, Download, Check, Trash2, ShieldAlert, ArrowUpDown, Receipt, Search } from 'lucide-react';
import { Invoice, InvoiceStatus, ProfileSettings } from '../types';

interface InvoiceListProps {
  invoices: Invoice[];
  settings: ProfileSettings;
  onNavigateToCreate: () => void;
  onDownloadInvoice: (invoice: Invoice) => void;
  onMarkPaid: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

export default function InvoiceList({
  invoices,
  settings,
  onNavigateToCreate,
  onDownloadInvoice,
  onMarkPaid,
  onDeleteInvoice
}: InvoiceListProps) {

  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'amount' | 'issueDate' | 'dueDate'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Format currency
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
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Toggle sorting order
  const handleSort = (column: 'id' | 'amount' | 'issueDate' | 'dueDate') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Filter & Sort Logic
  const processedInvoices = useMemo(() => {
    let result = [...invoices];

    // 1. Status Filter
    if (activeFilter !== 'All') {
      result = result.filter(inv => inv.status === activeFilter);
    }

    // 2. Search query matching
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(inv => 
        inv.id.toLowerCase().includes(q) || 
        inv.clientName.toLowerCase().includes(q)
      );
    }

    // 3. Sort Order
    result.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === 'amount') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      // Default string compare
      const strA = String(valA);
      const strB = String(valB);
      return sortOrder === 'asc' 
        ? strA.localeCompare(strB, undefined, { numeric: true }) 
        : strB.localeCompare(strA, undefined, { numeric: true });
    });

    return result;
  }, [invoices, activeFilter, searchTerm, sortBy, sortOrder]);

  // Aggregate Metrics Bar Calculations: "Showing 8 invoices · Total $7,850 · $2,750 outstanding"
  const metrics = useMemo(() => {
    const totalCount = invoices.length;
    const totalValue = invoices.reduce((sum, i) => sum + i.amount, 0);
    const outstandingValue = invoices
      .filter(i => i.status === 'Sent' || i.status === 'Overdue')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      totalCount,
      totalValue,
      outstandingValue
    };
  }, [invoices]);

  return (
    <div className="space-y-6 animate-fade-in" id="invoice-list-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track and generate invoice slips. Monitor draft states, issues, and arrears.
          </p>
        </div>
        <button
          onClick={onNavigateToCreate}
          className="bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </div>

      {/* Pill tabs Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-2">
        <div className="flex flex-wrap gap-2">
          {(['All', 'Draft', 'Sent', 'Paid', 'Overdue'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            const count = filter === 'All' 
              ? invoices.length 
              : invoices.filter(i => i.status === filter).length;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-tight cursor-pointer border transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-250 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter} <span className={`ml-1 text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400 font-normal'}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Small inline search bar */}
        <div className="relative min-w-[200px]">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search size={13} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice or client..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Summary Metrics Banner */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-500 font-medium font-sans flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-1.5">
          <Receipt size={14} className="text-slate-400" />
          <span>
            Showing <strong>{processedInvoices.length}</strong> invoices of {metrics.totalCount} total
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider font-bold">
          <span>Total volume: <span className="text-slate-900 font-mono">{formatCurrency(metrics.totalValue)}</span></span>
          <span className="text-amber-600">Outstanding: <span className="font-mono text-amber-700">{formatCurrency(metrics.outstandingValue)}</span></span>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {processedInvoices.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Receipt size={22} />
            </div>
            <h4 className="font-bold text-slate-900 text-base">No invoices found</h4>
            <p className="text-sm text-slate-400 mt-2">
              There are no invoices matching the selected active filter or query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4 pl-6 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1">
                      Invoice # <ArrowUpDown size={11} className="text-slate-300" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('id')}>ClientName</th>
                  <th className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('issueDate')}>
                    <div className="flex items-center gap-1">
                      Issue Date <ArrowUpDown size={11} className="text-slate-300" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-50" onClick={() => handleSort('dueDate')}>
                    <div className="flex items-center gap-1">
                      Due Date <ArrowUpDown size={11} className="text-slate-300" />
                    </div>
                  </th>
                  <th className="p-4 text-right cursor-pointer hover:bg-slate-50" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end gap-1">
                      Amount <ArrowUpDown size={11} className="text-slate-300" />
                    </div>
                  </th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedInvoices.map((inv) => {
                  const statusStyles: Record<string, string> = {
                    Draft: 'bg-slate-50 text-slate-600 border-slate-100',
                    Sent: 'bg-sky-50 text-sky-800 border-sky-100',
                    Paid: 'bg-emerald-50 text-emerald-800 border-emerald-100',
                    Overdue: 'bg-rose-50 text-rose-800 border-rose-100'
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 pl-6 font-mono font-bold text-slate-900">{inv.id}</td>
                      <td className="p-4 font-sans font-semibold text-slate-800">{inv.clientName}</td>
                      <td className="p-4 font-sans text-slate-500 font-mono">{inv.issueDate}</td>
                      <td className={`p-4 font-sans font-mono ${inv.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                        {inv.dueDate}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900 text-sm">{formatCurrency(inv.amount)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border tracking-wider ${statusStyles[inv.status]}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end items-center gap-1">
                          
                          {inv.status === 'Sent' && (
                            <button
                              onClick={() => onMarkPaid(inv.id)}
                              className="p-1 px-2 hover:bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px] border border-emerald-100 bg-white"
                              title="Mark paid"
                            >
                              <Check size={11} className="inline mr-0.5" />
                              <span>Paid</span>
                            </button>
                          )}

                          <button
                            onClick={() => onDownloadInvoice(inv)}
                            className="p-1.5 border border-slate-150 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded"
                            title="Download PDF"
                          >
                            <Download size={12} />
                          </button>

                          {inv.status === 'Draft' ? (
                            <button
                              onClick={() => onDeleteInvoice(inv.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 size={12} />
                            </button>
                          ) : (
                            <div className="w-8"></div>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
