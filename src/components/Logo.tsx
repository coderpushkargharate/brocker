import Link from "next/link";
import { Leaf } from "lucide-react";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-[10px] bg-brand text-white" style={{ width: size, height: size }}>
      <Leaf style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.4} fill="currentColor" />
    </span>
  );
}

export function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="AgriLand home">
      <LogoMark />
      <span className="leading-tight">
        <span className={`block text-[22px] font-bold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
          Agri<span className={dark ? "text-[#7ed957]" : "text-ink"}>Land</span>
        </span>
        {!dark && <span className="hidden text-[10.5px] font-medium uppercase tracking-wide whitespace-nowrap text-muted sm:block">Trusted Agriculture Land Marketplace</span>}
      </span>
    </Link>
  );
}
