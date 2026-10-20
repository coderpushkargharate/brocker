import { Mail, Phone, Trash2 } from "lucide-react";
import { readDB } from "@/lib/db";
import { timeAgo } from "@/lib/format";
import { deleteEnquiryAction, setEnquiryStatusAction } from "@/app/actions/admin";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import type { Enquiry } from "@/lib/types";

export const metadata = { title: "Enquiries" };

const CHIP: Record<Enquiry["status"], string> = {
  new: "bg-[#fef3c7] text-[#92400e]",
  "in-progress": "bg-[#dbeafe] text-[#1e40af]",
  resolved: "bg-[#dcfce7] text-[#166534]",
};

export default async function AdminEnquiries() {
  const list = [...(await readDB()).enquiries].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <>
      <PageTitle title="Enquiries" sub="Messages from the contact form and service requests." />
      <div className="space-y-4">
        {list.map((e) => (
          <Box key={e.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-semibold text-ink">
                  {e.name} <span className="text-[13px] font-normal text-muted">• {e.subject} • {timeAgo(e.createdAt)}</span>
                </p>
                <p className="mt-1 flex flex-wrap gap-4 text-[13px] text-body">
                  {e.email && (
                    <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-brand">
                      <Mail className="h-3.5 w-3.5" /> {e.email}
                    </a>
                  )}
                  {e.phone && (
                    <a href={`tel:${e.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 hover:text-brand">
                      <Phone className="h-3.5 w-3.5" /> {e.phone}
                    </a>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`chip capitalize ${CHIP[e.status]}`}>{e.status.replace("-", " ")}</span>
                {(["new", "in-progress", "resolved"] as const)
                  .filter((s) => s !== e.status)
                  .map((s) => (
                    <form key={s} action={setEnquiryStatusAction.bind(null, e.id, s)}>
                      <button className="rounded-md border border-line px-2 py-1 text-[12px] capitalize hover:bg-mint-50">{s.replace("-", " ")}</button>
                    </form>
                  ))}
                <form action={deleteEnquiryAction.bind(null, e.id)}>
                  <ConfirmButton message="Delete this enquiry?" className="rounded-md border border-line p-1 text-[#dc2626] hover:bg-[#fef2f2]">
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-[14px] text-body">{e.message}</p>
          </Box>
        ))}
        {list.length === 0 && <Box className="text-center text-muted">No enquiries yet.</Box>}
      </div>
    </>
  );
}
