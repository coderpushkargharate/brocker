import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { readDB } from "@/lib/db";
import { categoriesOf, serviceSettings } from "@/lib/services";
import { PageTitle } from "@/components/admin/Bits";
import { WorkerForm } from "@/components/services/WorkerForm";

export const metadata = { title: "Edit Worker" };

export default async function EditWorker({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const w = db.workers.find((x) => x.id === id);
  if (!w) notFound();
  const s = serviceSettings(db);
  return (
    <>
      <PageTitle title={`Edit: ${w.name}`} sub={`${w.stats.views} views • ${w.stats.calls} calls • ${w.stats.whatsapp} WhatsApp taps`}>
        <div className="flex gap-2">
          {w.idProof && (
            <a href={w.idProof} target="_blank" className="btn btn-ghost h-11 px-4 text-[14px]">
              Open {w.idProofType || "ID proof"}
            </a>
          )}
          <Link href={`/labour/${w.slug}`} target="_blank" className="btn btn-outline h-11 px-4 text-[14px]">
            <Eye className="h-4 w-4" /> View Profile
          </Link>
        </div>
      </PageTitle>
      <WorkerForm mode="admin" initial={w} categories={categoriesOf(db, "labour", true)} helpPhone={s.helpPhone} helpHours={s.helpHours} />
    </>
  );
}
