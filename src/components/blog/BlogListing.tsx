import Link from "next/link";
import { site } from "@/lib/config";
import { postUrl } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { Crumbs, PostCard } from "@/components/blog/BlogParts";
import { Pagination } from "@/components/buy/Pagination";
import type { BlogCategory, BlogPost } from "@/lib/types";

export function BlogListing(p: {
  title: string;
  sub: string;
  crumbs: { name: string; href?: string }[];
  items: BlogPost[];
  categories: BlogCategory[];
  chips: BlogCategory[];
  activeChip?: string;
  page: number;
  pages: number;
  total: number;
  hrefFor: (p: number) => string;
  listUrl: string;
}) {
  const cat = (id?: string) => p.categories.find((c) => c.id === id);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Blog",
              "@id": `${site.url}/blog#blog`,
              name: `${site.name} Blog`,
              url: `${site.url}/blog`,
              publisher: { "@id": `${site.url}/#org` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: p.crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.href ? site.url + (c.href === "/" ? "" : c.href) : site.url + p.listUrl })),
            },
            ...(p.items.length
              ? [{ "@type": "ItemList", itemListElement: p.items.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: site.url + postUrl(x), name: x.title })) }]
              : []),
          ],
        }}
      />
      <section className="bg-gradient-to-b from-mint-50 to-white">
        <div className="container-x pb-8 pt-8 lg:pt-12">
          <Crumbs items={p.crumbs} />
          <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-[-0.01em] text-ink sm:text-[42px]">{p.title}</h1>
          <p className="mt-3 max-w-[640px] text-[16.5px] leading-relaxed text-body">{p.sub}</p>
          {p.chips.length > 0 && (
            <nav aria-label="Blog categories" className="mt-6 flex flex-wrap gap-2">
              <Link href="/blog" className={`inline-flex min-h-10 items-center rounded-full px-4 text-[14px] font-medium ${!p.activeChip ? "bg-brand text-white" : "border border-line bg-white text-ink hover:border-brand"}`}>
                All articles
              </Link>
              {p.chips.map((c) => (
                <Link key={c.id} href={`/blog/category/${c.id}`} aria-current={p.activeChip === c.id ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-full px-4 text-[14px] font-medium ${p.activeChip === c.id ? "bg-brand text-white" : "border border-line bg-white text-ink hover:border-brand"}`}>
                  {c.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>
      <div className="container-x pb-20 pt-4">
        {p.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-mint-50 px-6 py-16 text-center">
            <h2 className="text-[20px] font-bold text-ink">No articles published yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-body">New guides on buying and selling agricultural land are on the way. Meanwhile, browse land for sale or read our FAQs.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/buy-land" className="btn btn-primary h-11 px-5">
                Browse land
              </Link>
              <Link href="/faq" className="btn btn-ghost h-11 px-5">
                Read FAQs
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {p.items.map((x, i) => (
                <PostCard key={x.id} post={x} category={cat(x.categoryId)} priority={i < 3} />
              ))}
            </div>
            {p.pages > 1 && <Pagination page={p.page} pages={p.pages} total={p.total} pageSize={9} hrefFor={p.hrefFor} noun="articles" />}
          </>
        )}
      </div>
    </>
  );
}
