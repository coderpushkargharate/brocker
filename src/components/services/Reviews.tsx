import { Star } from "lucide-react";
import { Stars } from "./Stars";
import { ReviewForm } from "./LeadForms";
import { timeAgo } from "@/lib/format";
import type { RatingInfo, ServiceReview } from "@/lib/types";

export function ReviewsBlock({ info, reviews, targetType, targetId }: { info: RatingInfo; reviews: ServiceReview[]; targetType: "business" | "worker"; targetId: string }) {
  const dist = info.ratingDist ?? [0, 0, 0, 0, 0];
  const total = dist.reduce((s, n) => s + n, 0) || 1;
  return (
    <div>
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-6 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-4">
            <span className="text-[44px] font-bold leading-none text-ink">{info.reviewCount ? info.rating.toFixed(1) : "–"}</span>
            <span>
              <Stars value={info.rating} size={22} />
              <span className="mt-1 block text-[14px] text-body">{info.reviewCount} reviews</span>
            </span>
          </div>
          <ul className="min-w-[220px] flex-1 space-y-1">
            {dist.map((n, i) => (
              <li key={i} className="flex items-center gap-2 text-[12px] text-body">
                <span className="flex w-6 items-center gap-0.5">
                  {5 - i} <Star className="h-3 w-3 fill-[#f5a623] text-[#f5a623]" />
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eef0f3]">
                  <span className="block h-full rounded-full bg-[#f5a623]" style={{ width: `${(n / total) * 100}%` }} />
                </span>
                <span className="w-9 text-right">{Math.round((n / total) * 100)}%</span>
              </li>
            ))}
          </ul>
          <span className="btn btn-primary h-11 px-6 text-[14.5px] group-open:hidden">Write a Review</span>
          <span className="btn btn-ghost hidden h-11 px-6 text-[14.5px] group-open:inline-flex">Close</span>
        </summary>
        <div className="mt-4">
          <ReviewForm targetType={targetType} targetId={targetId} />
        </div>
      </details>
      {reviews.length > 0 && (
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4b5563] text-[16px] font-semibold text-white">{r.name[0]?.toUpperCase()}</span>
                <span>
                  <b className="block text-[14px] text-ink">{r.name}</b>
                  <span className="flex items-center gap-2 text-[12px] text-muted">
                    <Stars value={r.rating} size={13} /> {timeAgo(r.createdAt)}
                  </span>
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-body">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
