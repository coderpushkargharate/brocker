import Link from "next/link";
import { BadgeCheck, Check, Crown, Eye, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { readDB } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { categoryById } from "@/lib/services";
import { deleteBusinessAction, setBusinessStatusAction, toggleBusinessFlagAction } from "@/app/actions/services-admin";
import { Box, PageTitle, PROFILE_CHIP } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { Img } from "@/components/Img";
import { businessImage } from "@/components/services/Cards";

export const metadata = { title: "Businesses" };

type Props = { searchParams: Promise<{ status?: string; category?: string; q?: string; saved?: string }> };

export default async function AdminBusinesses({ searchParams }: Props) {
  const sp = await searchParams;
  const db = await readDB();
  const cats = db.serviceCategories.filter((c) => c.kind === "business").sort((a, b) => a.order - b.order);
  let list = [...db.businesses].sort((a, b) => +(b.status === "pending") - +(a.status === "pending") || +new Date(b.updatedAt) - +new Date(a.updatedAt));
  if (sp.status) list = list.filter((b) => b.status === sp.status);
  if (sp.category) list = list.filter((b) => b.categoryId === sp.category);
  if (sp.q) {
    const t = sp.q.toLowerCase();
    list = list.filter((b) => [b.name, b.phone, b.area, b.district, b.contactName].some((x) => x?.toLowerCase().includes(t)));
  }
  const count = (s?: string) => db.businesses.filter((b) => !s || b.status === s).length;
  const tab = (s: string | undefined, label: string) => (
    <Link
      href={`/admin/businesses${s ? `?status=${s}` : ""}`}
      className={`rounded-lg px-3 py-1.5 text-[13.5px] font-medium ${sp.status === s ? "bg-brand text-white" : "border border-line bg-white text-ink hover:bg-mint-50"}`}
    >
      {label} ({count(s)})
    </Link>
  );
  const saved = sp.saved ? db.businesses.find((b) => b.id === sp.saved) : undefined;

  return (
    <>
      <PageTitle title="Businesses" sub="Approve new listings, manage badges, premium plans and profiles.">
        <Link href="/admin/businesses/new" className="btn btn-primary h-11 px-5 text-[14.5px]">
          <Plus className="h-4 w-4" /> Add Business
        </Link>
      </PageTitle>
      {saved && (
        <p className="mb-4 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2.5 text-[14px] text-[#166534]">
          Saved “{saved.name}”.{" "}
          <Link href={`/business-services/${saved.slug}`} className="font-semibold underline">
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
          <input name="q" defaultValue={sp.q} placeholder="Search name, phone…" className="input h-9 w-48 text-[13.5px]" />
          <button className="btn btn-ghost h-9 px-3 text-[13px]">Filter</button>
        </form>
      </div>

      <div className="space-y-3">
        {list.map((b) => (
          <Box key={b.id} className="!p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                <Img src={businessImage(b)} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-[220px] flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/businesses/${b.id}/edit`} className="text-[16px] font-semibold text-ink hover:text-brand">
                    {b.name}
                  </Link>
                  <span className={`chip capitalize ${PROFILE_CHIP[b.status]}`}>{b.status === "active" ? "live" : b.status}</span>
                  {b.verified && (
                    <span className="chip bg-[#dbeafe] text-[#1e40af]">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  )}
                  {b.premium && (
                    <span className="chip bg-[#fef3c7] text-[#92400e]">
                      <Crown className="h-3.5 w-3.5" /> Premium
                    </span>
                  )}
                  {b.plan === "premium" && !b.premium && <span className="chip bg-[#fff7ed] text-[#c2410c]">Premium requested</span>}
                </p>
                <p className="text-[12.5px] text-muted">
                  {categoryById(db, b.categoryId)?.short ?? b.categoryId} • {b.subcategory} • {b.area}, {b.district} • updated {timeAgo(b.updatedAt)}
                </p>
                <p className="mt-0.5 flex flex-wrap gap-x-4 text-[12.5px] text-body">
                  <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 hover:text-brand">
                    <Phone className="h-3 w-3" /> {b.contactName} • {b.phone}
                  </a>
                  <span>
                    ★ {b.rating.toFixed(1)} ({b.reviewCount}) • {b.stats.views} views • {b.stats.calls} calls • {b.stats.whatsapp} WhatsApp • {b.stats.leads} leads
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {b.status !== "active" && (
                  <form action={setBusinessStatusAction.bind(null, b.id, "active")}>
                    <button className="btn btn-primary h-8 px-3 text-[12.5px]">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                  </form>
                )}
                {b.status !== "rejected" && (
                  <form action={setBusinessStatusAction.bind(null, b.id, "rejected")}>
                    <button className="btn btn-ghost h-8 px-3 text-[12.5px] text-[#dc2626]">
                      <X className="h-3.5 w-3.5" /> {b.status === "active" ? "Unpublish" : "Reject"}
                    </button>
                  </form>
                )}
                <form action={toggleBusinessFlagAction.bind(null, b.id, "verified")}>
                  <button className="btn btn-ghost h-8 px-3 text-[12.5px]">{b.verified ? "Unverify" : "Verify"}</button>
                </form>
                <form action={toggleBusinessFlagAction.bind(null, b.id, "premium")}>
                  <button className="btn btn-ghost h-8 px-3 text-[12.5px]">{b.premium ? "Remove Premium" : "Make Premium"}</button>
                </form>
                <Link href={`/business-services/${b.slug}`} target="_blank" className="btn btn-ghost h-8 px-2.5" aria-label="View">
                  <Eye className="h-4 w-4" />
                </Link>
                <Link href={`/admin/businesses/${b.id}/edit`} className="btn btn-ghost h-8 px-2.5" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={deleteBusinessAction.bind(null, b.id)}>
                  <ConfirmButton message={`Delete "${b.name}" permanently?`} className="btn btn-ghost h-8 px-2.5 text-[#dc2626]">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              </div>
            </div>
          </Box>
        ))}
        {list.length === 0 && <Box className="text-center text-muted">No businesses found.</Box>}
      </div>
    </>
  );
}
