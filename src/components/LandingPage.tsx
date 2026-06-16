import { useState } from 'react';
import {
  Receipt,
  Clock,
  Users,
  BarChart2,
  ArrowRight,
  Play,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import VectorDashboard from './VectorDashboard';

interface LandingPageProps {
  /** Enter the actual app (dashboard). Wired from App.tsx. */
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  // Reusable Container Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans scroll-smooth selection:bg-slate-900 selection:text-white">

      {/* MINIMAL NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between sm:px-10">
          <div className="flex items-center gap-2.5">
            {/* Minimal Slate-900 Logo */}
            <div className="h-8 w-8 rounded-sm bg-slate-900 flex items-center justify-center font-sans font-bold text-sm text-white">
              K
            </div>
            <span className="font-sans font-bold text-lg tracking-tighter text-slate-900">
              KINETIC
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onEnter}
              className="hidden sm:inline-block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onEnter}
              className="bg-slate-900 text-white px-5 py-2 text-sm font-medium rounded-full hover:bg-slate-800 transition-all duration-200 shadow-sm shadow-slate-100"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-16 pb-24 sm:px-10 lg:pt-24 lg:pb-32 overflow-hidden bg-slate-50/40 border-b border-slate-100">
        <div className="mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center">

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-medium text-slate-900 max-w-4xl tracking-tight leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-[76px] mb-8"
          >
            Your freelance finance <br className="hidden md:inline" />
            <span className="underline decoration-2 underline-offset-8 decoration-slate-200">
              command center.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 max-w-md text-base sm:text-lg leading-relaxed text-slate-500"
          >
            A unified workspace to manage clients, track billable hours, and generate professional invoices — with precision and speed.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={onEnter}
              className="px-8 py-4 bg-slate-900 text-white font-medium rounded-md shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all text-sm inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight size={15} className="ml-2" />
            </button>
            <button
              type="button"
              onClick={onEnter}
              className="px-8 py-4 border border-slate-250 border-slate-200 text-slate-900 font-medium rounded-md hover:bg-slate-50/60 transition-all text-sm inline-flex items-center justify-center"
            >
              <Play size={13} className="mr-2 fill-current" />
              View Live Demo
            </button>
          </motion.div>

          {/* Interactive Live Vector Dashboard Simulator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 60, damping: 15 }}
            className="w-full mt-8"
          >
            <VectorDashboard />
          </motion.div>
        </div>

        {/* Blueprint background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a02_1px,transparent_1px),linear-gradient(to_bottom,#0f172a02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      </section>

      {/* CORE CAPABILITIES MODULE (Bento Grid) */}
      <section id="features" className="py-24 bg-white scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">

          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
              [ 01 // OVERVIEW ]
            </span>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Everything you need to run your independent business.
            </h2>
            <p className="mt-4 text-base text-slate-500">
              No clutter, no heavy graphs, and no confusing dashboards. We focus on sheer high-legibility mechanics so you can focus on executing client work.
            </p>
          </div>

          {/* Bento Grid with individual Slate Minimalist elements */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Box 1 (Span 2) */}
            <motion.div
              variants={itemVariants}
              className="col-span-1 md:col-span-2 p-8 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:bg-white group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-6 shadow-sm">
                  <Receipt size={18} />
                </div>
                <h3 className="font-sans font-bold text-xl text-slate-900 mb-2 tracking-tight">Smart Invoicing</h3>
                <p className="text-slate-500 text-sm max-w-lg leading-relaxed">
                  Draft invoice templates designed with pristine Swiss-grid vector structures. Create PDFs that look exceptionally professional, support multi-currency, and expedite payments.
                </p>
              </div>
              <div className="mt-8 p-4 bg-white/70 border border-slate-100 rounded-xl font-mono text-[10px] text-slate-500 flex flex-wrap gap-x-4 gap-y-2 justify-between shadow-sm">
                <span>ITEM_RECURRING: YES</span>
                <span>STATUS_TRACKER: INTUITIVE</span>
                <span>STRIPE_GATEWAY: INTEGRATED</span>
              </div>
            </motion.div>

            {/* Box 2 (Default size) */}
            <motion.div
              variants={itemVariants}
              className="p-8 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:bg-white"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-6 shadow-sm">
                  <Clock size={18} />
                </div>
                <h3 className="font-sans font-bold text-xl text-slate-900 mb-2 tracking-tight">Precision Time</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Log hours directly against active projects and contracts with client-specific roundings. No tabs or distractions.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600">
                <span>ROUNDING CRITERIA: 15m</span>
                <ChevronRight size={14} />
              </div>
            </motion.div>

            {/* Box 3 (Default size) */}
            <motion.div
              variants={itemVariants}
              className="p-8 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:bg-white"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-6 shadow-sm">
                  <Users size={18} />
                </div>
                <h3 className="font-sans font-bold text-xl text-slate-900 mb-2 tracking-tight">Client Hub (CRM)</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Consolidate every agreement, archived invoice, point of contact, and cumulative bill into a neat, ultra-readable directory.
                </p>
              </div>
              <span className="mt-6 font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                DIRECTORY // ONLINE_DATA_SYNCED
              </span>
            </motion.div>

            {/* Box 4 (Span 2) */}
            <motion.div
              variants={itemVariants}
              className="col-span-1 md:col-span-2 p-8 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:bg-white"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-6 shadow-sm">
                    <BarChart2 size={18} />
                  </div>
                  <h3 className="font-sans font-bold text-xl text-slate-900 mb-2 tracking-tight">Financial Reports</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Monitor precise revenue trends, incoming wire completions, and active tax allocations without complex data modeling.
                  </p>
                  <button
                    type="button"
                    onClick={onEnter}
                    className="font-mono text-[10px] uppercase tracking-wider font-bold text-slate-800 inline-flex items-center gap-1 border-b border-slate-200 pb-0.5 hover:border-slate-400"
                  >
                    Review Vector Ledger Reporting <ArrowRight size={12} />
                  </button>
                </div>

                {/* Micro clean widget illustration */}
                <div className="w-full md:w-64 border border-slate-100 bg-white shadow-sm rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-slate-400">ALLOCATED SECTORS</span>
                    <span className="font-bold text-emerald-600">100% HEALTH</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded overflow-hidden">
                        <div className="bg-slate-700 h-full w-[65%]"></div>
                      </div>
                      <span className="font-mono text-[9px] w-8 text-right font-semibold text-slate-600">65% TAX</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded overflow-hidden">
                        <div className="bg-slate-700 h-full w-[35%]"></div>
                      </div>
                      <span className="font-mono text-[9px] w-8 text-right font-semibold text-slate-600">35% SAVE</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* REVERSED NEUTRAL EXPLANATION VALUE BANNER */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          <div className="col-span-12 md:col-span-7 space-y-6">
            <span className="px-3 py-1 bg-slate-800 text-slate-300 font-mono text-[9px] tracking-widest uppercase rounded">
              THE INTENT
            </span>
            <h3 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-white">
              Engineered for extreme visual focus. No fluff.
            </h3>
            <p className="text-slate-300/80 text-base max-w-xl leading-relaxed">
              We ditched colorful glowing charts and infinite configuration menus. Modern business is complex enough; your tools shouldn't be. Kinetic Ledger gives you clear lines, optimal fonts, and blazing fast data entry.
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 grid grid-cols-2 gap-4">
            <div className="border border-slate-800 p-5 rounded-xl bg-slate-800/40">
              <span className="font-mono text-[10px] text-slate-400 block mb-1">01 / CONTRAST</span>
              <span className="font-sans font-bold text-lg block text-white">9.4:1 Audio-Visual</span>
              <p className="text-[11px] text-slate-400 mt-2">Unmatched readability across screen designs.</p>
            </div>
            <div className="border border-slate-800 p-5 rounded-xl bg-slate-800/40">
              <span className="font-mono text-[10px] text-slate-400 block mb-1">02 / WEIGHT</span>
              <span className="font-sans font-bold text-lg block text-white">&lt; 0.4s Loaded</span>
              <p className="text-[11px] text-slate-400 mt-2">Ultra thin network footprint instantly hotloaded.</p>
            </div>
          </div>
        </div>
        {/* Tiny crosshairs to evoke layout accuracy feeling */}
        <div className="absolute top-6 left-6 text-slate-700 font-mono text-xs">+</div>
        <div className="absolute top-6 right-6 text-slate-700 font-mono text-xs">+</div>
        <div className="absolute bottom-6 left-6 text-slate-700 font-mono text-xs">+</div>
        <div className="absolute bottom-6 right-6 text-slate-700 font-mono text-xs">+</div>
      </section>

      {/* ACCORDION FAQ SECTION */}
      <section id="faq" className="py-24 bg-slate-50/30 border-t border-slate-100 scroll-mt-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
              [ 03 // FREQUENTLY ASKED ]
            </span>
            <h2 className="font-display font-medium text-3xl text-slate-900 tracking-tight">
              Answering your core questions.
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is Kinetic Ledger offline first?",
                a: "Yes! All your draft inputs, project timers, and local ledger details sync locally instantly, ensuring you write and record billable metrics even if you suffer unexpected network outages."
              },
              {
                q: "Can I export my records for taxes?",
                a: "Absolutely. We support structured CSV exports, vector PDF format downloads, and JSON endpoints compatible with common accountant ledgers and auditing systems."
              },
              {
                q: "Do my clients need to sign up?",
                a: "Never. Your clients receive standard, beautiful, minimalist web invoices and PDF ledgers. They can pay instantly via cards, wires, or digital wallets with no logins required."
              },
              {
                q: "Is there a limit on standard invoices?",
                a: "Free accounts can generate unlimited raw invoice previews in draft. However, actual outbound tracking and ledger persistence apply to the first 3 active clients."
              }
            ].map((faq, index) => {
              const isOpen = activeFAQ === index;
              return (
                <div
                  key={index}
                  onClick={() => setActiveFAQ(isOpen ? null : index)}
                  className="border border-slate-100 bg-white rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-250"
                >
                  <div className="flex justify-between items-center bg-transparent">
                    <h4 className="font-sans font-bold text-sm sm:text-base text-slate-800 tracking-tight">
                      {faq.q}
                    </h4>
                    <span className="font-mono text-xs text-slate-400 font-bold ml-2">
                      {isOpen ? '[-]' : '[+]'}
                    </span>
                  </div>
                  {isOpen && (
                    <p className="mt-4 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MINIMALIST FOOTER */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-900">

            {/* Footer Brand Logo Block */}
            <div className="col-span-12 md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-sm bg-white flex items-center justify-center font-sans font-bold text-sm text-slate-950">
                  K
                </div>
                <span className="font-sans font-bold text-base text-white tracking-tight">
                  KINETIC
                </span>
              </div>
              <p className="text-slate-400/80 text-xs max-w-xs leading-relaxed">
                The high-contrast, minimalist command center built exclusively for modern independent professionals.
              </p>
            </div>

            {/* Links Columns */}
            <div className="col-span-6 md:col-span-3 space-y-4">
              <h5 className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                PRODUCT
              </h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features &amp; Mechanics</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked</a></li>
              </ul>
            </div>

            <div className="col-span-6 md:col-span-4 space-y-4">
              <h5 className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                CONNECT &amp; VERIFICATION
              </h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    Twitter / X <ExternalLink size={10} />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    LinkedIn <ExternalLink size={10} />
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    Github Repository <ExternalLink size={10} />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom attribution bar */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-500">
            <span>© 2026 KINETIC LEDGER INC. ALL RIGHTS RESERVED.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-400 transition-colors">PRIVACY POLICY</a>
              <span>/</span>
              <a href="#" className="hover:text-slate-400 transition-colors">TERMS OF SERVICE</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
