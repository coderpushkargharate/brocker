import Link from "next/link";
import { Check, Trash2, X } from "lucide-react";
import { readDB } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { deleteReviewAction, setReviewStatusAction } from "@/app/actions/services-admin";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { Stars } from "@/components/services/Stars";
import type { ServiceReview } from "@/lib/types";

export const metadata = { title: "Reviews" };

const CHIP: Record<ServiceReview["status"], string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  approved: "bg-[#dcfce7] text-[#166534]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
};

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const db = await readDB();
  let list = [...db.serviceReviews].sort((a, b) => +(b.status === "pending") - +(a.status === "pending") || +new Date(b.createdAt) - +new Date(a.createdAt));
  if (sp.status) list = list.filter((r) => r.status === sp.status);
  const tab = (s: string | undefined, label: string) => (
    <Link href={`/admin/service-reviews${s ? `?status=${s}` : ""}`} className={`rounded-lg px-3 py-1.5 text-[13.5px] font-medium ${sp.status === s ? "bg-brand text-white" : "border border-line bg-white text-ink hover:bg-mint-50"}`}>
      {label} ({db.serviceReviews.filter((r) => !s || r.status === s).length})
    </Link>
  );
  return (
    <>
      <PageTitle title="Reviews" sub="Customer reviews appear on profiles only after you approve them. Approving updates the star rating." />
      <div className="mb-4 flex flex-wrap gap-2">
        {tab(undefined, "All")}
        {tab("pending", "Pending")}
        {tab("approved", "Approved")}
        {tab("rejected", "Rejected")}
      </div>
      <div className="space-y-3">
        {list.map((r) => {
          const t = r.targetType === "business" ? db.businesses.find((b) => b.id === r.targetId) : db.workers.find((w) => w.id === r.targetId);
          const href = t ? (r.targetType === "business" ? `/business-services/${t.slug}` : `/labour/${t.slug}`) : undefined;
          return (
            <Box key={r.id} className="!p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-ink">
                    {r.name} <Stars value={r.rating} size={14} />
                    <span className={`chip capitalize ${CHIP[r.status]}`}>{r.status}</span>
                    <span className="text-[12.5px] font-normal text-muted">{timeAgo(r.createdAt)}</span>
                  </p>
                  <p className="text-[13px] text-body">
                    on{" "}
                    {href ? (
                      <Link href={href} target="_blank" className="font-semibold text-brand hover:underline">
                        {t!.name}
                      </Link>
                    ) : (
                      "a deleted profile"
                    )}
                  </p>
                  <p className="mt-1.5 text-[14px] text-ink">{r.text}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {r.status !== "approved" && (
                    <form action={setReviewStatusAction.bind(null, r.id, "approved")}>
                      <button className="btn btn-primary h-8 px-3 text-[12.5px]">
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    </form>
                  )}
                  {r.status !== "rejected" && (
                    <form action={setReviewStatusAction.bind(null, r.id, "rejected")}>
                      <button className="btn btn-ghost h-8 px-3 text-[12.5px] text-[#dc2626]">
                        <X className="h-3.5 w-3.5" /> {r.status === "approved" ? "Hide" : "Reject"}
                      </button>
                    </form>
                  )}
                  <form action={deleteReviewAction.bind(null, r.id)}>
                    <ConfirmButton message="Delete this review?" className="btn btn-ghost h-8 px-2.5 text-[#dc2626]">
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </Box>
          );
        })}
        {list.length === 0 && <Box className="text-center text-muted">No reviews.</Box>}
      </div>
    </>
  );
}
