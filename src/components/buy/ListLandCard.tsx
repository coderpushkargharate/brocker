import Link from "next/link";
import { CalendarDays, CheckCircle2, Droplet, Eye, MapPin, Route, Sprout, Zap } from "lucide-react";
import { Img, FALLBACK_LAND_IMAGE } from "../Img";
import { Avatar } from "../Avatar";
import { InterestButton, SaveButton } from "../LandActions";
import { shortPlace } from "../LandCard";
import { areaLabel, formatDate, inr, perAcre } from "@/lib/format";
import type { Land, PublicUser } from "@/lib/types";

export function ListLandCard({ land, owner, saved, interested }: { land: Land; owner?: PublicUser; saved: boolean; interested: boolean }) {
  const features = [
    { icon: Route, v: /no direct/i.test(land.roadAccess) ? "No" : "Yes", l: "Road Access" },
    { icon: Sprout, v: land.currentCrop || "—", l: "Current Crop" },
    { icon: Zap, v: land.electricity === "Available" ? "Yes" : land.electricity === "Nearby" ? "Nearby" : "No", l: "Electricity" },
    { icon: Droplet, v: land.waterSource.replace(/\s*\(\d+\)/, "") || "—", l: "Water Source" },
  ];
  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-white p-4 shadow-card md:grid-cols-[320px_1fr_auto]">
      <Link href={`/lands/${land.slug}`} className="relative block aspect-[320/220] overflow-hidden rounded-md" tabIndex={-1} aria-hidden>
        <Img src={land.images[0] || FALLBACK_LAND_IMAGE} alt="" fill sizes="(max-width:768px) 100vw, 320px" className="object-cover" />
        {land.verified && (
          <span className="chip absolute left-3 top-3 bg-[#2e7d32] font-medium text-white">
            <CheckCircle2 className="h-3.5 w-3.5 fill-white text-[#2e7d32]" /> Verified Land
          </span>
        )}
      </Link>

      <div className="min-w-0 md:pl-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[21px] font-semibold leading-tight text-ink">
            <Link href={`/lands/${land.slug}`} className="hover:text-brand">
              {land.title}
            </Link>
          </h2>
          <SaveButton landId={land.id} saved={saved} variant="plain" />
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[14.5px] text-muted">
          <MapPin className="h-4 w-4" /> {shortPlace(land)}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-9 gap-y-2 border-b border-line pb-4">
          <div>
            <dt className="sr-only">Total Area</dt>
            <dd className="text-[15.5px] font-bold text-ink">{areaLabel(land.area, land.areaUnit)}</dd>
            <dd className="text-[12px] text-muted">Total Area</dd>
          </div>
          <div>
            <dt className="sr-only">Asking Price</dt>
            <dd className="text-[15.5px] font-bold text-ink">{inr(land.price)}</dd>
            <dd className="text-[12px] text-muted">Asking Price</dd>
          </div>
          <div>
            <dt className="sr-only">Price per Acre</dt>
            <dd className="text-[15.5px] font-bold text-ink">{inr(perAcre(land.price, land.area))}</dd>
            <dd className="text-[12px] text-muted">Price per Acre</dd>
          </div>
        </dl>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {features.map((f) => (
            <li key={f.l} className="flex items-start gap-2">
              <f.icon className="mt-1 h-4 w-4 shrink-0 text-[#9ca3af]" />
              <span>
                <span className="block text-[14.5px] text-ink">{f.v}</span>
                <span className="block text-[12px] text-muted">{f.l}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {owner && (
            <div className="flex items-center gap-3">
              <Avatar src={owner.avatar} name={owner.name} size={40} />
              <span className="leading-tight">
                <span className="block text-[14.5px] font-semibold text-ink">{owner.name}</span>
                <span className="block text-[12px] text-muted">Land Owner</span>
              </span>
            </div>
          )}
          <span className="flex items-center gap-2 text-[14px] text-muted">
            <CalendarDays className="h-4 w-4" /> Posted on {formatDate(land.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-end gap-3 border-line md:w-[160px] md:border-l md:pl-4">
        <Link href={`/lands/${land.slug}`} className="btn btn-ghost h-10 w-full text-[15px] font-medium">
          <Eye className="h-4 w-4" /> View Details
        </Link>
        <InterestButton landId={land.id} interested={interested} variant="list" />
      </div>
    </article>
  );
}
