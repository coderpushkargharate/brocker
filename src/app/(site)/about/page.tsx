import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { HowItWorks, ReadyBanner, WhyChoose } from "@/components/home/Sections";
import { publicLands } from "@/lib/lands";
import { readDB } from "@/lib/db";

export const metadata: Metadata = {
  title: "About Us – Agricultural Land Marketplace in Maharashtra",
  description: "AgriLand connects genuine agricultural landowners with verified investors through secure, transparent and profitable land deals. Learn about our mission and verification process.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const db = (await readDB());
  const stats = [
    ["5000+", "Verified customers"],
    ["₹250Cr+", "Worth transactions"],
    [`${publicLands(db).length}+`, "Live verified lands"],
    [`${new Set(publicLands(db).map((l) => l.district)).size}`, "Districts covered"],
  ];
  return (
    <>
      <PageHero title="Where Farmers Find the Right Value, Investors Build the Right Future." sub="AgriLand is a trusted marketplace connecting agricultural landowners with genuine investors through secure, transparent, and profitable land deals." crumb={{ name: "About Us", href: "/about" }} />
      <div className="container-x space-y-20 py-16">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-1.5">Our mission</p>
            <h2 className="h2">Fair value for farmers. Real opportunity for investors.</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-body">
              Selling agricultural land in India has traditionally meant brokers, unclear documents and unfair prices. We built AgriLand so farmers can list their land for free, get it verified, and talk directly to serious investors — while investors get the confidence of checked documents, exact locations and transparent pricing.
            </p>
            <p className="mt-3 text-[15.5px] leading-relaxed text-body">From documentation to development, our team supports every step: land survey, title search & registration, NA conversion, borewell setup, compound walls and a trusted contractor network.</p>
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map(([v, l]) => (
                <div key={l} className="rounded-xl bg-mint-50 p-4 text-center">
                  <dd className="text-[24px] font-bold text-brand">{v}</dd>
                  <dt className="text-[12.5px] text-body">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
          <Image src="/images/hero.png" alt="Farmer and investor shaking hands" width={1600} height={913} className="h-auto w-full" />
        </section>

        <section id="verification" className="scroll-mt-28 rounded-3xl border border-[#cfe9d7] bg-mint-50 p-8 sm:p-10">
          <p className="eyebrow mb-1.5">Verification process</p>
          <h2 className="h2">Verified Land Means Trust</h2>
          <p className="mt-2 max-w-[640px] text-[15px] text-body">Before a listing gets the Verified badge, our team checks:</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Ownership details", "Owner name on the 7/12 extract matches the seller's identity proof."],
              ["Location", "Village, taluka and map location are confirmed against land records."],
              ["Documents", "7/12 extract, land map and ownership proof are reviewed for completeness."],
              ["Listing information", "Area, water source, road access and photos are checked for accuracy."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl bg-white p-5 shadow-card">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[13px] font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 flex items-center gap-2 font-semibold text-ink">
                  <Check className="h-4 w-4 text-sea" /> {t}
                </h3>
                <p className="mt-1 text-[13.5px] text-body">{d}</p>
              </li>
            ))}
          </ol>
          <Link href="/sell-land" className="btn btn-primary mt-8 h-11 px-6">
            Get your land verified
          </Link>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <WhyChoose />
          <HowItWorks />
        </div>
        <ReadyBanner />
      </div>
    </>
  );
}
