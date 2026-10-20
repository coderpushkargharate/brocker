import type { Metadata } from "next";
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

export default async function BuyLandPage({ searchParams }: Props) {
  const q = await searchParams;
  return <LandsBrowser q={q} basePath="/buy-land" title="Find Agricultural Land" subtitle="Explore verified agricultural land that matches your requirements." />;
}
