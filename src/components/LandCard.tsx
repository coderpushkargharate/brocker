import Link from "next/link";
import { ArrowRight, CheckCircle2, Eye, MapPin } from "lucide-react";
import { Img, FALLBACK_LAND_IMAGE } from "./Img";
import { SaveButton } from "./LandActions";
import { areaLabel, areaShort, inr, perAcre } from "@/lib/format";
import type { Land } from "@/lib/types";

export function landPlace(l: Land) {
  return `${l.taluka === l.village ? l.village : `${l.village}, ${l.taluka}`}, ${l.district}, ${l.state}`.replace(/^([^,]+), \1,/, "$1,");
}

export function shortPlace(l: Land) {
  return `${l.taluka}, ${l.district}, ${l.state}`;
}

/** Card used on the home page ("Verified Agricultural Lands" / "Recently Added Lands"). */
export function LandCard({ land, saved, match, badge = "verified" }: { land: Land; saved: boolean; match: number; badge?: "verified" | "new" }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card transition hover:shadow-soft">
      <div className="relative aspect-[398/192] overflow-hidden">
        <Link href={`/lands/${land.slug}`} tabIndex={-1} aria-hidden>
          <Img src={land.images[0] || FALLBACK_LAND_IMAGE} alt="" fill sizes="(max-width:768px) 100vw, 400px" className="object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        {(badge === "new" || land.verified) && (
          <span className="chip absolute left-3 top-3 bg-[#16a34a] py-1 text-[12.5px] text-white">
            <CheckCircle2 className="h-4 w-4" /> {badge === "new" ? "NEW" : "VERIFIED"}
          </span>
        )}
        <SaveButton landId={land.id} saved={saved} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col px-4 pb-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[18px] font-semibold leading-snug text-ink">
            <Link href={`/lands/${land.slug}`} className="hover:text-brand">
              {land.title}
            </Link>
          </h3>
          <SaveButton landId={land.id} saved={saved} variant="bookmark" className="mt-0.5" />
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[15px] text-body">
          <MapPin className="h-4 w-4 shrink-0 fill-[#6b7280] text-white" /> {shortPlace(land)}
        </p>
        <div className="mt-3 flex items-start justify-between">
          <span className="text-[16px] font-semibold text-ink">{areaLabel(land.area, land.areaUnit)}</span>
          <span className="text-right">
            <span className="block text-[20px] font-bold leading-tight text-ink">{inr(land.price)}</span>
            <span className="block text-[12px] text-body">
              {inr(perAcre(land.price, land.area))} per {land.areaUnit === "Acres" ? "Acre" : land.areaUnit}
            </span>
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="chip bg-[#e8f6ee] font-medium text-sea">{land.landType} Land</span>
          <span className="chip rounded-full bg-match text-sea">{match}% Match</span>
        </div>
        <Link href={`/lands/${land.slug}`} className="btn btn-primary mt-3 h-[42px] w-full text-[15px]" aria-label={`View details of ${land.title}`}>
          View Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

/** Compact card used for "Similar Land" carousels. */
export function MiniLandCard({ land, saved, showHeart = true }: { land: Land; saved?: boolean; showHeart?: boolean }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <div className="relative aspect-[328/176]">
        <Link href={`/lands/${land.slug}`} tabIndex={-1} aria-hidden>
          <Img src={land.images[0] || FALLBACK_LAND_IMAGE} alt="" fill sizes="330px" className="object-cover" />
        </Link>
        <span className="absolute bottom-2.5 left-2.5 rounded bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white">
          {areaShort(land.area, land.areaUnit)} • {land.taluka}
        </span>
        {showHeart && <SaveButton landId={land.id} saved={!!saved} variant="overlay-white" className="absolute right-2.5 top-2.5" />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold text-ink">
          <Link href={`/lands/${land.slug}`} className="hover:text-brand">
            {land.title}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted">
          <MapPin className="h-3.5 w-3.5 fill-[#ef4444] text-white" /> {shortPlace(land)}
        </p>
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-[17px] font-bold text-ink">{inr(land.price)}</p>
          <p className="text-[11px] text-muted">{inr(perAcre(land.price, land.area))} / Acre</p>
        </div>
        <Link href={`/lands/${land.slug}`} className="btn btn-ghost mt-3 h-9 w-full text-[13px] font-medium">
          <Eye className="h-4 w-4" /> View Details
        </Link>
      </div>
    </article>
  );
}
