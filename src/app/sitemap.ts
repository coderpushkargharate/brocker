import type { MetadataRoute } from "next";
import { site, DISTRICTS, LAND_CATEGORIES } from "@/lib/config";
import { publicLands } from "@/lib/lands";
import { readDB } from "@/lib/db";
import { publicBusinesses, publicWorkers } from "@/lib/services";
import { livePosts } from "@/lib/blog";

// rebuilt on every request so new land projects appear in Google immediately
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const db = await readDB();
  const lands = publicLands(db);
  const statics: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "daily"],
    ["/buy-land", 0.9, "daily"],
    ["/sell-land", 0.8, "weekly"],
    ["/services", 0.7, "monthly"],
    ["/find-services", 0.8, "daily"],
    ["/business-services", 0.8, "daily"],
    ["/labour", 0.8, "daily"],
    ["/list-business", 0.6, "monthly"],
    ["/labour/register", 0.6, "monthly"],
    ["/post-requirement", 0.5, "monthly"],
    ["/about", 0.5, "monthly"],
    ["/contact", 0.5, "monthly"],
    ["/faq", 0.5, "monthly"],
    ["/blog", 0.7, "weekly"],
    ["/install", 0.3, "yearly"],
    ["/privacy-policy", 0.2, "yearly"],
    ["/terms", 0.2, "yearly"],
    ["/cookie-policy", 0.2, "yearly"],
    ["/disclaimer", 0.2, "yearly"],
  ];
  // only published, indexable articles that are canonical to this site
  const posts = livePosts(db).filter((p) => !p.noindex && !p.canonicalUrl);
  const postCats = db.blogCategories.filter((c) => posts.some((p) => p.categoryId === c.id));
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
    ...publicBusinesses(db).map((b) => ({ url: `${site.url}/business-services/${b.slug}`, lastModified: new Date(b.updatedAt), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...publicWorkers(db).map((w) => ({ url: `${site.url}/labour/${w.slug}`, lastModified: new Date(w.updatedAt), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      ...(p.coverImage ? { images: [p.coverImage.startsWith("http") ? p.coverImage : site.url + p.coverImage] } : {}),
    })),
    ...postCats.map((c) => ({ url: `${site.url}/blog/category/${c.id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
