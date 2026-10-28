"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutate, newId, readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { saveImages, saveOne, UploadError } from "@/lib/uploads";
import { slugify } from "@/lib/format";
import { uniqueSlug } from "@/lib/services";
import { ratingFor } from "@/lib/services-seed";
import { EXPERIENCE_OPTIONS, imageForService } from "@/lib/services-config";
import type { Business, DB, LeadKind, Notification, Worker } from "@/lib/types";
import type { FormState } from "./auth";
import { isBot, rateLimit, TOO_MANY } from "@/lib/security";

const now = () => new Date().toISOString();
const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const strs = (fd: FormData, k: string) => fd.getAll(k).map((v) => String(v).trim()).filter(Boolean);
const num = (fd: FormData, k: string) => {
  const n = Number(String(fd.get(k) ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const validPhone = (p: string) => p.replace(/\D/g, "").length >= 10 && /^[+\d][\d\s-]{8,}$/.test(p);
const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function notify(db: DB, n: Omit<Notification, "id" | "read" | "createdAt">) {
  db.notifications.push({ ...n, id: newId(), read: false, createdAt: now() });
}
function notifyAdmins(db: DB, text: string, link: string) {
  for (const a of db.users.filter((u) => u.role === "admin")) notify(db, { userId: a.id, kind: "system", text, link });
}

function refresh() {
  revalidatePath("/", "layout");
}

// ---------- List Your Business ----------

export async function saveBusinessAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const editId = str(fd, "id");
  if (editId && !isAdmin) return { error: "Only admins can edit a business." };
  if (!isAdmin && (isBot(fd) || !(await rateLimit("business", 5, 60 * 60)))) return { error: TOO_MANY };

  const db0 = await readDB();
  const existing = editId ? db0.businesses.find((b) => b.id === editId) : undefined;
  if (editId && !existing) return { error: "Business not found." };

  const categoryId = str(fd, "categoryId");
  const category = db0.serviceCategories.find((c) => c.id === categoryId && c.kind === "business");
  const name = str(fd, "name", 120);
  const phone = str(fd, "phone", 20);
  const description = str(fd, "description", 1500);
  const district = str(fd, "district", 60);

  if (!category) return { error: "Please select a business category (Step 1)." };
  if (!str(fd, "subcategory")) return { error: "Please select a subcategory (Step 1)." };
  if (name.length < 3) return { error: "Please enter your business name (Step 2)." };
  if (description.length < 20) return { error: "Please write a short business description – at least 20 characters (Step 2)." };
  if (str(fd, "contactName").length < 2) return { error: "Please enter the contact person name (Step 3)." };
  if (!validPhone(phone)) return { error: "Please enter a valid 10-digit mobile number (Step 3)." };
  if (!district || !str(fd, "address")) return { error: "Please enter your address and district (Step 3)." };
  if (!isAdmin && fd.get("agree") !== "on") return { error: "Please accept the terms to submit your listing (Step 6)." };

  let logo: string | undefined, cover: string | undefined, images: string[] = [];
  const docs: string[] = [];
  try {
    logo = await saveOne(fd.get("logo"), "image");
    cover = await saveOne(fd.get("cover"), "image");
    images = await saveImages(fd.getAll("images"));
    for (const d of fd.getAll("documents")) {
      const f = await saveOne(d, "doc");
      if (f) docs.push(f);
    }
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }

  const serviceNames = [...new Set(strs(fd, "services").concat(csv(str(fd, "customServices", 500))))].slice(0, 30);
  const keep = new Set(strs(fd, "keepImages"));
  const keptImages = (existing?.images ?? []).filter((i) => keep.has(i));
  const sinceN = num(fd, "since");
  const tagsIn = csv(str(fd, "tags", 300));
  const plan = str(fd, "plan") === "premium" ? "premium" : "free";

  const fields = {
    categoryId,
    subcategory: str(fd, "subcategory"),
    name,
    businessType: str(fd, "businessType") || "Proprietorship",
    gst: str(fd, "gst", 20).toUpperCase() || undefined,
    since: sinceN >= 1900 && sinceN <= new Date().getFullYear() ? sinceN : undefined,
    employees: str(fd, "employees") || undefined,
    description,
    summary: str(fd, "summary", 160) || description.split(/(?<=\.)\s/)[0].slice(0, 140),
    contactName: str(fd, "contactName", 80),
    phone,
    whatsapp: fd.get("sameWhatsapp") === "on" ? phone : str(fd, "whatsapp", 20) || undefined,
    email: str(fd, "email", 120) || undefined,
    website: str(fd, "website", 200) || undefined,
    address: str(fd, "address", 300),
    area: str(fd, "area", 80) || str(fd, "taluka", 60),
    taluka: str(fd, "taluka", 60),
    district,
    state: "Maharashtra",
    pincode: str(fd, "pincode", 10) || undefined,
    serviceArea: str(fd, "serviceArea", 200) || undefined,
    delivery: str(fd, "delivery", 120) || undefined,
    workingHours: str(fd, "workingHours", 120) || undefined,
    paymentModes: strs(fd, "paymentModes").join(", ") || undefined,
    highlights: strs(fd, "highlights").slice(0, 6),
    customers: str(fd, "customers", 20) || undefined,
    projects: str(fd, "projects", 20) || undefined,
    priceLabel: str(fd, "priceLabel", 60) || undefined,
    availability: str(fd, "availability", 40) || undefined,
    services: serviceNames.map((n) => ({ name: n, image: existing?.services.find((s) => s.name === n)?.image ?? imageForService(n, category.image) })),
    products: csv(str(fd, "products", 800)).slice(0, 40),
    tags: (tagsIn.length ? tagsIn : serviceNames.length ? serviceNames : [str(fd, "subcategory")]).slice(0, 8),
    plan: plan as Business["plan"],
  };

  let savedId = "";
  await mutate((db) => {
    const taken = new Set(db.businesses.filter((b) => b.id !== editId).map((b) => b.slug));
    if (existing) {
      const b = db.businesses.find((x) => x.id === editId)!;
      Object.assign(b, fields);
      b.slug = uniqueSlug(slugify(str(fd, "slug") || b.slug), taken);
      if (logo) b.logo = logo;
      else if (fd.get("removeLogo") === "on") b.logo = undefined;
      if (cover) b.cover = cover;
      else if (fd.get("removeCover") === "on") b.cover = undefined;
      b.images = [...keptImages, ...images].slice(0, 30);
      b.documents = [...b.documents, ...docs];
      const status = str(fd, "status");
      if (status === "active" || status === "pending" || status === "rejected") b.status = status;
      b.verified = fd.get("verified") === "on";
      b.premium = fd.get("premium") === "on";
      if (fd.get("ratingOverride") === "on") Object.assign(b, ratingFor(Math.min(5, num(fd, "rating")), Math.round(num(fd, "reviewCount"))));
      b.updatedAt = now();
      savedId = b.id;
      return;
    }
    const b: Business = {
      id: newId(),
      slug: uniqueSlug(`${slugify(name)}-${slugify(fields.area)}`, taken),
      status: isAdmin ? ((str(fd, "status") as Business["status"]) || "active") : "pending",
      verified: isAdmin ? fd.get("verified") === "on" : false,
      premium: isAdmin ? fd.get("premium") === "on" : false,
      ...fields,
      logo,
      cover,
      images,
      documents: docs,
      ownerId: isAdmin ? undefined : user?.id,
      rating: 0,
      reviewCount: 0,
      ratingDist: [0, 0, 0, 0, 0],
      stats: { views: 0, calls: 0, whatsapp: 0, leads: 0 },
      createdAt: now(),
      updatedAt: now(),
    };
    db.businesses.push(b);
    savedId = b.id;
    if (!isAdmin) {
      notifyAdmins(db, `New business listing "${name}" (${category.short})${plan === "premium" ? " – Premium plan requested" : ""} is waiting for review.`, `/admin/businesses/${b.id}/edit`);
      if (user) notify(db, { userId: user.id, kind: "system", text: `Your business "${name}" was submitted. Our team will verify it and make it live soon.`, link: `/business-services` });
    }
  });
  refresh();
  if (isAdmin) redirect(`/admin/businesses?saved=${savedId}`);
  return { ok: savedId };
}

// ---------- Register as a Worker ----------

export async function saveWorkerAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const editId = str(fd, "id");
  if (editId && !isAdmin) return { error: "Only admins can edit a worker profile." };
  if (!isAdmin && (isBot(fd) || !(await rateLimit("worker", 5, 60 * 60)))) return { error: TOO_MANY };

  const db0 = await readDB();
  const existing = editId ? db0.workers.find((w) => w.id === editId) : undefined;
  if (editId && !existing) return { error: "Worker profile not found." };

  const name = str(fd, "name", 120);
  const phone = str(fd, "phone", 20);
  const categoryId = str(fd, "categoryId");
  const category = db0.serviceCategories.find((c) => c.id === categoryId && c.kind === "labour");
  const skills = strs(fd, "skills").slice(0, 20);
  const profileType = str(fd, "profileType") === "group" ? "group" : "individual";
  const wageMin = num(fd, "wageMin");
  const expLabel = str(fd, "experience");
  const district = str(fd, "district", 60);
  const village = str(fd, "village", 80);

  if (name.length < 2) return { error: "Please enter your full name (Step 1)." };
  if (!validPhone(phone)) return { error: "Please enter a valid 10-digit mobile number (Step 1)." };
  if (!category) return { error: "Please select a work category (Step 2)." };
  if (!skills.length) return { error: "Please select at least one skill (Step 2)." };
  if (!expLabel) return { error: "Please select your experience (Step 2)." };
  if (wageMin < 50) return { error: "Please enter your daily wage (Step 2)." };
  if (!district || !village) return { error: "Please enter your district and village / area (Step 3)." };
  if (!isAdmin && !existing && !(fd.get("photo") instanceof File && (fd.get("photo") as File).size > 0)) return { error: "Please upload a profile photo (Step 1)." };
  if (!isAdmin && fd.get("agree") !== "on") return { error: "Please confirm your details are correct (Step 5)." };

  let photo: string | undefined, cover: string | undefined, idProof: string | undefined, workPhotos: string[] = [];
  try {
    photo = await saveOne(fd.get("photo"), "image");
    cover = await saveOne(fd.get("cover"), "image");
    idProof = await saveOne(fd.get("idProof"), "doc");
    workPhotos = await saveImages(fd.getAll("workPhotos"));
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }

  const skillCounts: Record<string, number> = {};
  if (profileType === "group") for (const s of skills) if (num(fd, `count_${s}`) > 0) skillCounts[s] = Math.round(num(fd, `count_${s}`));
  const wageMax = num(fd, "wageMax");
  const keep = new Set(strs(fd, "keepImages"));
  const expYearsIn = str(fd, "expYears");
  const fields = {
    name,
    phone,
    whatsapp: fd.get("sameWhatsapp") === "on" ? phone : str(fd, "whatsapp", 20) || undefined,
    profileType: profileType as Worker["profileType"],
    categoryId,
    skills,
    skillCounts: profileType === "group" && Object.keys(skillCounts).length ? skillCounts : undefined,
    teamSize: num(fd, "teamSize") || undefined,
    experience: expLabel,
    expYears: expYearsIn !== "" && isAdmin ? num(fd, "expYears") : (EXPERIENCE_OPTIONS.find((o) => o.label === expLabel)?.years ?? (parseInt(expLabel) || 0)),
    wageMin,
    wageMax: wageMax > wageMin ? wageMax : undefined,
    wageUnit: str(fd, "wageUnit") || "Day",
    description: str(fd, "description", 500),
    village,
    taluka: str(fd, "taluka", 60),
    district,
    state: "Maharashtra",
    workRadius: str(fd, "workRadius") || "Within 10 km",
    availableToday: fd.get("availableToday") === "on",
    availability: strs(fd, "days").join(", ") || undefined,
    idProofType: str(fd, "idProofType") || undefined,
  };

  let savedId = "";
  await mutate((db) => {
    const taken = new Set(db.workers.filter((w) => w.id !== editId).map((w) => w.slug));
    if (existing) {
      const w = db.workers.find((x) => x.id === editId)!;
      Object.assign(w, fields);
      w.slug = uniqueSlug(slugify(str(fd, "slug") || w.slug), taken);
      if (photo) w.photo = photo;
      if (cover) w.cover = cover;
      else if (fd.get("removeCover") === "on") w.cover = undefined;
      if (idProof) w.idProof = idProof;
      w.workPhotos = [...w.workPhotos.filter((p) => keep.has(p)), ...workPhotos].slice(0, 20);
      const status = str(fd, "status");
      if (status === "active" || status === "pending" || status === "rejected") w.status = status;
      w.verified = fd.get("verified") === "on";
      if (fd.get("ratingOverride") === "on") Object.assign(w, ratingFor(Math.min(5, num(fd, "rating")), Math.round(num(fd, "reviewCount"))));
      w.updatedAt = now();
      savedId = w.id;
      return;
    }
    const w: Worker = {
      id: newId(),
      slug: uniqueSlug(`${slugify(name)}-${slugify(village)}`, taken),
      status: isAdmin ? ((str(fd, "status") as Worker["status"]) || "active") : "pending",
      verified: isAdmin ? fd.get("verified") === "on" : false,
      ...fields,
      photo,
      cover,
      idProof,
      workPhotos,
      ownerId: isAdmin ? undefined : user?.id,
      rating: 0,
      reviewCount: 0,
      ratingDist: [0, 0, 0, 0, 0],
      stats: { views: 0, calls: 0, whatsapp: 0 },
      createdAt: now(),
      updatedAt: now(),
    };
    db.workers.push(w);
    savedId = w.id;
    if (!isAdmin) {
      notifyAdmins(db, `New worker registration: ${name} (${skills.slice(0, 2).join(", ")}) from ${village} is waiting for verification.`, `/admin/workers/${w.id}/edit`);
      if (user) notify(db, { userId: user.id, kind: "system", text: `Your worker profile was submitted. Our team will verify it and make it live soon.`, link: "/labour" });
    }
  });
  refresh();
  if (isAdmin) redirect(`/admin/workers?saved=${savedId}`);
  return { ok: savedId };
}

// ---------- enquiries, call backs, requirements ----------

export async function serviceLeadAction(_: FormState, fd: FormData): Promise<FormState> {
  const kind = (["enquiry", "callback", "requirement"].includes(str(fd, "kind")) ? str(fd, "kind") : "enquiry") as LeadKind;
  const name = str(fd, "name", 80);
  const phone = str(fd, "phone", 20);
  const targetType = str(fd, "targetType") === "worker" ? "worker" : str(fd, "targetType") === "business" ? "business" : undefined;
  const targetId = str(fd, "targetId") || undefined;
  const okText = kind === "callback" ? "Call back requested! You will get a call shortly." : kind === "requirement" ? "Your requirement is posted. Verified providers and workers near you will contact you soon." : "Enquiry sent! The business will contact you soon.";
  if (isBot(fd)) return { ok: okText };
  if (!(await rateLimit("lead", 8, 10 * 60))) return { error: TOO_MANY };
  if (name.length < 2) return { error: "Please enter your name." };
  if (!validPhone(phone)) return { error: "Please enter a valid 10-digit mobile number." };
  if (kind === "requirement" && !str(fd, "categoryId")) return { error: "Please choose what you need." };
  if (kind === "requirement" && !str(fd, "district")) return { error: "Please choose the work location." };

  const db0 = await readDB();
  const target = targetType === "business" ? db0.businesses.find((b) => b.id === targetId) : targetType === "worker" ? db0.workers.find((w) => w.id === targetId) : undefined;
  if (targetType && !target) return { error: "This profile is no longer available." };

  await mutate((db) => {
    db.serviceLeads.push({
      id: newId(),
      kind,
      targetType,
      targetId,
      name,
      phone,
      item: str(fd, "item", 120) || undefined,
      categoryId: str(fd, "categoryId") || undefined,
      workersNeeded: num(fd, "workersNeeded") || undefined,
      budget: str(fd, "budget", 60) || undefined,
      startDate: str(fd, "startDate", 20) || undefined,
      village: str(fd, "village", 80) || undefined,
      taluka: str(fd, "taluka", 60) || undefined,
      district: str(fd, "district", 60) || undefined,
      message: str(fd, "message", 1000) || undefined,
      status: "new",
      createdAt: now(),
    });
    const label = kind === "requirement" ? "requirement" : kind === "callback" ? "call back request" : "enquiry";
    if (targetType === "business") {
      const b = db.businesses.find((x) => x.id === targetId);
      if (b) {
        b.stats.leads++;
        if (b.ownerId) notify(db, { userId: b.ownerId, kind: "message", text: `New ${label} from ${name} (${phone}) for ${b.name}.` });
      }
    }
    if (targetType === "worker") {
      const w = db.workers.find((x) => x.id === targetId);
      if (w?.ownerId) notify(db, { userId: w.ownerId, kind: "message", text: `New ${label} from ${name} (${phone}).` });
    }
    notifyAdmins(db, `New ${label} from ${name}${target ? ` for ${target.name}` : ""}.`, "/admin/service-leads");
  });
  revalidatePath("/admin", "layout");
  return { ok: okText };
}

export async function submitServiceReviewAction(_: FormState, fd: FormData): Promise<FormState> {
  const targetType = str(fd, "targetType") === "worker" ? "worker" : "business";
  const targetId = str(fd, "targetId");
  const name = str(fd, "name", 60);
  const rating = Math.round(num(fd, "rating"));
  const text = str(fd, "text", 800);
  if (isBot(fd)) return { ok: "Thank you! Your review will appear after a quick check." };
  if (!(await rateLimit("review", 5, 10 * 60))) return { error: TOO_MANY };
  if (name.length < 2) return { error: "Please enter your name." };
  if (rating < 1 || rating > 5) return { error: "Please choose a star rating." };
  if (text.length < 5) return { error: "Please write a few words about your experience." };
  const db0 = await readDB();
  const target = targetType === "business" ? db0.businesses.find((b) => b.id === targetId) : db0.workers.find((w) => w.id === targetId);
  if (!target) return { error: "This profile is no longer available." };
  await mutate((db) => {
    db.serviceReviews.push({ id: newId(), targetType, targetId, name, rating, text, status: "pending", createdAt: now() });
    notifyAdmins(db, `New ${rating}★ review for ${target.name} is waiting for approval.`, "/admin/service-reviews");
  });
  revalidatePath("/admin", "layout");
  return { ok: "Thank you! Your review will appear after a quick check." };
}

/** Save / unsave a business or worker. Returns the new state, or sends guests to login. */
export async function toggleSaveServiceAction(id: string, next: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return mutate((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    const list = (u.savedServices ??= []);
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else list.push(id);
    return i < 0;
  });
}

/** Count views, calls and WhatsApp taps. */
export async function trackServiceAction(type: "business" | "worker", id: string, what: "view" | "call" | "whatsapp") {
  if (!(await rateLimit("track", 60, 60))) return;
  await mutate((db) => {
    const t = type === "business" ? db.businesses.find((b) => b.id === id) : db.workers.find((w) => w.id === id);
    if (!t) return;
    if (what === "view") t.stats.views++;
    else if (what === "call") t.stats.calls++;
    else t.stats.whatsapp++;
  });
}
