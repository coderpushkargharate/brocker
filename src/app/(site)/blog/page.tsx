import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { BLOG_PAGE_SIZE, livePosts } from "@/lib/blog";
import { BlogListing } from "@/components/blog/BlogListing";

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  return {
    title: page > 1 ? `Blog – Page ${page}` : "Blog – Agricultural Land Guides & Advice",
    description: "Practical guides on buying and selling agricultural land in Maharashtra: 7/12 extracts, land documents, NA conversion, pricing and farm development.",
    alternates: { canonical: page > 1 ? `/blog?page=${page}` : "/blog" },
  };
}

export default async function BlogIndex({ searchParams }: Props) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const db = await readDB();
  const all = livePosts(db);
  const pages = Math.max(1, Math.ceil(all.length / BLOG_PAGE_SIZE));
  if (page > pages) notFound();
  const items = all.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
  const usedCats = db.blogCategories.filter((c) => all.some((p) => p.categoryId === c.id));
  return (
    <BlogListing
      title="AgriLand Blog"
      sub="Guides on land documents, pricing, buying and selling agricultural land in Maharashtra."
      crumbs={[{ name: "Home", href: "/" }, { name: "Blog" }]}
      items={items}
      categories={db.blogCategories}
      chips={usedCats}
      page={page}
      pages={pages}
      total={all.length}
      hrefFor={(p) => (p > 1 ? `/blog?page=${p}` : "/blog")}
      listUrl="/blog"
    />
  );
}

