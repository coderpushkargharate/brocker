# Website Audit Report – AgriLand

Audit date: 27–28 October 2026 · Scope: this repository (`agriland`), tested locally.
Status labels: **PASS** · **FAIL** · **BLOCKED** · **NOT TESTED**

## 1. Stack (detected, not changed)

| Area | Finding |
|---|---|
| Framework | Next.js 15.5 (App Router), React 19.1, TypeScript, Tailwind CSS v4 |
| Data | Whole-app state via `src/lib/db.ts`: MongoDB Atlas (`MONGODB_URI`) → Postgres JSONB (`DATABASE_URL`) → local JSON file |
| Files | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) or local disk |
| Auth | Custom: bcrypt hashes, HS256 JWT (`jose`) in an HttpOnly cookie, `middleware.ts` + server-side `requireUser()` |
| Roles | `admin`, `farmer`, `investor`. **There is no separate "s-admin" role** – the existing `admin` is the top-level role and controls the new blog CMS (see Security report §6). |
| Tests | None existed. Added `tests/smoke.test.mjs` (Node built-in runner, no new dependencies). |
| Business | Agricultural land marketplace (Maharashtra) + local business-services and labour directory. Not a property-developer/project site; there are no "builder" or "BHK" entities, so those requested page types were not created. |

**Environment safety:** `.env.local` points at a MongoDB Atlas database (likely production). Every test in this audit ran against an isolated JSON store in a temp folder (`MONGODB_URI=` overridden); production data was never read or written. No production URL is configured (`NEXT_PUBLIC_SITE_URL=http://localhost:3000`), so **production verification is BLOCKED**.

## 2. Baseline (before changes)

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS |
| `eslint` | PASS |
| `next build` | PASS |
| Internal-link crawl (89 URLs) | PASS – no broken internal links |
| Missing features | FAIL – no blog, no privacy/terms/cookie/disclaimer pages, no password recovery, no PNG app icons / service worker |
| Responsive (21 pages × 9 widths) | FAIL – header overflowed **197 px at 1024 px and 2 px at 1280 px on every page**; search bar overflowed ~240 px at 768 px; 2 pages overflowed at 320 px |
| `npm audit --omit=dev` | 5 findings (3 high) – see Security report |

## 3. Issues found and fixed

### Critical / high
| # | Issue | Fix | Status |
|---|---|---|---|
| 1 | Admin email **and password**, plus demo account passwords, committed in `README.md` | Removed; README now documents env vars only | Fixed – **rotate the admin password** (it is in git history) |
| 2 | Hard-coded fallback admin password and session-signing secret | No fallback password (random if unset); production refuses to sign/verify sessions without a ≥32-char `AUTH_SECRET` | PASS (verified) |
| 3 | Fresh production database was auto-filled with **fabricated listings, users, businesses and reviews** (demo accounts with known passwords) | Demo data only in development or with explicit `SEED_DEMO_DATA=true` | PASS (fresh prod store = 1 admin + categories) |
| 4 | Land pages showed the same generic claims for every listing ("Highly fertile", "Naturally enriched with nitrogen", "Direct connectivity to the taluka highway" even when road access was "No Direct Road") | Replaced with facts from the listing's own data | PASS |
| 5 | Public land pages showed **other buyers' names and avatars** and mislabelled activity ("Site Visit Scheduled", "Viewed This Land Today" for any follow-up) | Buyers anonymised ("A buyer from Pune"); labels match real statuses | PASS |
| 6 | **Every form wiped all typed input when the server returned a validation error** (React 19 auto-reset) – incl. sign-up, contact, enquiries, listing and business forms | `keepValues()` submit helper applied to all 15 action forms | PASS (regression test) |
| 7 | Anonymous "Direct Call" and support links used placeholder number `1800-123-4567` | Now configurable (`NEXT_PUBLIC_SUPPORT_PHONE`); placeholder still shows until set | Partly – **set real number** |
| 8 | No rate limiting or bot protection on login, sign-up, contact, enquiries, reviews, tracking | In-memory rate limits + honeypot on all public forms | PASS |
| 9 | Upload type checked only by browser-supplied MIME | File signature (magic bytes) check | PASS |
| 10 | Farmers could keep arbitrary image URLs on a listing via `existingImages` | Only images already on that listing can be kept | Fixed (code review) |

### Medium
| # | Issue | Fix | Status |
|---|---|---|---|
| 11 | Header overflow at 1024/1280 px; search bar overflow at 768 px; overflows at 320 px | Breakpoint and label adjustments | PASS – 0 overflow in 252 page×width checks |
| 12 | Placeholder social links (`instagram.com/` etc.) in footer and Organization JSON-LD | Shown only when configured | PASS |
| 13 | `aggregateRating` JSON-LD used stored totals that admins can override and seed data set | Computed only from approved reviews stored on the site | PASS |
| 14 | Land JSON-LD typed as retail `Product`; FAQPage markup duplicated on home and /faq | `RealEstateListing` + `Place`; FAQ markup only on /faq | PASS |
| 15 | `/signup` indexable and in sitemap | `noindex`, removed from sitemap | PASS |
| 16 | Next 15 streamed `<title>`/description into `<body>` for most user agents (incl. Googlebot) | `htmlLimitedBots: /.*/` – always in `<head>` | PASS (Lighthouse SEO 100) |
| 17 | No error boundaries – a failing page showed Next's default error | `(site)/error.tsx`, `admin/error.tsx`, `global-error.tsx` | Added |
| 18 | Low-contrast "Verified" chip, vague "Learn more" link, redundant alt text | Fixed | PASS (a11y 100 on 4/6 pages) |

### Defects introduced during this work and fixed before hand-off (found by testing)
* First service-worker install reloaded the page and wiped form input → reload only after the user presses "Update".
* Offline fallback page needed JS chunks that weren't cached → replaced with self-contained `public/offline.html`.
* Blog editor lost the clicked button's intent → hidden intent field.

## 4. New features
Blog CMS (admin) · public blog · 4 legal pages · cookie consent manager (dormant until a tag ID is set) · PWA (manifest, icons, service worker, offline page, install page, update prompt) · admin password reset · audit log · error pages · smoke test suite.

## 5. Verification summary (final build)

| Check | Result |
|---|---|
| TypeScript / ESLint / production build | PASS / PASS / PASS |
| Smoke tests (`npm run test:smoke`) | PASS 13/13 |
| Browser E2E journeys (Playwright, scratch script) | PASS 52/52 |
| Offline fallback with service worker | PASS |
| Crawl: 92 URLs, broken internal links | PASS – 0 |
| Responsive: 28 pages × 9 widths (320–1440) | PASS – 0 horizontal overflow |
| Lighthouse mobile (lab) | see `PRODUCTION_READINESS_REPORT.md` |
| Production site | BLOCKED – no URL configured |
| Real Android / iOS devices | NOT TESTED – no device access |

## 6. Related reports
`ROUTE_INVENTORY.md` · `SEO_IMPLEMENTATION_REPORT.md` · `SECURITY_AUDIT_REPORT.md` · `ADS_COMPLIANCE_CHECKLIST.md` · `PWA_INSTALLATION_AND_TESTING.md` · `PRODUCTION_READINESS_REPORT.md`
