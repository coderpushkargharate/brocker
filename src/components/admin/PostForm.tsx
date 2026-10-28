"use client";

import { keepValues } from "@/lib/forms";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { Eye, Loader2, Save, Send, Undo2 } from "lucide-react";
import { savePostAction } from "@/app/actions/blog";
import { Alert } from "@/components/auth/AuthForms";
import { slugify } from "@/lib/format";
import type { BlogCategory } from "@/lib/types";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId?: string;
  tags: string[];
  authorName: string;
  publishedAt: string; // datetime-local value (India time)
  coverImage?: string;
  coverAlt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noindex?: boolean;
  related: string[];
  state: "new" | "draft" | "scheduled" | "published";
};

function Count({ n, max }: { n: number; max: number }) {
  return <span className={`text-[12px] ${n > max ? "font-semibold text-[#b91c1c]" : "text-muted"}`}>{n}/{max}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <legend className="px-1 text-[15px] font-semibold text-ink">{title}</legend>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

export function PostForm({ initial, categories, others, siteUrl }: { initial: PostFormValues; categories: BlogCategory[]; others: { slug: string; title: string }[]; siteUrl: string }) {
  const [state, action, pending] = useActionState(savePostAction, undefined);
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle ?? "");
  const [seoDesc, setSeoDesc] = useState(initial.seoDescription ?? "");
  // the clicked button's name/value isn't sent with the action, so each button writes its intent here first
  const intentRef = useRef<HTMLInputElement>(null);
  const setIntent = (v: string) => () => {
    if (intentRef.current) intentRef.current.value = v;
  };
  const live = initial.state === "published" || initial.state === "scheduled";
  const shownSlug = slugTouched ? slug : slugify(title);

  return (
    <form onSubmit={keepValues(action)} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input ref={intentRef} type="hidden" name="intent" defaultValue="draft" />
      <div className="space-y-6">
        <Alert error={state?.error} />
        <Section title="Article">
          <div>
            <label className="label flex justify-between" htmlFor="p-title">
              Title <Count n={title.length} max={110} />
            </label>
            <input id="p-title" name="title" required minLength={5} maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} className="input text-[17px] font-semibold" />
          </div>
          <div>
            <label className="label" htmlFor="p-slug">
              URL
            </label>
            <div className="flex items-center rounded-lg border border-line bg-[#f9fafb] focus-within:border-leaf">
              <span className="hidden shrink-0 pl-3 text-[13px] text-muted sm:inline">/blog/</span>
              <input
                id="p-slug"
                name="slug"
                value={shownSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="lowercase letters, numbers and hyphens"
                className="h-[42px] min-w-0 flex-1 bg-transparent px-2 text-[15px] outline-none"
              />
            </div>
            {initial.id && live && shownSlug !== initial.slug && <p className="mt-1 text-[12.5px] text-[#92400e]">The old URL will automatically redirect to the new one.</p>}
          </div>
          <div>
            <label className="label flex justify-between" htmlFor="p-excerpt">
              Summary (shown on cards and under the title) <Count n={excerpt.length} max={300} />
            </label>
            <textarea id="p-excerpt" name="excerpt" rows={3} maxLength={320} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="p-content">
              Content (Markdown)
            </label>
            <textarea id="p-content" name="content" rows={22} defaultValue={initial.content} className="input font-mono text-[14px] leading-relaxed" />
            <details className="mt-2 text-[13px] text-body">
              <summary className="cursor-pointer font-medium text-brand">Formatting help</summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-[#f3f4f6] p-3 text-[12.5px] leading-relaxed">{`## Section heading
### Sub heading
**bold**, *italic*, \`code\`
[link text](/buy-land)  or  [site](https://example.com)
- bullet point
1. numbered point
> quote
![Describe the image](/images/land-farm-1.jpg "Optional caption")
---  (divider)`}</pre>
              <p className="mt-1">HTML is not allowed and will be shown as plain text.</p>
            </details>
          </div>
        </Section>

        <Section title="Search engine & social sharing">
          <div className="rounded-xl border border-line bg-[#f9fafb] p-4" aria-label="Google result preview">
            <p className="truncate text-[12.5px] text-[#4d5156]">
              {siteUrl.replace(/^https?:\/\//, "")} › blog › {shownSlug || "…"}
            </p>
            <p className="mt-0.5 truncate text-[18px] text-[#1a0dab]">{seoTitle || title || "Article title"} | AgriLand</p>
            <p className="mt-0.5 line-clamp-2 text-[13.5px] text-[#4d5156]">{seoDesc || excerpt || "The summary will be used as the description."}</p>
          </div>
          <div>
            <label className="label flex justify-between" htmlFor="p-seo-title">
              SEO title (optional) <Count n={seoTitle.length} max={60} />
            </label>
            <input id="p-seo-title" name="seoTitle" maxLength={70} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="input" placeholder="Defaults to the title" />
          </div>
          <div>
            <label className="label flex justify-between" htmlFor="p-seo-desc">
              Meta description (optional) <Count n={seoDesc.length} max={160} />
            </label>
            <textarea id="p-seo-desc" name="seoDescription" rows={2} maxLength={170} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className="input" placeholder="Defaults to the summary" />
          </div>
          <div>
            <label className="label" htmlFor="p-canonical">
              Canonical URL (only if this article was first published on another site)
            </label>
            <input id="p-canonical" name="canonicalUrl" type="url" defaultValue={initial.canonicalUrl} placeholder="https://…" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="p-og">
              Social sharing image (optional, 1200×630 recommended)
            </label>
            {initial.ogImage && (
              <label className="mb-2 flex items-center gap-2 text-[13px]">
                <input type="checkbox" name="removeOg" className="check" /> Remove current sharing image
              </label>
            )}
            <input id="p-og" name="ogImageFile" type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-[13px]" />
          </div>
          <label className="flex items-start gap-2 text-[14px]">
            <input type="checkbox" name="noindex" defaultChecked={initial.noindex} className="check mt-0.5" />
            <span>Hide from search engines (noindex) and the sitemap</span>
          </label>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Publish">
          <p className="text-[13.5px] text-body">
            Status:{" "}
            <b className="capitalize text-ink">{initial.state === "new" ? "not saved" : initial.state}</b>
          </p>
          <div>
            <label className="label" htmlFor="p-date">
              Publish date &amp; time (India time)
            </label>
            <input id="p-date" name="publishedAt" type="datetime-local" defaultValue={initial.publishedAt} className="input" />
            <p className="mt-1 text-[12px] text-muted">Leave empty to publish now. A future time schedules the article; it goes live automatically.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button type="submit" data-intent="publish" onClick={setIntent("publish")} disabled={pending} className="btn btn-primary h-11">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {live ? "Update" : "Publish"}
            </button>
            {live ? (
              <button type="submit" data-intent="unpublish" onClick={setIntent("unpublish")} disabled={pending} className="btn btn-ghost h-11">
                <Undo2 className="h-4 w-4" /> Unpublish (back to draft)
              </button>
            ) : (
              <button type="submit" data-intent="draft" onClick={setIntent("draft")} disabled={pending} className="btn btn-ghost h-11">
                <Save className="h-4 w-4" /> Save draft
              </button>
            )}
            {initial.id && (
              <Link href={`/admin/blog/${initial.id}/preview`} target="_blank" className="btn btn-ghost h-11">
                <Eye className="h-4 w-4" /> Preview saved version
              </Link>
            )}
          </div>
        </Section>

        <Section title="Organise">
          <div>
            <label className="label" htmlFor="p-cat">
              Category
            </label>
            <select id="p-cat" name="categoryId" defaultValue={initial.categoryId ?? ""} className="input">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Link href="/admin/blog/categories" className="mt-1 inline-block text-[12.5px] text-brand hover:underline">
              Manage categories
            </Link>
          </div>
          <div>
            <label className="label" htmlFor="p-tags">
              Tags (comma separated, max 10)
            </label>
            <input id="p-tags" name="tags" defaultValue={initial.tags.join(", ")} className="input" placeholder="7/12 extract, land documents" />
          </div>
          <div>
            <label className="label" htmlFor="p-author">
              Author
            </label>
            <input id="p-author" name="authorName" defaultValue={initial.authorName} maxLength={80} className="input" />
          </div>
        </Section>

        <Section title="Cover image">
          {initial.coverImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={initial.coverImage} alt={initial.coverAlt || ""} className="aspect-[16/9] w-full rounded-lg object-cover" />
              <label className="flex items-center gap-2 text-[13px]">
                <input type="checkbox" name="removeCover" className="check" /> Remove cover image
              </label>
            </>
          )}
          <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload cover image" className="block w-full text-[13px]" />
          <div>
            <label className="label" htmlFor="p-alt">
              Image description (alt text)
            </label>
            <input id="p-alt" name="coverAlt" defaultValue={initial.coverAlt} maxLength={200} className="input" placeholder="e.g. Irrigated sugarcane field near Baramati" />
          </div>
        </Section>

        {others.length > 0 && (
          <Section title="Related articles">
            <p className="text-[12.5px] text-muted">Pick up to 6. Others from the same category are filled in automatically.</p>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {others.map((o) => (
                <label key={o.slug} className="flex items-start gap-2 text-[13.5px]">
                  <input type="checkbox" name="related" value={o.slug} defaultChecked={initial.related.includes(o.slug)} className="check mt-0.5" />
                  <span>{o.title}</span>
                </label>
              ))}
            </div>
          </Section>
        )}
      </div>
    </form>
  );
}
