"use server";

import { revalidatePath } from "next/cache";
import { mutate, newId } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { saveOne, UploadError } from "@/lib/uploads";
import { slugify } from "@/lib/format";
import { ratingFromDist } from "@/lib/services-seed";
import type { DB, LeadStatus, ProfileStatus, ServiceKind, ServiceReview } from "@/lib/types";
import type { FormState } from "./auth";

const now = () => new Date().toISOString();
const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);

async function admin() {
  return requireUser(["admin"], "/admin");
}
function refresh() {
  revalidatePath("/", "layout");
}

function tell(db: DB, userId: string | undefined, text: string, link?: string) {
  if (userId) db.notifications.push({ id: newId(), userId, kind: "system", text, link, read: false, createdAt: now() });
}

// ---------- businesses ----------

export async function setBusinessStatusAction(id: string, status: ProfileStatus) {
  await admin();
  await mutate((db) => {
    const b = db.businesses.find((x) => x.id === id);
    if (!b) return;
    b.status = status;
    if (status === "active") b.verified = true;
    b.updatedAt = now();
    tell(db, b.ownerId, status === "active" ? `Your business "${b.name}" is verified and now live!` : `Your business "${b.name}" needs changes before it can go live. Please contact support.`, status === "active" ? `/business-services/${b.slug}` : undefined);
  });
  refresh();
}

export async function toggleBusinessFlagAction(id: string, flag: "verified" | "premium") {
  await admin();
  await mutate((db) => {
    const b = db.businesses.find((x) => x.id === id);
    if (!b) return;
    b[flag] = !b[flag];
    if (flag === "premium") b.plan = b.premium ? "premium" : "free";
  });
  refresh();
}

export async function deleteBusinessAction(id: string) {
  await admin();
  await mutate((db) => {
    db.businesses = db.businesses.filter((b) => b.id !== id);
    db.serviceReviews = db.serviceReviews.filter((r) => r.targetId !== id);
    for (const u of db.users) if (u.savedServices) u.savedServices = u.savedServices.filter((s) => s !== id);
  });
  refresh();
}

// ---------- workers ----------

export async function setWorkerStatusAction(id: string, status: ProfileStatus) {
  await admin();
  await mutate((db) => {
    const w = db.workers.find((x) => x.id === id);
    if (!w) return;
    w.status = status;
    if (status === "active") w.verified = true;
    w.updatedAt = now();
    tell(db, w.ownerId, status === "active" ? `Your worker profile is verified and now live!` : `Your worker profile needs changes before it can go live. Please contact support.`, status === "active" ? `/labour/${w.slug}` : undefined);
  });
  refresh();
}

export async function toggleWorkerFlagAction(id: string, flag: "verified" | "availableToday") {
  await admin();
  await mutate((db) => {
    const w = db.workers.find((x) => x.id === id);
    if (w) w[flag] = !w[flag];
  });
  refresh();
}

export async function deleteWorkerAction(id: string) {
  await admin();
  await mutate((db) => {
    db.workers = db.workers.filter((w) => w.id !== id);
    db.serviceReviews = db.serviceReviews.filter((r) => r.targetId !== id);
    for (const u of db.users) if (u.savedServices) u.savedServices = u.savedServices.filter((s) => s !== id);
  });
  refresh();
}

// ---------- leads ----------

export async function setLeadStatusAction(id: string, status: LeadStatus) {
  await admin();
  await mutate((db) => {
    const l = db.serviceLeads.find((x) => x.id === id);
    if (l) l.status = status;
  });
  revalidatePath("/admin", "layout");
}

export async function toggleLeadPublishedAction(id: string) {
  await admin();
  await mutate((db) => {
    const l = db.serviceLeads.find((x) => x.id === id);
    if (l) l.published = !l.published;
  });
  refresh();
}

export async function deleteLeadAction(id: string) {
  await admin();
  await mutate((db) => {
    db.serviceLeads = db.serviceLeads.filter((x) => x.id !== id);
  });
  refresh();
}

// ---------- reviews ----------

