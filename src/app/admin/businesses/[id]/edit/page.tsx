import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { readDB } from "@/lib/db";
import { categoriesOf, serviceSettings } from "@/lib/services";
import { PageTitle } from "@/components/admin/Bits";
import { BusinessForm } from "@/components/services/BusinessForm";

export const metadata = { title: "Edit Business" };

export default async function EditBusiness({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const b = db.businesses.find((x) => x.id === id);
  if (!b) notFound();
  const s = serviceSettings(db);
  const leads = db.serviceLeads.filter((l) => l.targetId === b.id).length;
  return (
    <>
      <PageTitle title={`Edit: ${b.name}`} sub={`${b.stats.views} views • ${b.stats.calls} calls • ${b.stats.whatsapp} WhatsApp taps • ${leads} leads`}>
        <div className="flex gap-2">
          <Link href={`/admin/service-leads?target=${b.id}`} className="btn btn-ghost h-11 px-4 text-[14px]">
            View Leads
          </Link>
          <Link href={`/business-services/${b.slug}`} target="_blank" className="btn btn-outline h-11 px-4 text-[14px]">
            <Eye className="h-4 w-4" /> View Profile
          </Link>
        </div>
      </PageTitle>
      <BusinessForm mode="admin" initial={b} categories={categoriesOf(db, "business", true)} premiumPrice={s.premiumPrice} helpPhone={s.helpPhone} helpHours={s.helpHours} loggedIn />
    </>
  );
}
