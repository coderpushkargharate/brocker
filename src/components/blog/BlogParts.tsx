import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Clock, Tag } from "lucide-react";
import { Img } from "@/components/Img";
import { fmtDate, postUrl, tagSlug } from "@/lib/blog";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import type { BlogCategory, BlogPost } from "@/lib/types";

export function PostCard({ post, category, priority = false }: { post: BlogPost; category?: BlogCategory; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-soft motion-reduce:transform-none">
      <Link href={postUrl(post)} className="relative block aspect-[16/9] overflow-hidden bg-mint" tabIndex={-1} aria-hidden="true">
        {post.coverImage ? (
          <Img src={post.coverImage} alt="" fill priority={priority} sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 400px" className="object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none" />
        ) : (
          <span className="absolute inset-0 bg-gradient-to-br from-mint to-[#cfe8d6]" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
          {category && (
            <Link href={`/blog/category/${category.id}`} className="font-semibold uppercase tracking-wide text-brand hover:underline">
              {category.name}
            </Link>
          )}
          <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt)}</time>
          <span>{readingMinutes(post.content)} min read</span>
        </p>
        <h3 className="mt-2 font-display text-[19px] font-bold leading-snug text-ink">
          <Link href={postUrl(post)} className="hover:text-brand">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-body">{post.excerpt}</p>
        <Link href={postUrl(post)} className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 text-[14px] font-semibold text-brand" aria-label={`Read: ${post.title}`}>
          Read article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {c.href ? (
            <Link href={c.href} className="hover:text-brand">
              {c.name}
            </Link>
          ) : (
            <span className="text-ink" aria-current="page">
              {c.name}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** The full article. Shared by the public page and the admin preview so both look identical. */
export function ArticleView({ post, category, related, preview }: { post: BlogPost; category?: BlogCategory; related: BlogPost[]; preview?: React.ReactNode }) {
  const { html, headings } = renderMarkdown(post.content);
  const toc = headings.filter((h) => h.level === 2);
  return (
    <article className="pb-16">
      {preview}
      <header className="bg-gradient-to-b from-mint-50 to-white">
        <div className="container-x max-w-[900px] pb-8 pt-8 lg:pt-12">
          <Crumbs items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, ...(category ? [{ name: category.name, href: `/blog/category/${category.id}` }] : []), { name: post.title }]} />
          <h1 className="mt-4 font-display text-[30px] font-bold leading-[1.15] tracking-[-0.015em] text-ink sm:text-[40px]">{post.title}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-body">{post.excerpt}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-muted">
            <span className="font-semibold text-ink">By {post.authorName}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> <time dateTime={post.publishedAt}>{fmtDate(post.publishedAt) || "Not published"}</time>
            </span>
            {post.updatedAt && post.publishedAt && +new Date(post.updatedAt) - +new Date(post.publishedAt) > 86400_000 && (
              <span>
                Updated <time dateTime={post.updatedAt}>{fmtDate(post.updatedAt)}</time>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {readingMinutes(post.content)} min read
            </span>
          </p>
        </div>
      </header>
      {post.coverImage && (
        <div className="container-x max-w-[1000px]">
          <figure className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-mint">
            <Img src={post.coverImage} alt={post.coverAlt || ""} fill priority sizes="(max-width:1000px) 100vw, 1000px" className="object-cover" />
          </figure>
        </div>
      )}
      <div className="container-x mt-10 grid max-w-[1000px] gap-10 lg:grid-cols-[1fr_220px]">
        <div className="prose-agri min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
        {toc.length > 1 && (
          <aside className="order-first lg:order-none">
            <nav aria-label="On this page" className="rounded-xl border border-line bg-mint-50 p-4 lg:sticky lg:top-28">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-brand">On this page</p>
              <ul className="mt-2 space-y-1.5 text-[14px]">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-body hover:text-brand">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>
      <div className="container-x max-w-[1000px]">
        {post.tags.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((t) => (
              <li key={t}>
                <Link href={`/blog/tag/${tagSlug(t)}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[13px] text-body hover:border-brand hover:text-brand">
                  <Tag className="h-3.5 w-3.5" /> {t}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <aside className="mt-10 flex flex-col gap-4 rounded-2xl bg-forest p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-[21px] font-bold">Looking for agricultural land?</p>
            <p className="mt-1 text-[14.5px] text-white/80">Browse listings with document checks, or list your land for free.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/buy-land" className="btn btn-primary h-11 px-5">
              Browse land
            </Link>
            <Link href="/sell-land" className="btn h-11 border border-white/40 px-5 text-white hover:bg-white/10">
              Sell your land
            </Link>
          </div>
        </aside>
        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-14">
            <h2 id="related-title" className="font-display text-[24px] font-bold text-ink">
              Related articles
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
