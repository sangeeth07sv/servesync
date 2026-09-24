# ServeSync

[Open the live app](https://servesync-six.vercel.app/)

A full stack restaurant dashboard built with Next.js, TypeScript, Supabase Auth and Postgres. The responsive frontend manages orders, menu items, expenses and finance reports. Next.js API routes validate data and enforce user identity. Supabase row level security isolates each restaurant account.

## Features

- Email sign-up and sign-in
- Persistent order, menu and expense records
- CSV order import and finance export
- Explainable fee anomaly detection: compares an order's fee rate with at least seven other orders from the same partner, using the median and median absolute deviation
- Optional generative analysis of aggregated figures (requires your own provider key)

The anomaly detector works without a paid AI key. Partner APIs are not connected; imports use the ServeSync CSV template. Financial forecasts are simple run-rate estimates.

## Architecture

| Layer | Implementation |
| --- | --- |
| Frontend | Next.js App Router, React, responsive dashboard |
| Backend | Next.js route handlers at /api/records and /api/insights |
| Database | Supabase Postgres, records stored as JSONB |
| Authentication | Supabase Auth bearer tokens validated on every API request |
| Access control | Postgres row level security keyed by auth.uid() |
| Deployment | Vercel for frontend and API; Supabase for Auth and database |

## Run locally

Copy .env.example to .env.local and enter your Supabase project URL and publishable key. Apply supabase/schema.sql to a dedicated Supabase project, then run:

```bash
npm ci
npm run dev
```

See [DEPLOY.md](DEPLOY.md) for setup and production deployment. Never commit passwords, database connection strings or provider API keys.

```bash
npm run typecheck
npm test
npm run build
```

The old Cloudflare Worker and D1 setup has been removed from the application. Old D1 records are not automatically copied into the new Postgres database.
