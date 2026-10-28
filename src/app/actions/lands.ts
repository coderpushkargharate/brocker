"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutate, newId, readDB } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { saveImages, saveOne, UploadError } from "@/lib/uploads";
import { slugify } from "@/lib/format";
import { DOCUMENT_TYPES } from "@/lib/config";
import type { DB, DocKey, InterestStatus, Land, LandDocument, LandStatus, NearbyPlace, Notification } from "@/lib/types";
import type { FormState } from "./auth";
import { isBot, rateLimit, TOO_MANY } from "@/lib/security";
import { site } from "@/lib/config";

const SUPPORT_DIGITS = site.supportPhoneHref.replace(/^tel:/, "");

const now = () => new Date().toISOString();
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const n = Number(String(fd.get(k) ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function notify(db: DB, n: Omit<Notification, "id" | "read" | "createdAt">) {
  db.notifications.push({ ...n, id: newId(), read: false, createdAt: now() });
}

function refresh() {
  revalidatePath("/", "layout");
}

/** "Pune (25 km)" -> { detail: "Pune", km: 25 } */
function parsePlace(v: string) {
  const m = v.match(/^(.*?)\s*\(([\d.]+)\s*km\)\s*$/i);
  return m ? { detail: m[1].trim(), km: Number(m[2]) } : { detail: v, km: 0 };
}

function buildNearby(fd: FormData, village: string, taluka: string): NearbyPlace[] {
  const out: NearbyPlace[] = [];
  const add = (kind: NearbyPlace["kind"], name: string, detail: string, km: number) => {
    if (km > 0 || detail) out.push({ kind, name, detail, distanceKm: km });
  };
  const road = str(fd, "nb_road");
  if (road) add("road", "Main Road", str(fd, "roadAccess") || "Main road", num(fd, "nb_road"));
  const vil = str(fd, "nb_village");
  if (vil) add("village", "Village / Market", `${village || "Village"} market`, num(fd, "nb_village"));
  const mkt = str(fd, "nb_market");
  if (mkt) add("market", "Agricultural Market", `${taluka || "Local"} Krishi Utpanna Bazar`, num(fd, "nb_market"));
  const rail = str(fd, "nb_rail");
  if (rail) add("rail", "Railway Station", `${taluka || "Nearest"} Railway Station`, num(fd, "nb_rail"));
  const city = str(fd, "nb_city");
  if (city) {
    const p = parsePlace(city);
    add("city", "Nearest City", p.detail, p.km);
  }
  const hw = str(fd, "nb_highway");
  if (hw) {
    const p = parsePlace(hw);
    add("highway", "Highway Access", p.detail, p.km);
  }
  return out;
}

/** Pick the "Find Land by Type" category when the farmer doesn't choose one. */
function deriveCategory(fd: FormData, area: number) {
  const type = str(fd, "landType").toLowerCase();
  const crop = str(fd, "currentCrop").toLowerCase();
  const water = `${str(fd, "waterSource")} ${str(fd, "waterAvailability")}`.toLowerCase();
  if (type.includes("farmhouse")) return "farmhouse-land";
  if (type.includes("orchard") || /mango|pomegranate|grape|banana|fruit/.test(crop)) return "orchard-fruit-farm";
  if (area >= 20) return "large-land-parcels";
  if (/organic/.test(str(fd, "description").toLowerCase())) return "organic-land";
  if (/canal|river|pond/.test(water)) return "irrigated-land";
  return "crop-land";
}

export async function saveLandAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["farmer", "admin"]);
  const isAdmin = user.role === "admin";
  const id = str(fd, "id");
  const intent = str(fd, "intent") === "draft" ? "draft" : "publish";
  const db0 = (await readDB());
  const existing = id ? db0.lands.find((l) => l.id === id) : undefined;
  if (id && !existing) return { error: "Listing not found." };
  if (existing && !isAdmin && existing.ownerId !== user.id) return { error: "You can only edit your own listings." };

  const title = str(fd, "title");
  const village = str(fd, "village");
  const taluka = str(fd, "taluka");
  const district = str(fd, "district");
  const area = num(fd, "area");
  const price = num(fd, "price");
  const description = str(fd, "description").slice(0, 1000);

  if (!title) return { error: "Please add a listing title." };

  // files
  let newImages: string[] = [];
  let video: string | undefined;
  const docUploads: Partial<Record<DocKey, string>> = {};
  try {
    newImages = await saveImages(fd.getAll("photos"));
    video = await saveOne(fd.get("video"), "video");
    for (const d of DOCUMENT_TYPES) {
      const f = await saveOne(fd.get(`doc_${d.key}`), "doc");
      if (f) docUploads[d.key] = f;
    }
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  // only photos already on this listing can be kept (prevents pointing a listing at arbitrary URLs)
  const keptImages = fd.getAll("existingImages").map(String).filter((i) => existing?.images.includes(i));
  const images = [...keptImages, ...newImages];

  const documents: LandDocument[] = DOCUMENT_TYPES.map((d) => {
    const prev = existing?.documents.find((x) => x.key === d.key);
    if (docUploads[d.key]) return { key: d.key, file: docUploads[d.key], status: "pending" };
    return prev ?? { key: d.key, status: "missing" };
  });

  if (intent === "publish") {
    if (!(area > 0)) return { error: "Please enter the total area." };
    if (!village || !taluka || !district) return { error: "Please complete the location details (village, taluka, district)." };
    if (!(price > 0)) return { error: "Please enter the total asking price." };
    if (images.length < 1) return { error: "Please upload at least one photo of your land." };
    if (description.length < 20) return { error: "Please write a short description about your land (at least 20 characters)." };
    if (!isAdmin) {
      const missing = DOCUMENT_TYPES.filter((d) => d.required && !documents.find((x) => x.key === d.key)?.file);
      if (missing.length) return { error: `Please upload required documents: ${missing.map((m) => m.label).join(", ")}.` };
    }
  }

  let status: LandStatus;
  let verified = existing?.verified ?? false;
  let featured = existing?.featured ?? false;
  if (isAdmin) {
    const s = str(fd, "status") as LandStatus;
    status = (["active", "draft", "pending", "sold", "rejected"] as const).includes(s) ? s : intent === "draft" ? "draft" : "active";
    verified = fd.get("verified") === "on";
    featured = fd.get("featured") === "on";
    if (verified) for (const d of documents) if (d.file) d.status = "verified";
  } else if (intent === "draft") {
    status = existing?.status === "active" ? "active" : "draft";
  } else {
    status = existing?.status === "active" ? "active" : "pending";
  }

  const fields = {
    title,
    landType: str(fd, "landType") || "Agriculture Land",
    category: str(fd, "category") || deriveCategory(fd, area),
    area,
    areaUnit: str(fd, "areaUnit") || "Acres",
    currentCrop: str(fd, "currentCrop"),
    village,
    taluka,
    district,
    state: str(fd, "state") || "Maharashtra",
    lat: num(fd, "lat") || existing?.lat || 18.52,
    lng: num(fd, "lng") || existing?.lng || 73.85,
    soilType: str(fd, "soilType"),
    waterSource: str(fd, "waterSource"),
    waterAvailability: str(fd, "waterAvailability"),
    roadAccess: str(fd, "roadAccess"),
    electricity: str(fd, "electricity"),
    fencing: str(fd, "fencing"),
    price,
    negotiable: str(fd, "negotiable") !== "no",
    description,
    highlights: fd.getAll("highlights").map(String),
    nearby: buildNearby(fd, village, taluka),
    images,
    video: fd.get("removeVideo") === "on" ? undefined : video ?? existing?.video,
    documents,
    status,
    verified,
    featured,
  };

  const ownerId = isAdmin ? str(fd, "ownerId") || existing?.ownerId || user.id : existing?.ownerId || user.id;

  const saved = await mutate((db) => {
    if (existing) {
      const l = db.lands.find((x) => x.id === existing.id)!;
      Object.assign(l, fields, { ownerId, updatedAt: now() });
      return l;
    }
    db.counters.landCode += 1;
    const code = db.counters.landCode;
    let slug = `${slugify(title)}-${slugify(taluka || district || "land")}`;
    if (db.lands.some((x) => x.slug === slug)) slug = `${slug}-${code}`;
    const l: Land = {
      id: newId(),
      code: `AGL-${code}`,
      slug,
      ...fields,
      ownerId,
      stats: { views: 0, saves: 0, shares: 0, calls: 0, docViews: 0 },
      createdAt: now(),
      updatedAt: now(),
    };
    db.lands.push(l);
    return l;
  });

  if (!isAdmin && saved.status === "pending" && existing?.status !== "pending") {
    await mutate((db) => {
      for (const a of db.users.filter((u) => u.role === "admin")) notify(db, { userId: a.id, kind: "land", text: `New listing "${saved.title}" by ${user.name} is waiting for review.`, link: `/admin/lands/${saved.id}` });
      notify(db, { userId: user.id, kind: "document", text: `Your listing "${saved.title}" was submitted. We will verify your documents before it goes live.`, link: `/dashboard/listings/${saved.id}` });
    });
  }
  if (saved.status === "active" && existing?.status !== "active") await alertInvestors(saved);

  refresh();
  redirect(isAdmin ? `/admin/lands?saved=${saved.id}` : `/dashboard/listings/${saved.id}?saved=1`);
}

/** Tell investors whose preferences match about a newly live land. */
async function alertInvestors(l: Land) {
  await mutate((db) => {
    for (const u of db.users) {
      if (u.role !== "investor" || !u.preferences?.alerts) continue;
      const p = u.preferences;
      if (p.district && p.district !== l.district) continue;
      if (l.price < p.budgetMin || l.price > p.budgetMax * 1.3) continue;
      notify(db, { userId: u.id, kind: "land", text: `New verified land matching your search is now available in ${l.district}: ${l.title}.`, link: `/lands/${l.slug}` });
    }
  });
}

export async function deleteLandAction(id: string) {
  const user = await requireUser(["farmer", "admin"]);
  await mutate((db) => {
    const l = db.lands.find((x) => x.id === id);
    if (!l || (user.role !== "admin" && l.ownerId !== user.id)) return;
    db.lands = db.lands.filter((x) => x.id !== id);
    db.interests = db.interests.filter((x) => x.landId !== id);
    for (const u of db.users) u.saved = u.saved.filter((s) => s !== id);
  });
  refresh();
}

export type ToggleResult = { ok: boolean; needLogin?: boolean; saved?: boolean; message?: string };

export async function toggleSaveAction(landId: string): Promise<ToggleResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, needLogin: true };
  const saved = await mutate((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    const l = db.lands.find((x) => x.id === landId);
    if (!l) return false;
    if (u.saved.includes(landId)) {
      u.saved = u.saved.filter((s) => s !== landId);
      l.stats.saves = Math.max(0, l.stats.saves - 1);
      return false;
    }
    u.saved.push(landId);
    l.stats.saves += 1;
    return true;
  });
  refresh();
  return { ok: true, saved };
}

