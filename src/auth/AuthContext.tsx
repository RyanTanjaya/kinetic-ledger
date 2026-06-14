import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  businessName: string | null;
  logoUrl: string | null;
  currency: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

// Seeded demo account — powers the "Try the demo" button.
const DEMO = { email: 'demo@kineticledger.app', password: 'demo1234' };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on load if a token is present.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/api/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // Clear user state when the api interceptor reports a 401.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('kl-unauthorized', onUnauthorized);
    return () => window.removeEventListener('kl-unauthorized', onUnauthorized);
  }, []);

  const applyAuth = (data: { token: string; user: AuthUser }) => {
    tokenStore.set(data.token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const r = await api.post('/api/auth/login', { email, password });
    applyAuth(r.data);
  };

  const register = async (name: string, email: string, password: string) => {
    const r = await api.post('/api/auth/register', { name, email, password });
    applyAuth(r.data);
  };

  const loginDemo = () => login(DEMO.email, DEMO.password);

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, register, loginDemo, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
