import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandsBrowser } from "@/components/buy/LandsBrowser";
import { LAND_CATEGORIES } from "@/lib/config";
import type { LandQuery } from "@/lib/lands";

// always fresh: admins add new lands at any time
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ type: string }>; searchParams: Promise<LandQuery> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { type } = await params;
  const c = LAND_CATEGORIES.find((x) => x.slug === type);
  if (!c) return { title: "Not found" };
  const q = await searchParams;
  return {
    title: `${c.name} for Sale in Maharashtra`,
    description: `Find verified ${c.name.toLowerCase()} for sale in Pune, Satara, Nashik, Kolhapur and across Maharashtra. Clear titles, verified documents and direct farmer contact on AgriLand.`,
    alternates: { canonical: `/land-type/${c.slug}` },
    robots: Object.values(q).some(Boolean) ? { index: false, follow: true } : undefined,
  };
}

export default async function LandTypePage({ params, searchParams }: Props) {
  const { type } = await params;
  const c = LAND_CATEGORIES.find((x) => x.slug === type);
  if (!c) notFound();
  const q = await searchParams;
  return <LandsBrowser q={{ ...q, category: c.slug }} basePath={`/land-type/${c.slug}`} title={c.name} subtitle={`Explore verified ${c.name.toLowerCase()} that matches your requirements.`} />;
}
