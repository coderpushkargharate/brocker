import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { BLOG_PAGE_SIZE, livePosts, tagSlug } from "@/lib/blog";
import { BlogListing } from "@/components/blog/BlogListing";

type Props = { params: Promise<{ tag: string }>; searchParams: Promise<{ page?: string }> };

const decode = (t: string) => {
  try {
    return decodeURIComponent(t).toLowerCase();
  } catch {
    return "";
  }
};

// Tag pages help visitors browse but overlap heavily with categories, so they are noindex (still followed).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = decode((await params).tag);
  return { title: `Articles tagged “${tag}”`, description: `AgriLand blog articles about ${tag}.`, robots: { index: false, follow: true }, alternates: { canonical: `/blog/tag/${tagSlug(tag)}` } };
}

export default async function BlogTagPage({ params, searchParams }: Props) {
  const tag = decode((await params).tag);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const db = await readDB();
  const list = livePosts(db).filter((p) => p.tags.includes(tag));
  if (!list.length) notFound();
  const pages = Math.max(1, Math.ceil(list.length / BLOG_PAGE_SIZE));
  if (page > pages) notFound();
  return (
    <BlogListing
      title={`Tagged: ${tag}`}
      sub={`${list.length} article${list.length === 1 ? "" : "s"} about ${tag}.`}
      crumbs={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: `#${tag}` }]}
      items={list.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE)}
      categories={db.blogCategories}
      chips={[]}
      page={page}
      pages={pages}
      total={list.length}
      hrefFor={(p) => `/blog/tag/${tagSlug(tag)}${p > 1 ? `?page=${p}` : ""}`}
      listUrl={`/blog/tag/${tagSlug(tag)}`}
    />
  );
}
