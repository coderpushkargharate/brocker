/* AgriLand service worker.
 * - Pages are always fetched from the network (they show login state and live listings); when offline,
 *   navigation falls back to /offline.html (self-contained: it needs no JS chunks that might not be cached).
 * - Hashed build assets are cached forever; images are cached and refreshed in the background.
 * - Admin, dashboard, API, auth and any non-GET request are never cached.
 * Bump VERSION to force clients onto a fresh cache. */
const VERSION = "v2";
const STATIC = `agri-static-${VERSION}`;
const IMAGES = `agri-img-${VERSION}`;
const PRECACHE = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png", "/icon.svg"];
const PRIVATE = [/^\/admin/, /^\/dashboard/, /^\/api\//, /^\/login/, /^\/signup/, /^\/forgot-password/];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC, IMAGES]);
      for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

async function trim(cacheName, max) {
  const c = await caches.open(cacheName);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE.some((r) => r.test(url.pathname))) return;

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(async () => (await caches.match("/offline.html")) || new Response("You are offline.", { status: 503, headers: { "Content-Type": "text/plain" } })));
    return;
  }

  // React Server Component payloads are page data: never cache them
  if (req.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  if (url.pathname.startsWith("/images/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/_next/image") || url.pathname.startsWith("/api/uploads/")) {
    event.respondWith(
      caches.open(IMAGES).then(async (c) => {
        const hit = await c.match(req);
        const refresh = fetch(req)
          .then((res) => {
            if (res.ok) c.put(req, res.clone()).then(() => trim(IMAGES, 150));
            return res;
          })
          .catch(() => hit);
        return hit || refresh;
      }),
    );
  }
});
