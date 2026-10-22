import type { MetadataRoute } from "next";
import { site, DISTRICTS, LAND_CATEGORIES } from "@/lib/config";
import { publicLands } from "@/lib/lands";
import { readDB } from "@/lib/db";

// rebuilt on every request so new land projects appear in Google immediately
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const lands = publicLands(await readDB());
  const statics: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "daily"],
    ["/buy-land", 0.9, "daily"],
    ["/sell-land", 0.8, "weekly"],
    ["/services", 0.7, "monthly"],
    ["/about", 0.5, "monthly"],
    ["/contact", 0.5, "monthly"],
    ["/faq", 0.5, "monthly"],
    ["/signup", 0.3, "yearly"],
  ];
  const districtsWithLand = new Set(lands.map((l) => l.district));
  return [
    ...statics.map(([p, priority, changeFrequency]) => ({ url: site.url + p, lastModified: now, changeFrequency, priority })),
    ...lands.map((l) => ({
      url: `${site.url}/lands/${l.slug}`,
      lastModified: new Date(l.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: l.images.slice(0, 5).map((i) => (i.startsWith("http") ? i : site.url + i)),
    })),
    ...DISTRICTS.filter((d) => districtsWithLand.has(d)).map((d) => ({ url: `${site.url}/locations/${d.toLowerCase()}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...LAND_CATEGORIES.map((c) => ({ url: `${site.url}/land-type/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
  ];
}
