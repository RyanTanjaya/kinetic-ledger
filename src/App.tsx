import { Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData } from './data/DataProvider';
import { useAuth } from './auth/AuthContext';

import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import PortalDashboard from './components/PortalDashboard';
import ClientsList from './components/ClientsList';
import ClientDetail from './components/ClientDetail';
import InvoiceGenerator from './components/InvoiceGenerator';
import InvoiceList from './components/InvoiceList';
import TimeLog from './components/TimeLog';
import PortalSettings from './components/PortalSettings';

// ── Public landing: CTAs go to login (or straight to the app if already signed in) ──
function LandingRoute() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  return <LandingPage onEnter={() => navigate(isAuthenticated ? '/dashboard' : '/login')} />;
}

// ── Protected screen wrappers: adapt the router + data layer to each screen's props ──
function DashboardRoute() {
  const navigate = useNavigate();
  const { invoices, projects, settings, downloadInvoice } = useData();
  const onNavigate = (view: string, id?: string) => {
    switch (view) {
      case 'clients': navigate('/clients'); break;
      case 'invoices': navigate('/invoices'); break;
      case 'settings': navigate('/settings'); break;
      case 'invoice-generator': navigate('/invoices/new'); break;
      case 'client-detail': if (id) navigate(`/clients/${id}`); break;
      default: navigate('/dashboard');
    }
  };
  return (
    <PortalDashboard
      invoices={invoices}
      projects={projects}
      settings={settings}
      onNavigate={onNavigate}
      onDownloadInvoice={downloadInvoice}
    />
  );
}

function ClientsRoute() {
  const navigate = useNavigate();
  const { clients, projects, invoices, settings, addClient, deleteClient } = useData();
  return (
    <ClientsList
      clients={clients}
      projects={projects}
      invoices={invoices}
      settings={settings}
      onAddClient={addClient}
      onDeleteClient={deleteClient}
      onNavigateToClient={(id) => navigate(`/clients/${id}`)}
    />
  );
}

function ClientDetailRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clients, projects, invoices, settings, addProject, downloadInvoice, markInvoicePaid, deleteInvoice } = useData();
  const client = clients.find((c) => c.id === id);
  if (!client) return <Navigate to="/clients" replace />;
  return (
    <ClientDetail
      client={client}
      projects={projects.filter((p) => p.clientId === client.id)}
      invoices={invoices.filter((i) => i.clientId === client.id)}
      settings={settings}
      onBackToList={() => navigate('/clients')}
      onAddProject={(proj) => addProject(client.id, proj)}
      onNavigateToInvoiceGenerator={(clientId) => navigate(`/invoices/new?clientId=${clientId}`)}
      onNavigateToTimeLog={(projectId) => navigate(`/clients/${client.id}/projects/${projectId}`)}
      onDownloadInvoice={downloadInvoice}
      onMarkInvoicePaid={markInvoicePaid}
      onDeleteInvoice={deleteInvoice}
    />
  );
}

function InvoiceListRoute() {
  const navigate = useNavigate();
  const { invoices, settings, downloadInvoice, markInvoicePaid, deleteInvoice } = useData();
  return (
    <InvoiceList
      invoices={invoices}
      settings={settings}
      onNavigateToCreate={() => navigate('/invoices/new')}
      onDownloadInvoice={downloadInvoice}
      onMarkPaid={markInvoicePaid}
      onDeleteInvoice={deleteInvoice}
    />
  );
}

function InvoiceGeneratorRoute() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { clients, settings, getNextInvoiceId, saveInvoice, downloadInvoice } = useData();
  const preselectedClientId = params.get('clientId') ?? undefined;
  return (
    <InvoiceGenerator
      clients={clients}
      settings={settings}
      preselectedClientId={preselectedClientId}
      nextInvoiceId={getNextInvoiceId()}
      onBackToList={() => navigate('/invoices')}
      onSaveInvoice={(inv) => {
        saveInvoice(inv);
        navigate('/invoices');
      }}
      onDownloadInvoice={downloadInvoice}
    />
  );
}

function TimeLogRoute() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, timeEntries, settings, addLog, deleteLog } = useData();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return <Navigate to="/clients" replace />;
  return (
    <TimeLog
      project={project}
      timeEntries={timeEntries}
      settings={settings}
      onBackToClient={(clientId) => navigate(`/clients/${clientId}`)}
      onAddLog={(log) => addLog(project.id, log)}
      onDeleteLog={deleteLog}
    />
  );
}

function SettingsRoute() {
  const { settings, saveSettings } = useData();
  return <PortalSettings settings={settings} onSaveSettings={saveSettings} />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/clients" element={<ClientsRoute />} />
          <Route path="/clients/:id" element={<ClientDetailRoute />} />
          <Route path="/clients/:clientId/projects/:projectId" element={<TimeLogRoute />} />
          <Route path="/invoices" element={<InvoiceListRoute />} />
          <Route path="/invoices/new" element={<InvoiceGeneratorRoute />} />
          <Route path="/settings" element={<SettingsRoute />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
