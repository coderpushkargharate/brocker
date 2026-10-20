"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { mutate, newId, readDB } from "@/lib/db";
import { dashboardPath, endSession, startSession } from "@/lib/auth";
import type { Role, User } from "@/lib/types";

export type FormState = { error?: string; ok?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (!email || !password) return { error: "Please enter your email and password." };

  const user = (await readDB()).users.find((u) => u.email.toLowerCase() === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "Invalid email or password." };
  if (user.blocked) return { error: "Your account has been blocked. Please contact support." };

  await startSession(user);
  const fallback = dashboardPath(user.role);
  let next = safeNext(fd.get("next"), fallback);
  if (next.startsWith("/admin") && user.role !== "admin") next = fallback;
  redirect(next);
}

export async function signupAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const phone = String(fd.get("phone") || "").trim();
  const password = String(fd.get("password") || "");
  const role = (String(fd.get("role") || "investor") === "farmer" ? "farmer" : "investor") as Role;
  const district = String(fd.get("district") || "").trim();

  if (name.length < 2) return { error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (!/^[+\d][\d\s-]{8,}$/.test(phone)) return { error: "Please enter a valid mobile number." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if ((await readDB()).users.some((u) => u.email.toLowerCase() === email)) return { error: "An account with this email already exists. Please log in." };

  const user: User = {
    id: newId(),
    name,
    email,
    phone,
    role,
    district: district || undefined,
    state: "Maharashtra",
    passwordHash: await bcrypt.hash(password, 10),
    verified: false,
    saved: [],
    profileViews: 0,
    createdAt: new Date().toISOString(),
  };
  await mutate((db) => {
    db.users.push(user);
    db.notifications.push({
      id: newId(),
      userId: user.id,
      kind: "system",
      text: role === "farmer" ? "Welcome to AgriLand! Add your first land listing to reach genuine investors." : "Welcome to AgriLand! Set your land preferences to get better matches.",
      link: role === "farmer" ? "/dashboard/listings/new" : "/dashboard#preferences",
      read: false,
      createdAt: new Date().toISOString(),
    });
    // let farmers in the same district know a new investor joined
    if (role === "investor" && district) {
      for (const f of db.users.filter((u) => u.role === "farmer" && u.district === district)) {
        db.notifications.push({ id: newId(), userId: f.id, kind: "investor", text: `New investor registered in your area: ${district}, Maharashtra.`, read: false, createdAt: new Date().toISOString() });
      }
    }
  });
  await startSession(user);
  redirect(safeNext(fd.get("next"), "/dashboard"));
}

export async function logoutAction() {
  await endSession();
  redirect("/");
}
