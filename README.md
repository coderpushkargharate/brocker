# AgriLand – Agricultural Land Marketplace (Next.js)

Next.js 15 (App Router) + Tailwind CSS v4 build of the Figma design in `../agricultura land project`.

## Run it

```bash
cd agriland
npm install
npm run dev          # http://localhost:3000
# production
npm run build && npm start
```

The database (`data/db.json`) and uploaded files (`data/uploads/`) are created automatically on first run.
In development a new database is filled with **demo data** (sample lands, users, businesses and reviews). In production (`NODE_ENV=production`)
a new database only gets the admin account and the service categories – set `SEED_DEMO_DATA=true` only for a demo site, never for the live site.
To reset local data, stop the server and delete `data/db.json`.

## Logins

The admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` when a database is first created (if `ADMIN_PASSWORD` is empty a random one is used).
Demo farmer/investor accounts exist only in local demo data – see `src/lib/seed.ts`. **Never put real passwords in this file.**
Anyone can sign up at `/signup` as a farmer or investor. Change a password from **My Profile → Change Password**;
admins can issue a temporary password to a user from **Admin → Users → Reset** (there is no email/SMS reset).

## Pages

**Public (indexed by Google)**
- `/` Home – hero, search, services, featured lands, why choose / how it works, locations, land types, recently added, FAQ
- `/buy-land` Find Agricultural Land – search bar, filters (district, budget, area, type, water, road, electricity, verified), sort, pagination
- `/lands/[slug]` **one page per land project** – gallery, I'm Interested, Direct Call, share, land info, map, documents, connectivity, farmer, similar lands
- `/locations/[district]`, `/land-type/[type]` – landing pages per district and land type
- `/sell-land`, `/investors`, `/services`, `/about`, `/faq`, `/contact`

**Farmer dashboard** – `/dashboard`, `/dashboard/listings`, `/dashboard/listings/new` (Add New Land Listing), `/dashboard/listings/[id]` (listing performance, interested investors, listing health), `/dashboard/listings/[id]/edit`, `/dashboard/interests`, `/dashboard/notifications`, `/dashboard/profile`

**Investor dashboard** – `/dashboard` (recommended lands, saved, interested, farmers connected, preferences + alerts), `/dashboard/saved`, `/dashboard/interests`

**Admin panel** – `/admin` overview, `/admin/lands` (all land projects: search, status, approve/reject, verify, feature, edit, delete), `/admin/lands/new`, `/admin/lands/[id]` (review photos + verify documents), `/admin/users` (add, verify, block, delete), `/admin/interests`, `/admin/enquiries`

## How the flow works
1. A farmer adds a listing → it goes to **Pending review** (drafts stay private).
2. Admin reviews documents and clicks **Approve & Publish** → the land is live at `/lands/<slug>`, added to the sitemap, and matching investors get an alert.
3. Investors save lands, click **I'm Interested** (farmer gets notified) or **Direct Call** (logged in the farmer's stats).
4. Admin can also add land projects directly (they go live immediately).

## SEO
- Server-rendered HTML for every public page, unique `<title>`, description and canonical URL per page
- Open Graph / Twitter cards (land photos used for land pages)
- JSON-LD: Organization, WebSite + SearchAction, Product/Offer + Place + BreadcrumbList for every land, ItemList on listings, FAQPage, Service
- `/sitemap.xml` (always up to date, includes every live land with images), `/robots.txt` (blocks admin/dashboard), web manifest
- Filtered/paginated search URLs are `noindex, follow` to avoid duplicate content; dashboards/admin are `noindex`
- After deploying: set `NEXT_PUBLIC_SITE_URL` to your real domain, add the site in **Google Search Console**, put the verification code in `GOOGLE_SITE_VERIFICATION`, and submit `https://your-domain/sitemap.xml`.

## Deploying on Vercel
Vercel cannot save files, so connect its free storage (one time, ~2 minutes):

1. Vercel dashboard → your project → **Storage** → **Create Database** → **Neon (Postgres)** → Connect to the project.
   This adds `DATABASE_URL` automatically. The tables and demo data (incl. the admin account) are created on first visit.
2. **Storage** → **Create** → **Blob** → Connect to the project. This adds `BLOB_READ_WRITE_TOKEN` (needed for photo/document uploads).
3. **Settings → Environment Variables**, add (see `.env.example` for the full list):
   - `AUTH_SECRET` = random text, **at least 32 characters** (required – logins are refused in production without it)
   - `NEXT_PUBLIC_SITE_URL` = `https://your-domain` (optional, defaults to the Vercel domain)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (used only when the database is first created)
   - `NEXT_PUBLIC_SUPPORT_PHONE`, `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_BUSINESS_ADDRESS` – your real business details (shown on the site and legal pages)
4. **Deployments** → ⋯ → **Redeploy**.

Without step 1 the site still opens, but changes are only kept temporarily.
Any Postgres works (e.g. Supabase): just set `DATABASE_URL` to its connection string.

## Deploying on a VPS
Without `DATABASE_URL` data is stored in `./data` (JSON + uploads):
```bash
npm run build && npm start   # set PORT if needed
```
Set `AUTH_SECRET` in production. `DATA_DIR` lets you point the data folder at a mounted volume.

## Project structure
```
src/app/(site)      public pages (header + footer), incl. /blog, legal pages, /install
src/app/admin/blog  blog CMS (admin only)
public/sw.js        service worker (PWA, offline page)
tests/              smoke tests (npm run test:smoke against a running server)
src/app/(app)       dashboards (header only)
src/app/admin       admin panel
src/app/actions     server actions (auth, lands, admin)
src/components      UI components (home sections, cards, forms, dashboard widgets)
src/lib             config, database, auth/session, queries, seed data
public/images       images cut from the Figma design
```
