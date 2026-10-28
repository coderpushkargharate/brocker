import Link from "next/link";
import { Eye, ExternalLink, Pencil, Plus, Send, Tags, Trash2, Undo2 } from "lucide-react";
import { readDB } from "@/lib/db";
import { fmtDate, postState, postUrl } from "@/lib/blog";
import { timeAgo } from "@/lib/format";
import { deletePostAction, setPostStatusAction } from "@/app/actions/blog";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { Pagination } from "@/components/buy/Pagination";

export const metadata = { title: "Blog" };

const PAGE = 20;
const CHIP = { draft: "bg-[#f3f4f6] text-[#374151]", scheduled: "bg-[#dbeafe] text-[#1e40af]", published: "bg-[#dcfce7] text-[#166534]" };

type Props = { searchParams: Promise<{ status?: string; category?: string; q?: string; sort?: string; page?: string }> };

export default async function AdminBlog({ searchParams }: Props) {
  const sp = await searchParams;
  const db = await readDB();
  let list = db.posts.map((p) => ({ p, state: postState(p) }));
  const count = (s?: string) => list.filter((x) => !s || x.state === s).length;
  if (sp.status) list = list.filter((x) => x.state === sp.status);
  if (sp.category) list = list.filter((x) => x.p.categoryId === sp.category);
  if (sp.q) {
    const t = sp.q.toLowerCase();
    list = list.filter(({ p }) => [p.title, p.slug, p.excerpt, p.tags.join(" "), p.authorName].some((v) => v.toLowerCase().includes(t)));
  }
  const sort = sp.sort ?? "updated";
  list.sort((a, b) =>
    sort === "title" ? a.p.title.localeCompare(b.p.title) : sort === "published" ? +new Date(b.p.publishedAt ?? 0) - +new Date(a.p.publishedAt ?? 0) : +new Date(b.p.updatedAt) - +new Date(a.p.updatedAt),
  );
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const page = Math.min(pages, Math.max(1, Number(sp.page) || 1));
  const shown = list.slice((page - 1) * PAGE, page * PAGE);
  const qs = (over: Record<string, string | undefined>) => {
    const u = new URLSearchParams(Object.entries({ ...sp, ...over }).filter(([, v]) => v) as [string, string][]);
    const s = u.toString();
    return `/admin/blog${s ? `?${s}` : ""}`;
  };
  const tab = (s: string | undefined, label: string) => (
    <Link href={qs({ status: s, page: undefined })} className={`rounded-lg px-3 py-1.5 text-[13.5px] font-medium ${sp.status === s ? "bg-brand text-white" : "border border-line bg-white text-ink hover:bg-mint-50"}`}>
      {label} ({count(s)})
    </Link>
  );
  const catName = (id?: string) => db.blogCategories.find((c) => c.id === id)?.name;

  return (
    <>
      <PageTitle title="Blog" sub="Write, schedule and publish articles. Published articles appear at /blog and in the sitemap.">
        <div className="flex gap-2">
          <Link href="/admin/blog/categories" className="btn btn-ghost h-11 px-4 text-[14.5px]">
            <Tags className="h-4 w-4" /> Categories
          </Link>
          <Link href="/admin/blog/new" className="btn btn-primary h-11 px-5 text-[14.5px]">
            <Plus className="h-4 w-4" /> New Article
          </Link>
        </div>
      </PageTitle>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tab(undefined, "All")}
        {tab("draft", "Drafts")}
        {tab("scheduled", "Scheduled")}
        {tab("published", "Published")}
        <form className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <select name="category" defaultValue={sp.category ?? ""} aria-label="Category" className="input h-9 w-auto py-0 text-[13.5px]">
            <option value="">All categories</option>
            {db.blogCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={sort} aria-label="Sort" className="input h-9 w-auto py-0 text-[13.5px]">
            <option value="updated">Recently updated</option>
            <option value="published">Publish date</option>
            <option value="title">Title A–Z</option>
          </select>
          <input name="q" defaultValue={sp.q} placeholder="Search title, tag…" aria-label="Search" className="input h-9 w-44 text-[13.5px]" />
          <button type="submit" className="btn btn-ghost h-9 px-3 text-[13px]">
            Filter
          </button>
        </form>
      </div>

      {shown.length === 0 ? (
        <Box className="py-12 text-center">
          <p className="text-[16px] font-semibold text-ink">{db.posts.length ? "No articles match these filters." : "No articles yet."}</p>
          {!db.posts.length && (
            <Link href="/admin/blog/new" className="btn btn-primary mt-4 h-11 px-5">
              <Plus className="h-4 w-4" /> Write the first article
            </Link>
          )}
        </Box>
      ) : (
        <div className="space-y-3">
          {shown.map(({ p, state }) => (
            <Box key={p.id} className="!p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[220px] flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className={`chip capitalize ${CHIP[state]}`}>{state}</span>
                    {p.noindex && <span className="chip bg-[#fef3c7] text-[#92400e]">noindex</span>}
                    {catName(p.categoryId) && <span className="text-[12.5px] text-muted">{catName(p.categoryId)}</span>}
                  </p>
                  <Link href={`/admin/blog/${p.id}/edit`} className="mt-1 block text-[16px] font-semibold text-ink hover:text-brand">
                    {p.title}
                  </Link>
                  <p className="text-[12.5px] text-muted">
                    /blog/{p.slug} · {state === "draft" ? `updated ${timeAgo(p.updatedAt)}` : `${state === "scheduled" ? "goes live" : "published"} ${fmtDate(p.publishedAt)}`} · by {p.authorName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/blog/${p.id}/edit`} className="btn btn-ghost h-8 px-3 text-[12.5px]">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <Link href={`/admin/blog/${p.id}/preview`} className="btn btn-ghost h-8 px-3 text-[12.5px]">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Link>
                  {state === "published" && (
                    <Link href={postUrl(p)} target="_blank" className="btn btn-ghost h-8 px-3 text-[12.5px]">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Link>
                  )}
                  <form action={setPostStatusAction.bind(null, p.id, state === "draft")}>
                    <button type="submit" className={`btn h-8 px-3 text-[12.5px] ${state === "draft" ? "btn-primary" : "btn-ghost"}`} title={state === "draft" ? "Publish now (requires summary and content)" : "Move back to drafts"}>
                      {state === "draft" ? <Send className="h-3.5 w-3.5" /> : <Undo2 className="h-3.5 w-3.5" />} {state === "draft" ? "Publish" : "Unpublish"}
                    </button>
                  </form>
                  <form action={deletePostAction.bind(null, p.id)}>
                    <ConfirmButton message={`Delete “${p.title}” permanently? This cannot be undone.`} className="btn btn-ghost h-8 px-3 text-[12.5px] text-[#dc2626]">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </Box>
          ))}
        </div>
      )}
      {pages > 1 && <Pagination page={page} pages={pages} total={list.length} pageSize={PAGE} hrefFor={(n) => qs({ page: String(n) })} noun="articles" />}
    </>
  );
}
