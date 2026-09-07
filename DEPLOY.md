# Deploy ServeSync step by step

Use Node.js 22.13 or later, GitHub, and a Cloudflare account. The site, backend and SQL database all run in Cloudflare. These instructions apply to THIS exported edition, not a Vercel/Render deployment.

## 1. Upload to GitHub

1. Extract this ZIP.
2. Create a GitHub repository named servesync (private recommended).
3. Upload the CONTENTS of the servesync-github folder, including the hidden .github folder. package.json and wrangler.jsonc must be in the repository root.
4. Do not upload the ZIP as your source code. Do not upload node_modules, .dev.vars, .env or passwords.

The easiest option for the remaining commands is your repository → Code → Codespaces → Create codespace on main. The same commands work in a local terminal with Node.js installed.

## 2. Install and sign into Cloudflare

Run from the folder containing package.json:

```bash
npm ci
npx wrangler login
```

Complete the browser sign-in. If using Codespaces and the callback cannot reach it, run from your own laptop instead, or configure an account-scoped CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID as Codespaces secrets, then restart the Codespace. Do not paste a token into source files.

## 3. Create your database

```bash
npx wrangler d1 create servesync-db
```

Copy the returned database_id. In wrangler.jsonc, replace the all-zero database_id placeholder with that exact ID. Keep binding as DB and database_name as servesync-db.

Create the tables:

```bash
npm run db:remote
```

This applies the included SQL migration to your new database. The backend already uses DB, so no manual SQL edits or database connection string are needed.

## 4. Set the administrator password and deploy

```bash
npx wrangler secret put ADMIN_PASSWORD
```

Enter a unique RANDOM password with at least 20 characters in the secure prompt. If Wrangler asks to create the servesync Worker before storing the secret, allow it. Username defaults to admin; you can change ADMIN_USERNAME in wrangler.jsonc.

```bash
npm run deploy
```

Wrangler prints your actual https://servesync.<your-subdomain>.workers.dev URL. Open it and sign in as admin with your password. Without the password secret, the site fails closed and displays setup-required.

## 5. Confirm your backend/database connection

1. Open Menu and add an item.
2. Reload the page and confirm the item remains.
3. Add an order with gross 1000, discount 50, refund 100, fee 100, food 250 and packaging 30.
4. Add an expense of 200 on the same date.
5. Select a date range containing these records. Finance should show net sales 850, total costs 580 and operating profit 270.
6. Delete the test records after checking. Deletion asks for confirmation.

## 6. Enable automatic GitHub deployment

1. Commit the actual database ID in wrangler.jsonc (the ID is not a password).
2. Create a Cloudflare API token scoped to your account with Workers Scripts Edit and D1 Edit permissions; deployment may also need Account Settings Read for account/subdomain discovery.
3. In GitHub → repository → Settings → Secrets and variables → Actions, add:
   - CLOUDFLARE_API_TOKEN
   - CLOUDFLARE_ACCOUNT_ID
4. Open Actions → Deploy ServeSync → Run workflow, or push a change to main.

The workflow installs dependencies, typechecks, builds, applies database migrations and deploys. ADMIN_PASSWORD stays in Cloudflare and does not need to be stored in GitHub.

## 7. Optional generative AI

```bash
npx wrangler secret put OPENAI_API_KEY
```

Set OPENAI_MODEL in wrangler.jsonc to a Chat Completions-compatible model available in your OpenAI API account. Then run npm run deploy. API usage is billed separately by the provider.

The AI screen sends only the selected period's aggregate figures when you click Generate AI analysis. It does not alter menu prices or send customer details.

## 8. Import partner data

Open Integrations → Download CSV template. Fill every column, using zero where applicable. Dates use YYYY-MM-DD. Upload under Orders and review before confirming.

Required columns:
reference,partner,date,name,gross,discount,refund,fee,food,packaging,status

Allowed status: Delivered, Preparing, Ready, Cancelled. Matching partner + reference updates a prior order. Maximum 500 rows and 500 KB per import.

Live partner APIs need additional development once you have official restaurant integration access. Do not assume that entering a restaurant ID alone enables synchronization.

## Local development

Copy .dev.vars.example to .dev.vars and replace the placeholder password.

```bash
npm run db:local
npm run dev
```

Use the localhost URL printed by Vite. Local records stay in a local D1 database; they are separate from production. Never commit .dev.vars.

## Troubleshooting

- Setup required: set ADMIN_PASSWORD with at least 20 characters.
- Wrong username/password: default username is admin; rotate the secret if needed.
- Database unavailable/no such table: confirm the database_id and run npm run db:remote.
- AI not connected: set the key and model; normal reports still work without AI.
- GitHub deployment fails: check the Actions log, account ID, token scope, and database ID.

## Official references

- https://developers.cloudflare.com/workers/vite-plugin/get-started/
- https://developers.cloudflare.com/d1/wrangler-commands/
- https://developers.cloudflare.com/d1/reference/migrations/
- https://developers.cloudflare.com/workers/configuration/secrets/

Validation in this package: production build, TypeScript, financial/CSV checks and auth checks. No deployment into your Cloudflare account has been performed.
