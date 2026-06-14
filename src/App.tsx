import { Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData } from './data/DataProvider';
import { useAuth } from './auth/AuthContext';
import { useClients, useClientDetail, useCreateClient, useDeleteClient } from './hooks/useClients';
import { useCreateProject } from './hooks/useProjects';

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

// ── Small route status helpers ──
function RouteLoading({ label }: { label: string }) {
  return <div className="py-20 text-center text-sm text-slate-400 font-mono">{label}</div>;
}
function RouteError({ label }: { label: string }) {
  return <div className="py-20 text-center text-sm text-rose-500 font-mono">{label}</div>;
}

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
  const { settings } = useData();
  const { data: clients = [], isLoading, isError } = useClients();
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();

  if (isLoading) return <RouteLoading label="Loading clients…" />;
  if (isError) return <RouteError label="Couldn't load clients. Is the API running?" />;

  return (
    <ClientsList
      clients={clients}
      projects={[]}
      invoices={[]}
      settings={settings}
      onAddClient={(c) => createClient.mutate(c)}
      onDeleteClient={(id) => {
        if (confirm('Delete this client? All linked projects and invoices will be deleted too.')) {
          deleteClient.mutate(id);
        }
      }}
      onNavigateToClient={(id) => navigate(`/clients/${id}`)}
    />
  );
}

function ClientDetailRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { settings, downloadInvoice } = useData();
  const { data, isLoading, isError } = useClientDetail(id);
  const createProject = useCreateProject(id ?? '');

  if (isLoading) return <RouteLoading label="Loading client…" />;
  if (isError || !data) return <Navigate to="/clients" replace />;

  // Features whose backend endpoints arrive in later build steps.
  const soon = (feature: string) => () => alert(`${feature} arrives in a later build step.`);

  return (
    <ClientDetail
      client={data.client}
      projects={data.projects}
      invoices={data.invoices}
      settings={settings}
      onBackToList={() => navigate('/clients')}
      onAddProject={(proj) =>
        createProject.mutate({
          title: proj.title,
          description: proj.description,
          status: proj.status,
          hourlyRate: proj.hourlyRate,
          totalBudget: proj.budget,
        })
      }
      onNavigateToInvoiceGenerator={(clientId) => navigate(`/invoices/new?clientId=${clientId}`)}
      onNavigateToTimeLog={soon('Time logging')}
      onDownloadInvoice={downloadInvoice}
      onMarkInvoicePaid={soon('Marking invoices paid')}
      onDeleteInvoice={soon('Deleting invoices')}
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
