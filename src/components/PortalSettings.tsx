import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { Upload, HelpCircle, Save, Check, Mail, Building, Laptop, Settings, CreditCard, Shield } from 'lucide-react';
import { ProfileSettings } from '../types';

interface PortalSettingsProps {
  settings: ProfileSettings;
  onSaveSettings: (updated: ProfileSettings) => void;
}

export default function PortalSettings({
  settings,
  onSaveSettings
}: PortalSettingsProps) {

  // State
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [currency, setCurrency] = useState(settings.currency);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [paymentTerms, setPaymentTerms] = useState(settings.paymentTerms);
  const [defaultNotes, setDefaultNotes] = useState(settings.defaultNotes);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [showToast, setShowToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if form has unsaved modifications
  const hasChanges = 
    displayName !== settings.displayName ||
    businessName !== settings.businessName ||
    currency !== settings.currency ||
    invoicePrefix !== settings.invoicePrefix ||
    paymentTerms !== settings.paymentTerms ||
    defaultNotes !== settings.defaultNotes ||
    logoUrl !== (settings.logoUrl || '');

  // Handle Logo uploading
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024) {
        alert("File size exceeds 50KB limit. Please choose a smaller layout image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      displayName,
      businessName,
      email: settings.email,
      currency,
      invoicePrefix,
      paymentTerms,
      defaultNotes,
      logoUrl
    });

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in" id="settings-screen">
      
      {/* Page header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure display attributes, default terms and payment coordinate coordinates.
        </p>
      </div>

      {/* Unsaved banner alert */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800 font-bold flex items-center justify-between shadow-inner animate-pulse">
          <span>⚠️ You have unsaved changes. Remember to persist your modifications.</span>
          <button 
            onClick={handleFormSubmit}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] uppercase tracking-wider font-extrabold transition-all"
          >
            Save Now
          </button>
        </div>
      )}

      {/* Settings Action Toast Notice */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-850 text-white font-mono text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={14} className="text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* The full form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">

        {/* Card 1: Profile & Business */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-50 pb-3">
            <Building size={16} className="text-slate-400" />
            Profile & Business Info
          </h3>

          {/* Logo upload circular box */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
            <div className="relative shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Business Logo" 
                  className="w-20 h-20 rounded-full border border-slate-200 object-cover shadow-inner"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 text-slate-450 text-slate-500 font-bold flex items-center justify-center text-lg uppercase shadow-inner">
                  {displayName ? displayName.slice(0, 2).toUpperCase() : "RT"}
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <span className="block text-xs font-bold text-slate-800">Business Logo</span>
              <p className="text-[10px] text-slate-400">
                PNG or JPG, max 200×200px, under 50KB. Appears on invoice PDFs.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLogoUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div className="flex justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all shadow-sm flex items-center gap-1"
                >
                  <Upload size={12} />
                  Upload Logo
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="px-2.5 py-1.5 border border-slate-200 text-[11px] font-semibold rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Business Info fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                required
                placeholder="Ryan Dev Studio"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address (Read-only Account verification)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Mail size={13} />
                </span>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={settings.email}
                  className="w-full pl-8 pr-3.5 py-2 border border-slate-200 bg-slate-50 text-xs font-mono text-slate-400 rounded-lg cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Invoice Preferences */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-50 pb-3">
            <CreditCard size={16} className="text-slate-400" />
            Invoice Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-semibold text-slate-800 rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SGD">SGD (S$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="MYR">MYR (RM)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                required
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 rounded-lg focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Payment Terms (Net)
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 cursor-pointer"
              >
                <option value="Net 7">Net 7 Days</option>
                <option value="Net 14">Net 14 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Default Notes / Payment Details (Pre-fills new invoices)
            </label>
            <textarea
              rows={3}
              value={defaultNotes}
              onChange={(e) => setDefaultNotes(e.target.value)}
              placeholder="e.g. Please transfer payments to Ryan Dev Bank details: ..."
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-white text-xs text-slate-800 rounded-xl focus:outline-none focus:ring-2 transition-all font-sans"
            />
          </div>
        </div>

        {/* Form Actions footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-md shadow-slate-100 cursor-pointer"
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
