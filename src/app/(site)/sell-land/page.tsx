import type { Metadata } from "next";
import Link from "next/link";
import { BadgeIndianRupee, FileCheck2, Megaphone, ShieldCheck, Users, Zap } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { FaqSection, HowItWorks, LandServices, ReadyBanner, SellBanner, WhyChoose } from "@/components/home/Sections";
import { ServicesPromo } from "@/components/ServicesPromo";

export const metadata: Metadata = {
  title: "Sell Agricultural Land – List Your Farm Land Free",
  description: "Sell your agricultural land faster to genuine verified investors. List your farm land free on AgriLand with photos, 7/12 documents and location, and get investor calls directly.",
  alternates: { canonical: "/sell-land" },
};

const BENEFITS = [
  { icon: BadgeIndianRupee, t: "100% Free Listing", d: "No listing fees or hidden charges for farmers." },
  { icon: Users, t: "Genuine Investors", d: "Only registered, verified investors can contact you." },
  { icon: ShieldCheck, t: "Verified Badge", d: "Verified listings get up to 3× more investor interest." },
  { icon: Zap, t: "Fast Responses", d: "Get notified instantly when investors show interest or call." },
  { icon: FileCheck2, t: "Document Help", d: "Our team helps with 7/12, title search and NA conversion." },
  { icon: Megaphone, t: "Boost Visibility", d: "Feature your land to reach thousands of buyers." },
];

export default function SellLandPage() {
  return (
    <>
      <PageHero title="Sell Your Agricultural Land to Genuine Investors" sub="List your land free, get verified and connect directly with serious investors across India — no middlemen, full transparency." crumb={{ name: "Sell Land", href: "/sell-land" }}>
        <Link href="/dashboard/listings/new" prefetch={false} className="btn btn-primary h-12 px-8 text-[16px]">
          List Your Land Free
        </Link>
        <Link href="/contact?subject=Help%20selling%20my%20land" className="btn btn-ghost h-12 px-8 text-[16px]">
          Talk to an Expert
        </Link>
      </PageHero>
      <div className="container-x space-y-20 py-16">
        <section aria-labelledby="ben-h">
          <p className="eyebrow mb-1.5">Why sell on AgriLand</p>
          <h2 id="ben-h" className="h2">
            Everything you need to sell your land
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <li key={b.t} className="rounded-2xl border border-[#dcefe3] bg-gradient-to-b from-white to-[#f1f9f4] p-6">
                <span className="icon-tile h-12 w-12">
                  <b.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-[18px] font-semibold text-ink">{b.t}</h3>
                <p className="mt-1.5 text-[14.5px] text-body">{b.d}</p>
              </li>
            ))}
          </ul>
        </section>
        <SellBanner />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <WhyChoose />
          <HowItWorks />
        </div>
        <LandServices />
        <ServicesPromo />
        <FaqSection />
        <ReadyBanner />
      </div>
    </>
  );
}
