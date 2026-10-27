import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, ClipboardList, IndianRupee, UsersRound } from "lucide-react";
import { readDB } from "@/lib/db";
import { categoriesOf, serviceSettings } from "@/lib/services";
import { Crumbs } from "@/components/services/Bits";
import { WorkerForm } from "@/components/services/WorkerForm";

export const metadata: Metadata = {
  title: "Register as a Worker – Get Work Near You",
  description: "Masons, helpers, painters, plumbers, electricians, farm labour and labour groups: create your free profile on AgriLand and get direct calls and WhatsApp enquiries from local customers.",
  alternates: { canonical: "/labour/register" },
};

export default async function RegisterWorkerPage() {
  const db = await readDB();
  const settings = serviceSettings(db);
  const perks = [
    [ClipboardList, "Get More Work", "Direct enquiries from customers & contractors"],
    [UsersRound, "Show Your Skills", "Reach local contractors"],
    [BadgeCheck, "Verified Profile", "Build trust and credibility"],
    [IndianRupee, "Free Registration", "Start your profile for free"],
  ] as const;
  return (
    <div className="bg-page pb-16">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef6f0] to-[#f7faf8]">
        <div className="absolute inset-y-0 right-0 hidden w-[45%] md:block">
          <Image src="/images/svc/hero-worker.jpg" alt="" fill priority sizes="45vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0f7f2] via-[#f0f7f2]/20 to-transparent" />
        </div>
        <div className="container-dash relative py-6 lg:py-8">
          <Crumbs items={[{ name: "Labour & Workforce", href: "/labour" }, { name: "Register as a Worker" }]} />
          <h1 className="mt-4 font-display text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[42px]">
            Register as a <span className="text-brand">Worker</span> on AgriLand
          </h1>
          <p className="mt-2 max-w-[560px] text-[15.5px] text-ink">Create your profile and get work opportunities from local customers, contractors and businesses.</p>
          <ul className="mt-6 grid max-w-[880px] grid-cols-2 gap-4 rounded-2xl bg-white/85 p-4 backdrop-blur md:grid-cols-4">
            {perks.map(([I, t, d]) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <I className="h-5 w-5" />
                </span>
                <span>
                  <b className="block text-[13.5px] text-ink">{t}</b>
                  <span className="text-[11.5px] leading-tight text-body">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <div className="container-dash pt-6">
        <WorkerForm categories={categoriesOf(db, "labour")} helpPhone={settings.helpPhone} helpHours={settings.helpHours} />
      </div>
    </div>
  );
}
