import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./types";

export const SESSION_COOKIE = "agri_session";
export const SESSION_DAYS = 7;

function secret() {
  const s = process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me-in-env-file-please";
  return new TextEncoder().encode(s);
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
  } catch {
    return null;
  }
}
