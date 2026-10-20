import { readUpload } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await readUpload("public", name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.data, { headers: { "Content-Type": file.type, "Cache-Control": "public, max-age=31536000, immutable" } });
}
