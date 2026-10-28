# Production Readiness Report

**Verdict: code is ready to deploy; the business is not yet ready to advertise.** All automated checks pass on a local production build. Before running ads, complete the owner actions below (real contact details, legal entity, unverified marketing claims, demo data, admin password rotation).

## Test results (final build, 28 Oct 2026)

| Check | Command / tool | Result |
|---|---|---|
| TypeScript | `npm run typecheck` | PASS |
| Lint | `npm run lint` | PASS (0 warnings) |
| Production build | `npm run build` | PASS |
| HTTP smoke tests | `BASE_URL=… npm run test:smoke` | PASS 13/13 |
| Browser journeys | Playwright script (kept outside the repo; listed below) | PASS 52/52 |
| Offline fallback | Playwright + service worker, server stopped | PASS |
| Internal links | crawl of 92 URLs | PASS – 0 broken |
| Responsive | 28 pages × 320/360/375/390/430/768/1024/1280/1440 | PASS – 0 horizontal overflow (baseline: every page overflowed at 1024 px) |
| Fresh production DB | `NODE_ENV=production`, no seed flag | PASS – only admin + categories, no fake content |
| Missing `AUTH_SECRET` | production mode | PASS – login refused with safe message |

**E2E journeys covered:** anonymous admin redirect · contact form invalid → valid → stored · values kept after error · honeypot · rate limit · sign-up terms consent + password length (server-side) · sign-up creates account + hashed password + secure cookie · farmer/investor/admin logins · farmer blocked from admin · forged JWT · wrong password · open-redirect · blog: category → draft (private) → admin preview → publish → public page, canonical, JSON-LD, XSS escaping, category/tag pages, sitemap → slug rename 308 → duplicate slug rejected → incomplete publish rejected → spoofed image rejected → scheduled (hidden) → re-dated (live) → unpublish (404) → audit log → delete with confirmation · admin password reset → temp password login · mobile menu navigation · land detail · "I'm Interested" requires login → stored for investor · buyer names hidden · service worker install, cache contents.

**Not tested:** real Android/iOS devices · production site (no URL configured) · real GA/Ads/Pixel tags (none configured) · Rich Results Test · Search Console · field (real-user) Core Web Vitals · screen readers (only automated a11y checks) · non-owner access to private documents via the browser (covered by code review).

## Performance (Lighthouse 12, mobile, simulated slow 4G – lab data, local server)

| Page | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 92 | 100 | 100 | 100 | 2.7 s | 0 | 210 ms |
| `/buy-land` | 75 | 97 | 100 | 100 | 3.2 s | 0 | 540 ms |
| land detail | 88 | 100 | 100 | 100 | 3.0 s | 0 | 280 ms |
| blog article | 95 | 100 | 100 | 100 | 2.5 s | 0 | 160 ms |
| `/contact` | 92 | 100 | 100 | 100 | 2.8 s | 0 | 200 ms |
| `/business-services` | 88 | 93 | 100 | 100 | 3.0 s | 0 | 260 ms |

CLS meets the target everywhere. LCP is slightly above the 2.5 s target on most pages under lab throttling. Remaining bottlenecks:
* `/buy-land` main-thread work (TBT 540 ms): the client-side filters/range sliders hydrate a large component. Splitting the filter panel or deferring it would help.
* Every page is dynamic (reads the session for the header), so HTML isn't cached at the CDN. Making the header's user area client-loaded would allow static caching of public pages – an architectural change, not done.
* `readDB()` loads the whole database per request (cached 1.5 s). Fine at current size; move to per-collection queries before data grows large.
* Remaining a11y items: `/buy-land` range-slider thumbs are below the 24 px target size; `/business-services` has some low-contrast labels.

## Owner action list (in priority order)

