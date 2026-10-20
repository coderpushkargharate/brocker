import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Heart, MapPin, Phone, Plus, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { listingQuality } from "@/lib/lands";
import { areaLabel, formatDate, inr } from "@/lib/format";
import { Img, FALLBACK_LAND_IMAGE } from "@/components/Img";
import { QualityRing } from "@/components/dashboard/Widgets";
import { ListingMenu } from "@/components/dashboard/ClientWidgets";

export const metadata: Metadata = { title: "My Land Listings" };

const CHIP: Record<string, string> = {
  active: "bg-[#dcfce7] text-[#166534]",
  draft: "bg-[#f3f4f6] text-[#374151]",
  pending: "bg-[#fef3c7] text-[#92400e]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
  sold: "bg-[#dbeafe] text-[#1e40af]",
};

export default async function ListingsPage() {
  const user = await requireUser(undefined, "/dashboard/listings");
  if (user.role === "investor") redirect("/dashboard/saved");
  const db = (await readDB());
  const mine = db.lands.filter((l) => l.ownerId === user.id).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return (
    <div className="container-dash pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold text-ink">My Land Listings</h1>
          <p className="text-[15px] text-muted">{mine.length} listings • manage, edit and track performance.</p>
        </div>
        <Link href="/dashboard/listings/new" className="btn btn-primary h-11 px-5 text-[15px]">
          <Plus className="h-4 w-4" /> Add New Listing
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {mine.map((l) => {
          const ints = db.interests.filter((i) => i.landId === l.id).length;
          const calls = db.calls.filter((c) => c.landId === l.id).length;
          return (
            <article key={l.id} className="grid items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card md:grid-cols-[160px_1fr_auto_auto]">
              <Link href={`/dashboard/listings/${l.id}`} className="relative block aspect-[4/3] overflow-hidden rounded-lg">
                <Img src={l.images[0] || FALLBACK_LAND_IMAGE} alt={l.title} fill sizes="170px" className="object-cover" />
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip uppercase ${CHIP[l.status]}`}>{l.status === "pending" ? "In review" : l.status}</span>
                  <span className="text-[12.5px] text-muted">ID: {l.code}</span>
                </div>
                <h2 className="mt-1.5 text-[18px] font-semibold text-ink">
                  <Link href={`/dashboard/listings/${l.id}`} className="hover:text-brand">
                    {l.title}
                  </Link>
                </h2>
                <p className="flex items-center gap-1 text-[13.5px] text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {l.village}, {l.taluka}, {l.district}
                </p>
                <p className="mt-1 text-[14px] text-ink">
                  {areaLabel(l.area, l.areaUnit)} • <b>{l.price ? inr(l.price) : "No price"}</b> • Updated {formatDate(l.updatedAt)}
                </p>
                <p className="mt-2 flex flex-wrap gap-4 text-[13px] text-[#374151]">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {l.stats.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {ints} interests
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> {calls} calls
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" /> {l.stats.saves} saves
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-center">
                <QualityRing value={listingQuality(l)} />
                <span className="text-[12px] text-muted">Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/listings/${l.id}/edit`} className="btn btn-outline h-9 px-4 text-[14px]">
                  Edit
                </Link>
                <Link href={`/dashboard/listings/${l.id}`} className="btn btn-ghost h-9 px-4 text-[14px]">
                  View
                </Link>
                <ListingMenu id={l.id} slug={l.slug} live={l.status === "active"} />
              </div>
            </article>
          );
        })}
        {mine.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-12 text-center">
            <p className="text-[17px] font-semibold">No listings yet</p>
            <Link href="/dashboard/listings/new" className="btn btn-primary mt-4 h-11 px-6">
              <Plus className="h-4 w-4" /> Add your first land
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
