import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sprout } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { LandCard } from "@/components/LandCard";
import { BuySellCards, ExploreLocations, FaqSection, HowItWorks, LandServices, LandTypes, ReadyBanner, SectionHead, SellBanner, WhyChoose } from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";
import { getCurrentUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { districtCounts, matchScore, publicLands } from "@/lib/lands";
import { FAQS } from "@/lib/faqs";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: { absolute: `${site.name} – Buy & Sell Verified Agricultural Land in Maharashtra` },
  description:
    "Where farmers find the right value and investors build the right future. Explore verified agricultural land for sale in Pune, Satara, Nashik, Kolhapur & Ahmednagar, or list your farm land free.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const lands = publicLands(await readDB());
  const featured = [...lands].sort((a, b) => Number(b.featured) - Number(a.featured) || b.stats.views - a.stats.views).slice(0, 3);
  const recent = [...lands].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 3);
  const saved = new Set(user?.saved ?? []);
  const prefs = user?.preferences;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.slice(0, 5).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      {/* Hero */}
      <section className="bg-[#fefefe]">
        <div className="container-x relative pb-10 pt-10 lg:pb-12 lg:pt-[100px]">
          <div className="relative z-10 max-w-[700px]">
            <p className="inline-flex w-full max-w-[535px] items-center justify-center gap-2 rounded-md border border-lime bg-gradient-to-r from-white to-[#f2fbea] py-1.5 text-[15px] font-semibold text-[#088810] sm:text-[16.5px]">
              <Sprout className="h-5 w-5" /> Trusted Agriculture Land Marketplace
            </p>
            <h1 className="mt-7 font-display text-[32px] font-bold leading-[1.22] tracking-[-0.01em] text-black sm:text-[40px] lg:text-[41px]">
              Where Farmers Find the <span className="text-gradient-green">Right Value,</span>
              <br className="hidden sm:block" /> Investors Build the <span className="text-gradient-green">Right Future.</span>
            </h1>
            <p className="mt-3 max-w-[570px] font-display text-[16px] leading-snug text-[#555] sm:text-[17px]">
              A trusted marketplace connecting agricultural landowners with genuine investors through secure, transparent, and profitable land deals
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Link href="/dashboard/listings/new" className="btn btn-primary h-[46px] w-full rounded-lg text-[16px] shadow-[0_6px_14px_rgba(22,114,8,0.25)] sm:w-[238px]">
                Sell Your Land
              </Link>
              <Link href="/buy-land" className="btn h-[46px] w-full rounded-lg border border-[#d1d5db] bg-white text-[16px] text-ink shadow-[0_4px_10px_rgba(0,0,0,0.08)] hover:bg-[#fafafa] sm:w-[238px]">
                Buy Agricultural Land
              </Link>
            </div>
          </div>
          <div className="relative mt-8 lg:absolute lg:right-0 lg:top-[52px] lg:mt-0 lg:w-[61%]">
            <Image
              src="/images/hero.png"
              alt="Farmer and investor shaking hands over verified premium agricultural land – 5000+ verified customers, ₹250Cr+ worth transactions"
              width={1600}
              height={913}
              priority
              sizes="(max-width:1024px) 100vw, 780px"
              className="h-auto w-full"
            />
          </div>
          <SearchBar className="relative z-10 mt-8 lg:mt-[110px]" />
        </div>
      </section>

      <div className="container-x space-y-20 pb-20 pt-6">
        <BuySellCards />
        <LandServices />

        <section aria-labelledby="featured-h">
          <SectionHead eyebrow="Featured Lands" title="Verified Agricultural Lands" sub="Verified, high-quality lands from trusted farmers." link={{ href: "/buy-land", label: "View All Lands" }} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <LandCard key={l.id} land={l} saved={saved.has(l.id)} match={matchScore(l, prefs)} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <WhyChoose />
          <HowItWorks />
        </div>

        <ExploreLocations counts={districtCounts(await readDB())} />
        <LandTypes />
        <SellBanner />

        <section aria-labelledby="recent-h">
          <SectionHead eyebrow="Newly Added" title="Recently Added Lands" sub="Verified, high-quality lands from trusted farmers." link={{ href: "/buy-land?sort=newest", label: "View All Lands" }} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((l) => (
              <LandCard key={l.id} land={l} saved={saved.has(l.id)} match={matchScore(l, prefs)} badge="new" />
            ))}
          </div>
        </section>

        <FaqSection />
        <ReadyBanner />
      </div>
    </>
  );
}
