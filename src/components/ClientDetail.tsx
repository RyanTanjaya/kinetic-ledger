import { useState, FormEvent } from 'react';
import { ArrowLeft, Plus, X, Mail, Phone, Edit2, FileText, CheckCircle, Clock, Trash, Download } from 'lucide-react';
import { Client, Project, Invoice, ProfileSettings } from '../types';

interface ClientDetailProps {
  client: Client;
  projects: Project[];
  invoices: Invoice[];
  settings: ProfileSettings;
  onBackToList: () => void;
  onEditClient: (updates: { name: string; company: string; email: string; phone: string }) => void;
  onEditProject: (projectId: string, updates: { title: string; description: string; hourlyRate: number; status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'; budget?: number }) => void;
  onAddProject: (newProj: Omit<Project, 'id' | 'clientId' | 'clientName' | 'totalHours'>) => void;
  onNavigateToInvoiceGenerator: (clientId: string) => void;
  onNavigateToTimeLog: (projectId: string) => void;
  onDownloadInvoice: (invoice: Invoice) => void;
  onMarkInvoicePaid: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
}

export default function ClientDetail({
  client,
  projects,
  invoices,
  settings,
  onBackToList,
  onEditClient,
  onEditProject,
  onAddProject,
  onNavigateToInvoiceGenerator,
  onNavigateToTimeLog,
  onDownloadInvoice,
  onMarkInvoicePaid,
  onDeleteInvoice
}: ClientDetailProps) {
  
  const [activeTab, setActiveTab] = useState<'Projects' | 'Invoices'>('Projects');
  const [isAddProjModalOpen, setIsAddProjModalOpen] = useState(false);

  // Edit Client fields
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Edit Project fields
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjTitle, setEditProjTitle] = useState('');
  const [editProjDesc, setEditProjDesc] = useState('');
  const [editProjRate, setEditProjRate] = useState(75);
  const [editProjStatus, setEditProjStatus] = useState<'ACTIVE' | 'PAUSED' | 'COMPLETED'>('ACTIVE');
  const [editProjBudget, setEditProjBudget] = useState<number | ''>('');

  // Add Project fields
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projRate, setProjRate] = useState(75);
  const [projStatus, setProjStatus] = useState<'ACTIVE' | 'PAUSED' | 'COMPLETED'>('ACTIVE');
  const [projBudget, setProjBudget] = useState<number | ''>('');

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
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const clientProjects = projects.filter(p => p.clientId === client.id);
  const clientInvoices = invoices.filter(i => i.clientId === client.id);

  const handleCreateProject = (e: FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    onAddProject({
      title: projTitle.trim(),
      description: projDesc.trim(),
      hourlyRate: Number(projRate) || 0,
      status: projStatus,
      budget: projBudget !== '' ? Number(projBudget) : undefined
    });

    // Reset Form
    setProjTitle('');
    setProjDesc('');
    setProjRate(75);
    setProjStatus('ACTIVE');
    setProjBudget('');
    setIsAddProjModalOpen(false);
  };

  const openEditClient = () => {
    setEditName(client.name);
    setEditCompany(client.company);
    setEditEmail(client.email);
    setEditPhone(client.phone);
    setIsEditClientOpen(true);
  };

