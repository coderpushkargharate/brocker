import fs from "fs/promises";
import path from "path";
import { put, head } from "@vercel/blob";
import { UPLOAD_DIR } from "./db";

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
const VIDEO_TYPES: Record<string, string> = { "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov" };
const DOC_TYPES: Record<string, string> = { ...IMAGE_TYPES, "application/pdf": ".pdf" };

export const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

/** Vercel Blob is used when its token is present (added automatically when you connect Blob storage on Vercel). */
export const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export class UploadError extends Error {}

function isFile(v: unknown): v is File {
  return typeof v === "object" && v !== null && "arrayBuffer" in v && "size" in v && (v as File).size > 0;
}

async function store(file: File, kind: "image" | "video" | "doc") {
  const types = kind === "image" ? IMAGE_TYPES : kind === "video" ? VIDEO_TYPES : DOC_TYPES;
  const ext = types[file.type];
  if (!ext) throw new UploadError(`Unsupported file type for ${file.name}`);
  const max = kind === "video" ? 50 : 8;
  if (file.size > max * 1024 * 1024) throw new UploadError(`${file.name} is larger than ${max} MB`);
  const name = crypto.randomUUID() + ext;
  const sub = kind === "doc" ? "docs" : "public";

  if (usingBlob) {
    const blob = await put(`${sub}/${name}`, file, { access: "public", addRandomSuffix: false, contentType: file.type });
    // documents are only handed out through /api/docs, which checks who is asking
    return kind === "doc" ? `/api/docs/${name}` : blob.url;
  }

  const dir = path.join(UPLOAD_DIR, sub);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return kind === "doc" ? `/api/docs/${name}` : `/api/uploads/${name}`;
}

export async function saveImages(entries: FormDataEntryValue[]) {
  const out: string[] = [];
  for (const e of entries) if (isFile(e)) out.push(await store(e, "image"));
  return out;
}

export async function saveOne(entry: FormDataEntryValue | null, kind: "image" | "video" | "doc") {
  return isFile(entry) ? store(entry, kind) : undefined;
}

function safeName(name: string) {
  const base = path.basename(name);
  return base === name && /^[\w-]+\.\w+$/.test(base) ? base : null;
}

/** Resolve a stored file name safely inside the upload folder. */
export function resolveUpload(sub: "public" | "docs", name: string) {
  const base = safeName(name);
  return base ? path.join(UPLOAD_DIR, sub, base) : null;
}

/** Read an uploaded file (from Blob or disk). Returns null when missing. */
export async function readUpload(sub: "public" | "docs", name: string): Promise<{ data: ArrayBuffer; type: string } | null> {
  const base = safeName(name);
  if (!base) return null;
  const type = MIME_BY_EXT[path.extname(base)] || "application/octet-stream";
  try {
    if (usingBlob) {
      const meta = await head(`${sub}/${base}`);
      const res = await fetch(meta.url);
      if (!res.ok) return null;
      return { data: await res.arrayBuffer(), type };
    }
    const buf = await fs.readFile(path.join(UPLOAD_DIR, sub, base));
    return { data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer, type };
  } catch {
    return null;
  }
}
