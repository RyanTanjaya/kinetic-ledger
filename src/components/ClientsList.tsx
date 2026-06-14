import { useState, FormEvent } from 'react';
import { Search, Plus, Mail, MessageSquare, Briefcase, Eye, Trash, Edit2, X, AlertCircle } from 'lucide-react';
import { Client, Project, Invoice, ProfileSettings } from '../types';

interface ClientsListProps {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  settings: ProfileSettings;
  onAddClient: (newClient: Omit<Client, 'id' | 'totalBilled'>) => void;
  onDeleteClient: (id: string) => void;
  onNavigateToClient: (id: string) => void;
}

export default function ClientsList({
  clients,
  projects,
  invoices,
  settings,
  onAddClient,
  onDeleteClient,
  onNavigateToClient
}: ClientsListProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Client Form State
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorText, setErrorText] = useState('');

  // Currency Dynamic formatting
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

  // Get Avatar background styling
  const getAvatarColorClass = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
      'bg-emerald-100 text-emerald-800',
      'bg-amber-100 text-amber-800',
      'bg-blue-100 text-blue-800',
      'bg-rose-100 text-rose-800',
      'bg-purple-100 text-purple-800'
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Form Submission
  const handleSaveDraft = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorText('Full Name is required.');
      return;
    }
    onAddClient({
      name: fullName.trim(),
      company: companyName.trim(),
      email: emailAddress.trim(),
      phone: phoneNumber.trim()
    });
    // Reset form
    setFullName('');
    setCompanyName('');
    setEmailAddress('');
    setPhoneNumber('');
    setErrorText('');
    setIsAddModalOpen(false);
  };

  // Filter clients
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" id="clients-list-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your customer relationships, projects and aggregate billed finances.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-650 bg-teal-650 bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold rounded-full hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          Add Client
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute left-3.5 top-3.5 text-slate-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search clients by name, company or email..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-white text-sm text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all shadow-sm"
        />
      </div>

      {/* Client Table / Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-16 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Search size={22} />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">No clients found</h4>
            <p className="text-sm text-slate-500 mt-2">
              Try adjusting your search query, or add a client details database log.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-700"
            >
              Add Your First Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                  <th className="p-4 pl-6">Client Name</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Active Projects</th>
                  <th className="p-4">Total Paid (Billed)</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => {
                  // Count total actual active projects
                  const clientProjs = projects.filter(p => p.clientId === client.id);
                  const activeProjsCount = clientProjs.length;

                  // Paid invoice calculations
                  const clientPaidTotal = invoices
                    .filter(i => i.clientId === client.id && i.status === 'Paid')
                    .reduce((sum, i) => sum + i.amount, 0);

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {/* Circle Avatar with Initials */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-tight shrink-0 ${getAvatarColorClass(client.name)}`}>
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900 text-xs sm:text-sm hover:underline cursor-pointer" onClick={() => onNavigateToClient(client.id)}>
                              {client.name}
                            </span>
                            {client.company && (
                              <span className="block text-[10px] text-slate-400 font-medium sm:hidden">
                                {client.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-sans">{client.company || '—'}</td>
                      <td className="p-4 text-slate-500 font-mono text-[11px] font-medium">{client.email || '—'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                          {activeProjsCount} {activeProjsCount === 1 ? 'project' : 'projects'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(clientPaidTotal || client.totalBilled)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onNavigateToClient(client.id)}
                            className="p-1 px-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded font-semibold text-[11px] flex items-center gap-1 transition-all"
                            title="Open Client Hub"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => onDeleteClient(client.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Client Record"
                          >
                            <Trash size={12} />
                          </button>
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

      {/* Add Client Centered Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Client</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveDraft} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-[11px] rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorText}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. sarah@acme.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +1 (555) 010-1234"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
