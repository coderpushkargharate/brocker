import Link from "next/link";
import { BadgeCheck, ChevronRight, Crown } from "lucide-react";

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[12px] font-semibold text-white shadow ${className}`}>
      <BadgeCheck className="h-3.5 w-3.5" /> Verified
    </span>
  );
}

export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-[#f59e0b] px-2 py-1 text-[12px] font-semibold text-white shadow ${className}`}>
      <Crown className="h-3.5 w-3.5" /> Premium
    </span>
  );
}

export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-body">
      <Link href="/" className="hover:text-brand">
        Home
      </Link>
      {items.map((c) => (
        <span key={c.name} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {c.href ? (
            <Link href={c.href} className="hover:text-brand">
              {c.name}
            </Link>
          ) : (
            <span className="text-ink">{c.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Tag({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" }) {
  return <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-medium ${tone === "green" ? "bg-[#dcf3e8] text-brand" : "bg-[#f3f4f6] text-[#374151]"}`}>{children}</span>;
}

/** Google Maps embed (no API key needed). */
export function MapEmbed({ query, className = "h-[220px]", zoom = 12 }: { query: string; className?: string; zoom?: number }) {
  return (
    <iframe
      title={`Map of ${query}`}
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`}
      className={`w-full rounded-xl border border-line ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export function mapsLink(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
