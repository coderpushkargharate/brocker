import type { Business, DB, ServiceCategory, ServiceKind, ServiceSettings, Worker } from "./types";
import { DEFAULT_SERVICE_SETTINGS } from "./services-seed";
import { expBucket } from "./services-config";

export const SERVICE_PAGE_SIZE = 10;

export function serviceSettings(db: DB): ServiceSettings {
  return { ...DEFAULT_SERVICE_SETTINGS, ...(db.serviceSettings?.[0] ?? {}) };
}

export function categoriesOf(db: DB, kind: ServiceKind, includeHidden = false): ServiceCategory[] {
  return db.serviceCategories.filter((c) => c.kind === kind && (includeHidden || c.active)).sort((a, b) => a.order - b.order);
}

export function categoryById(db: DB, id?: string) {
  return id ? db.serviceCategories.find((c) => c.id === id) : undefined;
}

const has = (hay: (string | undefined)[], needle: string) => {
  const n = needle.toLowerCase();
  return hay.some((h) => h && h.toLowerCase().includes(n));
};

/** Every word of the search must match somewhere, so "jcb pune" works. */
const textMatch = (hay: (string | undefined)[], q: string) =>
  q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => has(hay, w.replace(/s$/, "")));

const list = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

const paginate = <T,>(all: T[], pageIn?: string) => {
  const pages = Math.max(1, Math.ceil(all.length / SERVICE_PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(pageIn) || 1));
  return { items: all.slice((page - 1) * SERVICE_PAGE_SIZE, page * SERVICE_PAGE_SIZE), total: all.length, page, pages };
};

// ---------- businesses ----------

export type BizQuery = { q?: string; district?: string; taluka?: string; category?: string; sub?: string; verified?: string; sort?: string; page?: string };

export function publicBusinesses(db: DB) {
  const live = new Set(db.serviceCategories.filter((c) => c.active).map((c) => c.id));
  return db.businesses.filter((b) => b.status === "active" && live.has(b.categoryId));
}

export function businessHaystack(b: Business, db: DB) {
  const c = categoryById(db, b.categoryId);
  return [b.name, b.subcategory, b.summary, b.area, b.taluka, b.district, c?.name, c?.short, ...b.tags, ...b.services.map((s) => s.name), ...b.products];
}

export function filterBusinesses(q: BizQuery, db: DB, base = publicBusinesses(db)) {
  let all = base;
  if (q.category) all = all.filter((b) => b.categoryId === q.category);
  if (q.district) all = all.filter((b) => b.district === q.district);
  if (q.taluka) all = all.filter((b) => b.taluka === q.taluka);
  if (q.verified === "1") all = all.filter((b) => b.verified);
  const subs = list(q.sub);
  if (subs.length) all = all.filter((b) => subs.includes(b.subcategory) || b.tags.some((t) => subs.includes(t)));
  if (q.q) all = all.filter((b) => textMatch(businessHaystack(b, db), q.q!));
  return all;
}

export function sortBusinesses(all: Business[], sort?: string) {
  const s = [...all];
  if (sort === "rating") s.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  else if (sort === "reviews") s.sort((a, b) => b.reviewCount - a.reviewCount);
  else if (sort === "newest") s.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  // relevant: premium first, then verified, then rating
  else s.sort((a, b) => +b.premium - +a.premium || +b.verified - +a.verified || b.rating * Math.log(b.reviewCount + 2) - a.rating * Math.log(a.reviewCount + 2));
  return s;
}

export function searchBusinesses(q: BizQuery, db: DB) {
  return paginate(sortBusinesses(filterBusinesses(q, db), q.sort), q.page);
}

/** Subcategory → number of live businesses, for the filter sidebar. */
export function subcategoryCounts(db: DB, q: BizQuery) {
  const base = filterBusinesses({ ...q, sub: undefined, q: undefined }, db);
  const cats = q.category ? [categoryById(db, q.category)].filter(Boolean) as ServiceCategory[] : categoriesOf(db, "business");
  const out = new Map<string, number>();
  for (const c of cats) for (const s of c.subcategories) out.set(s, 0);
  for (const b of base) {
    if (out.has(b.subcategory)) out.set(b.subcategory, out.get(b.subcategory)! + 1);
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1]);
}

// ---------- workers ----------