1. **Change the admin password** (it was in git history) and ensure `AUTH_SECRET` (≥32 chars) is set in production.
2. Set business env vars: `NEXT_PUBLIC_SUPPORT_PHONE`, `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_BUSINESS_ADDRESS`, `NEXT_PUBLIC_GRIEVANCE_OFFICER`, social URLs, `NEXT_PUBLIC_SITE_URL`.
3. Remove demo data (lands, users, businesses, workers, reviews) from the live database, or confirm it was never loaded.
4. Substantiate or replace the "5000+ / ₹250Cr+ / 1000+" claims in `hero.png` and on `/about`.
5. Legal review of the 4 legal pages; decide on MahaRERA agent registration.
6. Deploy, then run `BASE_URL=https://your-domain npm run test:smoke` (read-only, safe on production).
7. Set up Search Console (see SEO report); add tag IDs only when ready, and verify consent behaviour with Tag Assistant / Pixel Helper.
8. Test the PWA on a real Android phone and iPhone (script in the PWA report).
9. Plan the Next 16 / `@vercel/blob` 2.x upgrade for the `npm audit` findings.
10. Publish real blog articles.

## Environment variables (presence only – values not inspected)

| Variable | Required | In `.env.local` |
|---|---|---|
| `AUTH_SECRET` | yes (production) | present |
| `NEXT_PUBLIC_SITE_URL` | yes | present (set to localhost) |
| `MONGODB_URI` / `DATABASE_URL` | one of them in production | `MONGODB_URI` present |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first run only | present |
| `GOOGLE_SITE_VERIFICATION` | optional | present |
| `BLOB_READ_WRITE_TOKEN` | needed on Vercel for uploads | missing |
| New: `NEXT_PUBLIC_SUPPORT_PHONE`, `…_WHATSAPP_URL`, `…_SUPPORT_EMAIL`, `…_LEGAL_NAME`, `…_BUSINESS_ADDRESS`, `…_GRIEVANCE_OFFICER`, `…_RERA_AGENT_NO`, `…_GSTIN`, `…_SOCIAL_*`, `…_GA_ID`, `…_GOOGLE_ADS_ID`, `…_GOOGLE_ADS_LEAD_LABEL`, `…_META_PIXEL_ID`, `SEED_DEMO_DATA` | see `.env.example` | missing (all optional; business details strongly recommended) |

## Deployment notes
* No database migration is needed: new collections (`posts`, `blogCategories`, `auditLog`) are created empty on first use, for MongoDB, Postgres and the JSON file. Existing records are untouched.
* `NEXT_DIST_DIR` (new, optional) lets a production build live beside a running `next dev`. Leave it unset in deployment.
* Nothing was deployed, committed or pushed, and no production data, DNS or credentials were touched.

## Important files changed
* Security: `src/lib/security.ts`, `src/lib/session.ts`, `src/lib/seed.ts`, `src/lib/uploads.ts`, `src/app/actions/{auth,lands,services,admin}.ts`, `next.config.ts`, `README.md`
* Forms: `src/lib/forms.ts` (+15 form components), `src/components/FormGuard.tsx`
* Blog: `src/app/actions/blog.ts`, `src/lib/{blog,markdown,audit}.ts`, `src/app/(site)/blog/**`, `src/app/admin/blog/**`, `src/components/blog/*`, `src/components/admin/{PostForm,BlogCategoryForm}.tsx`
* Legal & consent: `src/app/(site)/{privacy-policy,terms,cookie-policy,disclaimer}`, `src/components/{LegalPage,Consent}.tsx`
* PWA: `src/app/manifest.ts`, `public/sw.js`, `public/offline.html`, `public/icons/*`, `src/components/Pwa.tsx`, `src/app/(site)/install`
* SEO/UI: `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/(site)/lands/[slug]/page.tsx`, `src/components/{Footer,HeaderClient,SearchBar,Logo}.tsx`, `src/app/globals.css`
* Tests: `tests/smoke.test.mjs`, `package.json` scripts `typecheck`, `test:smoke`
