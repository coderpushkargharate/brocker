import { Img } from "./Img";
import { initials } from "@/lib/format";

export function Avatar({ src, name, size = 40, className = "" }: { src?: string; name: string; size?: number; className?: string }) {
  if (src)
    return (
      <span className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-mint ${className}`} style={{ width: size, height: size }}>
        <Img src={src} alt={name} fill sizes={`${size * 2}px`} className="object-cover" />
      </span>
    );
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-mint font-semibold text-brand ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
