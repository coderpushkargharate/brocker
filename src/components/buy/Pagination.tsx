import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pagesToShow(page: number, pages: number) {
  const set = new Set([1, 2, 3, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pages, total, pageSize, hrefFor, noun = "lands" }: { page: number; pages: number; total: number; pageSize: number; hrefFor: (p: number) => string; noun?: string }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const box = "flex h-9 min-w-9 items-center justify-center rounded-md border border-line bg-white px-2 text-[14px] text-ink";
  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={box} aria-label="Previous page" rel="prev">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${box} bg-[#f3f4f6] text-[#9ca3af]`} aria-hidden>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
        {pagesToShow(page, pages).map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-muted">
              …
            </span>
          ) : (
            <Link key={p} href={hrefFor(p)} aria-current={p === page ? "page" : undefined} className={p === page ? `${box} border-leaf bg-leaf font-semibold text-white` : box}>
              {p}
            </Link>
          ),
        )}
        {page < pages ? (
          <Link href={hrefFor(page + 1)} className={box} aria-label="Next page" rel="next">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${box} bg-[#f3f4f6] text-[#9ca3af]`} aria-hidden>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="text-[14.5px] text-muted">
        Showing {from} – {to} of {total} {noun}
      </p>
    </nav>
  );
}
