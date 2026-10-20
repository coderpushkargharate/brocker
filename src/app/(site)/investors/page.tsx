import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, FileSearch, LineChart, MapPinned, Phone, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ExploreLocations, HowItWorks, LandTypes, ReadyBanner, SectionHead, WhyChoose } from "@/components/home/Sections";
import { LandCard } from "@/components/LandCard";
import { getCurrentUser } from "@/lib/auth";
import { districtCounts, matchScore, publicLands } from "@/lib/lands";

export const metadata: Metadata = {
  title: "Invest in Agricultural Land – Verified Farm Land for Investors",
  description: "Invest in verified agricultural land in Maharashtra. Get land alerts that match your budget, compare documents and location, and connect directly with farmers on AgriLand.",
  alternates: { canonical: "/investors" },
};

const PERKS = [
  { icon: ShieldCheck, t: "Verified Documents", d: "7/12 extract, land map and ownership proof checked before listing." },
  { icon: BellRing, t: "Smart Land Alerts", d: "Set your budget, area and district — get notified when matching land is listed." },
  { icon: Phone, t: "Direct Farmer Contact", d: "Call or message landowners directly. No brokers, no commission." },
  { icon: MapPinned, t: "Exact Location", d: "Every land shows village, taluka and map location with nearby connectivity." },
  { icon: FileSearch, t: "Title Search Support", d: "Our legal team helps with title search, registration and NA conversion." },
  { icon: LineChart, t: "Long-term Value", d: "Agricultural land near growing cities is one of the most stable investments." },
];

export default async function InvestorsPage() {
  const user = await getCurrentUser();
  const lands = [...publicLands()].sort((a, b) => b.stats.views - a.stats.views).slice(0, 3);
  const saved = new Set(user?.saved ?? []);
  return (
    <>
      <PageHero title="Invest in Verified Agricultural Land" sub="Discover high-quality farm land from genuine farmers, with verified documents, clear titles and direct communication." crumb={{ name: "Investors", href: "/investors" }}>
        <Link href="/buy-land" className="btn btn-primary h-12 px-8 text-[16px]">
          Explore Land
        </Link>
        <Link href="/signup?role=investor" className="btn btn-ghost h-12 px-8 text-[16px]">
          Create Investor Account
        </Link>
      </PageHero>
      <div className="container-x space-y-20 py-16">
        <section aria-labelledby="perks-h">
          <p className="eyebrow mb-1.5">For investors</p>
          <h2 id="perks-h" className="h2">
            Invest with confidence
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((b) => (
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
        <section>
          <SectionHead eyebrow="Most viewed" title="Popular Lands with Investors" link={{ href: "/buy-land", label: "View All Lands" }} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lands.map((l) => (
              <LandCard key={l.id} land={l} saved={saved.has(l.id)} match={matchScore(l, user?.preferences)} />
            ))}
          </div>
        </section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <WhyChoose />
          <HowItWorks />
        </div>
        <ExploreLocations counts={districtCounts()} />
        <LandTypes />
        <ReadyBanner />
      </div>
    </>
  );
}
