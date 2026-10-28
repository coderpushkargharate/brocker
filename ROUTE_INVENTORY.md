# Route Inventory

Tested against the final production build (isolated test data). "Expected" = intended status for an anonymous visitor.
Auth: — public · F farmer · I investor · A admin. Results from `tests/smoke.test.mjs`, the link crawl and the E2E script.

## Public pages

| URL | Purpose | Auth | Indexed | Expected | Result |
|---|---|---|---|---|---|
| `/` | Home | — | yes | 200 | PASS |
| `/buy-land` | Search & filter land | — | yes (filtered/paged variants `noindex,follow`) | 200 | PASS |
| `/lands/[slug]` | Land detail | — (drafts: owner/admin only) | yes | 200 / 404 unknown | PASS / PASS |
| `/locations/[district]` | District landing page | — | yes (only districts with land in sitemap) | 200 / 404 unknown | PASS / PASS |
| `/land-type/[type]` | Land category page | — | yes | 200 / 404 unknown | PASS / PASS |
| `/sell-land` | For landowners | — | yes | 200 | PASS |
| `/investors` | Retired page | — | — | 308 → `/buy-land` | PASS |
| `/services` | Land services | — | yes | 200 | PASS |
| `/find-services` | Services hub | — | yes | 200 | PASS |
| `/business-services`, `/business-services/[slug]` | Business directory / profile | — | yes | 200 / 404 unknown | PASS / PASS |
| `/labour`, `/labour/[slug]` | Labour directory / profile | — | yes | 200 / 404 unknown | PASS / PASS |
| `/labour/register`, `/list-business`, `/post-requirement` | Lead / registration forms | — | yes | 200 | PASS |
| `/about`, `/contact`, `/faq` | Company & support | — | yes | 200 | PASS |
| `/blog` (+`?page=n`) | Blog index **(new)** | — | yes | 200; 404 past last page | PASS |
| `/blog/[slug]` | Article **(new)** | — | yes (per-post noindex option) | 200 live · 404 draft/scheduled/unknown · 308 old slug | PASS (all 4 cases) |
| `/blog/category/[slug]` | Category **(new)** | — | yes (noindex while empty) | 200 / 404 unknown | PASS |
| `/blog/tag/[tag]` | Tag listing **(new)** | — | noindex,follow | 200 / 404 unknown | PASS |
| `/privacy-policy`, `/terms`, `/cookie-policy`, `/disclaimer` | Legal **(new)** | — | yes | 200 | PASS |
| `/install` | App install instructions **(new)** | — | yes | 200 | PASS |
| `/login`, `/signup` | Auth | — | noindex | 200 | PASS |
| `/forgot-password` | Account recovery instructions **(new)** | — | noindex | 200 | PASS |
| any unknown path | Custom 404 | — | noindex | 404 | PASS |

## Protected pages (anonymous → `307 /login?next=…`, verified)

| URL | Purpose | Auth |
|---|---|---|
| `/dashboard`, `/dashboard/profile`, `/dashboard/notifications`, `/dashboard/interests` | Account dashboards | F, I |
| `/dashboard/listings`, `/new`, `/[id]`, `/[id]/edit` | Farmer listings | F (owner checks server-side) |
| `/dashboard/saved` | Saved lands | I |
| `/admin` and all `/admin/*` (lands, users, interests, enquiries, businesses, workers, service-leads, service-reviews, service-categories, service-settings) | Admin panel | A |
| `/admin/blog`, `/new`, `/[id]/edit`, `/[id]/preview`, `/categories` | Blog CMS **(new)** | A |
| `/admin/audit-log` | Audit log **(new)** | A |

Role checks verified: farmer → `/admin/blog` redirected to `/dashboard`; forged admin JWT rejected; admin pages also re-check the role in the layout and in every server action.

## Files & machine-readable

| URL | Expected | Result |
|---|---|---|
| `/robots.txt` | 200, disallows `/admin`, `/dashboard`, `/api/`, `/login` | PASS |
| `/sitemap.xml` | 200, only canonical public URLs, every URL returns 200 | PASS |
| `/manifest.webmanifest` | 200, PNG 192/512 + maskable icons | PASS |
| `/sw.js` | 200, `Cache-Control: no-cache` | PASS |
| `/offline.html` | 200, self-contained | PASS |
| `/api/uploads/[name]` | public images; path traversal → 404 | PASS |
| `/api/docs/[name]` | private documents: 401 anonymous, 403 non-owner | PASS (anonymous) / code-reviewed (non-owner) |

## Crawl result
92 URLs reached from the home page and sitemap: **0 broken internal links**. Duplicate titles exist only on query-string variants (e.g. `/locations/pune?district=Pune`), which canonicalise to the clean URL and are `noindex,follow` where they are filter states.
