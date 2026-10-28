import { slugify } from "./format";

/**
 * Minimal, safe Markdown → HTML for blog posts.
 * Every piece of text is HTML-escaped *before* formatting is applied, so raw HTML typed into a post is shown
 * as text and can never run as script. Links and images only accept http(s), site-relative, mailto: and tel: URLs.
 *
 * Supported: ## / ### / #### headings (a single # is treated as ##, the page title is the only H1),
 * paragraphs, **bold**, *italic*, `code`, [links](url), ![images](url "optional caption"),
 * - / * bullet lists, 1. numbered lists, > quotes, ``` code blocks, --- rules.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function safeUrl(raw: string, { image = false } = {}) {
  const u = raw.trim();
  if (/^https?:\/\/[^\s]+$/i.test(u)) return u;
  if (/^\/(?!\/)[^\s]*$/.test(u)) return u;
  if (!image && /^#[\w-]*$/.test(u)) return u;
  if (!image && /^(mailto:|tel:)[^\s]+$/i.test(u)) return u;
  return null;
}

/** inline formatting on already-escaped text */
function inline(escaped: string) {
  const codes: string[] = [];
  let s = escaped.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(`<code>${c}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  // images first so their "!" isn't left behind as text
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (m, alt, url) => {
    const ok = safeUrl(url.replace(/&amp;/g, "&"), { image: true });
    return ok ? `<img src="${esc(ok)}" alt="${alt}" loading="lazy" decoding="async" />` : m;
  });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) => {
    const ok = safeUrl(url.replace(/&amp;/g, "&"));
    if (!ok) return text;
    const external = /^https?:/i.test(ok);
    return `<a href="${esc(ok)}"${external ? ' rel="noopener noreferrer" target="_blank"' : ""}>${text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/__([^_]+)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>").replace(/(^|[^\w])_([^_\s][^_]*)_/g, "$1<em>$2</em>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
}

export type Heading = { level: 2 | 3 | 4; text: string; id: string };

export function renderMarkdown(src: string): { html: string; headings: Heading[] } {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  const headings: Heading[] = [];
  const usedIds = new Set<string>();
  let para: string[] = [];
  let list: { tag: "ul" | "ol"; items: string[] } | null = null;
  let quote: string[] = [];

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(esc(para.join(" ")))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(esc(i))}</li>`).join("")}</${list.tag}>`);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) out.push(`<blockquote><p>${inline(esc(quote.join(" ")))}</p></blockquote>`);
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    if (t.startsWith("```")) {
      flushAll();
      const code: string[] = [];
      while (++i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }
    if (!t) {
      flushAll();
      continue;
    }
    const h = t.match(/^(#{1,4})\s+(.+)$/);
    if (h) {
      flushAll();
      const level = Math.max(2, h[1].length) as 2 | 3 | 4;
      const text = h[2].replace(/#+$/, "").trim();
      let id = slugify(text) || "section";
      for (let n = 2; usedIds.has(id); n++) id = `${slugify(text)}-${n}`;
      usedIds.add(id);
      headings.push({ level, text, id });
      out.push(`<h${level} id="${id}">${inline(esc(text))}</h${level}>`);
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      flushAll();
      out.push("<hr />");
      continue;
    }
    if (t.startsWith(">")) {
      flushPara();
      flushList();
      quote.push(t.replace(/^>\s?/, ""));
      continue;
    }
    const ul = t.match(/^[-*+]\s+(.+)$/);
    const ol = t.match(/^\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      flushPara();
      flushQuote();
      const tag = ul ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      list ??= { tag, items: [] };
      list.items.push((ul || ol)![1]);
      continue;
    }
    const img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (img) {
      flushAll();
      const ok = safeUrl(img[2], { image: true });
      if (ok) {
        const cap = img[3] ? `<figcaption>${esc(img[3])}</figcaption>` : "";
        out.push(`<figure><img src="${esc(ok)}" alt="${esc(img[1])}" loading="lazy" decoding="async" />${cap}</figure>`);
      }
      continue;
    }
    flushList();
    flushQuote();
    para.push(t);
  }
  flushAll();
  return { html: out.join("\n"), headings };
}

/** Plain text (for reading time and fallbacks). */
export function markdownToText(src: string) {
  return src
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutes(src: string) {
  return Math.max(1, Math.round(markdownToText(src).split(" ").length / 200));
}
