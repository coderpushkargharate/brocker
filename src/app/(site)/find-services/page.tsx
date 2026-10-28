import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, Heart, House, LayoutGrid, Plus, SearchX, UserRound } from "lucide-react";
import { readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { businessHaystack, categoriesOf, publicBusinesses, publicWorkers, workerHaystack } from "@/lib/services";
import { Img } from "@/components/Img";
import { ProviderRow } from "@/components/services/Cards";
import { HubChips, HubLocation, HubSearch } from "@/components/services/HubControls";
import type { Business, Worker } from "@/lib/types";

export const metadata: Metadata = {
  title: "Find Services Near You – Suppliers, Contractors, JCB, Labour",
  description: "Verified suppliers, contractors, JCB, borewell, garden, home services and labour for your home, land and projects. Call or WhatsApp directly.",
  alternates: { canonical: "/find-services" },
};

type Q = { q?: string; district?: string; taluka?: string; cat?: string; verified?: string; today?: string; sort?: string; saved?: string };
type Props = { searchParams: Promise<Q> };

const words = (s: string) => s.toLowerCase().split(/\s+/).filter(Boolean);

export default async function FindServicesPage({ searchParams }: Props) {
  const q = await searchParams;
  const db = await readDB();
  const user = await getCurrentUser();
  const saved = new Set(user?.savedServices ?? []);
  const biz = categoriesOf(db, "business");
  const lab = categoriesOf(db, "labour");
  const byShort = (id: string) => biz.find((c) => c.id === id);

  // tiles in the same order as the design
  const tiles = [
    byShort("building-material") && { href: "/business-services?category=building-material#results", label: "Building Materials", image: byShort("building-material")!.image },
    byShort("contractor-architect") && { href: "/business-services?category=contractor-architect#results", label: "Contractor & Architect", image: byShort("contractor-architect")!.image },
    byShort("jcb-machinery") && { href: "/business-services?category=jcb-machinery#results", label: "JCB & Machinery", image: byShort("jcb-machinery")!.image },
    { href: "/labour", label: "Labour & Workforce", image: "/images/svc/cat-labour.jpg" },
    byShort("borewell-water") && { href: "/business-services?category=borewell-water#results", label: "Borewell & Water Services", image: byShort("borewell-water")!.image },
    byShort("home-services") && { href: "/business-services?category=home-services#results", label: "Home Services", image: byShort("home-services")!.image },
    byShort("garden-space") && { href: "/business-services?category=garden-space#results", label: "Garden & Landscaping", image: byShort("garden-space")!.image },
    // categories added later by the admin
    ...biz.filter((c) => !["building-material", "contractor-architect", "jcb-machinery", "borewell-water", "home-services", "garden-space"].includes(c.id)).map((c) => ({ href: `/business-services?category=${c.id}#results`, label: c.short, image: c.image })),
  ].filter(Boolean) as { href: string; label: string; image: string }[];

  type Row = { kind: "business" | "worker"; item: Business | Worker };
  let rows: Row[] = [
    ...publicBusinesses(db).map((item) => ({ kind: "business" as const, item })),
    ...publicWorkers(db).map((item) => ({ kind: "worker" as const, item })),
  ];
  if (q.saved === "1") rows = rows.filter((r) => saved.has(r.item.id));
  if (q.district) rows = rows.filter((r) => r.item.district === q.district);
  if (q.taluka) rows = rows.filter((r) => r.item.taluka === q.taluka);
  if (q.verified === "1") rows = rows.filter((r) => r.item.verified);
  if (q.today === "1") rows = rows.filter((r) => (r.kind === "worker" ? (r.item as Worker).availableToday : /available|stock|open/i.test((r.item as Business).availability ?? "")));
  if (q.cat === "labour") rows = rows.filter((r) => r.kind === "worker");
  else if (q.cat) rows = rows.filter((r) => (r.item as Business | Worker).categoryId === q.cat);
  if (q.q) {
    const ws = words(q.q);
    rows = rows.filter((r) => {
      const hay = (r.kind === "worker" ? workerHaystack(r.item as Worker, db) : businessHaystack(r.item as Business, db)).join(" ").toLowerCase();
      return ws.every((w) => hay.includes(w.replace(/s$/, "")));
    });
  }
  const price = (r: Row) => (r.kind === "worker" ? (r.item as Worker).wageMin : Number(((r.item as Business).priceLabel ?? "").replace(/[^\d]/g, "")) || Infinity);
  rows.sort(q.sort === "price" ? (a, b) => price(a) - price(b) : (a, b) => +b.item.verified - +a.item.verified || b.item.rating * Math.log(b.item.reviewCount + 2) - a.item.rating * Math.log(a.item.reviewCount + 2));
  const shown = rows.slice(0, 20);
  const where = q.taluka ? `${q.taluka}, ${q.district}` : q.district;

  return (
    <div className="lg:pb-16">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf4ec] to-white">
        <div className="absolute inset-y-0 right-0 hidden w-[50%] md:block">
          <Image src="/images/svc/hero-business.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#edf6ef] via-[#edf6ef]/40 to-transparent" />
        </div>
        <div className="container-x relative py-6 sm:py-8">
          <HubLocation q={q} />
          <h1 className="mt-4 font-display text-[34px] font-extrabold leading-[1.02] tracking-[-0.02em] text-ink sm:text-[48px]">
            Find the right service
            <span className="block text-brand">near you</span>
          </h1>
          <p className="mt-2 max-w-[520px] text-[15.5px] text-ink sm:text-[17px]">Verified suppliers, contractors, labour and service providers for your home, land and projects.</p>
          <div className="mt-5 max-w-[880px]">
            <HubSearch q={q} />
          </div>
        </div>
      </section>

      <section id="categories" aria-label="Categories" className="container-x mt-6 scroll-mt-24">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="block overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-card hover:shadow-soft">
                <span className="relative block aspect-[16/7] overflow-hidden rounded-xl">
                  <Img src={t.image} alt="" fill sizes="(max-width:640px) 50vw, 280px" className="object-cover" />
                </span>
                <span className="flex items-center justify-between gap-2 px-2 py-2.5">
                  <b className="text-[15px] leading-tight text-ink sm:text-[16px]">{t.label}</b>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/post-requirement" className="flex h-full flex-col justify-between rounded-2xl border border-[#cfe8d6] bg-mint-50 p-4 hover:shadow-soft">
              <span className="flex min-w-0 gap-3">
                <ClipboardList className="h-9 w-9 shrink-0 text-brand" />
                <span>
                  <b className="block text-[15px] leading-tight text-ink [overflow-wrap:anywhere] sm:text-[17px]">Post Your Requirement</b>
                  <span className="mt-1 block text-[13px] text-body">Get multiple quotes from verified providers</span>
                </span>
              </span>
              <span className="mt-3 flex h-8 w-8 items-center justify-center self-end rounded-full border border-line bg-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section id="providers" aria-labelledby="pop-h" className="container-x mt-8 scroll-mt-24">
        <div className="flex items-end justify-between gap-3">
          <h2 id="pop-h" className="text-[24px] font-bold tracking-[-0.01em] text-ink sm:text-[28px]">
            {q.saved === "1" ? "Your Saved Providers" : `Popular Service Providers ${where ? `in ${where}` : "Near You"}`}
          </h2>
          <Link href="/business-services#results" className="flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-brand">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4">
          <HubChips q={q} categories={[...biz.map((c) => ({ v: c.id, l: c.short })), { v: "labour", l: "Labour & Workforce" }, ...lab.map((c) => ({ v: c.id, l: `Labour – ${c.short}` }))]} />
        </div>
        <div className="mt-4 space-y-3">
          {shown.map((r) => (
            <ProviderRow key={r.item.id} kind={r.kind} item={r.item} saved={saved.has(r.item.id)} />
          ))}
          {shown.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-10 text-center">
              <SearchX className="mx-auto h-10 w-10 text-muted" />
              <p className="mt-3 text-[17px] font-semibold text-ink">{q.saved === "1" ? (user ? "You have not saved any providers yet" : "Log in to see your saved providers") : "No providers match your search"}</p>
              <Link href={q.saved === "1" && !user ? "/login?next=/find-services?saved=1" : "/post-requirement"} className="btn btn-primary mt-5 h-10 px-6 text-[14px]">
                {q.saved === "1" && !user ? "Log in" : "Post Your Requirement"}
              </Link>
            </div>
          )}
        </div>
        {rows.length > shown.length && (
          <p className="mt-4 text-center text-[14px] text-body">
            Showing {shown.length} of {rows.length}.{" "}
            <Link href="/business-services#results" className="link">
              Browse businesses
            </Link>{" "}
            or{" "}
            <Link href="/labour#results" className="link">
              browse workers
            </Link>
            .
          </p>
        )}
      </section>

      {/* app-style bottom bar on phones */}
      <nav aria-label="Quick links" className="sticky bottom-0 z-30 mt-10 grid grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {[
          { href: "/", label: "Home", I: House },
          { href: "/find-services#categories", label: "Categories", I: LayoutGrid },
          { href: "/post-requirement", label: "Post Requirement", I: Plus, big: true },
          { href: "/find-services?saved=1#providers", label: "Saved", I: Heart },
          { href: user ? (user.role === "admin" ? "/admin" : "/dashboard/profile") : "/login", label: "Profile", I: UserRound },
        ].map(({ href, label, I, big }) => (
          <Link key={label} href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${label === "Saved" && q.saved === "1" ? "text-brand" : "text-ink"}`}>
            {big ? (
              <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-soft">
                <I className="h-6 w-6" />
              </span>
            ) : (
              <I className="h-5 w-5" />
            )}
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
