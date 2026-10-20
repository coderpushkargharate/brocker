import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  ExternalLink,
  FileText,
  FlaskConical,
  Info,
  Layers,
  Map as MapIcon,
  MapPin,
  Plane,
  Route,
  Rows3,
  ShieldCheck,
  Signpost,
  Store,
  TrainFront,
  Car,
  Zap,
  Building2,
  Link2,
  Sparkles,
} from "lucide-react";
import type { Land, NearbyKind } from "@/lib/types";
import { DOCUMENT_TYPES } from "@/lib/config";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-white p-6 shadow-card ${className}`}>{children}</section>;
}

export function CardTitle({ icon, children, extra }: { icon?: React.ReactNode; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-[19px] font-semibold text-ink">
        {icon && <span className="text-brand">{icon}</span>}
        {children}
      </h2>
      {extra}
    </div>
  );
}

export function LandInfo({ land }: { land: Land }) {
  const rows = [
    { icon: Sparkles, l: "Water Availability", v: land.waterAvailability },
    { icon: Route, l: "Road Access", v: land.roadAccess },
    { icon: Layers, l: "Soil Type", v: land.soilType },
    { icon: Zap, l: "Electricity", v: land.electricity },
    { icon: FlaskConical, l: "Water Source", v: land.waterSource },
    { icon: Rows3, l: "Fencing", v: land.fencing },
  ];
  return (
    <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
      {rows.map((r, i) => (
        <div key={r.l} className={`flex items-center justify-between gap-3 py-3 ${i < rows.length - 2 ? "border-b border-line" : ""}`}>
          <dt className="flex items-center gap-2.5 text-[14px] text-muted">
            <r.icon className={`h-4 w-4 ${i % 2 === 0 ? "text-brand" : "text-[#9ca3af]"}`} /> {r.l}
          </dt>
          <dd className="text-[14px] font-semibold text-ink">{r.v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MapCard({ land }: { land: Land }) {
  const url = `https://www.google.com/maps/search/?api=1&query=${land.lat},${land.lng}`;
  return (
    <>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Village", land.village],
          ["Taluka", land.taluka],
          ["District", land.district],
          ["State", land.state],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-[13px] text-muted">{k}</dt>
            <dd className="text-[14px] font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="relative mt-4 h-[180px] overflow-hidden rounded-xl border border-line bg-[#eef1f5]">
        <svg viewBox="0 0 840 180" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 60 C 200 40, 300 110, 420 90 S 560 20, 640 35 S 780 100, 840 130" fill="none" stroke="#bcd3f2" strokeWidth="4" />
          <path d="M60 180 C 250 130, 480 140, 650 150 S 720 100, 700 80" fill="none" stroke="#dfe3ea" strokeWidth="6" />
        </svg>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#16803c] shadow-[0_0_0_6px_rgba(22,128,60,0.15)]">
          <MapPin className="h-5 w-5 fill-white text-[#16803c]" />
        </span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-ink shadow-sm hover:bg-mint-50">
          Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </>
  );
}

const DOC_ICONS = { extract: FileText, landMap: MapIcon, ownership: ShieldCheck, soil: FlaskConical, water: Droplets, other: FileText } as const;

export function DocumentsGrid({ land, owner }: { land: Land; owner?: boolean }) {
  const docs = land.documents.filter((d) => (owner ? ["extract", "landMap", "ownership", "soil"].includes(d.key) || d.file : d.file));
  const allVerified = docs.length > 0 && docs.every((d) => d.status === "verified");
  return (
    <>
      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {docs.map((d) => {
          const meta = DOCUMENT_TYPES.find((x) => x.key === d.key)!;
          const Icon = DOC_ICONS[d.key];
          const label = d.status === "verified" ? "Verified" : d.status === "pending" ? "Under review" : "Not uploaded";
          return (
            <li key={d.key} className="relative rounded-xl border border-line bg-[#fafafa] p-3">
              <Icon className="h-5 w-5 text-muted" />
              {d.status === "verified" && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 fill-[#16803c] text-white" />}
              <p className="mt-2 text-[13.5px] font-semibold text-ink">{meta.label}</p>
              <p className={`text-[12px] font-medium ${d.status === "verified" ? "text-[#16803c]" : d.status === "pending" ? "text-[#b45309]" : "text-[#dc2626]"}`}>{label}</p>
              {owner && d.file?.startsWith("/api/docs/") && (
                <a href={d.file} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[12px] font-semibold text-brand hover:underline">
                  View file
                </a>
              )}
            </li>
          );
        })}
      </ul>
      {allVerified ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-[#b7e4c7] bg-[#ecfdf3] px-4 py-3 text-[13px] text-ink">
          <CheckCircle2 className="h-5 w-5 fill-[#16803c] text-white" /> All documents are verified and safe. {owner ? "Your listing is 100% verified." : "This listing is 100% verified."}
        </p>
      ) : (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[13px] text-ink">
          <Info className="h-5 w-5 text-[#b45309]" /> Some documents are still being verified by the AgriLand team.
        </p>
      )}
    </>
  );
}

const NEARBY_ICONS: Record<NearbyKind, typeof Route> = { road: Signpost, rail: TrainFront, airport: Plane, market: Store, city: Building2, highway: Route, village: Store };

export function NearbyGrid({ land, cols = 2 }: { land: Land; cols?: 2 | 3 }) {
  if (!land.nearby.length) return <p className="mt-4 text-[14px] text-muted">Connectivity details will be added soon.</p>;
  return (
    <ul className={`mt-4 grid gap-x-10 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {land.nearby.map((n, i) => {
        const Icon = NEARBY_ICONS[n.kind] ?? Route;
        return (
          <li key={i} className="flex items-center justify-between gap-3 border-b border-line py-3">
            <span className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-[#16803c]">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-ink">{n.name}</span>
                <span className="block text-[13px] text-muted">{n.detail}</span>
              </span>
            </span>
            {n.distanceKm > 0 && (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-[13px] font-medium text-ink">
                <Car className="h-3.5 w-3.5 text-[#16803c]" /> {n.distanceKm} km
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ViewAllLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:underline">
      {children} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export { Link2 };
