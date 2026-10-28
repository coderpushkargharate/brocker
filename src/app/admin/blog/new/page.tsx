import { readDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { site } from "@/lib/config";
import { PageTitle } from "@/components/admin/Bits";
import { PostForm } from "@/components/admin/PostForm";

export const metadata = { title: "New Article" };

export default async function NewPost() {
  const me = await requireUser(["admin"], "/admin/blog/new");
  const db = await readDB();
  return (
    <>
      <PageTitle title="New Article" sub="Drafts are private. Publish when the article is ready." />
      <PostForm
        initial={{ title: "", slug: "", excerpt: "", content: "", tags: [], authorName: me.name, publishedAt: "", related: [], state: "new" }}
        categories={db.blogCategories}
        others={db.posts.map((p) => ({ slug: p.slug, title: p.title }))}
        siteUrl={site.url}
      />
    </>
  );
}
