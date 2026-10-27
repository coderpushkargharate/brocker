import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { readDB } from "@/lib/db";
import { serviceSettings } from "@/lib/services";
import { Crumbs } from "@/components/services/Bits";
import { RequirementForm } from "@/components/services/LeadForms";
import { HelpBox } from "@/components/services/BusinessForm";

export const metadata: Metadata = {
  title: "Post Your Requirement – Get Quotes from Verified Providers",
  description: "Need workers, building materials, JCB, borewell or a contractor? Post your requirement on AgriLand and get calls from verified local providers.",
  alternates: { canonical: "/post-requirement" },
};

type Props = { searchParams: Promise<{ type?: string; category?: string }> };

export default async function PostRequirementPage({ searchParams }: Props) {
  const q = await searchParams;
  const db = await readDB();
  const settings = serviceSettings(db);
  const cats = db.serviceCategories.filter((c) => c.active).sort((a, b) => a.order - b.order);
  const type = q.type === "service" ? "service" : "labour";
  return (
    <div className="bg-page pb-16 pt-6">
      <div className="container-x">
        <Crumbs items={[{ name: type === "labour" ? "Labour & Workforce" : "Business Services", href: type === "labour" ? "/labour" : "/business-services" }, { name: "Post Requirement" }]} />
        <h1 className="mt-3 font-display text-[30px] font-extrabold text-ink sm:text-[38px]">Post Your Requirement</h1>
        <p className="text-[15.5px] text-body">Tell us what you need. Verified workers and service providers near you will contact you.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
            <RequirementForm categories={cats} defaultType={type} defaultCategory={q.category} />
          </section>
          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#d6ecdc] bg-mint-50 p-5">
              <h2 className="text-[17px] font-bold text-ink">How it works</h2>
              <ul className="mt-3 space-y-2.5">
                {["Post your requirement in 1 minute", "Our team checks and shares it with matching providers", "Get calls & WhatsApp quotes", "Compare and hire directly – no commission"].map((t) => (
                  <li key={t} className="flex gap-2 text-[13.5px] text-ink">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {t}
                  </li>
                ))}
              </ul>
            </section>
            <HelpBox helpPhone={settings.helpPhone} helpHours={settings.helpHours} />
          </aside>
        </div>
      </div>
    </div>
  );
}