export type WorkerQuery = {
  q?: string;
  district?: string;
  taluka?: string;
  village?: string;
  category?: string;
  skill?: string;
  today?: string;
  verified?: string;
  wage?: string;
  exp?: string;
  type?: string;
  sort?: string;
  page?: string;
  tab?: string;
  view?: string;
};

export function publicWorkers(db: DB) {
  const live = new Set(db.serviceCategories.filter((c) => c.active).map((c) => c.id));
  return db.workers.filter((w) => w.status === "active" && live.has(w.categoryId));
}

export function workerHaystack(w: Worker, db: DB) {
  const c = categoryById(db, w.categoryId);
  return [w.name, w.description, w.village, w.taluka, w.district, c?.name, ...w.skills];
}

export function filterWorkers(q: WorkerQuery, db: DB, base = publicWorkers(db)) {
  let all = base;
  if (q.category) all = all.filter((w) => w.categoryId === q.category);
  if (q.district) all = all.filter((w) => w.district === q.district);
  if (q.taluka) all = all.filter((w) => w.taluka === q.taluka);
  if (q.village) all = all.filter((w) => w.village.toLowerCase() === q.village!.toLowerCase());
  if (q.today === "1") all = all.filter((w) => w.availableToday);
  if (q.verified === "1") all = all.filter((w) => w.verified);
  if (q.type === "individual" || q.type === "group") all = all.filter((w) => w.profileType === q.type);
  const skills = list(q.skill);
  if (skills.length) all = all.filter((w) => w.skills.some((s) => skills.includes(s)));
  const exps = list(q.exp);
  if (exps.length) all = all.filter((w) => exps.includes(expBucket(w.expYears)));
  if (q.wage) {
    const [min, max] = q.wage.split("-").map(Number);
    all = all.filter((w) => (w.wageMax ?? w.wageMin) >= (min || 0) && w.wageMin <= (max || Infinity));
  }
  if (q.q) all = all.filter((w) => textMatch(workerHaystack(w, db), q.q!));
  return all;
}

export function sortWorkers(all: Worker[], sort?: string) {
  const s = [...all];
  if (sort === "wage-asc") s.sort((a, b) => a.wageMin - b.wageMin);
  else if (sort === "wage-desc") s.sort((a, b) => b.wageMin - a.wageMin);
  else if (sort === "rating") s.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  else if (sort === "experience") s.sort((a, b) => b.expYears - a.expYears);
  else if (sort === "newest") s.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  else s.sort((a, b) => +b.availableToday - +a.availableToday || +b.verified - +a.verified || b.rating * Math.log(b.reviewCount + 2) - a.rating * Math.log(a.reviewCount + 2));
  return s;
}

export function searchWorkers(q: WorkerQuery, db: DB) {
  return paginate(sortWorkers(filterWorkers(q, db), q.sort), q.page);
}

/** Skill → number of live workers, for the filter sidebar. */
export function skillCounts(db: DB, q: WorkerQuery) {
  const base = filterWorkers({ ...q, skill: undefined, q: undefined }, db);
  const cats = q.category ? [categoryById(db, q.category)].filter(Boolean) as ServiceCategory[] : categoriesOf(db, "labour");
  const out = new Map<string, number>();
  for (const c of cats) for (const s of c.subcategories) out.set(s, 0);
  for (const w of base) for (const s of w.skills) if (out.has(s)) out.set(s, out.get(s)! + 1);
  return [...out.entries()].sort((a, b) => b[1] - a[1]);
}

export function expCounts(db: DB, q: WorkerQuery) {
  const base = filterWorkers({ ...q, exp: undefined }, db);
  const m = new Map<string, number>();
  for (const w of base) m.set(expBucket(w.expYears), (m.get(expBucket(w.expYears)) ?? 0) + 1);
  return m;
}

/** Villages that have workers in the chosen district / taluka. */
export function workerVillages(db: DB, district?: string, taluka?: string) {
  return [...new Set(publicWorkers(db).filter((w) => (!district || w.district === district) && (!taluka || w.taluka === taluka)).map((w) => w.village))].sort();
}

export function uniqueSlug(base: string, taken: Set<string>) {
  let s = base || "profile";
  let n = 2;
  while (taken.has(s)) s = `${base}-${n++}`;
  return s;
}
