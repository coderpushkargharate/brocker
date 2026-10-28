"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mutate, newId, readDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { saveOne, UploadError } from "@/lib/uploads";
import { slugify } from "@/lib/format";
import { istInputToIso, postState } from "@/lib/blog";
import type { BlogPost, PostStatus } from "@/lib/types";
import type { FormState } from "./auth";

const now = () => new Date().toISOString();
const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Blog management is limited to admins, checked on the server for every action. */
async function admin() {
  return requireUser(["admin"], "/admin/blog");
}

function refresh(slugs: string[] = []) {
  revalidatePath("/blog", "layout");
  for (const s of slugs) revalidatePath(`/blog/${s}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
}

export async function savePostAction(_: FormState, fd: FormData): Promise<FormState> {
  const me = await admin();
  const id = str(fd, "id");
  const db0 = await readDB();
  const existing = id ? db0.posts.find((p) => p.id === id) : undefined;
  if (id && !existing) return { error: "This post no longer exists." };

  const intent = str(fd, "intent"); // "draft" | "publish" | "unpublish"
  const title = str(fd, "title", 160);
  const slug = slugify(str(fd, "slug", 120) || title).slice(0, 100).replace(/-+$/, "");
  const excerpt = str(fd, "excerpt", 320);
  const content = String(fd.get("content") ?? "").slice(0, 100_000);
  const categoryId = str(fd, "categoryId") || undefined;
  const tags = [...new Set(str(fd, "tags", 500).split(",").map((t) => t.trim().toLowerCase().slice(0, 40)).filter(Boolean))].slice(0, 10);
  const seoTitle = str(fd, "seoTitle", 120) || undefined;
  const seoDescription = str(fd, "seoDescription", 320) || undefined;
  const canonicalUrl = str(fd, "canonicalUrl", 300) || undefined;
  const coverAlt = str(fd, "coverAlt", 200) || undefined;
  const authorName = str(fd, "authorName", 80) || me.name;
  const related = [...new Set(fd.getAll("related").map(String))].slice(0, 6);
  const publishInput = str(fd, "publishedAt", 20);

  // ---- validation (server-side; the form's own checks are only a convenience)
  if (title.length < 5) return { error: "Title must be at least 5 characters." };
  if (!SLUG_RE.test(slug) || slug.length < 3) return { error: "URL slug may only contain lowercase letters, numbers and single hyphens (min. 3 characters)." };
  const clash = db0.posts.find((p) => p.id !== existing?.id && (p.slug === slug || p.oldSlugs.includes(slug)));
  if (clash) return { error: `The URL /blog/${slug} is already used by “${clash.title}”. Choose another slug.` };
  if (categoryId && !db0.blogCategories.some((c) => c.id === categoryId)) return { error: "Please choose a valid category." };
  if (canonicalUrl && !/^https:\/\/[^\s]+$/i.test(canonicalUrl)) return { error: "Canonical URL must be a full https:// address (leave empty to use this page)." };
  if (seoTitle && seoTitle.length > 70) return { error: "SEO title should be 70 characters or less." };
  if (seoDescription && seoDescription.length > 170) return { error: "Meta description should be 170 characters or less." };
  if (publishInput && !istInputToIso(publishInput)) return { error: "Please enter a valid publish date and time." };

  let cover: string | undefined;
  let ogImage: string | undefined;
  try {
    cover = await saveOne(fd.get("cover"), "image");
    ogImage = await saveOne(fd.get("ogImageFile"), "image");
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  const coverImage = cover ?? (fd.get("removeCover") === "on" ? undefined : existing?.coverImage);

  let status: PostStatus = existing?.status ?? "draft";
  if (intent === "publish") status = "published";
  if (intent === "unpublish" || intent === "draft") status = "draft";

  if (status === "published") {
    if (excerpt.length < 30) return { error: "Add a summary (excerpt) of at least 30 characters before publishing." };
    if (content.trim().length < 200) return { error: "The article is too short to publish (at least 200 characters)." };
    if (coverImage && !coverAlt) return { error: "Describe the cover image (alt text) before publishing." };
  }

  const publishedAt = status === "published" ? istInputToIso(publishInput) ?? existing?.publishedAt ?? now() : istInputToIso(publishInput) ?? existing?.publishedAt;

  const fields = {
    title,
    slug,
    excerpt,
    content,
    status,
    publishedAt,
    categoryId,
    tags,
    authorName,
    coverImage,
    coverAlt,
    seoTitle,
    seoDescription,
    canonicalUrl,
    ogImage: ogImage ?? (fd.get("removeOg") === "on" ? undefined : existing?.ogImage),
    noindex: fd.get("noindex") === "on",
    related: related.filter((r) => r !== slug),
  };

  const saved = await mutate((db) => {
    let p = existing ? db.posts.find((x) => x.id === existing.id) : undefined;
    if (p) {
      // keep the old address working if a post that has been public is renamed
      if (p.slug !== slug && p.publishedAt && !p.oldSlugs.includes(p.slug)) p.oldSlugs.push(p.slug);
      p.oldSlugs = p.oldSlugs.filter((s) => s !== slug);
      Object.assign(p, fields, { updatedAt: now(), updatedBy: me.id });
    } else {
      p = { id: newId(), oldSlugs: [], ...fields, createdAt: now(), updatedAt: now(), createdBy: me.id, updatedBy: me.id } as BlogPost;
      db.posts.push(p);
    }
    const wasState = existing ? postState(existing) : "new";
    const state = postState(p);
    audit(db, me, wasState === state ? `blog:update(${state})` : `blog:${wasState}->${state}`, p.title);
    return { id: p.id, slug: p.slug, old: existing?.slug };
  });

  refresh([saved.slug, ...(saved.old ? [saved.old] : [])]);
  redirect(`/admin/blog/${saved.id}/edit?saved=${intent || "1"}`);
}

export async function setPostStatusAction(id: string, publish: boolean) {
  const me = await admin();
  const db0 = await readDB();
  const p0 = db0.posts.find((p) => p.id === id);
  if (!p0) return;
  if (publish && (p0.excerpt.length < 30 || p0.content.trim().length < 200)) return; // incomplete posts must be published from the editor
  await mutate((db) => {
    const p = db.posts.find((x) => x.id === id);
    if (!p) return;
    p.status = publish ? "published" : "draft";
    if (publish && !p.publishedAt) p.publishedAt = now();
    p.updatedAt = now();
    p.updatedBy = me.id;
    audit(db, me, publish ? "blog:publish" : "blog:unpublish", p.title);
  });
  refresh([p0.slug]);
}

export async function deletePostAction(id: string) {
  const me = await admin();
  let slug = "";
  await mutate((db) => {
    const p = db.posts.find((x) => x.id === id);
    if (!p) return;
    slug = p.slug;
    db.posts = db.posts.filter((x) => x.id !== id);
    for (const other of db.posts) other.related = other.related.filter((s) => s !== p.slug);
    audit(db, me, "blog:delete", p.title);
  });
  refresh(slug ? [slug] : []);
}

export async function saveBlogCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  const me = await admin();
  const editId = str(fd, "editId");
  const name = str(fd, "name", 60);
  const id = editId || slugify(str(fd, "slug", 60) || name);
  const description = str(fd, "description", 300);
  if (name.length < 2) return { error: "Category name is too short." };
  if (!SLUG_RE.test(id)) return { error: "Category URL may only contain lowercase letters, numbers and hyphens." };
  const db0 = await readDB();
  if (!editId && db0.blogCategories.some((c) => c.id === id)) return { error: "A category with this URL already exists." };
  await mutate((db) => {
    const c = db.blogCategories.find((x) => x.id === id);
    if (c) Object.assign(c, { name, description });
    else db.blogCategories.push({ id, name, description });
    audit(db, me, editId ? "blog-category:update" : "blog-category:create", name);
  });
  refresh();
  revalidatePath("/admin/blog/categories");
  return { ok: editId ? "Category updated." : "Category added." };
}

export async function deleteBlogCategoryAction(id: string) {
  const me = await admin();
  await mutate((db) => {
    const c = db.blogCategories.find((x) => x.id === id);
    if (!c) return;
    db.blogCategories = db.blogCategories.filter((x) => x.id !== id);
    // posts stay, just uncategorised
    for (const p of db.posts) if (p.categoryId === id) p.categoryId = undefined;
    audit(db, me, "blog-category:delete", c.name);
  });
  refresh();
  revalidatePath("/admin/blog/categories");
}
