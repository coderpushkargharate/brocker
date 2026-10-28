import Link from "next/link";
import { Trash2 } from "lucide-react";
import { readDB } from "@/lib/db";
import { deleteBlogCategoryAction } from "@/app/actions/blog";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { BlogCategoryForm } from "@/components/admin/BlogCategoryForm";

export const metadata = { title: "Blog Categories" };

export default async function BlogCategories() {
  const db = await readDB();
  return (
    <>
      <PageTitle title="Blog Categories" sub="Each category gets its own page at /blog/category/…">
        <Link href="/admin/blog" className="btn btn-ghost h-11 px-4 text-[14.5px]">
          All articles
        </Link>
      </PageTitle>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {db.blogCategories.length === 0 && <Box className="text-center text-[14.5px] text-muted">No categories yet. Add one to group related articles.</Box>}
          {db.blogCategories.map((c) => {
            const n = db.posts.filter((p) => p.categoryId === c.id).length;
            return (
              <Box key={c.id} className="!p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-[200px] flex-1">
                    <p className="text-[15.5px] font-semibold text-ink">{c.name}</p>
                    <p className="text-[12.5px] text-muted">
                      /blog/category/{c.id} · {n} article{n === 1 ? "" : "s"}
                    </p>
                    {c.description && <p className="mt-1 text-[13.5px] text-body">{c.description}</p>}
                  </div>
                  <details className="w-full sm:w-auto">
                    <summary className="btn btn-ghost h-8 cursor-pointer px-3 text-[12.5px]">Edit</summary>
                    <div className="mt-3 sm:w-[320px]">
                      <BlogCategoryForm category={c} />
                    </div>
                  </details>
                  <form action={deleteBlogCategoryAction.bind(null, c.id)}>
                    <ConfirmButton message={`Delete category “${c.name}”? Its ${n} article(s) will become uncategorised.`} className="btn btn-ghost h-8 px-3 text-[12.5px] text-[#dc2626]">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </ConfirmButton>
                  </form>
                </div>
              </Box>
            );
          })}
        </div>
        <Box>
          <h2 className="mb-4 text-[16px] font-semibold text-ink">Add category</h2>
          <BlogCategoryForm />
        </Box>
      </div>
    </>
  );
}
