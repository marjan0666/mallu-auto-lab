# Mallu Auto Lab — Storefront

A from-scratch replacement for the malluautolab.com Shopify store: Next.js
(App Router) + Supabase (Postgres, Auth, Storage) + Razorpay + Resend,
deployed on Vercel. Includes a small admin panel for products, collections,
orders and homepage content — no code changes needed for day-to-day store
management.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Supabase** — Postgres database, Google OAuth login, Storage for product images
- **Razorpay** — payments (Orders API + Checkout + webhook)
- **Resend** — order confirmation & admin notification emails
- **Vercel** — hosting

## 0. Prerequisites (nothing was installed in this environment)

This project was scaffolded on a machine without Node.js or Git installed,
so nothing has been run yet — no `npm install`, no git repo, no dev server.
Install these first:

1. **Node.js 20 LTS** — https://nodejs.org
2. **Git** — https://git-scm.com/download/win

Then, from this folder:

```bash
npm install
```

## 1. Create the Supabase project

1. Go to https://supabase.com → New project.
2. In **Project Settings → API**, copy the **Project URL**, **anon public**
   key, and **service_role** key.
3. In the **SQL Editor**, run the three migration files in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_stock_functions.sql`
   (0002 also creates a public Storage bucket named `products` — check
   **Storage** in the dashboard to confirm it exists.)

## 2. Enable Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create an **OAuth client ID** (type: Web application).
2. Add this **Authorized redirect URI** (from Supabase: **Authentication →
   Providers → Google** shows the exact callback URL):
   `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
3. In Supabase **Authentication → Providers → Google**, paste the Client ID
   and Client Secret from Google, and enable the provider.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to
   your local dev URL for now (`http://localhost:3000`) — you'll update this
   to your Vercel domain after deploying (step 7).

## 3. Set up Razorpay

1. Create an account at https://dashboard.razorpay.com (test mode is fine
   to start).
2. **Settings → API Keys** → generate a key pair (`Key Id` / `Key Secret`).
3. You'll add the webhook (**Settings → Webhooks**) *after* deploying, once
   you have a public URL — see step 7.

## 4. Set up Resend

1. Create an account at https://resend.com.
2. Verify a sending domain (**Domains** → add your domain, add the DNS
   records it gives you). Until a domain is verified you can only send to
   your own Resend account email — fine for testing.
3. Create an API key (**API Keys**).

## 5. Fill in environment variables

Copy `.env.example` to `.env.local` and fill in every value from steps 1–4:

```bash
cp .env.example .env.local
```

## 6. Migrate the product catalog from Shopify

This pulls every product, variant, collection and image straight from the
live `malluautolab.com` Shopify JSON endpoints and loads them into your new
Supabase project (images are re-hosted in Supabase Storage, not hotlinked).

```bash
npm run seed
```

Note: Shopify's public storefront JSON only exposes an `available`
true/false per variant, not real inventory counts — the script sets stock to
20 for anything marked available. Adjust real stock numbers afterwards in
**Admin → Products**.

## 7. Run it locally

```bash
npm run dev
```

Visit http://localhost:3000. Sign in with Google once (via the "Sign in"
link), then make yourself an admin by running this in the Supabase SQL
Editor:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

Reload and visit http://localhost:3000/admin.

## 8. Deploy to Vercel

1. Push this project to a GitHub repo (`git init`, `git add -A`,
   `git commit`, create a repo on GitHub, `git push`).
2. In [Vercel](https://vercel.com), **Add New → Project**, import the repo.
3. Add all the same environment variables from `.env.local` in the Vercel
   project settings, but set `NEXT_PUBLIC_SITE_URL` to your production
   domain (e.g. `https://malluautolab.com` or the `*.vercel.app` URL).
4. Deploy.

### After deploying

- **Supabase → Authentication → URL Configuration**: set **Site URL** to
  your production domain, and add it (plus `/auth/callback`) to **Redirect
  URLs**.
- **Google Cloud Console**: add your production domain to **Authorized
  JavaScript origins**, and
  `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` should already be
  the only redirect URI needed (Supabase brokers the OAuth flow).
- **Razorpay → Settings → Webhooks**: add endpoint
  `https://YOUR-DOMAIN/api/webhooks/razorpay`, subscribe to
  `payment.captured`, and copy the generated **Webhook Secret** into
  `RAZORPAY_WEBHOOK_SECRET` in Vercel's env vars (redeploy after adding it).
- Switch Razorpay from test keys to live keys once you're ready to accept
  real payments.
- Point your domain's DNS at Vercel (**Project → Settings → Domains**).

## Project structure

```
app/                      Pages & API routes (Next.js App Router)
  admin/                  Admin panel (products, collections, orders, homepage content)
  api/checkout/           Razorpay order creation + payment verification
  api/webhooks/razorpay/  Razorpay webhook (backstop for payment confirmation)
  auth/callback/          Supabase OAuth callback handler
components/               Shared UI + admin form components
lib/                      Supabase clients, Razorpay/Resend helpers, cart store, types
emails/                   React Email templates sent via Resend
supabase/migrations/      SQL schema, RLS policies, storage bucket, stock functions
scripts/seed.ts           One-time Shopify → Supabase catalog migration
```

## What's editable from the admin panel (`/admin`)

- **Products** — create/edit/delete, price, stock, images, variants (e.g.
  team/size/colour), which collection they belong to, active/featured flags.
- **Collections** — create/edit/delete, cover image, description, sort order.
- **Orders** — view order details and update status (pending → paid →
  shipped → delivered, etc.).
- **Homepage content** — hero heading/subheading/image/button, and which
  collections are featured on the homepage.

Everything else (layout, checkout flow, policy page copy) is code — ask for
changes here rather than editing dashboards.
