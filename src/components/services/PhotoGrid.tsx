"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Img } from "@/components/Img";

/** Row of photos; the last tile shows "+N View All Photos". Click opens a full-screen viewer. */
export function PhotoGrid({ images, title, show = 5 }: { images: string[]; title: string; show?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = images.length;
  const prev = useCallback(() => setOpen((x) => (x === null ? x : (x - 1 + n) % n)), [n]);
  const next = useCallback(() => setOpen((x) => (x === null ? x : (x + 1) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, prev, next]);

  if (!n) return <p className="text-[14px] text-muted">No photos added yet.</p>;
  const tiles = images.slice(0, show);
  const extra = n - tiles.length;

  return (
    <>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {tiles.map((src, i) => (
          <li key={src + i}>
            <button type="button" onClick={() => setOpen(i)} className="relative block aspect-[16/10] w-full overflow-hidden rounded-lg">
              <Img src={src} alt={`${title} – photo ${i + 1}`} fill sizes="(max-width:640px) 33vw, 180px" className="object-cover transition hover:scale-105" />
              {i === tiles.length - 1 && extra > 0 && (
                <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white">
                  <b className="text-[24px] leading-none">+{extra}</b>
                  <span className="mt-1 text-[12.5px]">View All Photos</span>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
          <button
            className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <div className="relative h-[75vh] w-full max-w-[1000px]" onClick={(e) => e.stopPropagation()}>
            <Img src={images[open]} alt={`${title} – photo ${open + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
          <button
            className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
          <p className="absolute bottom-4 text-[14px] text-white/80">
            {open + 1} / {n}
          </p>
        </div>
      )}
    </>
  );
}
