import { readUpload } from "@/lib/uploads";
import { getCurrentUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

/** Uploaded documents are private: only the owner and admins can open them. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const url = `/api/docs/${name}`;
  const db = await readDB();
  const land = db.lands.find((l) => l.documents.some((d) => d.file === url));
  // business documents and worker ID proofs: owner (if any) and admins only
  const biz = db.businesses.find((b) => b.documents.includes(url));
  const worker = db.workers.find((w) => w.idProof === url);
  const ownerId = land?.ownerId ?? biz?.ownerId ?? worker?.ownerId;
  if (!land && !biz && !worker) return new Response("Forbidden", { status: 403 });
  if (user.role !== "admin" && ownerId !== user.id) return new Response("Forbidden", { status: 403 });
  const file = await readUpload("docs", name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.data, { headers: { "Content-Type": file.type, "Cache-Control": "private, no-store" } });
}
