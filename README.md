# Propwise | Dubai Market Intelligence

Phase 1 of the Dubai market dashboard: a responsive public overview with interactive month, area, developer, property-type, and transaction-category filters. **Every market figure is fictional demo data. This application does not contain real Dubai market statistics.**

## Run and review

Use Node.js 22 or newer (validated with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The server binds to `0.0.0.0` for cloud preview access. In a hosted coding environment, use its port 3000 preview or port forwarding feature.

- `/`: public market overview, KPI cards, transaction and sales-value trend tabs, off-plan/ready comparison, area rankings, developer rankings, and derived demo insights.
- `/internal`: public navigation placeholder for the future authenticated workspace.
- `/internal/market-data`: planned upload → extraction → review → publication workflow. No uploads, authentication, or publishing are enabled.

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

## Phase boundaries

Phase 1 requires no credentials, database, or AI services. Supabase authentication, storage, database tables/RLS, roles, monthly revisions, and publication belong to later phases. Screenshot templates must wait for actual source samples. No API keys or private data should be added to client code. Internal placeholder routes are intentionally public and must be replaced with server-authorized routes before private functionality is added.

Next.js App Router is compatible with Vercel, but this prototype has not been deployed. Public deployment requires explicit approval. Do not proceed to Phase 2 until the interface is approved.