export async function expressInterestAction(landId: string, message?: string): Promise<ToggleResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, needLogin: true };
  if (!(await rateLimit("interest", 20, 60 * 60, user.id))) return { ok: false, message: TOO_MANY };
  const l = (await readDB()).lands.find((x) => x.id === landId && x.status === "active");
  if (!l) return { ok: false, message: "Land not found." };
  if (l.ownerId === user.id) return { ok: false, message: "This is your own listing." };
  await mutate((db) => {
    if (db.interests.some((i) => i.landId === landId && i.investorId === user.id)) return;
    db.interests.push({ id: newId(), landId, investorId: user.id, status: "new", message: message?.slice(0, 500), createdAt: now() });
    notify(db, { userId: l.ownerId, kind: "interest", text: `${user.name} is interested in your ${l.title}.`, link: `/dashboard/listings/${l.id}` });
    notify(db, { userId: user.id, kind: "interest", text: `Your interest in ${l.title} was received.`, link: `/lands/${l.slug}` });
  });
  refresh();
  return { ok: true, message: "Interest sent! The farmer has been notified." };
}

/** Logs a call and returns the number to dial. */
export async function logCallAction(landId: string): Promise<{ phone: string }> {
  const user = await getCurrentUser();
  const db = (await readDB());
  const l = db.lands.find((x) => x.id === landId && x.status === "active");
  if (!l || !(await rateLimit("call", 30, 10 * 60))) return { phone: SUPPORT_DIGITS };
  const owner = db.users.find((u) => u.id === l.ownerId);
  await mutate((d) => {
    const land = d.lands.find((x) => x.id === landId)!;
    land.stats.calls += 1;
    d.calls.push({ id: newId(), landId, fromUserId: user?.id, toUserId: l.ownerId, createdAt: now() });
    notify(d, { userId: l.ownerId, kind: "call", text: `${user ? user.name : "A visitor"} called you about ${l.title}.`, link: `/dashboard/listings/${l.id}` });
  });
  // Visitors who are not logged in reach AgriLand support, which connects them to the farmer.
  return { phone: user && owner?.phone ? owner.phone.replace(/[^\d+]/g, "") : SUPPORT_DIGITS };
}

