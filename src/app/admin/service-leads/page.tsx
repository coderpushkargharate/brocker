import Link from "next/link";
import { Eye, EyeOff, MapPin, Phone, Trash2 } from "lucide-react";
import { readDB } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { categoryById } from "@/lib/services";
import { waLink } from "@/lib/services-config";
import { deleteLeadAction, setLeadStatusAction, toggleLeadPublishedAction } from "@/app/actions/services-admin";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import type { LeadStatus } from "@/lib/types";

export const metadata = { title: "Leads & Requirements" };

const CHIP: Record<LeadStatus, string> = {
  new: "bg-[#fef3c7] text-[#92400e]",
  contacted: "bg-[#dbeafe] text-[#1e40af]",
  closed: "bg-[#dcfce7] text-[#166534]",
};
const KIND = { enquiry: "Enquiry", callback: "Call Back", requirement: "Requirement" } as const;

type Props = { searchParams: Promise<{ kind?: string; status?: string; target?: string }> };

export default async function AdminLeads({ searchParams }: Props) {
  const sp = await searchParams;
  const db = await readDB();
  let list = [...db.serviceLeads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (sp.kind) list = list.filter((l) => l.kind === sp.kind);
  if (sp.status) list = list.filter((l) => l.status === sp.status);
  if (sp.target) list = list.filter((l) => l.targetId === sp.target);
  const tab = (k: string | undefined, label: string) => (
    <Link href={`/admin/service-leads${k ? `?kind=${k}` : ""}`} className={`rounded-lg px-3 py-1.5 text-[13.5px] font-medium ${sp.kind === k && !sp.target ? "bg-brand text-white" : "border border-line bg-white text-ink hover:bg-mint-50"}`}>
      {label} ({db.serviceLeads.filter((l) => !k || l.kind === k).length})
    </Link>
  );

  return (
    <>
      <PageTitle title="Leads & Requirements" sub="Enquiries and call-back requests sent to businesses and workers, and requirements posted by customers." />
      <div className="mb-4 flex flex-wrap gap-2">
        {tab(undefined, "All")}
        {tab("enquiry", "Enquiries")}
        {tab("callback", "Call Backs")}
        {tab("requirement", "Requirements")}
      </div>
      {sp.target && (
        <p className="mb-4 text-[14px] text-body">
          Showing leads for one profile.{" "}
          <Link href="/admin/service-leads" className="link">
            Show all
          </Link>
        </p>
      )}
      <div className="space-y-3">
        {list.map((l) => {
          const target = l.targetType === "business" ? db.businesses.find((b) => b.id === l.targetId) : l.targetType === "worker" ? db.workers.find((w) => w.id === l.targetId) : undefined;
          const targetHref = target ? (l.targetType === "business" ? `/admin/businesses/${target.id}/edit` : `/admin/workers/${target.id}/edit`) : undefined;
          const isLabourReq = l.kind === "requirement" && db.serviceCategories.some((c) => c.id === l.categoryId && c.kind === "labour");
          return (
            <Box key={l.id} className="!p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-[15.5px] font-semibold text-ink">
                    <span className="chip bg-[#f3f4f6] text-[#374151]">{KIND[l.kind]}</span>
                    {l.name}
                    <span className={`chip capitalize ${CHIP[l.status]}`}>{l.status}</span>
                    {l.published && <span className="chip bg-[#dcf3e8] text-brand">On “Find Work”</span>}
                    <span className="text-[12.5px] font-normal text-muted">{timeAgo(l.createdAt)}</span>
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-body">
                    <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 hover:text-brand">
                      <Phone className="h-3.5 w-3.5" /> {l.phone}
                    </a>
                    <a href={waLink(l.phone)} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                      WhatsApp
                    </a>
                    {(l.village || l.taluka || l.district) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {[l.village, l.taluka, l.district].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[13.5px] text-ink">
                    {target && (
                      <>
                        For{" "}
                        <Link href={targetHref!} className="font-semibold text-brand hover:underline">
                          {target.name}
                        </Link>
                        {" • "}
                      </>
                    )}
                    {l.categoryId && <>{categoryById(db, l.categoryId)?.name} • </>}
                    {l.item && <>{l.item} • </>}
                    {l.workersNeeded && <>{l.workersNeeded} workers • </>}
                    {l.budget && <>Budget {l.budget} • </>}
                    {l.startDate && <>Start {l.startDate}</>}
                  </p>
                  {l.message && <p className="mt-1.5 whitespace-pre-line rounded-lg bg-[#f9fafb] p-2.5 text-[13.5px] text-body">{l.message}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["new", "contacted", "closed"] as const)
                    .filter((s) => s !== l.status)
                    .map((s) => (
                      <form key={s} action={setLeadStatusAction.bind(null, l.id, s)}>
                        <button className="rounded-md border border-line px-2 py-1 text-[12px] capitalize hover:bg-mint-50">{s}</button>
                      </form>
                    ))}
                  {isLabourReq && (
                    <form action={toggleLeadPublishedAction.bind(null, l.id)}>
                      <button className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[12px] hover:bg-mint-50" title="Show this requirement to workers on the Find Work tab">
                        {l.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {l.published ? "Hide from Find Work" : "Publish on Find Work"}
                      </button>
                    </form>
                  )}
                  <form action={deleteLeadAction.bind(null, l.id)}>
                    <ConfirmButton message="Delete this lead?" className="rounded-md border border-line p-1 text-[#dc2626] hover:bg-[#fef2f2]">
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </Box>
          );
        })}
        {list.length === 0 && <Box className="text-center text-muted">No leads yet.</Box>}
      </div>
    </>
  );
}
