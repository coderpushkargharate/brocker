import { Star } from "lucide-react";

/** Five stars with partial fill, e.g. 4.6 */
export function Stars({ value, size = 15, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[1px] ${className}`} aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-[#e5e7eb]" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-[#f5a623]" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingLine({ rating, count, size = 15 }: { rating: number; count: number; size?: number }) {
  if (!count) return <span className="text-[13px] text-muted">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13.5px]">
      <Stars value={rating} size={size} />
      <span className="font-semibold text-ink">{rating.toFixed(1)}</span>
      <span className="text-muted">({count} reviews)</span>
    </span>
  );
}
