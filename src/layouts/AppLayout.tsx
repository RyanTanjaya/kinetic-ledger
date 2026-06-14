import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', Icon: Users },
  { to: '/invoices', label: 'Invoices', Icon: Receipt },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
];

// Persistent authenticated shell: top nav (desktop) + bottom bar (mobile) + routed content.
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name ?? 'Account';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white pb-16">
      {/* GLOBAL TOP NAV */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between sm:px-10 h-20">
          {/* Brand */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center font-sans font-extrabold text-sm text-white shadow-md">
              K
            </div>
            <div>
              <span className="font-display font-black text-sm uppercase tracking-wider text-slate-900 block leading-none">
                Kinetic Ledger
              </span>
              <span className="font-mono text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5 block">
                SaaS Dashboard
              </span>
            </div>
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 py-1 transition-all cursor-pointer ${
                    isActive ? 'text-slate-900 border-b-2 border-slate-900' : 'hover:text-slate-900'
                  }`
                }
              >
                <Icon size={13} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* User capsule + logout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block font-sans font-bold text-xs text-slate-800">{displayName}</span>
            <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-sans font-bold text-xs text-slate-800 uppercase shadow-inner">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="ml-1 p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM BAR */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-40 bg-slate-900/95 text-white/70 shadow-2xl rounded-2xl border border-slate-800 px-6 py-3 flex justify-between items-center backdrop-blur-lg">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 cursor-pointer transition-all ${isActive ? 'text-white scale-110 font-bold' : ''}`
            }
          >
            <Icon size={15} />
            <span className="text-[9px]">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* ROUTED CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        <Outlet />
      </main>
    </div>
  );
}
