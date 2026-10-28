import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { site } from "@/lib/config";
import { isoToIstInput, postState, postUrl } from "@/lib/blog";
import { PageTitle } from "@/components/admin/Bits";
import { PostForm } from "@/components/admin/PostForm";

export const metadata = { title: "Edit Article" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

const SAVED: Record<string, string> = { publish: "Published.", draft: "Draft saved.", unpublish: "Unpublished – the article is a private draft again." };

export default async function EditPost({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  const db = await readDB();
  const p = db.posts.find((x) => x.id === id);
  if (!p) notFound();
  const state = postState(p);
  return (
    <>
      <PageTitle title="Edit Article" sub={`/blog/${p.slug}`}>
        <Link href="/admin/blog" className="btn btn-ghost h-11 px-4 text-[14.5px]">
          All articles
        </Link>
      </PageTitle>
      {saved && (
        <p role="status" className="mb-4 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-2.5 text-[14px] text-[#166534]">
          {SAVED[saved] ?? "Saved."}{" "}
          {state === "published" && (
            <Link href={postUrl(p)} target="_blank" className="font-semibold underline">
              View live article
            </Link>
          )}
          {state === "scheduled" && "It will go live at the scheduled time."}
        </p>
      )}
      <PostForm
        initial={{
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          content: p.content,
          categoryId: p.categoryId,
          tags: p.tags,
          authorName: p.authorName,
          publishedAt: isoToIstInput(p.publishedAt),
          coverImage: p.coverImage,
          coverAlt: p.coverAlt,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          canonicalUrl: p.canonicalUrl,
          ogImage: p.ogImage,
          noindex: p.noindex,
          related: p.related,
          state,
        }}
        categories={db.blogCategories}
        others={db.posts.filter((x) => x.id !== p.id).map((x) => ({ slug: x.slug, title: x.title }))}
        siteUrl={site.url}
      />
    </>
  );
}
