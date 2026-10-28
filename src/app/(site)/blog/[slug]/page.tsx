import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { readDB } from "@/lib/db";
import { site } from "@/lib/config";
import { findLivePost, postUrl, relatedPosts } from "@/lib/blog";
import { markdownToText } from "@/lib/markdown";
import { JsonLd } from "@/components/JsonLd";
import { ArticleView } from "@/components/blog/BlogParts";

type Props = { params: Promise<{ slug: string }> };

const abs = (u?: string) => (!u ? undefined : u.startsWith("http") ? u : site.url + u);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { post } = findLivePost(await readDB(), slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const image = post.ogImage || post.coverImage;
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: post.canonicalUrl || postUrl(post) },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      url: postUrl(post),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName],
      tags: post.tags,
      images: image ? [{ url: image, alt: post.coverAlt || post.title }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, images: image ? [image] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const db = await readDB();
  const { post, moved } = findLivePost(db, slug);
  if (moved) permanentRedirect(`/blog/${moved}`);
  if (!post) notFound();
  const category = db.blogCategories.find((c) => c.id === post.categoryId);
  const url = site.url + postUrl(post);
  const words = markdownToText(post.content).split(" ").length;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              mainEntityOfPage: url,
              headline: post.title.slice(0, 110),
              description: post.seoDescription || post.excerpt,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              author: { "@type": "Person", name: post.authorName },
              publisher: { "@id": `${site.url}/#org` },
              ...(post.coverImage ? { image: [abs(post.coverImage)] } : {}),
              ...(category ? { articleSection: category.name } : {}),
              ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
              wordCount: words,
              inLanguage: "en-IN",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
                ...(category ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${site.url}/blog/category/${category.id}` }] : []),
                { "@type": "ListItem", position: category ? 4 : 3, name: post.title, item: url },
              ],
            },
          ],
        }}
      />
      <ArticleView post={post} category={category} related={relatedPosts(db, post)} />
    </>
  );
}
