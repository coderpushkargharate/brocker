import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./types";

export const SESSION_COOKIE = "agri_session";
export const SESSION_DAYS = 7;

export class MissingSecretError extends Error {}

function secret() {
  const s = process.env.AUTH_SECRET;
  // In production a missing secret would let anyone who knows the fallback forge an admin session, so refuse to run.
  if (!s && process.env.NODE_ENV === "production") throw new MissingSecretError("AUTH_SECRET is not set");
  if (s && s.length < 32 && process.env.NODE_ENV === "production") throw new MissingSecretError("AUTH_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s || "dev-only-insecure-secret-change-me-in-env-file-please");
}

export interface SessionPayload {
  sub: string;
  role: Role;
  name: string;
}

export async function signSession(p: SessionPayload) {
  return new SignJWT({ role: p.role, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return { sub: payload.sub, role: payload.role as Role, name: String(payload.name || "") };
  } catch (e) {
    if (e instanceof MissingSecretError) console.error("[auth]", e.message);
    return null;
  }
}
