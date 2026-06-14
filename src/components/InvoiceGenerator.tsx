import { useState, useEffect } from 'react';
import { Plus, Trash, Download, FileText, Sparkles, HelpCircle, ArrowLeft, Send } from 'lucide-react';
import { Client, Invoice, LineItem, ProfileSettings } from '../types';

interface InvoiceGeneratorProps {
  clients: Client[];
  settings: ProfileSettings;
  preselectedClientId?: string;
  nextInvoiceId: string;
  onBackToList: () => void;
  onSaveInvoice: (newInv: Invoice) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
}

export default function InvoiceGenerator({
  clients,
  settings,
  preselectedClientId,
  nextInvoiceId,
  onBackToList,
  onSaveInvoice,
  onDownloadInvoice
}: InvoiceGeneratorProps) {

  // Form states
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || (clients[0]?.id || ''));
  const [issueDate, setIssueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // default +30 Net
    return d.toISOString().split('T')[0];
  });
  
  // Create default initial line items as requested: 
  // - Website homepage redesign | 1 | $1200
  // - Mobile responsiveness fixes | 3 | $75
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "li-1", description: "Website homepage redesign", qty: 1, unitPrice: 1200, total: 1200 },
    { id: "li-2", description: "Mobile responsiveness fixes", qty: 3, unitPrice: 75, total: 225 }
  ]);

  const [notes, setNotes] = useState(settings.defaultNotes || "Payment via bank transfer. Account details on file.");

  // Get active client details
  const activeClient = clients.find(c => c.id === selectedClientId);

  // Sync dates with terms setting if requested
  useEffect(() => {
    if (settings.paymentTerms) {
      let days = 30;
      if (settings.paymentTerms.includes('7')) days = 7;
      if (settings.paymentTerms.includes('14')) days = 14;
      if (settings.paymentTerms.includes('30')) days = 30;
      if (settings.paymentTerms.includes('60')) days = 60;

      const issue = new Date(issueDate);
      issue.setDate(issue.getDate() + days);
      setDueDate(issue.toISOString().split('T')[0]);
    }
  }, [issueDate, settings.paymentTerms]);

  // Adjust due date if pre-loaded item properties change
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

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + (item.qty * item.unitPrice), 0);
  };

  // Add Empty Line item
  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `li-user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: "",
      qty: 1,
      unitPrice: 0,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  // Remove Line item
  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      // Keep at least one row
      setLineItems([{ id: "li-only", description: "", qty: 1, unitPrice: 0, total: 0 }]);
      return;
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  // Update Line item input inline
  const handleUpdateItem = (id: string, field: keyof LineItem, val: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        if (field === 'qty' || field === 'unitPrice') {
          updated.qty = Math.max(0, Number(updated.qty) || 0);
          updated.unitPrice = Math.max(0, Number(updated.unitPrice) || 0);
          updated.total = updated.qty * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const subtotal = calculateSubtotal();

  const handleFormSubmit = (status: 'Draft' | 'Sent') => {
    if (!selectedClientId) {
      alert("Please select or add a client first.");
      return;
    }
    const targetInv: Invoice = {
      id: nextInvoiceId,
      clientId: selectedClientId,
      clientName: activeClient?.name || "Unknown Client",
      clientCompany: activeClient?.company || "",
      issueDate,
      dueDate,
      amount: subtotal,
      status,
      lineItems: lineItems.filter(li => li.description.trim() !== ""),
      notes
    };
    onSaveInvoice(targetInv);
  };

  const handleDownloadTrigger = () => {
    const targetInv: Invoice = {
      id: nextInvoiceId,
      clientId: selectedClientId,
      clientName: activeClient?.name || "Unknown Client",
      clientCompany: activeClient?.company || "",
      issueDate,
      dueDate,
      amount: subtotal,
      status: 'Sent',
      lineItems: lineItems.filter(li => li.description.trim() !== ""),
      notes
    };
    onDownloadInvoice(targetInv);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="invoice-generator-screen">
      
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button onClick={onBackToList} className="hover:text-slate-900 cursor-pointer">Invoices</button>
        <span>/</span>
        <span className="text-slate-900 font-bold">New Invoice</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Invoice</h2>
        <button 
          onClick={onBackToList}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Client & Metadata */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-55 border-slate-50 pb-3 uppercase tracking-widest text-[10px] text-slate-400">
              01 / CLIENT & DATE INFO
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Bill To Client <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all cursor-pointer"
                >
                  <option value="" disabled>Select client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Invoice Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={nextInvoiceId}
                  className="w-full px-3 py-2 border border-slate-150 border-slate-200 bg-slate-50 text-xs font-bold font-mono text-slate-500 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Line Items Inline Table */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-50 pb-3 uppercase tracking-widest text-[10px] text-slate-400">
              02 / BILLED WORK LINE ITEMS
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[9px] uppercase tracking-wider font-bold text-slate-400 pb-2">
                    <th className="pb-2 w-[55%]">Work Description</th>
                    <th className="pb-2 text-center w-[12%]">Qty</th>
                    <th className="pb-2 text-center w-[18%]">Unit Price</th>
                    <th className="pb-2 text-right w-[15%]">Total</th>
                    <th className="pb-2 text-right w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5 pr-2">
                        <input
                          type="text"
                          required
                          placeholder="What work is billed?"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-150 border-slate-200 focus:border-slate-350 bg-white text-xs text-slate-800 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-1">
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(item.id, 'qty', e.target.value)}
                          className="w-[50px] mx-auto text-center px-1.5 py-1 border border-slate-200 bg-white text-xs font-semibold font-mono text-slate-800 rounded"
                        />
                      </td>
                      <td className="py-2.5 px-1">
                        <div className="relative flex items-center">
                          <span className="absolute left-1.5 text-[10px] text-slate-400 font-mono">$</span>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full pl-4 pr-1.5 py-1 border border-slate-200 bg-white text-xs font-semibold font-mono text-slate-800 rounded text-right"
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900 pr-2">
                        ${(item.qty * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="p-1 hover:text-rose-600 text-slate-400 hover:bg-rose-50 rounded transition-colors"
                          title="Delete line"
                        >
                          <Trash size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Line item button */}
            <button
              type="button"
              onClick={handleAddLineItem}
              className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900 py-2 px-3 border border-dashed border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          {/* Section 3: Notes & Terms */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-50 pb-3 uppercase tracking-widest text-[10px] text-slate-400">
              03 / ADDITIONAL RECIPIENT NOTES
            </h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Notes & Bank Transfer Instructions (appears on PDF footer)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of payments, account prefixing, coordinates etc..."
                className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-xs text-slate-800 rounded-xl focus:outline-none focus:ring-2 font-sans"
              />
            </div>
          </div>

          {/* Create State Operations bar */}
          <div className="flex items-center gap-4 justify-end pt-3">
            <button
              onClick={() => handleFormSubmit('Draft')}
              className="px-5 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleFormSubmit('Sent')}
              className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-slate-100"
            >
              <Send size={13} />
              Issue & Save Invoice
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Desktop Paper Preview Card (Sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 px-3 py-1 font-mono uppercase tracking-widest flex items-center justify-between">
              <span>LIVE PAPER PREVIEW</span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            {/* Absolute White Invoice Simulation Sheet */}
            <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-6 space-y-6 font-sans text-slate-800 text-[10px]">
              
              {/* Header section (Ryan Dev Studio) */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  {settings.logoUrl ? (
                    <img referrerPolicy="no-referrer" src={settings.logoUrl} className="h-7 w-auto object-contain rounded mb-1" alt="Logo" />
                  ) : (
                    <div className="h-8 w-8 bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center rounded mb-1">
                      {settings.businessName ? settings.businessName.slice(0,2).toUpperCase() : "RD"}
                    </div>
                  )}
                  <h4 className="font-extrabold text-[11px] text-slate-900 tracking-tight">
                    {settings.businessName || "Ryan Dev Studio"}
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">{settings.email}</p>
                </div>

                <div className="text-right">
                  <h3 className="text-sm font-black text-slate-905 text-slate-900 tracking-tighter uppercase">INVOICE</h3>
                  <span className="font-mono text-slate-500 font-bold">{nextInvoiceId}</span>
                </div>
              </div>

              {/* Sub metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-400">Bill To:</span>
                  <span className="font-bold text-slate-800 block text-[11px] mt-0.5">{activeClient?.name || "(Client not selected)"}</span>
                  {activeClient?.company && (
                    <span className="text-slate-500 block text-[9px]">{activeClient.company}</span>
                  )}
                  {activeClient?.email && (
                    <span className="text-slate-400 block font-mono text-[8px] mt-1">{activeClient.email}</span>
                  )}
                </div>

                <div className="space-y-1.5 font-mono text-right text-[9px]">
                  <div>
                    <span className="text-slate-400 font-sans tracking-wide">DATE ISSUED: </span>
                    <span className="font-bold text-slate-700">{issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans tracking-wide">DATE DUE: </span>
                    <span className="font-bold text-slate-900">{dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Line items tables */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-12 border-b border-slate-100 pb-1.5 font-extrabold text-[8px] uppercase tracking-wider text-slate-400">
                  <div className="col-span-8">Description</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-1 text-right">Rate</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="space-y-2 min-h-[4rem] divide-y divide-slate-50">
                  {lineItems.filter(l => l.description.trim() !== "").map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 pt-1.5 font-normal">
                      <div className="col-span-8 text-slate-700 font-medium pr-2 truncate">{item.description}</div>
                      <div className="col-span-1 text-center font-mono font-medium text-slate-500">{item.qty}</div>
                      <div className="col-span-1 text-right font-mono text-slate-500">${item.unitPrice}</div>
                      <div className="col-span-2 text-right font-mono font-bold text-slate-900">${(item.qty * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL INVOICE COST:</span>
                  <span className="text-sm font-black font-mono text-slate-950">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>

              {/* Extra instructions */}
              {notes && (
                <div className="border-t border-slate-100 pt-3 text-[8px] text-slate-400 max-h-[4rem] overflow-hidden leading-relaxed">
                  <span className="block font-bold text-slate-500 uppercase tracking-wide mb-0.5">TERMS & NOTES:</span>
                  <p>{notes}</p>
                </div>
              )}

              {/* Bottom instant download banner */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleDownloadTrigger}
                  className="w-full bg-slate-955 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg py-2 font-bold flex items-center justify-center gap-1.5 transition-all text-[9.5px]"
                >
                  <Download size={11} />
                  Print & Download PDF Document
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
