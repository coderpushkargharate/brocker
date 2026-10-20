import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { budgetLabel, inr, timeAgo } from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { Img, FALLBACK_LAND_IMAGE } from "@/components/Img";
import { CallButton } from "@/components/LandActions";
import { InterestStatusSelect, StatusPill } from "@/components/dashboard/ClientWidgets";

export const metadata: Metadata = { title: "Investor Interests" };

export default async function InterestsPage() {
  const user = await requireUser(["farmer", "investor"], "/dashboard/interests");
  const db = readDB();
  const farmer = user.role === "farmer";
  const myLandIds = new Set(db.lands.filter((l) => l.ownerId === user.id).map((l) => l.id));
  const list = db.interests
    .filter((i) => (farmer ? myLandIds.has(i.landId) : i.investorId === user.id))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  return (
    <div className="container-dash pt-8">
      <h1 className="text-[30px] font-semibold text-ink">{farmer ? "Investor Interests" : "Lands You're Interested In"}</h1>
      <p className="text-[15px] text-muted">{farmer ? "Investors who showed interest in your lands. Update the status as you follow up." : "Track the lands you showed interest in and connect with farmers."}</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <ul className="divide-y divide-line">
          {list.map((i) => {
            const land = db.lands.find((l) => l.id === i.landId);
            const other = db.users.find((u) => u.id === (farmer ? i.investorId : land?.ownerId));
            if (!land || !other) return null;
            return (
              <li key={i.id} className="grid items-center gap-4 p-4 md:grid-cols-[1.2fr_1.3fr_auto]">
                <div className="flex items-center gap-3">
                  <Avatar src={other.avatar} name={other.name} size={46} />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-ink">{other.name}</p>
                    <p className="text-[12.5px] text-muted">
                      {farmer ? `${other.city ?? other.district ?? ""} • Budget ${budgetLabel(other.preferences?.budgetMin, other.preferences?.budgetMax)}` : "Land Owner"}
                    </p>
                    <p className="text-[12px] text-muted">{other.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={farmer ? `/dashboard/listings/${land.id}` : `/lands/${land.slug}`} className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Img src={land.images[0] || FALLBACK_LAND_IMAGE} alt={land.title} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <Link href={farmer ? `/dashboard/listings/${land.id}` : `/lands/${land.slug}`} className="block truncate text-[14.5px] font-semibold text-ink hover:text-brand">
                      {land.title}
                    </Link>
                    <p className="flex items-center gap-1 text-[12.5px] text-muted">
                      <MapPin className="h-3 w-3" /> {land.taluka}, {land.district} • {inr(land.price)}
                    </p>
                    {i.message && <p className="mt-0.5 truncate text-[12.5px] italic text-body">“{i.message}”</p>}
                    <p className="text-[11.5px] text-muted">{timeAgo(i.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  {farmer ? <InterestStatusSelect id={i.id} status={i.status} /> : <StatusPill status={i.status} investor />}
                  {farmer ? (
                    <a href={`tel:${other.phone.replace(/[^\d+]/g, "")}`} className="btn btn-primary h-9 px-4 text-[13px]">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  ) : (
                    <CallButton landId={land.id} label="Call Farmer" className="btn btn-primary h-9 px-4 text-[13px]" />
                  )}
                </div>
              </li>
            );
          })}
          {list.length === 0 && (
            <li className="p-10 text-center text-[14.5px] text-muted">
              {farmer ? "No investor interest yet. Complete your listings to attract investors." : (
                <>
                  You haven&apos;t shown interest in any land yet.{" "}
                  <Link href="/buy-land" className="link">
                    Explore lands
                  </Link>
                </>
              )}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
