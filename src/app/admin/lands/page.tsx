import Link from "next/link";
import { CheckCircle2, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { readDB } from "@/lib/db";
import { inr } from "@/lib/format";
import { setLandStatusAction, toggleLandFlagAction } from "@/app/actions/admin";
import { deleteLandAction } from "@/app/actions/lands";
import { Box, PageTitle, STATUS_CHIP } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { Img, FALLBACK_LAND_IMAGE } from "@/components/Img";
import type { LandStatus } from "@/lib/types";

export const metadata = { title: "Land Projects" };

const STATUSES: LandStatus[] = ["active", "pending", "draft", "rejected", "sold"];

export default async function AdminLands({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; sort?: string; saved?: string }> }) {
  const { q = "", status = "", sort = "", saved } = await searchParams;
  const db = (await readDB());
  let lands = [...db.lands];
  if (status) lands = lands.filter((l) => l.status === status);
  if (q) {
    const s = q.toLowerCase();
    lands = lands.filter((l) => [l.title, l.code, l.village, l.taluka, l.district, db.users.find((u) => u.id === l.ownerId)?.name].join(" ").toLowerCase().includes(s));
  }
  lands.sort(sort === "views" ? (a, b) => b.stats.views - a.stats.views : sort === "price" ? (a, b) => b.price - a.price : (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  const savedLand = saved ? db.lands.find((l) => l.id === saved) : undefined;

  return (
    <>
      <PageTitle title="Land Projects" sub={`${db.lands.length} total • each live project has its own SEO page`}>
        <Link href="/admin/lands/new" className="btn btn-primary h-11 px-5 text-[14.5px]">
          <Plus className="h-4 w-4" /> Add New Land
        </Link>
      </PageTitle>
      {savedLand && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[14px] text-[#166534]">
          <CheckCircle2 className="h-5 w-5" /> &ldquo;{savedLand.title}&rdquo; saved.
          {savedLand.status === "active" && (
            <Link href={`/lands/${savedLand.slug}`} className="font-semibold underline">
              View live page
            </Link>
          )}
        </p>
      )}

      <Box>
        <form className="flex flex-wrap gap-3" role="search">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={q} placeholder="Search title, code, village, owner…" className="input pl-9" />
          </div>
          <select name="status" defaultValue={status} className="input w-auto">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={sort} className="input w-auto">
            <option value="">Recently updated</option>
            <option value="views">Most viewed</option>
            <option value="price">Highest price</option>
          </select>
          <button className="btn btn-dark h-[42px] px-5">Filter</button>
        </form>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
              <tr>
                <th className="py-3 pr-3">Land</th>
                <th className="py-3 pr-3">Owner</th>
                <th className="py-3 pr-3">Price</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 pr-3">Verified</th>
                <th className="py-3 pr-3">Featured</th>
                <th className="py-3 pr-3">Stats</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lands.map((l) => {
                const owner = db.users.find((u) => u.id === l.ownerId);
                return (
                  <tr key={l.id} className="align-middle">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md">
                          <Img src={l.images[0] || FALLBACK_LAND_IMAGE} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/lands/${l.id}`} className="block max-w-[260px] truncate font-semibold text-ink hover:text-brand">
                            {l.title}
                          </Link>
                          <p className="text-[12px] text-muted">
                            {l.code} • {l.taluka}, {l.district} • {l.area} {l.areaUnit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3">{owner?.name ?? "—"}</td>
                    <td className="py-3 pr-3 font-semibold">{l.price ? inr(l.price) : "—"}</td>
                    <td className="py-3 pr-3">
                      <form action={async (fd: FormData) => {
                        "use server";
                        await setLandStatusAction(l.id, String(fd.get("s")) as LandStatus);
                      }} className="flex items-center gap-1">
                        <select name="s" defaultValue={l.status} className={`rounded-md border-0 px-2 py-1 text-[12px] font-semibold capitalize ${STATUS_CHIP[l.status]}`}>
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button className="rounded border border-line px-1.5 py-0.5 text-[11px] hover:bg-mint-50">Set</button>
                      </form>
                    </td>
                    <td className="py-3 pr-3">
                      <form action={toggleLandFlagAction.bind(null, l.id, "verified")}>
                        <button className={`chip ${l.verified ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-muted"}`} title="Toggle verified">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {l.verified ? "Yes" : "No"}
                        </button>
                      </form>
                    </td>
                    <td className="py-3 pr-3">
                      <form action={toggleLandFlagAction.bind(null, l.id, "featured")}>
                        <button className={`chip ${l.featured ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#f3f4f6] text-muted"}`} title="Toggle featured">
                          <Star className={`h-3.5 w-3.5 ${l.featured ? "fill-current" : ""}`} /> {l.featured ? "Yes" : "No"}
                        </button>
                      </form>
                    </td>
                    <td className="py-3 pr-3 text-[12px] text-muted">
                      {l.stats.views} views
                      <br />
                      {db.interests.filter((i) => i.landId === l.id).length} interests
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1.5">
                        {l.status === "active" && (
                          <Link href={`/lands/${l.slug}`} target="_blank" className="btn btn-ghost h-8 w-8 p-0" title="View live page">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <Link href={`/admin/lands/${l.id}/edit`} className="btn btn-ghost h-8 w-8 p-0" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <form action={deleteLandAction.bind(null, l.id)}>
                          <ConfirmButton message={`Delete "${l.title}" permanently?`} className="btn btn-ghost h-8 w-8 p-0 text-[#dc2626]">
                            <Trash2 className="h-4 w-4" />
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lands.length === 0 && <p className="py-8 text-center text-[14px] text-muted">No land projects match.</p>}
        </div>
      </Box>
    </>
  );
}
