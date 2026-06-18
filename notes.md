# Kinetic Ledger — Engineering Notes (read me first)

Handoff doc for any future session. Read this top-to-bottom before changing anything; it captures the stack, every non-obvious decision (and why), what's intentionally the way it is (don't "fix" it), where things live, and how to ship.

- **Live web:** https://kinetic-ledger-sepia.vercel.app
- **Live API:** https://kinetic-ledger-api.onrender.com (`/api/health` → `{ok:true}`)
- **Repo:** https://github.com/RyanTanjaya/kinetic-ledger (public)
- **Demo / "Try the demo" account:** `demo@kineticledger.app` / `demo1234`
- Brand is **KINETIC / Kinetic Ledger**. Original project name was "Freelancer Client Portal".

---

## 1. Stack

**Web** (repo root): React 19, Vite 6, **Tailwind v4** (config lives in `src/index.css` via `@theme`, no tailwind.config), **React Router v7** (BrowserRouter), **TanStack Query v5**, **axios**, `motion/react` (Framer Motion), **pdf-lib** (client-side PDF), `lucide-react` icons. Fonts: Plus Jakarta Sans (sans) / Space Grotesk (`font-display`) / JetBrains Mono.

**API** (`server/`): **Express 4** + TypeScript (CommonJS, run with `tsx`), **Prisma 6** → **PostgreSQL on Supabase**, **JWT** (`jsonwebtoken`) + **bcryptjs**, **zod** validation.

**Infra:** GitHub (CI in Actions) → **Vercel** (web, git-connected) + **Render** (API blueprint) → **Supabase** (DB). Push to `main` auto-deploys both.

---

## 2. Repo layout (where everything lives)

