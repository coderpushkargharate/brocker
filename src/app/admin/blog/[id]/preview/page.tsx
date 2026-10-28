import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { postState, relatedPosts } from "@/lib/blog";
import { ArticleView } from "@/components/blog/BlogParts";

export const metadata = { title: "Preview Article", robots: { index: false, follow: false } };

// Admin-only (protected by middleware and the admin layout). Drafts are never reachable from /blog.
export default async function PreviewPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDB();
  const p = db.posts.find((x) => x.id === id);
  if (!p) notFound();
  const state = postState(p);
  return (
    <div className="-m-4 bg-white sm:-m-6 lg:-m-8">
      <ArticleView
        post={p}
        category={db.blogCategories.find((c) => c.id === p.categoryId)}
        related={relatedPosts(db, p)}
        preview={
          <div role="status" className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-2 bg-[#fef3c7] px-4 py-2.5 text-[13.5px] text-[#92400e] lg:top-0">
            <span>
              Preview – this article is <b className="capitalize">{state}</b>
              {state !== "published" && " and not visible to the public"}.
            </span>
            <Link href={`/admin/blog/${p.id}/edit`} className="font-semibold underline">
              Back to editor
            </Link>
          </div>
        }
      />
    </div>
  );
}
