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

The database (`data/db.json`) and uploaded files (`data/uploads/`) are created automatically on first run with demo data.
To reset everything to the demo data, stop the server and delete `data/db.json`.

## Logins

| Role | Email | Password | Goes to |
|---|---|---|---|
| **Admin** | pushkargharate3011@gmail.com | pushkar3011 | `/admin` |
| Farmer (demo) | rajesh.kumar@email.com | farmer123 | `/dashboard` (farmer) |
| Investor (demo) | nilesh.kude@email.com | investor123 | `/dashboard` (investor) |

The admin email/password come from `.env.local` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and are applied when the database is first created.
Anyone can sign up at `/signup` as a farmer or investor. Change the admin password from **My Profile → Change Password**.

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

## Deploying
Data is stored in files, so deploy to a host with a **persistent disk** (VPS, Railway, Render with a disk, DigitalOcean, etc.):
```bash
npm run build && npm start   # set PORT if needed
```
Set `AUTH_SECRET` to a long random string in production. `DATA_DIR` lets you point the database/uploads at a mounted volume.
Serverless hosts like Vercel do **not** keep written files, so listings added there would be lost – for Vercel, move `src/lib/db.ts` to a real database (e.g. Supabase/Postgres) first.

## Project structure
```
src/app/(site)      public pages (header + footer)
src/app/(app)       dashboards (header only)
src/app/admin       admin panel
src/app/actions     server actions (auth, lands, admin)
src/components      UI components (home sections, cards, forms, dashboard widgets)
src/lib             config, database, auth/session, queries, seed data
public/images       images cut from the Figma design
```
