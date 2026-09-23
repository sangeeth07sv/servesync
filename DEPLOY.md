# Deploy ServeSync

## 1. Supabase

Create a dedicated Supabase project. In SQL Editor, apply [supabase/schema.sql](supabase/schema.sql). In Authentication, keep email confirmation enabled if you want verified accounts. Copy the project URL and publishable API key from the project settings. The publishable key is safe for browser use because every records query is scoped by row level security; do not use a secret or service role key in a NEXT_PUBLIC variable.

## 2. Vercel

Import this GitHub repository as a Next.js project on Vercel. Use the repository root as the project root and the default Next.js build command. Add these environment variables for Production (and Preview if desired):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Optional server-only variables for the Generate AI analysis button:

```
OPENAI_API_KEY=your-private-api-key
OPENAI_MODEL=your-available-model
```

Do not prefix OPENAI_API_KEY with NEXT_PUBLIC. This feature may incur provider charges; the fee anomaly detector needs no AI API key.

Deploy and open the Vercel URL. Sign up, confirm your email if required, sign in, add a menu item and an order, reload and confirm both remain. Check the finance calculation and delete the test records. Sign out and verify the records API returns 401 without a token.

## 3. Put the live URL on GitHub

Once the app works, open the repository page, tap the About settings icon, enter the verified Vercel URL in Website, and save. You may also put the URL at the top of README.md. GitHub hosts the code; Vercel hosts the running app.

## Existing data

This migration creates a fresh Postgres database. It does not transfer any existing Cloudflare D1 records. If the previous database contained records, export them before retiring it.
