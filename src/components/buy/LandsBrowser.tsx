import Image from "next/image";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { SearchBar } from "../SearchBar";
import { ServicesPromo } from "../ServicesPromo";
import { JsonLd } from "../JsonLd";
import { Filters, SortSelect } from "./Filters";
import { ListLandCard } from "./ListLandCard";
import { Pagination } from "./Pagination";
import { getCurrentUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { PAGE_SIZE, searchLands, type LandQuery } from "@/lib/lands";
import { toPublic } from "@/lib/auth";
import { site } from "@/lib/config";

export async function LandsBrowser({ q, basePath, title, subtitle }: { q: LandQuery; basePath: string; title: string; subtitle: string }) {
  const user = await getCurrentUser();
  const { items, total, page, pages } = searchLands(q);
  const db = readDB();
  const saved = new Set(user?.saved ?? []);
  const interested = new Set(user ? db.interests.filter((i) => i.investorId === user.id).map((i) => i.landId) : []);
  const qs = q as Record<string, string | undefined>;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(qs)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    return `${basePath}${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: title,
          numberOfItems: total,
          itemListElement: items.map((l, i) => ({ "@type": "ListItem", position: (page - 1) * PAGE_SIZE + i + 1, url: `${site.url}/lands/${l.slug}`, name: l.title })),
        }}
      />
      <section className="relative">
        <div className="relative h-[300px] overflow-hidden lg:h-[280px]">
          <Image src="/images/find-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-white/10" />
          <div className="container-dash relative pt-12 lg:pt-14">
            <h1 className="text-[30px] font-bold tracking-[-0.01em] text-ink sm:text-[34px]">{title}</h1>
            <span className="mt-2 block h-1 w-12 rounded bg-brand" />
            <p className="mt-6 text-[16px] text-body sm:text-[17px]">{subtitle}</p>
          </div>
        </div>
        <div className="container-dash relative z-10 -mt-[72px]">
          <SearchBar defaults={{ district: q.district ?? "", taluka: q.taluka ?? "", type: q.type ?? "", budget: q.budget ?? "" }} />
        </div>
      </section>

      <div className="container-dash mt-8 grid gap-8 pb-20 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <Filters q={qs} />
          <div className="hidden lg:block">
            <ServicesPromo variant="tall" />
          </div>
        </aside>

        <section aria-label="Search results">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[19px] text-ink">
              <span className="mr-2 text-[24px] font-bold text-leaf">{total}</span>
              Agricultural Lands Found
            </p>
            <SortSelect q={qs} />
          </div>
          <div className="mt-4 space-y-6">
            {items.map((l) => {
              const o = db.users.find((u) => u.id === l.ownerId);
              return <ListLandCard key={l.id} land={l} owner={o ? toPublic(o) : undefined} saved={saved.has(l.id)} interested={interested.has(l.id)} />;
            })}
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-12 text-center">
                <SearchX className="mx-auto h-10 w-10 text-muted" />
                <p className="mt-3 text-[17px] font-semibold text-ink">No lands match your filters</p>
                <p className="mt-1 text-[14px] text-body">Try widening your budget or area range, or choose another district.</p>
                <Link href="/buy-land" className="btn btn-primary mt-5 h-10 px-6 text-[14px]">
                  View all lands
                </Link>
              </div>
            )}
          </div>
          {total > 0 && <Pagination page={page} pages={pages} total={total} pageSize={PAGE_SIZE} hrefFor={hrefFor} />}
          <div className="mt-8 lg:hidden">
            <ServicesPromo variant="tall" />
          </div>
        </section>
      </div>
    </>
  );
}
