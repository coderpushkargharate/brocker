import { readUpload } from "@/lib/uploads";
import { getCurrentUser } from "@/lib/auth";
import { readDB } from "@/lib/db";

/** Land documents are private: only the land owner and admins can open them. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const url = `/api/docs/${name}`;
  const land = (await readDB()).lands.find((l) => l.documents.some((d) => d.file === url));
  if (!land || (user.role !== "admin" && land.ownerId !== user.id)) return new Response("Forbidden", { status: 403 });
  const file = await readUpload("docs", name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.data, { headers: { "Content-Type": file.type, "Cache-Control": "private, no-store" } });
}
