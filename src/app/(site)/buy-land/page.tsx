import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, FileSearch, LineChart, MapPinned, Phone, ShieldCheck } from "lucide-react";
import { LandsBrowser } from "@/components/buy/LandsBrowser";
import type { LandQuery } from "@/lib/lands";

type Props = { searchParams: Promise<LandQuery> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await searchParams;
  const where = q.taluka ? `${q.taluka}, ${q.district}` : q.district;
  const title = where ? `Agricultural Land for Sale in ${where}` : "Buy Agricultural Land – Verified Farm Land for Sale";
  const filtered = Object.entries(q).some(([k, v]) => v && k !== "district");
  return {
    title,
    description: `Explore verified agricultural land for sale${where ? ` in ${where}` : " across Maharashtra"}. Compare price per acre, water source, road access and documents, then connect directly with farmers.`,
    alternates: { canonical: q.district && !filtered ? `/locations/${q.district.toLowerCase()}` : "/buy-land" },
    // filtered/paginated combinations are useful for people but duplicate content for search engines
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

// moved here from the old Investors page
const PERKS = [
  { icon: ShieldCheck, t: "Verified Documents", d: "7/12 extract, land map and ownership proof checked before listing." },
  { icon: BellRing, t: "Smart Land Alerts", d: "Set your budget, area and district — get notified when matching land is listed." },
  { icon: Phone, t: "Direct Farmer Contact", d: "Call or message landowners directly. No brokers, no commission." },
  { icon: MapPinned, t: "Exact Location", d: "Every land shows village, taluka and map location with nearby connectivity." },
  { icon: FileSearch, t: "Title Search Support", d: "Our legal team helps with title search, registration and NA conversion." },
  { icon: LineChart, t: "Long-term Value", d: "Agricultural land near growing cities is one of the most stable investments." },
];

export default async function BuyLandPage({ searchParams }: Props) {
  const q = await searchParams;
  return (
    <>
      <LandsBrowser q={q} basePath="/buy-land" title="Find Agricultural Land" subtitle="Explore verified agricultural land that matches your requirements." />
      <section aria-labelledby="perks-h" className="container-dash pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-1.5">Why buy on AgriLand</p>
            <h2 id="perks-h" className="h2">
              Buy with confidence
            </h2>
          </div>
          <Link href="/signup?role=investor" className="btn btn-primary h-11 px-6 text-[15px]">
            Create Free Buyer Account
          </Link>
        </div>
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
    </>
  );
}
