# Propwise | Dubai Market Intelligence

Phase 1 of the Dubai market dashboard, with the requested administrator-only workspace gate: a responsive public overview with interactive month, area, developer, property-type, and transaction-category filters. **Every market figure is fictional demo data. This application does not contain real Dubai market statistics.**

## Run and review

Use Node.js 22 or newer (validated with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The server binds to `0.0.0.0` for cloud preview access. In a hosted coding environment, use its port 3000 preview or port forwarding feature.

- `/`: public market overview, KPI cards, transaction and sales-value trend tabs, off-plan/ready comparison, area rankings, developer rankings, and derived demo insights.
- `/admin/login`: direct administrator sign-in URL; no workspace links appear in public navigation.
- `/internal`: server-protected admin workspace.
- `/internal/market-data`: server-protected placeholder for the planned upload → extraction → review → publication workflow. Uploads and publishing remain disabled.

Try changing the month and filters; every visual uses the same selection. Click an area or developer to filter it. Reset restores the latest demo period. Monthly report exports the filtered fictional dataset as CSV. The newsletter form only displays a session-local confirmation; it does not store email addresses or send mail.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm start
```

Browser tests use `/usr/bin/chromium` by default. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your installed Chromium path when needed.

The unit tests verify complete demo periods, combined filtering, aggregation, category/ranking reconciliation, historical scope, and unavailable comparisons. Browser checks cover interactive filters, chart toggles, CSV export, placeholders, and mobile layout.

## Structure and design

- `src/lib/demo-data.ts`: typed synthetic records and shared filtering, aggregation, rankings, and comparison functions. No data provider is connected.
- `src/components/dashboard.tsx`: interactive public dashboard with Recharts visualizations and accessible native filters.
- `src/components/shell.tsx`: responsive public and future internal navigation.
- `src/components/ui/button.tsx`: shadcn/ui-style composable Button built with Radix Slot, CVA, and Tailwind.
- `src/app/globals.css`: navy, white, and teal design system; responsive layouts and reduced-motion support.
- `public/propwise-mark.svg`: replaceable logo asset.

Price per square foot is weighted by total synthetic property area. Month-over-month comparisons use identical segment filters; the first available period has no prior comparison. Year-over-year figures are unavailable because this demo has only six months. Insights describe the selected synthetic records and make no predictions.

## Admin login setup

For a guided walkthrough, see [ADMIN-SETUP.md](ADMIN-SETUP.md).

The public dashboard works without configuration. Admin routes fail closed and redirect to the login/setup page until Supabase is configured. Merely knowing an internal URL does not grant access.

1. Create a Supabase project (or use your existing one).
2. Copy `.env.example` to `.env.local`. Set `SUPABASE_URL` to the project URL and `SUPABASE_PUBLISHABLE_KEY` to its publishable key. These come from your project's API settings. Never use a service-role or secret key here, and never commit `.env.local`.
3. In the Supabase Authentication dashboard, create your administrator user with an email and password. Confirm the account there if needed.
4. Copy that user's UUID. Run the following in the Supabase SQL editor, replacing the UUID. This is an administrator-only operation; the application has no public role-assignment or registration endpoint.

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where id = 'YOUR_ADMIN_USER_UUID';
```

5. Restart `npm run dev`, then open `http://localhost:3000/admin/login` and sign in. The workspace section appears in the authenticated admin workspace, while the public overview remains free of internal navigation.

Supabase `getUser()` verifies sessions server-side. Only `app_metadata.role = "admin"` grants access; user-editable metadata is ignored. Middleware refreshes server cookies and checks internal requests; the layout and each internal page also verify access. Authentication cookies are HttpOnly and use Secure in production. Protected pages are dynamic and must never be cached publicly. Sign out uses Supabase to clear the session. Future private data queries and mutation endpoints must independently authorize the user and use database RLS; this gate does not replace RLS.

Validation in this cloud workspace covers public navigation, denied direct internal access, forged role cookies, and role policy. A real administrator sign-in remains unverified until a Supabase project and administrator account are configured. Do not report live admin authentication as configured until that check passes.

## Phase boundaries

The public Phase 1 dashboard requires no credentials, database, or AI services. The requested admin gate uses Supabase Authentication. Storage, market database tables/RLS, analyst/editor roles, monthly revisions, and publication belong to later phases. Screenshot templates must wait for actual source samples. No API keys or private data should be added to client code. Internal placeholder routes are now restricted to verified administrators. Real private datasets and upload functionality have not been added.

Next.js App Router is compatible with Vercel, but this prototype has not been deployed. Public deployment requires explicit approval. Do not proceed to Phase 2 until the interface is approved.