  const handleEditClientSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onEditClient({
      name: editName.trim(),
      company: editCompany.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
    });
    setIsEditClientOpen(false);
  };

  const openEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setEditProjTitle(proj.title);
    setEditProjDesc(proj.description || '');
    setEditProjRate(proj.hourlyRate);
    setEditProjStatus(proj.status);
    setEditProjBudget(proj.budget ?? '');
  };

  const handleEditProjSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProjectId || !editProjTitle.trim()) return;
    onEditProject(editingProjectId, {
      title: editProjTitle.trim(),
      description: editProjDesc.trim(),
      hourlyRate: Number(editProjRate) || 0,
      status: editProjStatus,
      budget: editProjBudget !== '' ? Number(editProjBudget) : undefined,
    });
    setEditingProjectId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="client-detail-screen">
      
      {/* Back button */}
      <button 
        onClick={onBackToList}
        className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Clients
      </button>

      {/* Client Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Large Initials Avatar Circle (64px) */}
          <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xl uppercase shadow-inner shrink-0">
            {getInitials(client.name)}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight font-sans">
              {client.name}
            </h1>
            {client.company && (
              <p className="text-sm text-slate-400 font-medium mt-0.5">{client.company}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-slate-500 font-medium">
              {client.email && (
                <span className="flex items-center gap-1 font-mono">
                  <Mail size={12} className="text-slate-400" />
                  {client.email}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1 font-mono">
                  <Phone size={12} className="text-slate-400" />
                  {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Far Right */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            type="button"
            onClick={openEditClient}
            className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Edit2 size={13} />
            Edit Client
          </button>
          <button
            onClick={() => onNavigateToInvoiceGenerator(client.id)}
            className="flex-1 md:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <FileText size={13} />
            New Invoice
          </button>
        </div>
      </div>

      {/* Tabs list with underline style */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('Projects')}
          className={`px-5 py-3 text-sm font-semibold tracking-tight border-b-2 transition-all cursor-pointer ${
            activeTab === 'Projects'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Projects ({clientProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('Invoices')}
          className={`px-5 py-3 text-sm font-semibold tracking-tight border-b-2 transition-all cursor-pointer ${
            activeTab === 'Invoices'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Invoices ({clientInvoices.length})
        </button>
      </div>

      {/* Projects tab contents */}
      {activeTab === 'Projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-transparent">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Active & Completed Projects</h3>
            <button
              onClick={() => setIsAddProjModalOpen(true)}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus size={14} />
              Add Project
            </button>
          </div>

          {clientProjects.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-16 text-center max-w-sm mx-auto bg-white/50">
              <p className="text-sm font-medium text-slate-600">No projects established</p>
              <p className="text-xs text-slate-400 mt-1">Setup your first active project to log contract rates.</p>
              <button
                onClick={() => setIsAddProjModalOpen(true)}
                className="mt-4 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800"
              >
                Log Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientProjects.map((proj) => {
                const statusColors = {
                  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-100',
                  PAUSED: 'bg-amber-50 text-amber-800 border-amber-100',
                  COMPLETED: 'bg-slate-50 text-slate-600 border-slate-100'
                };

                return (
                  <div key={proj.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
                    {/* Status badge in top right */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h4 className="font-bold text-sm text-slate-900 truncate leading-snug pr-4" title={proj.title}>
                        {proj.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border shrink-0 ${statusColors[proj.status]}`}>
                        {proj.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5rem] mb-4">
                      {proj.description || 'No description listed.'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-4 mb-4 text-center">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Rate</span>
                        <span className="font-mono text-xs font-semibold text-slate-800">${proj.hourlyRate}/hr</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Hours</span>
                        <span className="font-mono text-xs font-semibold text-slate-800">{proj.totalHours} hrs</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Earnings</span>
                        <span className="font-mono text-xs font-extrabold text-slate-900">{formatCurrency(proj.totalHours * proj.hourlyRate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProject(proj)}
                        className="px-3 py-2 border border-slate-100 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-semibold text-slate-700 transition-colors flex items-center gap-1"
                        title="Edit project"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => onNavigateToTimeLog(proj.id)}
                        className="flex-1 text-center py-2 border border-slate-100 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        View Project Sheet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab Content */}
      {activeTab === 'Invoices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-transparent">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Raised Invoices</h3>
            <button
              onClick={() => onNavigateToInvoiceGenerator(client.id)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus size={14} />
              Raise Invoice
            </button>
          </div>

          {clientInvoices.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-16 text-center max-w-sm mx-auto bg-white/50">
              <p className="text-sm font-medium text-slate-600">No invoices generated yet</p>
              <p className="text-xs text-slate-400 mt-1">Start by adding projects or go directly to the invoice creator.</p>
              <button
                onClick={() => onNavigateToInvoiceGenerator(client.id)}
                className="mt-4 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800"
              >
                Raise Invoice
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                    <th className="p-4 pl-6">Invoice #</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientInvoices.map((inv) => {
                    const statusStyles: Record<string, string> = {
                      Draft: 'bg-slate-50 text-slate-600 border-slate-100',
                      Sent: 'bg-sky-50 text-sky-800 border-sky-100',
                      Paid: 'bg-emerald-50 text-emerald-800 border-emerald-100',
                      Overdue: 'bg-rose-50 text-rose-800 border-rose-100'
                    };

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-900">{inv.id}</td>
                        <td className="p-4 font-mono font-bold text-slate-900 text-sm">{formatCurrency(inv.amount)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${statusStyles[inv.status]}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className={`p-4 ${inv.status === 'Overdue' ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                          {inv.dueDate}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            {inv.status === 'Sent' && (
                              <button
                                onClick={() => onMarkInvoicePaid(inv.id)}
                                className="p-1 px-2 border border-emerald-200 text-emerald-700 bg-emerald-50/30 font-semibold hover:bg-emerald-100/50 rounded text-[10px] transition-all"
                                title="Mark as fully paid"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => onDownloadInvoice(inv)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-100 hover:bg-slate-50 rounded"
                              title="Download PDF"
                            >
                              <Download size={12} />
                            </button>
                            {inv.status === 'Draft' && (
                              <button
                                onClick={() => onDeleteInvoice(inv.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Delete Draft"
                              >
                                <Trash size={12} />
                              </button>
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
      )}

      {/* Edit Client Dialog */}
      {isEditClientOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Client</h3>
              <button
                onClick={() => setIsEditClientOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditClientOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Dialog */}
      {editingProjectId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Project</h3>
              <button
                onClick={() => setEditingProjectId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProjSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editProjTitle}
                  onChange={(e) => setEditProjTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={editProjDesc}
                  onChange={(e) => setEditProjDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Hourly Rate ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={editProjRate}
                    onChange={(e) => setEditProjRate(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                  <select
                    value={editProjStatus}
                    onChange={(e: any) => setEditProjStatus(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Project Budget ($)</label>
                <input
                  type="number"
                  value={editProjBudget}
                  onChange={(e) => setEditProjBudget(e.target.value !== '' ? parseInt(e.target.value) : '')}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProjectId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Centered Dialog Modal */}
      {isAddProjModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Project</h3>
              <button 
                onClick={() => setIsAddProjModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                close
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description Optional
                </label>
                <textarea
                  placeholder="Provide high level scope details..."
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={projRate}
                    onChange={(e) => setProjRate(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Status
                  </label>
                  <select
                    value={projStatus}
                    onChange={(e: any) => setProjStatus(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Project Budget Optional ($)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={projBudget}
                  onChange={(e) => setProjBudget(e.target.value !== '' ? parseInt(e.target.value) : '')}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddProjModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Log Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
