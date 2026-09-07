# ServeSync — GitHub deployment edition

A single-restaurant dashboard with a React frontend, server API and persistent Cloudflare D1 SQL database.

This edition runs independently of ChatGPT. A single administrator signs in through the browser's username/password prompt. Keep this repository private if you do not want to share its code.

## What you receive

- Frontend: app/dashboard.tsx (overview, menu, orders, finance, integrations, insights).
- Backend: app/api/records/route.ts and app/api/insights/route.ts.
- Database schema: db/schema.ts; SQL migration: drizzle/0000_overrated_union_jack.sql.
- Authentication: worker/auth.ts. Requires a random password at least 20 characters long.
- Hosting configuration: wrangler.jsonc.
- GitHub automatic deployment: .github/workflows/deploy.yml.
- Full setup: DEPLOY.md.

Menu items, orders and expenses are saved to D1, not browser storage. Frontend and API share one origin; there is no separate backend URL or DATABASE_URL to paste. The DB binding connects backend queries to D1.

## Current capabilities and limits

Menu create/edit/delete, local availability, order create/edit/delete, validated normalized CSV imports, expense records, date-filtered operating profit/loss, financial CSV export and a linear earnings estimate are implemented.

Live Swiggy/Zomato/ONDC sync is NOT implemented. Authorized partner-specific adapters still need to be developed and tested with official access. Local menu edits do not update partner menus. CSV uses the ServeSync template; arbitrary partner exports must first be mapped to it.

Generative AI is implemented as an optional OpenAI request, but no API key/model is included. Calculated insights remain usable without an AI provider.

All order amounts are recognized as entered, irrespective of status. Enter actual refunds and incurred costs for cancelled orders. Use sales excluding pass-through taxes. Store food, packaging and platform costs on the order; record only additional overheads under Finance to avoid double counting.

Profit = gross - discounts - refunds - fees - food - packaging - overheads.
Forecast = selected-period operating profit / selected calendar days * 30.
The estimate is not statutory accounting, a guarantee, or a calibrated AI forecast.

## Data migration

This creates a NEW empty database in your own Cloudflare account. It does not copy data from the private ChatGPT-hosted site.

## Security

Use HTTPS and a unique randomly generated admin password. Cloudflare secrets hold ADMIN_PASSWORD and OPENAI_API_KEY; never put them in GitHub source. The browser caches Basic authentication for its session; close the browser session when finished, especially on shared machines. Rotate ADMIN_PASSWORD to revoke access. This is single-admin access, not a multi-staff role system.

GitHub Actions requires account-scoped Cloudflare API credentials in repository secrets. Never commit an API token. New database migrations should be append-only after they have been applied.
