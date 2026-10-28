import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { BLOG_PAGE_SIZE, livePosts } from "@/lib/blog";
import { BlogListing } from "@/components/blog/BlogListing";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const db = await readDB();
  const cat = db.blogCategories.find((c) => c.id === slug);
  if (!cat) return { title: "Category not found", robots: { index: false } };
  const count = livePosts(db).filter((p) => p.categoryId === cat.id).length;
  return {
    title: `${cat.name} – Articles & Guides${page > 1 ? ` (Page ${page})` : ""}`,
    description: cat.description || `Articles about ${cat.name.toLowerCase()} from the AgriLand blog.`,
    alternates: { canonical: `/blog/category/${cat.id}${page > 1 ? `?page=${page}` : ""}` },
    // a category with no published articles is an empty page: keep it out of search results
    robots: count === 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const db = await readDB();
  const cat = db.blogCategories.find((c) => c.id === slug);
  if (!cat) notFound();
  const all = livePosts(db);
  const list = all.filter((p) => p.categoryId === cat.id);
  const pages = Math.max(1, Math.ceil(list.length / BLOG_PAGE_SIZE));
  if (page > pages) notFound();
  return (
    <BlogListing
      title={cat.name}
      sub={cat.description || `Articles about ${cat.name.toLowerCase()}.`}
      crumbs={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: cat.name }]}
      items={list.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE)}
      categories={db.blogCategories}
      chips={db.blogCategories.filter((c) => all.some((p) => p.categoryId === c.id))}
      activeChip={cat.id}
      page={page}
      pages={pages}
      total={list.length}
      hrefFor={(p) => `/blog/category/${cat.id}${p > 1 ? `?page=${p}` : ""}`}
      listUrl={`/blog/category/${cat.id}`}
    />
  );
}