/** Add or remove one review from the profile's star breakdown. */
function applyReview(db: DB, r: ServiceReview, sign: 1 | -1) {
  const t = r.targetType === "business" ? db.businesses.find((b) => b.id === r.targetId) : db.workers.find((w) => w.id === r.targetId);
  if (!t) return;
  const dist = [...(t.ratingDist ?? [0, 0, 0, 0, 0])];
  dist[5 - r.rating] = Math.max(0, (dist[5 - r.rating] ?? 0) + sign);
  Object.assign(t, ratingFromDist(dist));
}

export async function setReviewStatusAction(id: string, status: ServiceReview["status"]) {
  await admin();
  await mutate((db) => {
    const r = db.serviceReviews.find((x) => x.id === id);
    if (!r || r.status === status) return;
    if (r.status === "approved") applyReview(db, r, -1);
    if (status === "approved") applyReview(db, r, 1);
    r.status = status;
  });
  refresh();
}

export async function deleteReviewAction(id: string) {
  await admin();
  await mutate((db) => {
    const r = db.serviceReviews.find((x) => x.id === id);
    if (!r) return;
    if (r.status === "approved") applyReview(db, r, -1);
    db.serviceReviews = db.serviceReviews.filter((x) => x.id !== id);
  });
  refresh();
}

// ---------- categories ----------

export async function saveCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  await admin();
  const id = str(fd, "id");
  const kind = (str(fd, "kind") === "labour" ? "labour" : "business") as ServiceKind;
  const name = str(fd, "name", 80);
  if (name.length < 2) return { error: "Please enter a category name." };
  const subs = [...new Set(str(fd, "subcategories", 4000).split(/\n|,/).map((s) => s.trim()).filter(Boolean))];
  if (!subs.length) return { error: kind === "labour" ? "Please add at least one skill." : "Please add at least one subcategory." };
  let image: string | undefined;
  try {
    image = await saveOne(fd.get("imageFile"), "image");
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  const error = await mutate((db) => {
    const fields = {
      name,
      short: str(fd, "short", 40) || name,
      description: str(fd, "description", 200),
      icon: str(fd, "icon") || "building",
      subcategories: subs,
      active: fd.get("active") === "on",
      order: Number(str(fd, "order")) || 99,
    };
    if (id) {
      const c = db.serviceCategories.find((x) => x.id === id);
      if (!c) return "Category not found.";
      Object.assign(c, fields);
      if (image) c.image = image;
      else if (str(fd, "image")) c.image = str(fd, "image");
      return;
    }
    let slug = slugify(name) || "category";
    let n = 2;
    while (db.serviceCategories.some((c) => c.id === slug)) slug = `${slugify(name)}-${n++}`;
    db.serviceCategories.push({ id: slug, kind, ...fields, image: image || str(fd, "image") || (kind === "labour" ? "/images/svc/lab-construction.jpg" : "/images/svc/cat-building.jpg") });
  });
  if (error) return { error };
  refresh();
  return { ok: id ? "Category updated." : "Category added." };
}

export async function deleteCategoryAction(id: string) {
  await admin();
  await mutate((db) => {
    const used = db.businesses.some((b) => b.categoryId === id) || db.workers.some((w) => w.categoryId === id);
    const c = db.serviceCategories.find((x) => x.id === id);
    if (!c) return;
    // a category that still has profiles is only hidden, so nothing is lost
    if (used) c.active = false;
    else db.serviceCategories = db.serviceCategories.filter((x) => x.id !== id);
  });
  refresh();
}

// ---------- settings ----------

export async function saveServiceSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  await admin();
  const lines = (k: string) => str(fd, k, 3000).split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  await mutate((db) => {
    db.serviceSettings = [
      {
        id: "main",
        statBusinesses: str(fd, "statBusinesses", 20),
        statCategories: str(fd, "statCategories", 20),
        statEnquiries: str(fd, "statEnquiries", 20),
        statRating: str(fd, "statRating", 20),
        statWorkers: str(fd, "statWorkers", 20),
        premiumPrice: Number(str(fd, "premiumPrice").replace(/\D/g, "")) || 1000,
        helpPhone: str(fd, "helpPhone", 30),
        helpHours: str(fd, "helpHours", 80),
        popularSearches: lines("popularSearches"),
        popularLabourSearches: lines("popularLabourSearches"),
      },
    ];
  });
  refresh();
  return { ok: "Settings saved." };
}
