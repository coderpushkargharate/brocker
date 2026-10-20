"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { mutate, newId, readDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { DocKey, Enquiry, LandStatus, Role } from "@/lib/types";
import type { FormState } from "./auth";

const now = () => new Date().toISOString();

async function admin() {
  return requireUser(["admin"], "/admin");
}

export async function setLandStatusAction(id: string, status: LandStatus) {
  await admin();
  await mutate((db) => {
    const l = db.lands.find((x) => x.id === id);
    if (!l) return;
    const wasLive = l.status === "active";
    l.status = status;
    l.updatedAt = now();
    if (status === "active") {
      l.verified = true;
      for (const d of l.documents) if (d.file) d.status = "verified";
    }
    const text =
      status === "active"
        ? `Your listing "${l.title}" is verified and now live!`
        : status === "rejected"
          ? `Your listing "${l.title}" needs changes before it can go live. Please contact support.`
          : `Your listing "${l.title}" status changed to ${status}.`;
    db.notifications.push({ id: newId(), userId: l.ownerId, kind: "document", text, link: `/dashboard/listings/${l.id}`, read: false, createdAt: now() });
    if (status === "active" && !wasLive) {
      for (const u of db.users) {
        const p = u.preferences;
        if (u.role !== "investor" || !p?.alerts || (p.district && p.district !== l.district)) continue;
        if (l.price < p.budgetMin || l.price > p.budgetMax * 1.3) continue;
        db.notifications.push({ id: newId(), userId: u.id, kind: "land", text: `New verified land matching your search is now available in ${l.district}: ${l.title}.`, link: `/lands/${l.slug}`, read: false, createdAt: now() });
      }
    }
  });
  revalidatePath("/", "layout");
}

export async function toggleLandFlagAction(id: string, flag: "verified" | "featured") {
  await admin();
  await mutate((db) => {
    const l = db.lands.find((x) => x.id === id);
    if (l) l[flag] = !l[flag];
  });
  revalidatePath("/", "layout");
}

export async function setDocumentStatusAction(landId: string, key: DocKey, status: "verified" | "pending") {
  await admin();
  await mutate((db) => {
    const l = db.lands.find((x) => x.id === landId);
    const d = l?.documents.find((x) => x.key === key);
    if (!l || !d || !d.file) return;
    d.status = status;
    if (status === "verified") {
      const label = { extract: "7/12 Extract", landMap: "Land Map", ownership: "Ownership Proof", soil: "Soil Report", water: "Water Source Proof", other: "Other Document" }[key];
      db.notifications.push({ id: newId(), userId: l.ownerId, kind: "document", text: `Your document "${label}" has been verified.`, link: `/dashboard/listings/${l.id}`, read: false, createdAt: now() });
    }
  });
  revalidatePath("/", "layout");
}

export async function toggleBlockUserAction(id: string) {
  const me = await admin();
  if (id === me.id) return;
  await mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (u && u.role !== "admin") u.blocked = !u.blocked;
  });
  revalidatePath("/admin", "layout");
}

export async function toggleVerifyUserAction(id: string) {
  await admin();
  await mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (u) u.verified = !u.verified;
  });
  revalidatePath("/", "layout");
}

export async function deleteUserAction(id: string) {
  const me = await admin();
  if (id === me.id) return;
  await mutate((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u || u.role === "admin") return;
    const landIds = db.lands.filter((l) => l.ownerId === id).map((l) => l.id);
    db.lands = db.lands.filter((l) => l.ownerId !== id);
    db.interests = db.interests.filter((i) => i.investorId !== id && !landIds.includes(i.landId));
    db.notifications = db.notifications.filter((n) => n.userId !== id);
    db.users = db.users.filter((x) => x.id !== id);
    for (const x of db.users) x.saved = x.saved.filter((s) => !landIds.includes(s));
  });
  revalidatePath("/", "layout");
}

export async function createUserAction(_: FormState, fd: FormData): Promise<FormState> {
  await admin();
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const phone = String(fd.get("phone") || "").trim();
  const password = String(fd.get("password") || "");
  const roleIn = String(fd.get("role") || "farmer");
  const role: Role = roleIn === "admin" ? "admin" : roleIn === "investor" ? "investor" : "farmer";
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid name and email." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if ((await readDB()).users.some((u) => u.email === email)) return { error: "A user with this email already exists." };
  const hash = await bcrypt.hash(password, 10);
  await mutate((db) => {
    db.users.push({
      id: newId(),
      name,
      email,
      phone,
      role,
      district: String(fd.get("district") || "") || undefined,
      state: "Maharashtra",
      passwordHash: hash,
      verified: true,
      saved: [],
      profileViews: 0,
      createdAt: now(),
    });
  });
  revalidatePath("/admin", "layout");
  return { ok: `User ${name} created.` };
}

export async function setEnquiryStatusAction(id: string, status: Enquiry["status"]) {
  await admin();
  await mutate((db) => {
    const e = db.enquiries.find((x) => x.id === id);
    if (e) e.status = status;
  });
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiryAction(id: string) {
  await admin();
  await mutate((db) => {
    db.enquiries = db.enquiries.filter((x) => x.id !== id);
  });
  revalidatePath("/admin", "layout");
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("password") || "");
  const u = (await readDB()).users.find((x) => x.id === me.id)!;
  if (!(await bcrypt.compare(current, u.passwordHash))) return { error: "Current password is incorrect." };
  if (next.length < 6) return { error: "New password must be at least 6 characters." };
  const hash = await bcrypt.hash(next, 10);
  await mutate((db) => {
    db.users.find((x) => x.id === me.id)!.passwordHash = hash;
  });
  return { ok: "Password changed." };
}
