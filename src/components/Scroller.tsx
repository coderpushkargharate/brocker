"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horizontal card row with working prev/next arrows. */
export function Scroller({ title, viewAll, children, titleClass = "text-[24px] font-bold tracking-[-0.01em] text-ink", cols = "auto-cols-[85%] sm:auto-cols-[calc(50%-12px)] lg:auto-cols-[calc(25%-18px)]" }: { title: string; viewAll?: string; children: React.ReactNode; titleClass?: string; cols?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const by = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className={titleClass}>{title}</h2>
        <div className="flex items-center gap-3">
          {viewAll && (
            <Link href={viewAll} className="text-[13px] font-semibold text-brand hover:underline">
              View All
            </Link>
          )}
          <button onClick={() => by(-1)} aria-label="Scroll left" className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white hover:bg-mint-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => by(1)} aria-label="Scroll right" className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white hover:bg-mint-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={ref} className={`no-scrollbar mt-6 grid snap-x snap-mandatory grid-flow-col gap-6 overflow-x-auto pb-1 ${cols}`}>
        {children}
      </div>
    </div>
  );
}
