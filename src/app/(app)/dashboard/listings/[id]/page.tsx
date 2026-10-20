import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, ChevronRight, Eye, FileText, Heart, ImageIcon, Info, Link2, MapPin, Pencil, Phone, Share2, User, Users, XCircle, ChartColumn } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { listingChecks, listingQuality, publicLands } from "@/lib/lands";
import { performance } from "@/lib/stats";
import { areaLabel, budgetLabel, inr, perAcre, timeAgo } from "@/lib/format";
import { site } from "@/lib/config";
import { Img, FALLBACK_LAND_IMAGE } from "@/components/Img";
import { Avatar } from "@/components/Avatar";
import { Card, CardTitle, DocumentsGrid, LandInfo, MapCard, NearbyGrid } from "@/components/land/Parts";
import { ReadMore } from "@/components/land/ReadMore";
import { ShareListingButton } from "@/components/LandActions";
import { MiniLandCard } from "@/components/LandCard";
import { ServicesPromo } from "@/components/ServicesPromo";
import { NeedHelp, QualityRing, Trend } from "@/components/dashboard/Widgets";
import { InterestStatusSelect, ListingMenu } from "@/components/dashboard/ClientWidgets";

export const metadata: Metadata = { title: "Listing Details" };

export default async function SellerListingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const user = await requireUser(["farmer"], `/dashboard/listings/${id}`);
  const db = readDB();
  const land = db.lands.find((l) => l.id === id);
  if (!land || land.ownerId !== user.id) notFound();

  const interests = db.interests.filter((i) => i.landId === land.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const calls = db.calls.filter((c) => c.landId === land.id);
  const perf = performance(db, [land.id]);
  const quality = listingQuality(land);
  const checks = listingChecks(land);
  const live = land.status === "active";
  const url = `${site.url}/lands/${land.slug}`;

  // Why investors are interested: simple scores from the land's attributes
  const peers = publicLands(db).filter((l) => l.district === land.district && l.id !== land.id);
  const avgPerAcre = peers.length ? peers.reduce((s, l) => s + perAcre(l.price, l.area), 0) / peers.length : perAcre(land.price, land.area);
  const priceScore = Math.max(35, Math.min(95, Math.round(70 + ((avgPerAcre - perAcre(land.price, land.area)) / (avgPerAcre || 1)) * 60)));
  const reasons = [
    ["Competitive Price", priceScore],
    [`${/black|alluvial|loam/i.test(land.soilType) ? "Fertile " : ""}${land.soilType}`, /black|alluvial|loam/i.test(land.soilType) ? 80 : 60],
    ["Good Water Availability", land.waterAvailability === "Year-round" ? 70 : 45],
    [`${land.roadAccess} Access`, /paved|highway/i.test(land.roadAccess) ? 60 : 35],
    [`Near ${land.district} Location`, 50],
  ] as const;

  const similar = publicLands(db)
    .filter((l) => l.id !== land.id && l.district === land.district)
    .slice(0, 4);

  const waiting = interests.filter((i) => i.status === "new").length;

  return (
    <div className="container-dash pt-8">
      {saved && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[14px] text-[#166534]">
          <CheckCircle2 className="h-5 w-5" />
          {land.status === "pending" ? "Listing submitted! Our team will verify your documents and publish it shortly." : land.status === "draft" ? "Draft saved." : "Listing saved successfully."}
        </p>
      )}
      <Link href="/dashboard/listings" className="inline-flex items-center gap-2 text-[14.5px] text-[#374151] hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to My Listings
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-4">
            <span className={`chip rounded text-[12px] font-bold uppercase ${live ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>{live ? "Active Listing" : land.status === "pending" ? "In Review" : land.status}</span>
            <span className="text-[13px] text-muted">ID: {land.code}</span>
          </p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-[32px]">{land.title}</h1>
          <p className="flex items-center gap-1 text-[13.5px] text-muted">
            <MapPin className="h-4 w-4 fill-[#ef4444] text-white" /> {land.village}, {land.district}, {land.state}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/listings/${land.id}/edit`} className="btn btn-ghost h-10 px-4 text-[14px]">
            <Pencil className="h-4 w-4" /> Edit Listing
          </Link>
          {live ? (
            <ShareListingButton landId={land.id} url={url} title={land.title} />
          ) : (
            <Link href={`/dashboard/listings/${land.id}/edit`} className="btn btn-primary h-10 px-5 text-[14px]">
              <Share2 className="h-4 w-4" /> Complete & Publish
            </Link>
          )}
          <ListingMenu id={land.id} slug={land.slug} live={live} afterDelete="/dashboard/listings" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.43fr_1fr]">
        <div className="relative aspect-[782/418] overflow-hidden rounded-2xl bg-mint">
          <Img src={land.images[0] || FALLBACK_LAND_IMAGE} alt={land.title} fill priority sizes="800px" className="object-cover" />
          {land.verified && (
            <span className="chip absolute left-4 top-4 bg-[#16803c] text-[12px] text-white">
              <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED LAND
            </span>
          )}
          <a href={`https://www.google.com/maps/search/?api=1&query=${land.lat},${land.lng}`} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-ink shadow">
            <MapPin className="h-4 w-4 fill-[#16803c] text-white" /> View on Map
          </a>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => {
            const src = land.images[i];
            const last = i === 4 && land.images.length > 5;
            return (
              <div key={i} className="relative aspect-[270/203] overflow-hidden rounded-2xl bg-mint">
                {src ? <Img src={src} alt="" fill sizes="280px" className="object-cover" /> : <Link href={`/dashboard/listings/${land.id}/edit`} className="flex h-full flex-col items-center justify-center text-[13px] text-muted"><ImageIcon className="h-6 w-6" /> Add photo</Link>}
                {last && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-white">
                    <span className="text-[24px] font-bold">+{land.images.length - 5}</span>
                    <span className="text-[13px]">More Photos</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="mt-6">
        <h2 className="flex items-center gap-2 text-[19px] font-semibold text-ink">
          <ChartColumn className="h-5 w-5 text-brand" /> Listing Performance <span className="text-[#9ca3af]">(This Month)</span>
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-y-5 sm:grid-cols-5 sm:divide-x sm:divide-line">
          {[
            [Eye, land.stats.views, "Views", perf.views.change],
            [Users, interests.length, "Investor Interests", perf.interests.change],
            [Heart, land.stats.saves, "Saves", null],
            [Phone, calls.length, "Calls Received", perf.calls.change],
            [Share2, land.stats.shares, "Shares", null],
          ].map(([I, v, l, c]) => {
            const Icon = I as typeof Eye;
            return (
              <div key={l as string} className="flex items-center gap-3 px-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <dd className="text-[19px] font-semibold text-ink">{(v as number).toLocaleString("en-IN")}</dd>
                  <dt className="text-[12.5px] text-muted">{l as string}</dt>
                  <dd>
                    {c !== null && <Trend v={c as number} />}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardTitle icon={<Building2 className="h-5 w-5" />}>Property Overview</CardTitle>
            <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                [areaLabel(land.area, land.areaUnit), "Total Area"],
                [land.price ? inr(land.price) : "—", "Asking Price"],
                [land.price ? `${inr(perAcre(land.price, land.area))}` : "—", "Price per Acre"],
                [land.landType, "Land Type"],
              ].map(([v, k]) => (
                <div key={k} className="rounded-xl border border-line bg-[#fafafa] p-3.5">
                  <dd className="text-[18px] font-semibold text-ink">{v}</dd>
                  <dt className="text-[12px] text-muted">{k}</dt>
                </div>
              ))}
            </dl>
          </Card>
          <Card>
            <CardTitle icon={<Info className="h-5 w-5" />}>Land Information</CardTitle>
            <LandInfo land={land} />
          </Card>
          <Card>
            <h2 className="text-[19px] font-semibold text-ink">
              Why Investors Are Interested <span className="text-[12px] font-normal text-muted">(This Month)</span>
            </h2>
            <ul className="mt-4 space-y-3.5">
              {reasons.map(([l, v]) => (
                <li key={l}>
                  <p className="text-[13.5px] text-ink">{l}</p>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#eef2f5]">
                    <div className="h-full rounded-full bg-[#16803c]" style={{ width: `${v}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle icon={<MapPin className="h-5 w-5 fill-brand text-white" />}>Location Details</CardTitle>
            <MapCard land={land} />
          </Card>
          <Card>
            <CardTitle icon={<FileText className="h-5 w-5" />}>Verified Documents</CardTitle>
            <DocumentsGrid land={land} owner />
          </Card>
          <Card>
            <CardTitle icon={<Link2 className="h-5 w-5" />}>Nearby Connectivity</CardTitle>
            <NearbyGrid land={land} />
          </Card>
          {similar.length > 0 && (
            <Card>
              <CardTitle extra={<Link href={`/locations/${land.district.toLowerCase()}`} className="text-[13px] font-semibold text-brand">View All →</Link>}>Similar Land Listings</CardTitle>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {similar.map((l) => (
                  <MiniLandCard key={l.id} land={l} showHeart={false} />
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <div id="interests" />
            <CardTitle extra={<Link href="/dashboard/interests" className="text-[13px] font-semibold text-brand">View All →</Link>}>Interested Investors ({interests.length})</CardTitle>
            <ul className="mt-4 divide-y divide-line">
              {interests.slice(0, 6).map((i) => {
                const inv = db.users.find((u) => u.id === i.investorId);
                if (!inv) return null;
                return (
                  <li key={i.id} className="flex items-start gap-3 py-4">
                    <Avatar src={inv.avatar} name={inv.name} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[15px] font-semibold text-ink">{inv.name}</p>
                        <InterestStatusSelect id={i.id} status={i.status} />
                      </div>
                      <p className="text-[12.5px] text-muted">
                        {inv.city ?? inv.district}, {inv.state ?? "Maharashtra"}
                      </p>
                      <p className="text-[12.5px] text-ink">Budget: {budgetLabel(inv.preferences?.budgetMin, inv.preferences?.budgetMax)}</p>
                      {i.message && <p className="mt-1 rounded-md bg-[#f9fafb] px-2 py-1 text-[12.5px] italic text-body">“{i.message}”</p>}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-[11.5px] text-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" /> Interested {timeAgo(i.createdAt)}
                        </span>
                        <span className="flex gap-2">
                          <a href={`mailto:${inv.email}`} className="btn btn-outline h-8 px-3 text-[13px]">
                            Email
                          </a>
                          <a href={`tel:${inv.phone.replace(/[^\d+]/g, "")}`} className="btn btn-primary h-8 px-3 text-[13px]">
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
              {interests.length === 0 && <li className="py-4 text-[14px] text-muted">No investor interest yet.</li>}
            </ul>
          </Card>
          <Card>
            <h2 className="text-[19px] font-semibold text-ink">About This Land</h2>
            <div className="mt-3">
              <ReadMore text={land.description} />
            </div>
          </Card>
          <Card>
            <h2 className="text-[19px] font-semibold text-ink">Listing Health</h2>
            <div className="mt-4 flex items-center gap-6">
              <QualityRing value={quality} size={96} />
              <ul className="flex-1 space-y-2 border-l border-line pl-6">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-[13px] text-[#374151]">
                    {c.label}
                    {c.ok ? <CheckCircle2 className="h-4 w-4 fill-[#16803c] text-white" /> : <XCircle className="h-4 w-4 fill-[#f59e0b] text-white" />}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[12.5px] text-muted">{quality >= 85 ? "Great job! Your listing is almost perfect." : "Complete the missing items to get more investor interest."}</p>
          </Card>
          <Card>
            <h2 className="text-[19px] font-semibold text-ink">Next Steps</h2>
            <ul className="mt-4 space-y-3">
              {[
                [User, `${waiting} investor${waiting === 1 ? " is" : "s are"} waiting for your response`, "Connect with them to close the deal faster.", "#interests"],
                [ImageIcon, "Add more photos", "Listings with more photos get 70% more views.", `/dashboard/listings/${land.id}/edit`],
                [FileText, "Keep documents updated", "Updated documents increase investor trust.", `/dashboard/listings/${land.id}/edit`],
              ].map(([I, t, d, href]) => {
                const Icon = I as typeof User;
                return (
                  <li key={t as string}>
                    <Link href={href as string} className="flex items-center gap-3 rounded-xl bg-[#f9fafb] p-3 hover:bg-mint-50">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-brand">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13.5px] font-semibold text-ink">{t as string}</span>
                        <span className="block text-[11.5px] text-muted">{d as string}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <h2 className="text-[16px] font-semibold text-ink">
              Listing Activity <span className="text-[12px] font-normal text-muted">(This Month)</span>
            </h2>
            <ul className="mt-4 space-y-3 border-b border-line pb-4 text-[13.5px]">
              {[
                ["Profile Views", perf.views.value, perf.views.change],
                ["Investor Interests", perf.interests.value, perf.interests.change],
                ["Calls Received", perf.calls.value, perf.calls.change],
                ["Documents Viewed", land.stats.docViews, null],
              ].map(([l, v, c]) => (
                <li key={l as string} className="flex items-center justify-between text-[#374151]">
                  {l as string}
                  <span className="flex items-center gap-2 font-semibold text-ink">
                    {v as number} {c !== null && <Trend v={c as number} />}
                  </span>
                </li>
              ))}
            </ul>
            {live && (
              <Link href={`/lands/${land.slug}`} className="mt-3 flex items-center justify-center gap-1 text-[13.5px] font-semibold text-brand hover:underline">
                View Public Page <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </Card>
          <NeedHelp />
        </div>
      </div>

      <div className="mt-6">
        <ServicesPromo />
      </div>
    </div>
  );
}
