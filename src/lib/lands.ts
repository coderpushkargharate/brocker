import { readDB } from "./db";
import type { DB, Land, Preferences, PublicUser, User } from "./types";
import { toPublic } from "./auth";
import { BUDGETS, AREAS } from "./config";

export const PAGE_SIZE = 6;

export function publicLands(db: DB) {
  return db.lands.filter((l) => l.status === "active");
}

export async function getLandBySlug(slug: string) {
  return (await (await readDB())).lands.find((l) => l.slug === slug);
}

export async function getLandById(id: string) {
  return (await (await readDB())).lands.find((l) => l.id === id);
}

export async function getUser(id: string): Promise<PublicUser | undefined> {
  const u = (await (await readDB())).users.find((x) => x.id === id);
  return u ? toPublic(u) : undefined;
}

export type LandQuery = {
  district?: string;
  taluka?: string;
  type?: string;
  category?: string;
  budget?: string; // "min-max"
  area?: string; // "min-max"
  water?: string;
  road?: string;
  electricity?: string;
  verified?: string;
  q?: string;
  sort?: string;
  page?: string;
};

export function parseRange(v?: string): [number, number] | null {
  if (!v) return null;
  const [a, b] = v.split("-").map(Number);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return [a, b];
}

export function searchLands(q: LandQuery, db: DB) {
  let list = publicLands(db);
  if (q.district) list = list.filter((l) => l.district.toLowerCase() === q.district!.toLowerCase());
  if (q.taluka) list = list.filter((l) => l.taluka.toLowerCase() === q.taluka!.toLowerCase());
  if (q.type) list = list.filter((l) => l.landType.toLowerCase() === q.type!.toLowerCase());
  if (q.category) list = list.filter((l) => l.category === q.category);
  const b = parseRange(q.budget);
  if (b) list = list.filter((l) => l.price >= b[0] && l.price <= b[1]);
  const a = parseRange(q.area);
  if (a) list = list.filter((l) => l.area >= a[0] && l.area <= a[1]);
  if (q.water === "1") list = list.filter((l) => !/limited|monsoon/i.test(l.waterAvailability));
  if (q.road === "1") list = list.filter((l) => !/no direct/i.test(l.roadAccess));
  if (q.electricity === "1") list = list.filter((l) => l.electricity === "Available");
  if (q.verified === "1") list = list.filter((l) => l.verified);
  if (q.q) {
    const s = q.q.toLowerCase();
    list = list.filter((l) => [l.title, l.village, l.taluka, l.district, l.currentCrop, l.code].join(" ").toLowerCase().includes(s));
  }
  switch (q.sort) {
    case "price-asc":
      list = [...list].sort((x, y) => x.price - y.price);
      break;
    case "price-desc":
      list = [...list].sort((x, y) => y.price - x.price);
      break;
    case "newest":
      list = [...list].sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt));
      break;
    case "area-desc":
      list = [...list].sort((x, y) => y.area - x.area);
      break;
    default:
      list = [...list].sort((x, y) => Number(y.featured) - Number(x.featured) || Number(y.verified) - Number(x.verified) || y.stats.views - x.stats.views);
  }
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(q.page) || 1), pages);
  return { total, pages, page, items: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) };
}

export const DEFAULT_PREFS: Preferences = {
  district: "Pune",
  budgetMin: BUDGETS[1].min,
  budgetMax: BUDGETS[1].max,
  areaMin: AREAS[1].min,
  areaMax: AREAS[1].max,
  landType: "Agricultural",
  alerts: true,
};

/** How well a land fits an investor's preferences (shown as "88% Match"). */
export function matchScore(l: Land, p: Preferences = DEFAULT_PREFS) {
  let s = 40;
  if (l.district === p.district) s += 15;
  if (l.price >= p.budgetMin && l.price <= p.budgetMax) s += 12;
  else if (l.price <= p.budgetMax * 1.3) s += 6;
  if (l.area >= p.areaMin && l.area <= p.areaMax) s += 8;
  if (l.landType === p.landType) s += 5;
  if (l.verified) s += 5;
  if (l.waterAvailability === "Year-round") s += 3;
  return Math.min(s, 98);
}

export function listingChecks(l: Land) {
  const docsDone = l.documents.filter((d) => ["extract", "landMap", "ownership", "soil"].includes(d.key) && d.file).length;
  return [
    { label: "Basic Information", ok: Boolean(l.title && l.area && l.landType) },
    { label: `Photos (${Math.min(l.images.length, 5)}/5)`, ok: l.images.length >= 5 },
    { label: "Location Details", ok: Boolean(l.village && l.taluka && l.district && l.state) },
    { label: `Documents (${docsDone}/4)`, ok: docsDone >= 4 },
    { label: "Price Added", ok: l.price > 0 },
    { label: "Description", ok: l.description.trim().length > 40 },
  ];
}

export function listingQuality(l: Land) {
  const c = listingChecks(l);
  let score = c.filter((x) => x.ok).length / c.length;
  // partial credit for photos
  if (l.images.length > 0 && l.images.length < 5) score += (l.images.length / 5) * (1 / c.length);
  return Math.round(score * 100);
}

export function profileStrength(u: PublicUser | User) {
  const fields = [u.name, u.email, u.phone, u.avatar, u.district, u.state];
  const extra = u.role === "farmer" ? [u.village, u.taluka, u.experience, u.farmingType] : [u.city, u.preferences ? "y" : ""];
  const all = [...fields, ...extra];
  return Math.round((all.filter(Boolean).length / all.length) * 100);
}

export function districtCounts(db: DB) {
  const m = new Map<string, number>();
  for (const l of publicLands(db)) m.set(l.district, (m.get(l.district) || 0) + 1);
  return m;
}

export function similarLands(l: Land, n: number, db: DB) {
  return publicLands(db)
    .filter((x) => x.id !== l.id)
    .sort((a, b) => Number(b.district === l.district) - Number(a.district === l.district) || Math.abs(a.price - l.price) - Math.abs(b.price - l.price))
    .slice(0, n);
}