```
/                            ← the WEB app (Vite). NOT a /client folder — see decision #1
  index.html                 title: "Kinetic Ledger — Freelance Financial Command Center"
  vite.config.ts             react + tailwind plugins; resolve.dedupe[react] + optimizeDeps (motion fix)
  tsconfig.json              include:["src"] so web typecheck ignores server/ ; NOT strict
  vercel.json                Vite preset + SPA rewrite (all → /index.html) for React Router
  render.yaml                Render blueprint for the API (rootDir: server)
  .github/workflows/ci.yml   CI: lint + build for web AND server on push/PR to main
  .env.production            VITE_API_URL = the Render API URL (COMMITTED; public, not a secret)
  DEPLOY.md, notes.md, README.md, server/README.md

  src/
    main.tsx                 Providers: BrowserRouter > QueryClientProvider > AuthProvider > DataProvider > App
    App.tsx                  <Routes> + small inline "route wrapper" components that pull from hooks/
                             useData and pass props down to the screen components
    types.ts                 Client, Project, Invoice (NOTE: id = invoice NUMBER, dbId = cuid), LineItem,
                             TimeEntry, ProfileSettings, ProjectStatus, InvoiceStatus
    vite-env.d.ts            /// vite/client types (so import.meta.env works)

    auth/AuthContext.tsx     useAuth(): login/register/loginDemo/logout; token in localStorage "kl_token";
                             restores session via GET /api/auth/me; reacts to "kl-unauthorized" event
    lib/api.ts               axios instance (baseURL = VITE_API_URL || http://localhost:4000); request
                             interceptor adds Bearer; 401 interceptor clears token + fires "kl-unauthorized";
                             getApiErrorMessage() (network-aware error text)
    lib/pdf.ts               downloadInvoicePdf() with pdf-lib; embedLogo(); ASCII-sanitises text
    data/DataProvider.tsx    useData(): { settings (live via useQuery ['settings']), saveSettings (PUT +
                             invalidate), downloadInvoice }. Renders the "Invoice PDF downloaded" modal.
    data/mockData.ts         Legacy mock arrays. ONLY INITIAL_SETTINGS is still used (fallback before the
                             settings query loads). Clients/projects/invoices/timeEntries arrays are dead
                             code kept for reference — everything is live API now.

    api/        clients.ts projects.ts invoices.ts dashboard.ts settings.ts timeEntries.ts
                One module per resource. fetch* functions + mutation functions. THESE MAP DB → UI SHAPES
                (status DRAFT→"Draft", dates → "Jun 8, 2026", invoiceNumber→id, totalAmount→amount,
                totalBudget→budget, etc.). When you add a backend field, map it here.
    hooks/      useClients.ts useProjects.ts useInvoices.ts useDashboard.ts useSettings.ts useTimeLog.ts
                Thin TanStack Query hooks (useQuery + useMutation) that call api/* and invalidate keys.

    components/ LandingPage.tsx     marketing page (KINETIC). Sections: nav, hero (+VectorDashboard demo),
                                    features bento, "The Intent" banner, FAQ, footer. (Pricing/testimonial/
                                    version-badge were REMOVED — decision #10, don't re-add.)
                VectorDashboard.tsx interactive hero widget (live timer + invoice mock)
                PortalDashboard.tsx dashboard (consumes a `stats` prop)
                ClientsList.tsx     clients table + Add Client modal
                ClientDetail.tsx    client hub: header (Edit Client modal), Projects tab (cards w/ Edit
                                    Project modal), Invoices tab
                InvoiceGenerator.tsx  /invoices/new form + live preview
                InvoiceList.tsx     all invoices + status filter
                TimeLog.tsx         project time entries
                PortalSettings.tsx  Settings (profile + logo uploader + invoice prefs). Logo uploader is
                                    fully wired (file→base64→logoUrl).
    pages/      Login.tsx Register.tsx   (kinetic-styled; "Try the demo" button)
    layouts/AppLayout.tsx    persistent shell: top nav + mobile bar + <Outlet/> + logout
    routes/ProtectedRoute.tsx redirect to /login when unauthenticated

server/
  package.json               type:commonjs; scripts: dev(tsx watch), build(tsc), start(node dist/index.js),
                             lint(tsc --noEmit), prisma:generate/migrate/deploy/studio, seed
  tsconfig.json              CommonJS, outDir dist, strict:true
  .env                       GITIGNORED — DATABASE_URL, JWT_SECRET, PORT, FRONTEND_URL (recreate on clone!)
  .env.example               template for the above
  prisma/schema.prisma       6 models: User, Client, Project, TimeEntry, Invoice, InvoiceItem
                             + enums ProjectStatus, InvoiceStatus. onDelete:Cascade everywhere.
                             Invoice number is @@unique([userId, invoiceNumber]) (per-user).
  prisma/seed.ts             demo user + sample clients/projects/time/invoices
  prisma/migrations/         0_init (baseline) + migration_lock.toml — see decision #11
  src/index.ts               express app: cors (origin FN, see #8), json, /api/health (public),
                             /api/auth (public), then app.use('/api', requireAuth) gate, then routers,
                             404, error handler, listen(PORT)
  src/lib/prisma.ts          PrismaClient singleton (globalThis guard for tsx watch)
  src/middleware/auth.ts     requireAuth (Bearer→req.userId), signToken (7d expiry)
  src/types/express.d.ts     adds req.userId to Express.Request
  src/routes/                auth.ts(register/login/me) clients.ts(CRUD + nested POST /:id/projects)
                             projects.ts(get/put/delete + nested POST /:id/time-entries)
                             timeEntries.ts(put/delete) invoices.ts(list/create/get/mark-paid/delete)
                             dashboard.ts(GET /stats) settings.ts(get/put)
```

---

## 3. How the data flow works

- **Auth:** `Login`/`Register`/"Try demo" → `AuthContext` → `POST /api/auth/login|register` → token in `localStorage.kl_token`. `api.ts` attaches it as `Bearer` on every request. On 401 the interceptor clears the token and fires `kl-unauthorized`, which logs the user out. Session restores on reload via `GET /api/auth/me`.
- **Reads:** screen → route-wrapper in `App.tsx` → `hooks/use*` (TanStack Query, keys like `['clients']`, `['clients', id]`, `['invoices']`, `['dashboard']`, `['settings']`, `['project', id]`) → `api/*` fetch → backend → Prisma → Supabase. `api/*` maps the raw DB object into the UI shape from `types.ts`.
- **Writes:** screen calls an `on*` prop → route-wrapper calls a mutation hook → `api/*` PUT/POST/DELETE → `onSuccess` invalidates the relevant query keys → UI refetches.
- **Invoices have two ids:** UI `invoice.id` = the human number ("INV-013"); `invoice.dbId` = the database cuid. Display uses `id`; mutations (mark-paid/delete) must use `dbId`. Route wrappers translate number→dbId via the loaded list. Keep this pattern.
- **Settings are global:** `DataProvider` loads `['settings']` and exposes `settings` to the whole app (currency formatting, business name, logo on PDF). `PortalSettings` saves via `saveSettings` (PUT + invalidate).

