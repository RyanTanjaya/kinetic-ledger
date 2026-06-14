import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Gate for authenticated routes. Redirects to /login when not signed in.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-sm">
        Loading…
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
