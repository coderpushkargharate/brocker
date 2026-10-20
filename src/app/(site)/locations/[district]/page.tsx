import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandsBrowser } from "@/components/buy/LandsBrowser";
import { DISTRICTS } from "@/lib/config";
import type { LandQuery } from "@/lib/lands";

// always fresh: admins add new lands at any time
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ district: string }>; searchParams: Promise<LandQuery> };

const find = (slug: string) => DISTRICTS.find((d) => d.toLowerCase() === slug.toLowerCase());

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const district = find((await params).district);
  if (!district) return { title: "Location not found" };
  const q = await searchParams;
  return {
    title: `Agricultural Land for Sale in ${district}, Maharashtra`,
    description: `Buy verified agricultural land and farm land in ${district} district, Maharashtra. Compare price per acre, water source, soil and road access, and contact farmers directly on AgriLand.`,
    alternates: { canonical: `/locations/${district.toLowerCase()}` },
    robots: Object.values(q).some(Boolean) ? { index: false, follow: true } : undefined,
  };
}

export default async function LocationPage({ params, searchParams }: Props) {
  const district = find((await params).district);
  if (!district) notFound();
  const q = await searchParams;
  return (
    <LandsBrowser
      q={{ ...q, district }}
      basePath={`/locations/${district.toLowerCase()}`}
      title={`Agricultural Land in ${district}`}
      subtitle={`Explore verified agricultural land for sale across ${district} district, Maharashtra.`}
    />
  );
}
