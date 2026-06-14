import { useState, useEffect } from 'react';
import { Play, Square, FileText, TrendingUp, Clock, User, DollarSign, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VectorDashboard() {
  // Simple state for interactive features
  const [clientName, setClientName] = useState('Acme Agency');
  const [projectName, setProjectName] = useState('Identity Redesign');
  const [hourlyRate, setHourlyRate] = useState(90);
  const [hours, setHours] = useState(14.5);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
        // Slowly add to tracked hours for demo feedback
        if (timerSeconds > 0 && timerSeconds % 5 === 0) {
          setHours((prev) => parseFloat((prev + 0.1).toFixed(2)));
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleStartStop = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleReset = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const totalBilled = (hours * hourlyRate).toFixed(2);

  // Format stopwatch output: hh:mm:ss
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="w-full max-w-5xl mx-auto border border-slate-100 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden mt-12 grid grid-cols-1 md:grid-cols-12">
      {/* Simulation Header */}
      <div className="col-span-12 bg-slate-50/70 text-slate-700 px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200"></span>
            <span className="w-3 h-3 rounded-full bg-slate-300"></span>
            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
          </div>
          <span className="font-mono text-xs text-slate-500 tracking-wider uppercase">
            LIVE PREVIEW // interactive_command_center.sh
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[10px] text-emerald-600 font-semibold tracking-wider">ACTIVE SANDBOX</span>
        </div>
      </div>

      {/* Simulator Control Panel - Left Side */}
      <div className="col-span-12 md:col-span-5 p-6 md:p-8 bg-slate-50/50 border-r border-b md:border-b-0 border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="px-2 py-0.5 font-mono text-[10px] bg-slate-100 text-slate-600 font-bold uppercase tracking-wide rounded">
              CTRL PANEL
            </span>
            <h4 className="font-sans font-medium text-xs tracking-tight text-slate-500">
              Customize dynamic ledger metrics
            </h4>
          </div>

          <div className="space-y-4">
            {/* Input Client Name */}
            <div>
              <label className="block font-mono text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                Active Client
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <User size={14} />
                </span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 font-sans rounded-lg transition-all"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>

            {/* Input Project */}
            <div>
              <label className="block font-mono text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                Project Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <FileText size={14} />
                </span>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 font-sans rounded-lg transition-all"
                  placeholder="e.g. Design Consulting"
                />
              </div>
            </div>

            {/* Rates Layout */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                  Hourly Rate ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <DollarSign size={14} />
                  </span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 font-mono rounded-lg transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">
                  Billable Hours
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    <Clock size={14} />
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 font-mono rounded-lg transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Time Tracker Simulation */}
        <div className="mt-8 pt-6 border-t border-slate-150">
          <h5 className="font-mono text-[10px] font-bold uppercase tracking-wider mb-3 text-slate-500">
            TEST KINETIC TRACKER
          </h5>
          <div className="p-4 border border-slate-150 bg-white rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">SESSION TIME</span>
              <span className="font-mono text-xl font-bold text-slate-800 tracking-wider">
                {formatTime(timerSeconds)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartStop}
                className={`px-4 py-2 text-xs font-sans font-semibold rounded-lg border transition-colors duration-200 flex items-center gap-1.5 ${
                  isTimerRunning
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-slate-955 bg-slate-900 text-white hover:bg-slate-800 border-transparent shadow-sm'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Square size={12} className="fill-current" /> Pause
                  </>
                ) : (
                  <>
                    <Play size={12} className="fill-current" /> Track
                  </>
                )}
              </button>
              {timerSeconds > 0 && (
                <button
                  onClick={handleReset}
                  className="px-2.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-mono font-bold transition-colors"
                  title="Reset Timer"
                >
                  RESET
                </button>
              )}
            </div>
          </div>
          {isTimerRunning && (
            <p className="font-mono text-[9px] text-emerald-600 mt-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live tracker actively recalculating project ledger rates every 5s
            </p>
          )}
        </div>
      </div>

      {/* Simulator Vector Output Ledger - Right Side */}
      <div className="col-span-12 md:col-span-7 p-6 md:p-8 bg-white flex flex-col justify-between">
        {/* Mock Invoice Preview */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
                <span className="font-mono text-[9px] font-bold text-white">K</span>
              </div>
              <span className="font-display font-bold text-xs tracking-wider uppercase text-slate-800">
                LEDGER #KL-2026
              </span>
            </div>
            <span className="font-mono text-[9px] bg-slate-50 border border-slate-100 py-1 px-2.5 rounded-full text-slate-500 font-medium">
              STATUS: DRAFT OUTBOUND
            </span>
          </div>

          {/* Minimal Invoice Ledger Card */}
          <div className="border border-slate-100 bg-slate-50/40 p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between border-b border-slate-200/60 pb-3">
              <div>
                <span className="block font-mono text-[9px] text-slate-400 tracking-wider uppercase">CLIENT</span>
                <span className="font-sans font-semibold text-sm text-slate-800">{clientName || 'Unnamed Client'}</span>
              </div>
              <div className="text-right">
                <span className="block font-mono text-[9px] text-slate-400 tracking-wider uppercase">DATE</span>
                <span className="font-mono text-xs text-slate-600 font-medium">JUNE 09, 2026</span>
              </div>
            </div>

            <div className="flex justify-between border-b border-slate-200/60 pb-3">
              <div>
                <span className="block font-mono text-[9px] text-slate-400 tracking-wider uppercase">DESCRIPTION</span>
                <span className="font-sans text-xs text-slate-600">{projectName || 'Project Consulting Work'}</span>
              </div>
              <div className="text-right">
                <span className="block font-mono text-[9px] text-slate-400 tracking-wider uppercase">RATE</span>
                <span className="font-mono text-xs text-slate-700 font-semibold">${hourlyRate}/hr</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="block font-mono text-[9px] text-slate-400 tracking-wider uppercase">ACCUMULATED</span>
                <span className="font-mono text-xs font-semibold text-slate-700">{hours} Hours</span>
              </div>
              <div className="text-right">
                <span className="block font-mono text-[9px] text-slate-400 tracking-wider uppercase">TOTAL BILLABLE</span>
                <span className="font-mono text-lg font-bold text-slate-900">${totalBilled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mock Analytics Report below */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              MONTHLY VECTOR SCHEMATIC
            </h5>
            <div className="font-mono text-[9px] text-slate-500 flex items-center gap-1">
              <TrendingUp size={10} /> PROJECTED REVENUE +18.4%
            </div>
          </div>

          {/* Clean Flat-Styled Vector Bar Chart */}
          <div className="h-28 border border-slate-100 bg-slate-50/40 rounded-xl p-4 flex items-end justify-between gap-3 relative">
            {/* Grid Lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-slate-100 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-2/4 border-t border-slate-100 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-slate-100 pointer-events-none"></div>

            {/* Bars */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 border-t border-transparent rounded-md h-8 transition-colors duration-200"></div>
              <span className="font-mono text-[9px] text-slate-400 font-medium">MAR</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 border-t border-transparent rounded-md h-14 transition-colors duration-200"></div>
              <span className="font-mono text-[9px] text-slate-400 font-medium">APR</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-slate-200/70 hover:bg-slate-300/80 border-t border-transparent rounded-md h-11 transition-colors duration-200"></div>
              <span className="font-mono text-[9px] text-slate-400 font-medium">MAY</span>
            </div>

            {/* Current month dynamic peak */}
            <div className="flex-1 flex flex-col items-center gap-1 group">
              <motion.div 
                layout 
                className="w-full bg-slate-900 border border-transparent rounded-md relative h-20 hover:bg-slate-850 flex items-start justify-center transition-colors shadow-sm"
              >
                <div className="absolute -top-7 bg-slate-900 text-white text-[8px] font-mono px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${totalBilled}
                </div>
              </motion.div>
              <span className="font-mono text-[9px] text-slate-800 font-bold">JUN</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full bg-slate-100 hover:bg-slate-200 border-t border-transparent rounded-md h-16 transition-colors duration-200"></div>
              <span className="font-mono text-[9px] text-slate-400 font-medium">JUL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
