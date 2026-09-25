# Engineering Decisions

## Day 2 milestone: explainable AI insights and production safety

ServeSync keeps the AI feature useful even when no paid provider key is configured.

- **Deterministic fallback first:** fee anomaly detection runs locally from historical partner orders using median and median absolute deviation. This makes the core insight feature testable, predictable, and free to run.
- **Provider-optional generation:** the generative route only receives aggregated financial figures and is disabled unless an explicit provider key is configured. Raw customer/order records are not sent to a model.
- **Server-side trust boundary:** API routes validate the Supabase bearer token, load only the authenticated restaurant's records, and let Postgres RLS enforce isolation.
- **Money safety:** calculations use integer paise/cents and round only at the presentation boundary to avoid floating-point drift.
- **Deployment posture:** Vercel hosts the Next.js app and route handlers; Supabase provides Auth and Postgres. This keeps the project within free tiers for a portfolio demo.

## Verification checklist

```bash
npm run typecheck
npm test
npm run build
```

The GitHub Actions workflow runs the same checks on every push.
