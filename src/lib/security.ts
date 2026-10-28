import { headers } from "next/headers";
import { HONEYPOT_FIELD } from "./honeypot";

/**
 * Small abuse guards for public forms and tracking actions.
 *
 * The rate limiter keeps its counters in memory, so on serverless hosts (Vercel) each warm instance
 * counts separately. That still stops scripted floods hitting one instance; for strict global limits
 * put a shared store (e.g. Upstash Redis) or the host's firewall rules in front.
 */

type Bucket = { hits: number[] };
const g = globalThis as unknown as { __agriRate?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (g.__agriRate ||= new Map());

/**
 * Visitor IP for rate limiting. Prefers headers set by the hosting proxy; for X-Forwarded-For the
 * right-most entry is used because it is added by the last (trusted) proxy, while the left-most can be
 * supplied by the client to dodge limits.
 */
export async function clientIp() {
  const h = await headers();
  const xff = h.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  return (h.get("x-vercel-forwarded-for") || h.get("x-real-ip") || xff?.[xff.length - 1] || "unknown").trim();
}

/** true when the caller is still under `limit` hits in the last `windowSec` seconds (and records this hit). */
export async function rateLimit(action: string, limit: number, windowSec: number, extraKey = "") {
  const key = `${action}|${await clientIp()}|${extraKey}`;
  const now = Date.now();
  const b = buckets.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowSec * 1000);
  if (b.hits.length >= limit) {
    buckets.set(key, b);
    return false;
  }
  b.hits.push(now);
  buckets.set(key, b);
  // keep memory bounded
  if (buckets.size > 20_000) for (const [k, v] of buckets) if (!v.hits.some((t) => now - t < 3600_000)) buckets.delete(k);
  return true;
}

export const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";


export function isBot(fd: FormData) {
  return String(fd.get(HONEYPOT_FIELD) ?? "").trim() !== "";
}

/** Check a file's first bytes match the type the browser claimed, so renamed files are rejected. */
export function matchesSignature(bytes: Uint8Array, mime: string) {
  const at = (off: number, sig: number[]) => sig.every((v, i) => bytes[off + i] === v);
  const ascii = (off: number, s: string) => at(off, [...s].map((c) => c.charCodeAt(0)));
  switch (mime) {
    case "image/jpeg":
      return at(0, [0xff, 0xd8, 0xff]);
    case "image/png":
      return at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/gif":
      return ascii(0, "GIF8");
    case "image/webp":
      return ascii(0, "RIFF") && ascii(8, "WEBP");
    case "application/pdf":
      return ascii(0, "%PDF");
    case "video/webm":
      return at(0, [0x1a, 0x45, 0xdf, 0xa3]);
    case "video/mp4":
    case "video/quicktime":
      return ["ftyp", "moov", "mdat", "wide", "free", "skip"].some((box) => ascii(4, box));
    default:
      return false;
  }
}