---

## 4. Design decisions & why

1. **Web at repo root, API in `/server` (not `/client` + `/server`).** The web app was an existing working tree; moving it was risky. To stop the web `tsc` from compiling `server/`, `tsconfig.json` has `include: ["src"]`. The project4 plan said `/client` + `/server` — we deliberately diverged.
2. **bcryptjs, not bcrypt** — avoids native build pain on Windows. Same API.
3. **React Router (BrowserRouter), not the original state-based nav.** `App.tsx` is route-based; SPA fallback is handled by `vercel.json` rewrite in prod and Vite in dev.
4. **TanStack Query for all server state**, one `api/*` module + `hooks/use*` per resource. Mutations invalidate query keys; no manual cache surgery.
5. **`DataProvider` is intentionally tiny** — only live settings + the PDF download (+ the download-confirm modal). It used to hold all mock data; that's gone now that every screen is live.
6. **Frontend maps DB → UI shapes** (in `api/*`) instead of changing the screen components' expected props. Enum casing, date formatting, `invoiceNumber→id`, `totalAmount→amount`, `totalBudget→budget` all happen there.
7. **Invoice numbers unique per user** (`@@unique([userId, invoiceNumber])`), auto-incremented server-side in `invoices.ts` (max existing +1, zero-padded). Totals are computed server-side.
8. **CORS** (`server/src/index.ts`) uses an origin function allowing: the `FRONTEND_URL` allowlist (comma-separated), any `localhost` port, and any `*.vercel.app` — so local dev, Vercel previews, and prod all work without re-touching env on every deploy.
9. **`.env.production` is committed** (just `VITE_API_URL` = the Render URL). It's a public URL, not a secret, and Vite bakes it into the build so Vercel points at the live API with zero dashboard config. `server/.env` and `.env.development` are gitignored.
10. **Landing page was trimmed** — the "Version 4.0 Now Live" badge, the pricing section, and the testimonial were removed on purpose (PR #1). Don't re-add them.
11. **Schema uses Prisma migrations** (not `db push` anymore). The existing DB was baselined as `0_init` (`migrate diff --from-empty` → `migrate resolve --applied`). Render runs `prisma migrate deploy` on build.
12. **PDF is client-side (pdf-lib).** Text is ASCII-sanitised (Helvetica/WinAnsi can't render every glyph), so non-USD currencies use codes like `EUR `/`GBP ` not symbols. Logo is embedded if `settings.logoUrl` is a PNG/JPEG data URL.
13. **Money stored as `Float`** — fine for a portfolio project; production would use `Decimal` or integer cents.
14. **Demo mode = real auth.** "Try the demo" just logs into the seeded `demo@kineticledger.app` account. No separate guest code path.

---

## 5. What NOT to redo / waste time on

- **Don't** restructure to `/client` + `/server`. Web-at-root is intentional (decision #1).
- **Don't** swap `bcryptjs` → `bcrypt`, or remove `tsconfig.json` `include:["src"]`.
- **Don't** re-add pricing / testimonial / version badge to the landing.
- **Don't** use `prisma db push` — schema changes go through migrations now (see §7).
- **Don't** turn on **Vercel Deployment Protection** — it once made the public site serve a stale build (deployment URLs 401'd, the alias didn't advance). It is OFF; keep it off.
- **Don't** commit secrets. `server/.env` (DB password, JWT secret) is gitignored. Only `*.env.example` and the public `.env.production` are tracked.
- **PowerShell + git gotcha:** never pipe git through `2>&1` (e.g. `git push 2>&1`) — git writes normal progress to stderr, which flips `$?` to `$false` even on success and looks like a failure. Use `$LASTEXITCODE -eq 0`. For multi-line commit messages use repeated `-m` flags (the `@'...'@` here-string is fragile with embedded quotes).
- **Render gotcha (already handled):** `NODE_ENV=production` makes `npm install` skip devDeps; the build command uses `npm install --include=dev` so `tsc`/`prisma` exist at build time. Don't drop that flag.
- **"Edit Client" is not a reliable "new build" marker** — that string existed in the original app. Use a feature-specific string (e.g. a testimonial quote) when sanity-checking which build is live.

---

## 6. First-time setup after cloning (new device)

```bash
git clone https://github.com/RyanTanjaya/kinetic-ledger.git
cd kinetic-ledger
npm install                 # web deps
npm install --prefix server # api deps

# Recreate the API secrets (NOT in the repo):
cp server/.env.example server/.env
#   DATABASE_URL = the Supabase Session-pooler URL (get it from the Render dashboard env vars,
#                  or Supabase → Settings → Database → Connection string → Session pooler)
#   JWT_SECRET   = any long random string (the prod value is in Render's env vars)
#   PORT=4000  FRONTEND_URL=http://localhost:3000

npm run --prefix server prisma:generate
# DB already has the schema + demo data, so no migrate/seed needed unless you want a fresh DB.

npm run dev:all             # web :3000 + api :4000 together
```

To run the **web preview against the live API** (skip running a local backend), create a gitignored `.env.development` at the repo root with `VITE_API_URL=https://kinetic-ledger-api.onrender.com`, then `npm run dev`. (Heads up: that hits the live prod DB — mutations are real. Revert any test data, e.g. re-seed.)

---

## 7. How to make a change & ship it

**Workflow (this repo uses branch → PR → squash-merge; `main` auto-deploys):**

```bash
git checkout main && git pull
git checkout -b my-change
# ...edit...
npm run lint && npm run build                 # web typecheck + build
npm run lint --prefix server                  # api typecheck (if you touched server/)
# verify in the browser preview (preview tools) when it's UI-visible
git add <files>
git commit -m "Short summary" -m "Why / details"
git push -u origin my-change
gh pr create --base main --head my-change --title "..." --body "..."
git checkout main
gh pr merge my-change --squash --delete-branch
git pull
```

Merging to `main` → **Render** rebuilds the API and **Vercel** rebuilds the web automatically. Verify: `curl https://kinetic-ledger-api.onrender.com/api/health` and hard-refresh the live site.

**Recipes for common future changes:**

- **Add a field to a model:** edit `server/prisma/schema.prisma` → `npm run --prefix server prisma:migrate` (creates a migration + applies locally) → expose it in the relevant `server/src/routes/*.ts` (select/return + zod for writes) → map it in the matching `src/api/*.ts` → add to `src/types.ts` → use it in the screen. Push; Render runs `migrate deploy`.
- **Add an endpoint:** add the handler in the right `server/src/routes/*.ts` (it's already behind `requireAuth`, so `req.userId` is set — always scope queries by it). Then add a function in `src/api/*.ts` + a hook in `src/hooks/*.ts` + wire it in the screen's route-wrapper in `App.tsx`.
- **New screen:** component in `src/components/` → add a `<Route>` + a route-wrapper in `App.tsx` (under `ProtectedRoute`/`AppLayout` if it needs auth) → add a `<NavLink>` in `src/layouts/AppLayout.tsx`.
- **Landing tweak:** all in `src/components/LandingPage.tsx`.
- **Invoice PDF tweak:** all in `src/lib/pdf.ts`.

---

## 8. Deploy specifics & known quirks

- **Vercel (web):** git-connected to `main`. `vercel.json` sets the Vite preset + SPA rewrite. No env vars needed in Vercel (the API URL is baked via `.env.production`). The public domain is `kinetic-ledger-sepia.vercel.app` (`kinetic-ledger.vercel.app` was taken globally). Deployment Protection must stay OFF.
- **Render (API):** blueprint from `render.yaml`, `rootDir: server`. Build = `npm install --include=dev && npx prisma migrate deploy && npx prisma generate && npm run build`; start = `node dist/index.js`. Env vars (set in Render dashboard): `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`. **Free tier sleeps when idle — the first request after a quiet spell takes ~30–60s** (cold start); the demo login will feel slow then snappy.
- **CI:** `.github/workflows/ci.yml` runs lint + build for web and server on every push/PR.
- **Prisma 7 deprecation warning** about `package.json#prisma` (the seed config) is harmless on Prisma 6; migrate to `prisma.config.ts` only if/when upgrading.

---

## 9. Status

10-step build complete and deployed; post-launch PRs merged: #1 landing trim, #2 Edit Client, #3 Edit Project, #4 logo-on-PDF, #5 Prisma migrations. Everything compiles, builds, and is live. Possible next ideas: custom domain on Vercel, more invoice statuses/filters, `prisma.config.ts` migration.
