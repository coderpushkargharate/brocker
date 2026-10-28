# PWA Installation & Testing

AgriLand is now an installable Progressive Web App. A PWA is **not** a Play Store or App Store listing (see the end of this document).

## What was built

| Piece | Details |
|---|---|
| Manifest (`src/app/manifest.ts`) | `id`/`start_url`/`scope` `/`, `display: standalone`, theme `#167208`, PNG icons 192/512, maskable 192/512, SVG, shortcuts (Buy Land, Sell Land, Find Services) |
| Icons | `public/icons/*.png` (generated from the existing logo; maskable versions keep the leaf inside the safe zone), `src/app/apple-icon.png` (180 px) |
| iOS | `apple-mobile-web-app-capable`, title and status-bar meta; `viewport-fit=cover` with safe-area padding on the header, footer, banners and dialogs |
| Service worker (`public/sw.js`) | Pages always from the network (they show login state and live listings) → `/offline.html` when offline. Hashed `/_next/static` cache-first; images stale-while-revalidate (max 150). **Never cached:** `/admin`, `/dashboard`, `/api/*`, `/login`, `/signup`, `/forgot-password`, RSC payloads, any non-GET request. Served with `no-cache` so updates are picked up. |
| Updates (`src/components/Pwa.tsx`) | New version → "A new version is available · Update" bar; reload happens only after the user taps Update (and the app checks for updates whenever it returns to the foreground). |
| Install entry points | Footer and mobile menu "Install App": uses the browser's real prompt where available (Chrome/Edge/Samsung on Android, desktop Chrome/Edge), otherwise links to `/install`. Hidden once installed. No fake install buttons. |
| `/install` | Step-by-step instructions for Android, iPhone/iPad (Safari → Share → Add to Home Screen) and desktop, plus live status |

## Test results

| Test | Environment | Result |
|---|---|---|
| Manifest valid, PNG 192/512 + maskable reachable | Smoke test | PASS |
| Service worker installs and activates | Chrome (headless, local prod build) | PASS |
| Offline navigation shows the offline page; recovers when back online | Chrome, server stopped | PASS |
| No admin/dashboard/API/page HTML in caches | Chrome cache inspection | PASS |
| First install doesn't reload the page / wipe forms | Chrome (regression found and fixed) | PASS |
| Install prompt on Android | Real device | **NOT TESTED** – no device access |
| Add to Home Screen on iPhone/iPad, standalone mode, status bar, safe areas | Real device | **NOT TESTED** – no device access |
| Login persists after closing/reopening installed app | Real device | **NOT TESTED** (uses the same 7-day HttpOnly cookie as the browser, so it should persist) |
| Desktop install (Chrome/Edge) | – | **NOT TESTED** interactively |
| Lighthouse PWA category | – | Not available in Lighthouse 12 (category removed) |

Installability needs **HTTPS** (localhost is exempt).

## Manual test script (do this on the live HTTPS site)

**Android (Chrome)**
1. Open the site → menu (⋮) → **Install app**, or tap **Install App** in the footer.
2. Open from the home screen: it should open at the home page in its own window with the green theme.
3. Log in, close the app fully, reopen → still logged in.
4. Turn on aeroplane mode, open a new page → "You're offline" page; turn data back on → page reloads.
5. Use the Android back button inside the app: it should move back through pages, then close the app.
6. After a new deployment, reopen the app → "Update" bar appears → tap it → new version loads.

**iPhone / iPad (Safari, iOS 16.4+)**
1. Open in **Safari** → Share → **Add to Home Screen** → Add.
2. Check the icon, that it opens without Safari's address bar, and that the header isn't under the notch.
3. Repeat steps 3–4 from Android. (iOS has no install prompt API, so the footer button opens the instructions page instead – this is expected.)

## App Store / Play Store
A PWA can't be listed in the stores by itself. Options if you want store presence later:
* **Google Play:** wrap the PWA as a Trusted Web Activity (e.g. Bubblewrap / PWABuilder). Needs a Play developer account, Digital Asset Links file on your domain, store listing, privacy policy URL (exists) and Google review.
* **Apple App Store:** Apple usually rejects simple website wrappers; it needs a native shell with real app functionality (e.g. Capacitor), an Apple developer account and App Review.
Neither was done – no native app exists in this repository.
