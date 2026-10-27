import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Crown, LayoutGrid, SearchX, Star, UsersRound } from "lucide-react";
import { readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { categoriesOf, categoryById, searchBusinesses, serviceSettings, SERVICE_PAGE_SIZE, subcategoryCounts, type BizQuery } from "@/lib/services";
import { site } from "@/lib/config";
import { Crumbs, MapEmbed } from "@/components/services/Bits";
import { CatIcon } from "@/components/services/icons";
import { BizFilters, BizSearch, SortBy } from "@/components/services/Filters";
import { BusinessCard } from "@/components/services/Cards";
import { Pagination } from "@/components/buy/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { Img } from "@/components/Img";

type Props = { searchParams: Promise<BizQuery> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await searchParams;
  const cat = categoryById(await readDB(), q.category);
  const where = q.taluka ? `${q.taluka}, ${q.district}` : q.district || "Maharashtra";
  const filtered = Object.entries(q).some(([k, v]) => v && k !== "category");
  return {
    title: cat ? `${cat.name} in ${where}` : `Business Services – Trusted Local Suppliers & Contractors in ${where}`,
    description: `Find verified ${cat ? cat.name.toLowerCase() : "building material suppliers, contractors, JCB, borewell, garden and home service providers"} in ${where}. Call or WhatsApp directly.`,
    alternates: { canonical: cat && !filtered ? `/business-services?category=${cat.id}` : "/business-services" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function BusinessServicesPage({ searchParams }: Props) {
  const q = await searchParams;
  const db = await readDB();
  const user = await getCurrentUser();
  const settings = serviceSettings(db);
  const cats = categoriesOf(db, "business");
  const { items, total, page, pages } = searchBusinesses(q, db);
  const subs = subcategoryCounts(db, q);
  const saved = new Set(user?.savedServices ?? []);
  const qs = q as Record<string, string | undefined>;
  const where = q.taluka || q.district || "Maharashtra";

  const hrefFor = (p: number, drop = "") => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(qs)) if (v && k !== "page" && k !== drop) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    return `/business-services${sp.size ? `?${sp}` : ""}#results`;
  };

  const stats = [
    { v: settings.statBusinesses, l: "Verified Businesses", icon: <CatIcon name="building" className="h-7 w-7" /> },
    { v: settings.statCategories, l: "Service Categories", icon: <LayoutGrid className="h-7 w-7" /> },
    { v: settings.statEnquiries, l: "Customer Enquiries", icon: <UsersRound className="h-7 w-7" /> },
    { v: settings.statRating, l: "Average Rating", icon: <Star className="h-7 w-7 fill-[#f5a623] text-[#f5a623]" /> },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Business Services",
          numberOfItems: total,
          itemListElement: items.map((b, i) => ({ "@type": "ListItem", position: (page - 1) * SERVICE_PAGE_SIZE + i + 1, url: `${site.url}/business-services/${b.slug}`, name: b.name })),
        }}
      />
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef6f0] to-white">
        <div className="absolute inset-y-0 right-0 hidden w-[62%] md:block">
          <Image src="/images/svc/hero-business.jpg" alt="" fill priority sizes="62vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f1f8f3] via-[#f1f8f3]/40 to-transparent" />
        </div>
        <div className="container-dash relative grid gap-6 py-8 lg:py-10 xl:grid-cols-[1fr_250px]">
          <div className="max-w-[1000px]">
            <Crumbs items={[{ name: "Business Services" }]} />
            <h1 className="mt-3 font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[44px]">
              Find Trusted Local Businesses
              <span className="block text-[22px] text-brand sm:text-[32px]">for Your Home, Land &amp; Construction Needs</span>
            </h1>
            <p className="mt-3 text-[15.5px] text-ink sm:text-[17px]">Verified suppliers, contractors and service providers across Maharashtra.</p>
            <div className="mt-5">
              <BizSearch q={qs} popular={settings.popularSearches} />
            </div>
          </div>
          <ul className="hidden h-fit space-y-4 self-center rounded-2xl bg-white/95 p-5 shadow-soft xl:block">
            {stats.map((s) => (
              <li key={s.l} className="flex items-center gap-3">
                <span className="text-brand">{s.icon}</span>
                <span>
                  <b className="block text-[18px] leading-tight text-ink">{s.v}</b>
                  <span className="text-[13px] text-body">{s.l}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* categories */}
      <section aria-labelledby="explore-h" className="container-dash mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="explore-h" className="text-[24px] font-bold tracking-[-0.01em] text-ink sm:text-[26px]">
              Explore Business Services
            </h2>
            <p className="text-[15px] text-body">Choose a category to find verified service providers near you.</p>
          </div>
          <Link href="/business-services#results" className="flex items-center gap-1.5 text-[15px] font-semibold text-brand">
            View All Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cats.map((c, i) => (
            <li key={c.id}>
              <Link
                href={`/business-services?category=${c.id}#results`}
                className={`grid h-full grid-cols-[150px_1fr] gap-3 rounded-2xl border bg-white p-2 shadow-card transition hover:shadow-soft sm:grid-cols-[180px_auto_1fr] ${q.category === c.id ? "border-brand ring-2 ring-brand/20" : "border-line"}`}
              >
                <span className="relative block h-[100px] overflow-hidden rounded-xl">
                  <Img src={c.image} alt="" fill sizes="180px" className="object-cover" />
                </span>
                <span className="hidden pt-3 text-brand sm:block">
                  <CatIcon name={c.icon} className="h-9 w-9" />
                </span>
                <span className="py-2">
                  <b className="block text-[15px] leading-snug text-ink">
                    {i + 1}. {c.name}
                  </b>
                  <span className="mt-1 block text-[13px] leading-snug text-body">{c.description}</span>
                  <span className="mt-1.5 flex items-center gap-1 text-[13px] font-semibold text-brand">
                    View Services <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* results */}
      <div id="results" className="container-dash mt-8 grid scroll-mt-24 gap-6 pb-20 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
        <aside>
          <BizFilters q={qs} subs={subs} />
        </aside>
        <section aria-label="Search results" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-bold text-ink">
              {total.toLocaleString("en-IN")} Business{total === 1 ? "" : "es"} Found in {where}
              {q.category && <span className="font-medium text-body"> • {categoryById(db, q.category)?.short}</span>}
            </h2>
            <SortBy
              q={qs}
              options={[
                { v: "", l: "Most Relevant" },
                { v: "rating", l: "Highest Rated" },
                { v: "reviews", l: "Most Reviewed" },
                { v: "newest", l: "Newest" },
              ]}
            />
          </div>
          {q.q && (
            <p className="mt-2 text-[13.5px] text-body">
              Showing results for <b className="text-ink">“{q.q}”</b>.{" "}
              <Link href={hrefFor(1, "q")} className="link">
                Clear search
              </Link>
            </p>
          )}
          <div className="mt-4 space-y-4">
            {items.map((b) => (
              <BusinessCard key={b.id} b={b} saved={saved.has(b.id)} />
            ))}
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-12 text-center">
                <SearchX className="mx-auto h-10 w-10 text-muted" />
                <p className="mt-3 text-[17px] font-semibold text-ink">No businesses match your search</p>
                <p className="mt-1 text-[14px] text-body">Try another category or district, or post your requirement and providers will contact you.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link href="/business-services#results" className="btn btn-outline h-10 px-6 text-[14px]">
                    View all businesses
                  </Link>
                  <Link href="/post-requirement?type=service" className="btn btn-primary h-10 px-6 text-[14px]">
                    Post Requirement
                  </Link>
                </div>
              </div>
            )}
          </div>
          {total > 0 && <Pagination page={page} pages={pages} total={total} pageSize={SERVICE_PAGE_SIZE} hrefFor={hrefFor} />}
        </section>
        <aside className="space-y-5 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 xl:col-span-1 xl:block xl:space-y-5">
          <section className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-ink">View on Map</h2>
              <span className="text-[12px] text-muted">{where}</span>
            </div>
            <MapEmbed query={`${q.taluka ? q.taluka + ", " : ""}${q.district || "Pune"}, Maharashtra`} className="h-[230px]" zoom={q.taluka ? 12 : 10} />
          </section>
          <section className="rounded-2xl border border-[#cfe8d6] bg-gradient-to-b from-[#f2faf4] to-[#e3f3e8] p-5">
            <h2 className="flex items-center gap-2 text-[20px] font-bold leading-tight text-brand">
              <Crown className="h-7 w-7 shrink-0 fill-[#f5a623] text-[#f5a623]" /> List Your Business on {site.name}
            </h2>
            <p className="mt-2 text-[14px] text-body">Get more enquiries, verified customers and grow your business.</p>
            <p className="mt-3 text-[28px] font-extrabold text-ink">
              ₹{settings.premiumPrice.toLocaleString("en-IN")} <span className="text-[20px]">/ month</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] text-body">Premium Listing Package</span>
              <Link href="/list-business" className="btn btn-primary h-10 px-4 text-[13.5px]">
                List Your Business <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-3 text-[12px] text-muted">Free basic listing also available.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
