import Link from "next/link";
import { BadgeCheck, Check, Eye, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { readDB } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { categoryById } from "@/lib/services";
import { wageLabel } from "@/lib/services-config";
import { deleteWorkerAction, setWorkerStatusAction, toggleWorkerFlagAction } from "@/app/actions/services-admin";
import { Box, PageTitle, PROFILE_CHIP } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { Img } from "@/components/Img";
import { workerImage } from "@/components/services/Cards";

export const metadata = { title: "Workers & Labour" };

type Props = { searchParams: Promise<{ status?: string; category?: string; q?: string; saved?: string }> };

export default async function AdminWorkers({ searchParams }: Props) {
  const sp = await searchParams;
  const db = await readDB();
  const cats = db.serviceCategories.filter((c) => c.kind === "labour").sort((a, b) => a.order - b.order);
  let list = [...db.workers].sort((a, b) => +(b.status === "pending") - +(a.status === "pending") || +new Date(b.updatedAt) - +new Date(a.updatedAt));
  if (sp.status) list = list.filter((w) => w.status === sp.status);
  if (sp.category) list = list.filter((w) => w.categoryId === sp.category);
  if (sp.q) {
    const t = sp.q.toLowerCase();
    list = list.filter((w) => [w.name, w.phone, w.village, w.taluka, ...w.skills].some((x) => x?.toLowerCase().includes(t)));
  }
  const count = (s?: string) => db.workers.filter((w) => !s || w.status === s).length;
  const tab = (s: string | undefined, label: string) => (
    <Link href={`/admin/workers${s ? `?status=${s}` : ""}`} className={`rounded-lg px-3 py-1.5 text-[13.5px] font-medium ${sp.status === s ? "bg-brand text-white" : "border border-line bg-white text-ink hover:bg-mint-50"}`}>
      {label} ({count(s)})
    </Link>
  );
  const saved = sp.saved ? db.workers.find((w) => w.id === sp.saved) : undefined;

  return (
    <>
      <PageTitle title="Workers & Labour" sub="Verify new worker registrations and labour groups, and keep profiles up to date.">
        <Link href="/admin/workers/new" className="btn btn-primary h-11 px-5 text-[14.5px]">
          <Plus className="h-4 w-4" /> Add Worker
        </Link>
      </PageTitle>
      {saved && (
        <p className="mb-4 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2.5 text-[14px] text-[#166534]">
          Saved “{saved.name}”.{" "}
          <Link href={`/labour/${saved.slug}`} className="font-semibold underline">
            View profile
          </Link>
        </p>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tab(undefined, "All")}
        {tab("pending", "Pending")}
        {tab("active", "Live")}
        {tab("rejected", "Rejected")}
        <form className="ml-auto flex gap-2">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <select name="category" defaultValue={sp.category ?? ""} className="input h-9 w-auto py-0 text-[13.5px]">
            <option value="">All categories</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.short}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={sp.q} placeholder="Search name, phone, skill…" className="input h-9 w-52 text-[13.5px]" />
          <button className="btn btn-ghost h-9 px-3 text-[13px]">Filter</button>
        </form>
      </div>
      <div className="space-y-3">
        {list.map((w) => (
          <Box key={w.id} className="!p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                <Img src={workerImage(w)} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/workers/${w.id}/edit`} className="text-[16px] font-semibold text-ink hover:text-brand">
                    {w.name}
                  </Link>
                  <span className={`chip capitalize ${PROFILE_CHIP[w.status]}`}>{w.status === "active" ? "live" : w.status}</span>
                  {w.verified && (
                    <span className="chip bg-[#dbeafe] text-[#1e40af]">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                  {w.profileType === "group" && <span className="chip bg-[#fff7ed] text-[#c2410c]">Labour Group</span>}
                  {w.availableToday && <span className="chip bg-[#dcf3e8] text-brand">Available Today</span>}
                </p>
                <p className="text-[12.5px] text-muted">
                  {categoryById(db, w.categoryId)?.short ?? w.categoryId} • {w.skills.slice(0, 3).join(", ")} • {w.village}, {w.taluka}, {w.district} • {wageLabel(w)} • updated {timeAgo(w.updatedAt)}
                </p>
                <p className="mt-0.5 flex flex-wrap gap-x-4 text-[12.5px] text-body">
                  <a href={`tel:${w.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 hover:text-brand">
                    <Phone className="h-3 w-3" /> {w.phone}
                  </a>
                  <span>
                    ★ {w.rating.toFixed(1)} ({w.reviewCount}) • {w.stats.views} views • {w.stats.calls} calls • {w.stats.whatsapp} WhatsApp
                  </span>
                  {w.idProof && (
                    <a href={w.idProof} target="_blank" className="font-semibold text-brand hover:underline">
                      {w.idProofType || "ID proof"}
                    </a>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {w.status !== "active" && (
                  <form action={setWorkerStatusAction.bind(null, w.id, "active")}>
                    <button className="btn btn-primary h-8 px-3 text-[12.5px]">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  </form>
                )}
                {w.status !== "rejected" && (
                  <form action={setWorkerStatusAction.bind(null, w.id, "rejected")}>
                    <button className="btn btn-ghost h-8 px-3 text-[12.5px] text-[#dc2626]">
                      <X className="h-3.5 w-3.5" /> {w.status === "active" ? "Unpublish" : "Reject"}
                    </button>
                  </form>
                )}
                <form action={toggleWorkerFlagAction.bind(null, w.id, "verified")}>
                  <button className="btn btn-ghost h-8 px-3 text-[12.5px]">{w.verified ? "Unverify" : "Verify"}</button>
                </form>
                <form action={toggleWorkerFlagAction.bind(null, w.id, "availableToday")}>
                  <button className="btn btn-ghost h-8 px-3 text-[12.5px]">{w.availableToday ? "Not available" : "Available today"}</button>
                </form>
                <Link href={`/labour/${w.slug}`} target="_blank" className="btn btn-ghost h-8 px-2.5" aria-label="View">
                  <Eye className="h-4 w-4" />
                </Link>
                <Link href={`/admin/workers/${w.id}/edit`} className="btn btn-ghost h-8 px-2.5" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={deleteWorkerAction.bind(null, w.id)}>
                  <ConfirmButton message={`Delete "${w.name}" permanently?`} className="btn btn-ghost h-8 px-2.5 text-[#dc2626]">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              </div>
            </div>
          </Box>
        ))}
        {list.length === 0 && <Box className="text-center text-muted">No workers found.</Box>}
      </div>
    </>
  );
}
