import { Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData } from './data/DataProvider';
import { useAuth } from './auth/AuthContext';
import { useClients, useClientDetail, useCreateClient, useDeleteClient, useUpdateClient } from './hooks/useClients';
import { useCreateProject } from './hooks/useProjects';
import { useTimeLog, useAddTimeEntry, useDeleteTimeEntry } from './hooks/useTimeLog';
import { useDashboard } from './hooks/useDashboard';
import { useInvoices, useCreateInvoice, useMarkInvoicePaid, useDeleteInvoice } from './hooks/useInvoices';
import { useSettings } from './hooks/useSettings';

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
  const { settings, downloadInvoice } = useData();
  const { data: stats, isLoading, isError } = useDashboard();
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

  if (isLoading) return <RouteLoading label="Loading dashboard…" />;
  if (isError || !stats) return <RouteError label="Couldn't load the dashboard." />;

  return (
    <PortalDashboard
      stats={stats}
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
  const updateClient = useUpdateClient();
  const markPaid = useMarkInvoicePaid();
  const deleteInv = useDeleteInvoice();

  if (isLoading) return <RouteLoading label="Loading client…" />;
  if (isError || !data) return <Navigate to="/clients" replace />;

  const dbIdOf = (num: string) => data.invoices.find((i) => i.id === num)?.dbId;

  return (
    <ClientDetail
      client={data.client}
      projects={data.projects}
      invoices={data.invoices}
      settings={settings}
      onBackToList={() => navigate('/clients')}
      onEditClient={(updates) => updateClient.mutate({ id: id ?? '', input: updates })}
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
      onNavigateToTimeLog={(projectId) => navigate(`/clients/${id}/projects/${projectId}`)}
      onDownloadInvoice={downloadInvoice}
      onMarkInvoicePaid={(num) => {
        const dbId = dbIdOf(num);
        if (dbId) markPaid.mutate(dbId);
      }}
      onDeleteInvoice={(num) => {
        const dbId = dbIdOf(num);
        if (dbId && confirm('Delete this draft invoice?')) deleteInv.mutate(dbId);
      }}
    />
  );
}

function InvoiceListRoute() {
  const navigate = useNavigate();
  const { settings, downloadInvoice } = useData();
  const { data: invoices = [], isLoading, isError } = useInvoices();
  const markPaid = useMarkInvoicePaid();
  const deleteInv = useDeleteInvoice();

  if (isLoading) return <RouteLoading label="Loading invoices…" />;
  if (isError) return <RouteError label="Couldn't load invoices. Is the API running?" />;

  const dbIdOf = (num: string) => invoices.find((i) => i.id === num)?.dbId;

  return (
    <InvoiceList
      invoices={invoices}
      settings={settings}
      onNavigateToCreate={() => navigate('/invoices/new')}
      onDownloadInvoice={downloadInvoice}
      onMarkPaid={(num) => {
        const dbId = dbIdOf(num);
        if (dbId) markPaid.mutate(dbId);
      }}
      onDeleteInvoice={(num) => {
        const dbId = dbIdOf(num);
        if (dbId && confirm('Delete this draft invoice?')) deleteInv.mutate(dbId);
      }}
    />
  );
}

function InvoiceGeneratorRoute() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { settings, downloadInvoice } = useData();
  const { data: clients = [] } = useClients();
  const { data: invoices = [] } = useInvoices();
  const createInvoice = useCreateInvoice();
  const preselectedClientId = params.get('clientId') ?? undefined;

  // Best-guess next number for the preview; the server assigns the real one on save.
  const nextNum =
    invoices.reduce((max, inv) => {
      const m = inv.id.match(/(\d+)/);
      return m ? Math.max(max, parseInt(m[1])) : max;
    }, 0) + 1;
  const nextInvoiceId = `INV-${String(nextNum).padStart(3, '0')}`;

  return (
    <InvoiceGenerator
      clients={clients}
      settings={settings}
      preselectedClientId={preselectedClientId}
      nextInvoiceId={nextInvoiceId}
      onBackToList={() => navigate('/invoices')}
      onSaveInvoice={(inv) =>
        createInvoice.mutate(
          {
            clientId: inv.clientId,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            notes: inv.notes,
            status: inv.status,
            items: inv.lineItems.map((li) => ({
              description: li.description,
              quantity: li.qty,
              unitPrice: li.unitPrice,
            })),
          },
          { onSuccess: () => navigate('/invoices') }
        )
      }
      onDownloadInvoice={downloadInvoice}
    />
  );
}

function TimeLogRoute() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { settings } = useData();
  const { data, isLoading, isError } = useTimeLog(projectId);
  const addLog = useAddTimeEntry(projectId ?? '');
  const deleteLog = useDeleteTimeEntry(projectId ?? '');

  if (isLoading) return <RouteLoading label="Loading project…" />;
  if (isError || !data) return <Navigate to="/clients" replace />;

  return (
    <TimeLog
      project={data.project}
      timeEntries={data.entries}
      settings={settings}
      onBackToClient={(clientId) => navigate(`/clients/${clientId}`)}
      onAddLog={(log) => addLog.mutate(log)}
      onDeleteLog={(logId) => deleteLog.mutate(logId)}
    />
  );
}

function SettingsRoute() {
  const { data: settings, isLoading } = useSettings();
  const { saveSettings } = useData();
  if (isLoading || !settings) return <RouteLoading label="Loading settings…" />;
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
