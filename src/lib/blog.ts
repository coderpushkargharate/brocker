import type { BlogPost, DB } from "./types";

export const BLOG_PAGE_SIZE = 9;

/** Public only when published and the publish time has been reached (future = scheduled). */
export function isLive(p: BlogPost, now = Date.now()) {
  return p.status === "published" && !!p.publishedAt && +new Date(p.publishedAt) <= now;
}

export function postState(p: BlogPost): "draft" | "scheduled" | "published" {
  if (p.status !== "published") return "draft";
  return isLive(p) ? "published" : "scheduled";
}

export function livePosts(db: DB) {
  const now = Date.now();
  return db.posts.filter((p) => isLive(p, now)).sort((a, b) => +new Date(b.publishedAt!) - +new Date(a.publishedAt!));
}

/** Finds a live post by its current slug, or by an old slug (caller redirects). */
export function findLivePost(db: DB, slug: string): { post?: BlogPost; moved?: string } {
  const s = slug.toLowerCase();
  const live = livePosts(db);
  const post = live.find((p) => p.slug === s);
  if (post) return { post };
  const old = live.find((p) => p.oldSlugs.includes(s));
  return old ? { moved: old.slug } : {};
}

export function relatedPosts(db: DB, post: BlogPost, n = 3) {
  const live = livePosts(db).filter((p) => p.id !== post.id);
  const picked = post.related.map((s) => live.find((p) => p.slug === s)).filter(Boolean) as BlogPost[];
  const score = (p: BlogPost) => (p.categoryId && p.categoryId === post.categoryId ? 3 : 0) + p.tags.filter((t) => post.tags.includes(t)).length;
  const rest = live.filter((p) => !picked.includes(p)).sort((a, b) => score(b) - score(a));
  return [...picked, ...rest].slice(0, n);
}

export function postUrl(p: Pick<BlogPost, "slug">) {
  return `/blog/${p.slug}`;
}

export const tagSlug = (t: string) => encodeURIComponent(t.toLowerCase());

export function fmtDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }) : "";
}

/** "2026-10-28T10:30" typed in the admin (India time) -> ISO string. */
export function istInputToIso(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return undefined;
  const d = new Date(`${v}:00+05:30`);
  return Number.isNaN(+d) ? undefined : d.toISOString();
}

/** ISO string -> value for <input type="datetime-local"> in India time. */
export function isoToIstInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(+new Date(iso) + 330 * 60_000);
  return d.toISOString().slice(0, 16);
}
