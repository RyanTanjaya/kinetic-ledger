# Kinetic Ledger — API (server)

Express + TypeScript + Prisma REST API for the Kinetic Ledger app.

## Stack
- **Express 4** + **TypeScript** (run with `tsx` in dev, compiled with `tsc` for prod)
- **Prisma 6** ORM → **PostgreSQL** (Supabase)
- **JWT** auth (`jsonwebtoken`) + **bcryptjs** password hashing
- **zod** request validation

## Prerequisites
- Node 20+
- A PostgreSQL database. A free [Supabase](https://supabase.com) project works great.

## Setup

```bash
cd server
npm install
cp .env.example .env      # then edit .env (see below)
npm run prisma:generate   # generate the Prisma client
npm run prisma:migrate    # create tables (needs a real DATABASE_URL)
npm run dev               # start the API on http://localhost:4000
```

### Environment (`server/.env`)
| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. For Supabase use the **connection pooler** URL (port `6543`). |
| `JWT_SECRET` | Long random string used to sign JWTs. |
| `PORT` | API port (default `4000`). |
| `FRONTEND_URL` | Allowed CORS origin (default `http://localhost:3000`). |

> A placeholder `.env` is committed-ignored and already present so `prisma generate` and the dev server boot. Replace `DATABASE_URL` with your Supabase string before running migrations or any data/auth route.

### Getting a Supabase `DATABASE_URL`
1. Create a project at supabase.com.
2. Project Settings → **Database** → **Connection string** → **URI**.
3. Use the **Connection pooling** URI (port `6543`) for `DATABASE_URL`. Add `?pgbouncer=true` if not present.
4. Run `npm run prisma:migrate` once to create the tables.

## API surface (Step 1)
Public:
- `GET  /api/health` → `{ ok: true }`
- `POST /api/auth/register` `{ name, email, password }` → `{ token, user }`
- `POST /api/auth/login` `{ email, password }` → `{ token, user }`

Protected (send `Authorization: Bearer <token>`):
- `GET  /api/auth/me` → `{ user }`
- `GET  /api/clients?search=` · `POST /api/clients` · `GET /api/clients/:id` · `PUT /api/clients/:id` · `DELETE /api/clients/:id`
- `GET/POST/... /api/projects`, `/api/time-entries`, `/api/invoices`, `/api/dashboard`, `/api/settings` → **501 (not implemented yet)** — coming in build steps 4–9.

## Notes
- All client/project/invoice data is scoped to the authenticated user (`req.userId`); ownership is verified before any read or mutation.
- Deleting a client cascades to its projects, time entries, invoices, and invoice items (Prisma `onDelete: Cascade`).
- Invoice numbers are unique **per user** (`@@unique([userId, invoiceNumber])`).
