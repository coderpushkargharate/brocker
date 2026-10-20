import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readDB } from "./db";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./session";
import type { PublicUser, Role, User } from "./types";

export function toPublic(u: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function startSession(u: User) {
  const token = await signSession({ sub: u.id, role: u.role, name: u.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && !process.env.ALLOW_INSECURE_COOKIE,
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The logged-in user, or null. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await verifySession(token);
  if (!s) return null;
  const u = readDB().users.find((x) => x.id === s.sub);
  if (!u || u.blocked) return null;
  return toPublic(u);
}

/** Use in pages/actions that need a login. Redirects to /login when missing. */
export async function requireUser(roles?: Role[], next = "/dashboard"): Promise<PublicUser> {
  const u = await getCurrentUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (roles && !roles.includes(u.role)) redirect(u.role === "admin" ? "/admin" : "/dashboard");
  return u;
}

export function dashboardPath(role: Role) {
  return role === "admin" ? "/admin" : "/dashboard";
}
