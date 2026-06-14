import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { getApiErrorMessage } from '../lib/api';

export default function Login() {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Could not sign in. Check your credentials.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setBusy(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Demo sign-in failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col items-center justify-center px-6 font-sans">
      <Link to="/" className="flex items-center gap-2.5 mb-8">
        <div className="h-8 w-8 rounded-sm bg-slate-900 flex items-center justify-center font-bold text-sm text-white">K</div>
        <span className="font-bold text-lg tracking-tighter text-slate-900">KINETIC</span>
      </Link>

      <div className="w-full max-w-sm bg-white border border-slate-100 rounded-2xl shadow-xl p-8">
        <h1 className="font-display font-medium text-2xl text-slate-900 tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Sign in to your command center.</p>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            {busy ? 'Signing in…' : <>Sign in <ArrowRight size={15} /></>}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-slate-300">
          <span className="h-px flex-1 bg-slate-100" /> or <span className="h-px flex-1 bg-slate-100" />
        </div>

        <button
          onClick={handleDemo}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          <Play size={13} className="fill-current" /> Try the demo
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          No account?{' '}
          <Link to="/register" className="font-semibold text-slate-900 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
