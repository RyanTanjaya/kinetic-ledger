import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import clientsRoutes from './routes/clients';
import projectsRoutes from './routes/projects';
import timeEntriesRoutes from './routes/timeEntries';
import invoicesRoutes from './routes/invoices';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import { requireAuth } from './middleware/auth';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
// Allowed CORS origins: explicit FRONTEND_URL (comma-separated ok), plus any
// localhost port and any *.vercel.app deployment (production + previews).
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // same-origin / curl / server-to-server
      let host = '';
      try {
        host = new URL(origin).hostname;
      } catch {
        /* malformed origin */
      }
      const allowed =
        ALLOWED_ORIGINS.includes(origin) ||
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.endsWith('.vercel.app');
      cb(null, allowed);
    },
  })
);
app.use(express.json({ limit: '1mb' }));

// Health check (public)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'kinetic-ledger-api' });
});

// Public auth routes
app.use('/api/auth', authRoutes);

// Everything below requires a valid JWT
app.use('/api', requireAuth);
app.use('/api/clients', clientsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/time-entries', timeEntriesRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Unknown API route
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Kinetic Ledger API listening on http://localhost:${PORT}`);
});
