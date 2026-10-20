"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Img, FALLBACK_LAND_IMAGE } from "../Img";
import { SaveButton } from "../LandActions";

export function Gallery({ images, title, video, landId, saved, verified }: { images: string[]; title: string; video?: string; landId: string; saved: boolean; verified: boolean }) {
  const list = images.length ? images : [FALLBACK_LAND_IMAGE];
  const [i, setI] = useState(0);
  const [open, setOpen] = useState<null | "photo" | "video">(null);
  const prev = useCallback(() => setI((x) => (x - 1 + list.length) % list.length), [list.length]);
  const next = useCallback(() => setI((x) => (x + 1) % list.length), [list.length]);

  useEffect(() => {
    if (!open) return;
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

  const thumbs = list.slice(0, video ? 4 : 5);
  const extra = list.length - thumbs.length;

  return (
    <div>
      <div className="relative aspect-[680/346] overflow-hidden rounded-2xl bg-mint">
        <button className="absolute inset-0" onClick={() => setOpen("photo")} aria-label="Open photo viewer">
          <Img src={list[i]} alt={`${title} – photo ${i + 1}`} fill priority sizes="(max-width:1024px) 100vw, 680px" className="object-cover" />
        </button>
        {verified && (
          <span className="chip absolute left-4 top-4 rounded-full bg-[#1f2937]/85 px-3 py-1.5 text-[13px] font-medium text-white">
            <CheckCircle2 className="h-4 w-4 fill-[#22c55e] text-[#1f2937]" /> Verified Land
          </span>
        )}
        <SaveButton landId={landId} saved={saved} variant="plain" className="absolute right-4 top-4 drop-shadow" />
        {list.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous photo" className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} aria-label="Next photo" className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-6 gap-2.5">
        {thumbs.map((src, idx) => (
          <button key={src + idx} onClick={() => setI(idx)} aria-label={`Show photo ${idx + 1}`} className={`relative aspect-[103/78] overflow-hidden rounded-lg border-2 ${i === idx ? "border-leaf" : "border-transparent"}`}>
            <Img src={src} alt="" fill sizes="110px" className="object-cover" />
          </button>
        ))}
        {video && (
          <button onClick={() => setOpen("video")} className="relative aspect-[103/78] overflow-hidden rounded-lg bg-black" aria-label="Play video">
            <Img src={list[1] ?? list[0]} alt="" fill sizes="110px" className="object-cover opacity-60" />
            <span className="absolute inset-0 flex flex-col items-center justify-center text-[11px] font-medium text-white">
              <Play className="h-4 w-4 fill-white" /> Play Video
            </span>
          </button>
        )}
        <button onClick={() => setOpen("photo")} className="flex aspect-[103/78] flex-col items-center justify-center rounded-lg border border-line bg-white text-center">
          <span className="text-[13px] font-semibold text-ink">{extra > 0 ? `+${extra}` : list.length}</span>
          <span className="text-[10.5px] text-muted">View All Photos</span>
        </button>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white" aria-label="Close" onClick={() => setOpen(null)}>
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-full max-h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {open === "video" && video ? (
              <video src={video} controls autoPlay className="h-full w-full rounded-lg" />
            ) : (
              <>
                <Img src={list[i]} alt={`${title} – photo ${i + 1}`} fill sizes="100vw" className="object-contain" />
                <button onClick={prev} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={next} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
                  <ChevronRight className="h-6 w-6" />
                </button>
                <p className="absolute -bottom-8 left-0 right-0 text-center text-sm text-white/80">
                  {i + 1} / {list.length}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