export async function recordViewAction(landId: string) {
  if (!(await rateLimit("view", 60, 60))) return;
  const viewer = await getCurrentUser();
  await mutate((db) => {
    const l = db.lands.find((x) => x.id === landId);
    if (!l || l.ownerId === viewer?.id) return;
    l.stats.views += 1;
    const owner = db.users.find((u) => u.id === l.ownerId);
    if (owner) owner.profileViews += 1;
    db.views ??= [];
    db.views.push({ landId, at: now() });
    // keep ~60 days of history for "this week / this month" numbers
    const cutoff = Date.now() - 60 * 86400_000;
    if (db.views.length > 5000 || Math.random() < 0.02) db.views = db.views.filter((v) => +new Date(v.at) > cutoff);
  });
}

export async function recordShareAction(landId: string) {
  if (!(await rateLimit("share", 20, 60))) return;
  await mutate((db) => {
    const l = db.lands.find((x) => x.id === landId);
    if (l) l.stats.shares += 1;
  });
}

export async function setInterestStatusAction(interestId: string, status: InterestStatus) {
  const user = await requireUser(["farmer", "admin"]);
  await mutate((db) => {
    const i = db.interests.find((x) => x.id === interestId);
    if (!i) return;
    const l = db.lands.find((x) => x.id === i.landId);
    if (!l || (user.role !== "admin" && l.ownerId !== user.id)) return;
    i.status = status;
    if (status === "contacted" || status === "responded")
      notify(db, { userId: i.investorId, kind: "message", text: `${user.name} has responded to your enquiry about ${l.title}.`, link: `/lands/${l.slug}` });
  });
  refresh();
}

