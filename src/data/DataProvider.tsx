import { createContext, useContext, useState, type ReactNode } from 'react';
import { X, Download } from 'lucide-react';
import { Invoice, ProfileSettings } from '../types';
import { INITIAL_SETTINGS } from './mockData';
import { downloadInvoicePdf } from '../lib/pdf';

// Lightweight app context. Clients/projects/invoices/time are all served by the
// live API now (TanStack Query); this just holds the current user settings
// (until Step 9 wires them to the API) and the one-click invoice PDF download.
interface DataContextValue {
  settings: ProfileSettings;
  saveSettings: (s: ProfileSettings) => void;
  downloadInvoice: (inv: Invoice) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
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

  const saveSettings = (s: ProfileSettings) => setSettings(s);

  const downloadInvoice = (invoice: Invoice) => {
    void downloadInvoicePdf(invoice, settings);
    setPreviewInvoice(invoice);
  };

  return (
    <DataContext.Provider value={{ settings, saveSettings, downloadInvoice }}>
      {children}

      {/* Invoice-downloaded confirmation (global overlay). */}
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

            <h3 className="font-sans font-extrabold text-slate-900 tracking-tight text-lg">Invoice PDF downloaded</h3>
            <p className="text-xs text-slate-400 mt-1">A professional PDF has been generated and saved to your device.</p>

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
