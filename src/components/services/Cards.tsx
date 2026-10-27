import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarCheck, Clock, HardHat, Images, MapPin, Truck, UsersRound, BadgeIndianRupee, CircleCheck } from "lucide-react";
import { Img } from "@/components/Img";
import { RatingLine, Stars } from "./Stars";
import { PremiumBadge, Tag, VerifiedBadge } from "./Bits";
import { CallButton, SaveButton, WhatsAppButton } from "./Actions";
import { FALLBACK_BUSINESS_IMAGE, FALLBACK_WORKER_IMAGE, wageLabel } from "@/lib/services-config";
import type { Business, Worker } from "@/lib/types";

const HIGHLIGHT_ICON: Record<string, typeof Truck> = {
  "Site Delivery Available": Truck,
  "Best Market Rates": BadgeIndianRupee,
  "Free Site Visit": Truck,
  "On-Time Delivery": Clock,
  "10+ Years Experience": CalendarCheck,
  "24x7 Service": Clock,
};

export function businessImage(b: Business) {
  return b.images[0] || b.cover || b.services[0]?.image || FALLBACK_BUSINESS_IMAGE;
}

export function BusinessCard({ b, saved }: { b: Business; saved: boolean }) {
  const t = { type: "business" as const, id: b.id, phone: b.phone, whatsapp: b.whatsapp, name: b.name };
  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-white p-3 shadow-card sm:grid-cols-[210px_1fr] lg:grid-cols-[210px_1fr_auto]">
      <Link href={`/business-services/${b.slug}`} className="relative block h-[170px] overflow-hidden rounded-xl sm:h-[150px]">
        <Img src={businessImage(b)} alt={b.name} fill sizes="(max-width: 640px) 100vw, 210px" className="object-cover" />
        <span className="absolute left-2 top-2 flex gap-1">{b.premium ? <PremiumBadge /> : b.verified ? <VerifiedBadge /> : null}</span>
      </Link>
      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[17px] font-bold leading-snug text-ink">
            <Link href={`/business-services/${b.slug}`} className="hover:text-brand">
              {b.name}
            </Link>
          </h3>
          <SaveButton id={b.id} saved={saved} className="lg:hidden" />
        </div>
        <div className="mt-1">
          <RatingLine rating={b.rating} count={b.reviewCount} size={14} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-body">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {b.area}, {b.district}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {b.tags.slice(0, 5).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] text-body">{b.summary}</p>
        {b.highlights.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 lg:hidden">
            {b.highlights.slice(0, 2).map((h) => (
              <li key={h} className="flex items-center gap-1 text-[12.5px] text-ink">
                <CircleCheck className="h-3.5 w-3.5 text-brand" /> {h}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1 lg:w-[270px] lg:flex-row lg:items-start lg:py-1">
        {b.highlights.length > 0 && (
          <ul className="hidden w-[125px] space-y-2 pt-8 lg:block">
            {b.highlights.slice(0, 2).map((h) => {
              const I = HIGHLIGHT_ICON[h] ?? CircleCheck;
              return (
                <li key={h} className="flex items-start gap-1.5 text-[11.5px] leading-tight text-ink">
                  <I className="h-4 w-4 shrink-0 text-brand" /> {h}
                </li>
              );
            })}
          </ul>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div className="hidden justify-end lg:flex">
            <SaveButton id={b.id} saved={saved} />
          </div>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            <CallButton t={t} className="h-9 border-[#d1fae5] bg-[#ecfdf5] text-[13px]" />
            <WhatsAppButton t={t} className="h-9 text-[13px]" />
            <Link href={`/business-services/${b.slug}`} className="btn btn-outline h-9 text-[13px]">
              View Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function workerImage(w: Worker) {
  return w.photo || w.workPhotos[0] || FALLBACK_WORKER_IMAGE;
}

export function WorkerCard({ w, saved, skillLabel }: { w: Worker; saved: boolean; skillLabel?: string }) {
  const t = { type: "worker" as const, id: w.id, phone: w.phone, whatsapp: w.whatsapp, name: w.name };
  const group = w.profileType === "group";
  const skills = group && w.skillCounts ? Object.entries(w.skillCounts).map(([s, n]) => `${s.split(" / ")[0]} (${n})`) : w.skills;
  return (
    <article className="grid gap-4 rounded-2xl border border-line bg-white p-3 shadow-card sm:grid-cols-[150px_1fr] lg:grid-cols-[150px_1fr_250px]">
      <Link href={`/labour/${w.slug}`} className={`relative block h-[170px] overflow-hidden rounded-xl sm:h-[140px] ${group ? "sm:col-span-1" : ""}`}>
        <Img src={workerImage(w)} alt={w.name} fill sizes="(max-width: 640px) 100vw, 150px" className="object-cover" />
        {group ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#f59e0b] px-2 py-1 text-[11.5px] font-semibold text-white">
            <HardHat className="h-3.5 w-3.5" /> Labour Naka
          </span>
        ) : (
          w.availableToday && (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[11.5px] font-semibold text-white">
              <CircleCheck className="h-3.5 w-3.5" /> Available Today
            </span>
          )
        )}
      </Link>
      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-[17px] font-bold leading-snug text-ink">
            <Link href={`/labour/${w.slug}`} className="hover:text-brand">
              {w.name}
            </Link>
            {w.verified && <CircleCheck className="h-[18px] w-[18px] shrink-0 fill-[#2563eb] text-white" aria-label="Verified" />}
          </h3>
          <SaveButton id={w.id} saved={saved} className="lg:hidden" />
        </div>
        <div className="mt-1">
          <RatingLine rating={w.rating} count={w.reviewCount} size={14} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-body">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {w.village === w.taluka ? w.village : `${w.village}, ${w.taluka}`}, {w.district}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {skills.slice(0, group ? 4 : 2).map((s, i) => (
            <Tag key={s} tone={!group && i === 0 ? "green" : "gray"}>
              {s}
            </Tag>
          ))}
          {group && skills.length > 4 && <Tag tone="green">+{skills.length - 4} More</Tag>}
          {!group && <Tag>{w.experience} Exp</Tag>}
          {!group && <Tag>{w.teamSize ? `Team of ${w.teamSize}` : "Individual"}</Tag>}
        </div>
        <p className="mt-2 line-clamp-2 text-[13px] text-body">{w.description}</p>
        {skillLabel && <p className="sr-only">{skillLabel}</p>}
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1 lg:py-1">
        <div className="flex items-start justify-between">
          <p className="text-[21px] font-bold text-brand">{wageLabel(w)}</p>
          <SaveButton id={w.id} saved={saved} className="hidden lg:flex" />
        </div>
        <ul className="space-y-1 text-[12.5px] text-body">
          {group ? (
            <>
              <li className="flex items-center gap-1.5">
                <UsersRound className="h-4 w-4 text-muted" /> Total {w.teamSize ?? "10"}+ Workers Available
              </li>
              <li className="flex items-center gap-1.5">
                <BriefcaseBusiness className="h-4 w-4 text-muted" /> Skilled &amp; Unskilled
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted" /> Work Area: {w.workRadius}
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-1.5">
                <BriefcaseBusiness className="h-4 w-4 text-muted" /> {w.experience} Experience
              </li>
              <li className="flex items-center gap-1.5">
                <UsersRound className="h-4 w-4 text-muted" /> Individual Worker
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted" /> Available {w.workRadius.toLowerCase()}
              </li>
            </>
          )}
        </ul>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <CallButton t={t} className="h-10 text-[14px]" />
          <WhatsAppButton t={t} className="h-10 text-[14px]" />
        </div>
      </div>
    </article>
  );
}

/** Compact card used on the Find Services hub (mixes businesses and workers). */
export function ProviderRow({ kind, item, saved }: { kind: "business" | "worker"; item: Business | Worker; saved: boolean }) {
  const isW = kind === "worker";
  const w = item as Worker;
  const b = item as Business;
  const href = isW ? `/labour/${w.slug}` : `/business-services/${b.slug}`;
  const img = isW ? workerImage(w) : businessImage(b);
  const photos = isW ? w.workPhotos.length + (w.photo ? 1 : 0) : b.images.length + (b.cover ? 1 : 0);
  const t = { type: kind, id: item.id, phone: item.phone, whatsapp: item.whatsapp, name: item.name };
  const chips = isW ? [w.skills[0], `${w.experience} Exp`, w.teamSize ? `Team of ${w.teamSize}` : "Individual"] : b.tags.slice(0, 5);
  const status = isW ? (w.availableToday ? "Available Today" : "") : b.availability;
  return (
    <article className="grid grid-cols-[110px_1fr] gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-card sm:grid-cols-[190px_1fr_210px] sm:gap-4">
      <Link href={href} className="relative block h-[110px] overflow-hidden rounded-xl sm:h-[130px]">
        <Img src={img} alt={item.name} fill sizes="190px" className="object-cover" />
        {item.verified && <VerifiedBadge className="absolute left-1.5 top-1.5 !px-1.5 !py-0.5 !text-[11px]" />}
        {photos > 0 && (
          <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
            <Images className="h-3 w-3" /> {photos} Photos
          </span>
        )}
      </Link>
      <div className="min-w-0 py-0.5">
        <h3 className="truncate text-[16.5px] font-bold text-ink">
          <Link href={href} className="hover:text-brand">
            {item.name}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-[13px] text-body">
          <Stars value={item.rating} size={13} /> <b className="text-ink">{item.rating.toFixed(1)}</b> ({item.reviewCount} reviews)
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-body">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {[...new Set([isW ? w.village : b.area, item.taluka, item.district])].join(", ")}
        </p>
        <div className="mt-1.5 hidden flex-wrap gap-1.5 sm:flex">
          {chips.filter(Boolean).map((c, i) => (
            <Tag key={c} tone={isW && i === 0 ? "green" : "gray"}>
              {c}
            </Tag>
          ))}
        </div>
        <p className="mt-1.5 hidden truncate text-[12.5px] text-body sm:block">{isW ? w.description : b.summary}</p>
      </div>
      <div className="col-span-2 flex flex-col gap-2 border-t border-line pt-2 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div className="flex items-center justify-between gap-2">
          {status ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#dcf3e8] px-2 py-1 text-[12px] font-semibold text-brand">
              <CalendarCheck className="h-3.5 w-3.5" /> {status}
            </span>
          ) : (
            <span />
          )}
          <SaveButton id={item.id} saved={saved} className="!h-8 !w-8" />
        </div>
        <p className="text-[17px] font-bold text-ink">{isW ? wageLabel(w) : b.priceLabel || "Contact for Quote"}</p>
        <div className="grid grid-cols-2 gap-2">
          <CallButton t={t} className="h-9 text-[13px]" />
          <WhatsAppButton t={t} className="h-9 text-[13px]" />
        </div>
      </div>
    </article>
  );
}