export async function markNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await mutate((db) => {
    for (const n of db.notifications) if (n.userId === user.id) n.read = true;
  });
  refresh();
}

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  let avatar: string | undefined;
  try {
    avatar = await saveOne(fd.get("avatar"), "image");
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  const name = str(fd, "name");
  if (name.length < 2) return { error: "Please enter your name." };
  await mutate((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    Object.assign(u, {
      name,
      phone: str(fd, "phone"),
      village: str(fd, "village") || undefined,
      taluka: str(fd, "taluka") || undefined,
      district: str(fd, "district") || undefined,
      state: str(fd, "state") || undefined,
      city: str(fd, "city") || undefined,
      experience: str(fd, "experience") || undefined,
      farmingType: str(fd, "farmingType") || undefined,
      bio: str(fd, "bio") || undefined,
    });
    if (avatar) u.avatar = avatar;
  });
  refresh();
  return { ok: "Profile updated successfully." };
}

export async function updatePreferencesAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const [bMin, bMax] = str(fd, "budget").split("-").map(Number);
  const [aMin, aMax] = str(fd, "area").split("-").map(Number);
  await mutate((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    u.preferences = {
      district: str(fd, "district"),
      budgetMin: bMin || 0,
      budgetMax: bMax || 1_000_000_000,
      areaMin: aMin || 0,
      areaMax: aMax || 100000,
      landType: str(fd, "landType") || "Agriculture Land",
      alerts: fd.get("alerts") === "on",
    };
  });
  refresh();
  if (fd.get("search") === "1") {
    redirect(`/buy-land?district=${encodeURIComponent(str(fd, "district"))}&budget=${str(fd, "budget")}&area=${str(fd, "area")}&type=${encodeURIComponent(str(fd, "landType"))}`);
  }
  return { ok: "Preferences saved." };
}

export async function toggleAlertsAction() {
  const user = await requireUser();
  await mutate((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    u.preferences = { ...(u.preferences ?? { district: "Pune", budgetMin: 1_000_000, budgetMax: 3_000_000, areaMin: 2, areaMax: 10, landType: "Agriculture Land", alerts: false }) };
    u.preferences.alerts = !u.preferences.alerts;
  });
  refresh();
}

export async function contactAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name").slice(0, 80);
  const phone = str(fd, "phone").slice(0, 20);
  const message = str(fd, "message");
  // bots get a normal-looking answer so they don't retry
  if (isBot(fd)) return { ok: "Thank you! Our team will contact you within 24 hours." };
  if (!(await rateLimit("contact", 5, 10 * 60))) return { error: TOO_MANY };
  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^[+\d][\d\s-]{8,}$/.test(phone)) return { error: "Please enter a valid mobile number." };
  if (message.length < 5) return { error: "Please write a short message." };
  await mutate((db) => {
    db.enquiries.push({ id: newId(), name, email: "", phone, subject: str(fd, "subject").slice(0, 120) || "General", message: message.slice(0, 2000), status: "new", createdAt: now() });
    for (const a of db.users.filter((u) => u.role === "admin")) notify(db, { userId: a.id, kind: "message", text: `New enquiry from ${name}: ${str(fd, "subject") || "General"}`, link: "/admin/enquiries" });
  });
  return { ok: "Thank you! Our team will contact you within 24 hours." };
}
