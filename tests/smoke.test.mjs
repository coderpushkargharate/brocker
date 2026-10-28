// HTTP smoke tests for a running AgriLand server. No dependencies (Node's built-in test runner).
//   BASE_URL=http://localhost:3000 npm run test:smoke
// Read-only: safe to point at any environment, including production.
import { test } from "node:test";
import assert from "node:assert/strict";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const get = (p, opts = {}) => fetch(BASE + p, { redirect: "manual", ...opts });
const html = async (p) => {
  const r = await get(p);
  return { r, body: await r.text() };
};

const PUBLIC = ["/", "/buy-land", "/sell-land", "/services", "/find-services", "/business-services", "/labour", "/labour/register", "/list-business", "/post-requirement", "/about", "/contact", "/faq", "/blog", "/install", "/privacy-policy", "/terms", "/cookie-policy", "/disclaimer", "/login", "/signup", "/forgot-password"];

test("public pages return 200 with exactly one <h1> and a <title>", async () => {
  for (const p of PUBLIC) {
    const { r, body } = await html(p);
    assert.equal(r.status, 200, `${p} status`);
    assert.match(body, /<title>[^<]{5,}<\/title>/, `${p} title`);
    assert.equal((body.match(/<h1[\s>]/g) || []).length, 1, `${p} h1 count`);
  }
});

test("indexable pages have a canonical and unique titles", async () => {
  const titles = new Map();
  for (const p of PUBLIC) {
    const { body } = await html(p);
    if (/<meta name="robots" content="noindex/.test(body)) continue;
    assert.match(body, /<link rel="canonical" href="[^"]+"/, `${p} canonical`);
    const t = body.match(/<title>([^<]*)<\/title>/)[1];
    assert.ok(!titles.has(t), `duplicate title "${t}" on ${p} and ${titles.get(t)}`);
    titles.set(t, p);
  }
});

test("auth and utility pages are noindex", async () => {
  for (const p of ["/login", "/signup", "/forgot-password"]) {
    const { body } = await html(p);
    assert.match(body, /<meta name="robots" content="noindex/, p);
  }
});

test("unknown resources return a real 404", async () => {
  for (const p of ["/no-such-page", "/lands/no-such-land", "/locations/atlantis", "/land-type/nope", "/business-services/nope", "/labour/nope", "/blog/no-such-post", "/blog/category/nope", "/blog/tag/nope"]) {
    const r = await get(p);
    assert.equal(r.status, 404, p);
  }
});

test("protected areas redirect anonymous visitors to login", async () => {
  for (const p of ["/admin", "/admin/blog", "/admin/blog/new", "/admin/users", "/dashboard", "/dashboard/listings"]) {
    const r = await get(p);
    assert.equal(r.status, 307, `${p} status`);
    assert.match(r.headers.get("location") || "", /\/login\?next=/, `${p} location`);
  }
});

test("private documents are not served to anonymous users", async () => {
  const r = await get("/api/docs/anything.pdf");
  assert.equal(r.status, 401);
  const t = await get("/api/uploads/..%2F..%2Fdb.json");
  assert.equal(t.status, 404);
});

test("robots.txt blocks private areas and points to the sitemap", async () => {
  const body = await (await get("/robots.txt")).text();
  for (const d of ["/admin", "/dashboard", "/api/"]) assert.match(body, new RegExp(`Disallow: ${d}`));
  assert.match(body, /Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
});

test("sitemap is valid, has no private URLs, and every URL resolves", async () => {
  const body = await (await get("/sitemap.xml")).text();
  assert.match(body, /^<\?xml/);
  const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(urls.length > 5, "sitemap has URLs");
  for (const u of urls) {
    const path = u.replace(/^https?:\/\/[^/]+/, "") || "/";
    assert.ok(!/^\/(admin|dashboard|api|login|signup)/.test(path), `private URL in sitemap: ${path}`);
    const r = await get(path);
    assert.equal(r.status, 200, `sitemap URL ${path}`);
  }
});

test("JSON-LD on every public page parses", async () => {
  for (const p of PUBLIC) {
    const { body } = await html(p);
    for (const m of body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) assert.doesNotThrow(() => JSON.parse(m[1]), `${p} JSON-LD`);
  }
});

test("web app manifest is installable", async () => {
  const m = await (await get("/manifest.webmanifest")).json();
  assert.equal(m.display, "standalone");
  assert.equal(m.start_url, "/");
  for (const size of ["192x192", "512x512"]) {
    const icon = m.icons.find((i) => i.sizes === size && i.type === "image/png");
    assert.ok(icon, `${size} png icon`);
    assert.equal((await get(icon.src)).status, 200, `${icon.src} reachable`);
  }
  assert.ok(m.icons.some((i) => i.purpose === "maskable"), "maskable icon");
  const offline = await get("/offline.html");
  assert.equal(offline.status, 200, "offline fallback page");
  assert.ok(!(await offline.text()).includes("/_next/"), "offline page must not depend on build chunks");
  const sw = await get("/sw.js");
  assert.equal(sw.status, 200);
  assert.match(sw.headers.get("cache-control") || "", /no-cache/);
});

test("security headers are present", async () => {
  const r = await get("/");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.ok(r.headers.get("strict-transport-security"));
  assert.match(r.headers.get("content-security-policy") || "", /frame-ancestors 'self'/);
  assert.equal(r.headers.get("x-powered-by"), null);
});

test("footer links to all legal pages", async () => {
  const { body } = await html("/");
  for (const p of ["/privacy-policy", "/terms", "/cookie-policy", "/disclaimer"]) assert.ok(body.includes(`href="${p}"`), p);
});

test("retired URLs redirect permanently to their replacement", async () => {
  const r = await get("/investors");
  assert.equal(r.status, 308);
  assert.match(r.headers.get("location") || "", /\/buy-land$/);
});
