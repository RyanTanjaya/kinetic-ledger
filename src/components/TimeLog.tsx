import { useState, FormEvent } from 'react';
import { Calendar, Clock, DollarSign, Plus, ArrowLeft, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import { Project, TimeEntry, ProfileSettings } from '../types';

interface TimeLogProps {
  project: Project;
  timeEntries: TimeEntry[];
  settings: ProfileSettings;
  onBackToClient: (clientId: string) => void;
  onAddLog: (newLog: Omit<TimeEntry, 'id' | 'projectId' | 'projectTitle' | 'clientId' | 'clientName' | 'earnings'>) => void;
  onDeleteLog: (logId: string) => void;
}

export default function TimeLog({
  project,
  timeEntries,
  settings,
  onBackToClient,
  onAddLog,
  onDeleteLog
}: TimeLogProps) {

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  // New Log Form states
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [logDesc, setLogDesc] = useState('');
  const [logHours, setLogHours] = useState<number | ''>(1.5);
  const [errorText, setErrorText] = useState('');

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
    return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filter time logs for this project
  const projectLogs = timeEntries.filter(entry => entry.projectId === project.id);

  // Sorting descending by date
  const sortedLogs = [...projectLogs].sort((a, b) => b.date.localeCompare(a.date));

  // Dynamic aggregates
  const totalHoursLogged = projectLogs.reduce((sum, e) => sum + e.hours, 0);
  const totalEarningsLogged = totalHoursLogged * project.hourlyRate;

  // Form Submission
  const handleSaveDraft = (e: FormEvent) => {
    e.preventDefault();
    if (!logHours || Number(logHours) <= 0) {
      setErrorText('Please enter positive hours.');
      return;
    }
    if (!logDesc.trim()) {
      setErrorText('Please describe what you worked on.');
      return;
    }

    onAddLog({
      date: logDate,
      description: logDesc.trim(),
      hours: Number(logHours)
    });

    // Reset Form
    setLogDesc('');
    setLogHours(1.5);
    setErrorText('');
    setIsLogModalOpen(false);
  };

  // Preview hours * rate
  const hoursPreview = Number(logHours) || 0;
  const earningsPreviewValue = hoursPreview * project.hourlyRate;

  return (
    <div className="space-y-6 animate-fade-in" id="time-log-screen">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button onClick={() => onBackToClient(project.clientId)} className="hover:text-slate-900 cursor-pointer">
          Clients
        </button>
        <span>/</span>
        <button onClick={() => onBackToClient(project.clientId)} className="hover:text-slate-900 cursor-pointer">
          {project.clientName}
        </button>
        <span>/</span>
        <span className="text-slate-900 font-bold">{project.title}</span>
      </div>

      {/* Project Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider font-mono">
                {project.clientName} Project Hub
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-100 uppercase tracking-widest">
                {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans mt-1.5">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">{project.description}</p>
            )}
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="self-start sm:self-center bg-slate-900 hover:bg-slate-800 font-semibold text-xs text-white px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus size={16} />
            Log Time
          </button>
        </div>

        {/* 3 Stat general pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
          <div className="bg-slate-default bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
            <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Hourly rate</span>
            <span className="font-mono text-base font-extrabold text-slate-850 text-slate-800 mt-1 block">
              {formatCurrency(project.hourlyRate)}/hr
            </span>
          </div>

          <div className="bg-slate-default bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
            <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Total Hours</span>
            <span className="font-mono text-base font-extrabold text-slate-800 mt-1 block">
              {totalHoursLogged} hrs logged
            </span>
          </div>

          <div className="bg-slate-default bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
            <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Accumulated earnings</span>
            <span className="font-mono text-base font-extrabold text-teal-600 mt-1 block">
              {formatCurrency(totalEarningsLogged)} earned
            </span>
          </div>
        </div>
      </div>

      {/* Time Entries section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">Time Entries</h3>
            <p className="text-xs text-slate-400 font-medium">Logged sessions of digital contract work</p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-100 rounded">
            {sortedLogs.length} logged items
          </span>
        </div>

        {sortedLogs.length === 0 ? (
          <div className="p-16 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Clock size={20} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">No time entries recorded</h4>
            <p className="text-xs text-slate-400 mt-2">
              Begin by logging some billable research, meetings, or development hours.
            </p>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="mt-4 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold"
            >
              Log Session Hours
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                  <th className="pb-3 pl-3 w-[15%] font-mono">Date</th>
                  <th className="pb-3 w-[55%]">Worked Description</th>
                  <th className="pb-3 text-right w-[12%]">Hours</th>
                  <th className="pb-3 text-right w-[14%]">Earnings</th>
                  <th className="pb-3 pr-3 text-right w-[4%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {sortedLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3.5 pl-3 font-mono text-slate-500 font-bold">{entry.date}</td>
                    <td className="py-3.5 pr-4 text-slate-800 block truncate max-w-lg cursor-pointer" title={entry.description}>
                      {entry.description}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-900 hover:font-bold">{entry.hours} hrs</td>
                    <td className="py-3.5 text-right font-mono text-slate-500 font-bold">{formatCurrency(entry.hours * project.hourlyRate)}</td>
                    <td className="py-3.5 pr-3 text-right">
                      <button
                        onClick={() => onDeleteLog(entry.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Delete entry"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-350 border-slate-200 font-bold bg-slate-50/55 text-slate-900">
                  <td className="py-3 pl-3 font-bold uppercase tracking-wider text-[10px] text-slate-450 text-slate-400">Total</td>
                  <td className="py-3"></td>
                  <td className="py-3 text-right font-mono text-slate-900 text-sm">{totalHoursLogged} hrs</td>
                  <td className="py-3 text-right font-mono text-slate-900 text-sm">{formatCurrency(totalEarningsLogged)}</td>
                  <td className="py-3 pr-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Log Time Dialog Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest text-slate-400">Log Billable Time</h3>
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                close
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveDraft} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-[11px] rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorText}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Date Worked
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Task / Works Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  placeholder="e.g. Homepage hero section animation"
                  rows={3}
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Hours Logged (e.g. 0.5, 1, 1.5, ... )
                </label>
                <input
                  type="number"
                  required
                  step={0.5}
                  min={0.5}
                  max={24}
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white text-xs font-mono text-slate-800 rounded-lg focus:outline-none focus:ring-2 transition-all"
                />
              </div>

              {/* Dynamic cost rate estimation display */}
              {hoursPreview > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[10px] text-slate-500 text-center">
                  Calculation preview: <br />
                  <strong className="text-slate-900">{hoursPreview} hrs</strong> × <strong className="text-slate-905 text-slate-900">${project.hourlyRate}/hr</strong> = <strong className="text-teal-650 text-teal-600">{formatCurrency(earningsPreviewValue)}</strong>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
