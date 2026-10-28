import Link from "next/link";
import { Bell, Bookmark, CheckCircle2, Heart, MapPin, Phone, Users } from "lucide-react";
import { readDB } from "@/lib/db";
import { DEFAULT_PREFS, matchScore, publicLands } from "@/lib/lands";
import { areaLabel, inr, perAcre } from "@/lib/format";
import type { Land, PublicUser } from "@/lib/types";
import { Img, FALLBACK_LAND_IMAGE } from "../Img";
import { Avatar } from "../Avatar";
import { CallButton, SaveButton } from "../LandActions";
import { ServicesPromo } from "../ServicesPromo";
import { Scroller } from "../Scroller";
import { NotificationList, Panel, PanelHead, StatCard } from "./Widgets";
import { AlertsToggle, PreferencesForm, StatusPill } from "./ClientWidgets";

function RecoCard({ land, saved }: { land: Land; saved: boolean }) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="relative aspect-[353/192]">
        <Link href={`/lands/${land.slug}`} tabIndex={-1} aria-hidden>
          <Img src={land.images[0] || FALLBACK_LAND_IMAGE} alt="" fill sizes="360px" className="object-cover" />
        </Link>
        {land.verified && (
          <span className="chip absolute left-3 top-3 bg-[#15803d] py-1 text-[12.5px] text-white">
            <CheckCircle2 className="h-4 w-4" /> VERIFIED
          </span>
        )}
        <SaveButton landId={land.id} saved={saved} className="absolute right-3 top-3" />
      </div>
      <div className="p-4">
        <h3 className="truncate text-[18px] font-semibold text-ink">
          <Link href={`/lands/${land.slug}`} className="hover:text-brand">
            {land.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[14px] text-body">
          <MapPin className="h-4 w-4 fill-[#6b7280] text-white" /> {land.taluka}, {land.district}, {land.state}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[17px] font-semibold text-ink">{areaLabel(land.area, land.areaUnit)}</span>
          <span className="text-[20px] font-bold text-ink">{inr(land.price)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[13px] text-body">{inr(perAcre(land.price, land.area))} per Acre</span>
          <span className="chip bg-[#e8f6ee] font-medium text-sea">{land.landType}</span>
        </div>
        <Link href={`/lands/${land.slug}`} className="btn btn-outline mt-4 h-10 w-full text-[16px]">
          View Details
        </Link>
      </div>
    </article>
  );
}

function MiniRow({ land, right }: { land: Land; right?: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-xl border border-line p-4 shadow-card">
      <Link href={`/lands/${land.slug}`} className="relative h-[90px] w-[110px] shrink-0 overflow-hidden rounded-lg">
        <Img src={land.images[0] || FALLBACK_LAND_IMAGE} alt={land.title} fill sizes="120px" className="object-cover" />
        <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-[#7ed957] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">{land.status === "active" ? "Active" : land.status}</span>
      </Link>
      <div className="min-w-0 flex-1">{right}</div>
    </div>
  );
}

export async function InvestorDashboard({ user }: { user: PublicUser }) {
  const db = (await readDB());
  const prefs = user.preferences ?? DEFAULT_PREFS;
  const saved = new Set(user.saved);
  const lands = publicLands(db);
  const savedLands = user.saved.map((id) => db.lands.find((l) => l.id === id)).filter((l): l is Land => !!l && l.status === "active");
  const myInterests = db.interests.filter((i) => i.investorId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const myCalls = db.calls.filter((c) => c.fromUserId === user.id);
  const connectedIds = new Set([...myCalls.map((c) => c.toUserId), ...myInterests.filter((i) => i.status !== "new").map((i) => db.lands.find((l) => l.id === i.landId)?.ownerId)].filter(Boolean) as string[]);
  const farmers = [...connectedIds].map((id) => db.users.find((u) => u.id === id)).filter(Boolean) as typeof db.users;
  const notes = db.notifications.filter((n) => n.userId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const unread = notes.filter((n) => !n.read).length;
  const recommended = [...lands].sort((a, b) => matchScore(b, prefs) - matchScore(a, prefs) || b.stats.views - a.stats.views).slice(0, 8);

  return (
    <div className="container-dash pt-8">
      <h1 className="text-[28px] font-semibold tracking-[-0.01em] text-ink sm:text-[36px]">Welcome back, {user.name}! 👋</h1>
      <p className="mt-1 text-[17px] text-body">Find the right agricultural land that matches your needs.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Saved Lands" value={savedLands.length} tone="bg-mint text-brand" icon={<Bookmark className="h-5 w-5" />} foot={<Link href="/dashboard/saved" className="text-[14px] font-medium text-brand">View all saved</Link>} />
        <StatCard label="Interested Lands" value={myInterests.length} tone="bg-[#eff6ff] text-[#2563eb]" icon={<Heart className="h-5 w-5" />} foot={<Link href="/dashboard/interests" className="text-[14px] font-medium text-brand">View all</Link>} />
        <StatCard label="Farmers Connected" value={farmers.length} tone="bg-[#fffbeb] text-[#d97706]" icon={<Users className="h-5 w-5" fill="currentColor" />} foot={<Link href="#farmers" className="text-[14px] font-medium text-brand">View all</Link>} />
        <StatCard label="Calls / Enquiries" value={myCalls.length + myInterests.filter((i) => i.message).length} tone="bg-[#f5f3ff] text-[#7c3aed]" icon={<Phone className="h-5 w-5" fill="currentColor" />} foot={<Link href="/dashboard/interests" className="text-[14px] font-medium text-brand">View all</Link>} />
        <StatCard label="New Notifications" value={unread} tone="bg-[#fef2f2] text-[#ef4444]" icon={<Bell className="h-5 w-5" />} foot={<Link href="/dashboard/notifications" className="text-[14px] font-medium text-brand">View all</Link>} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_434px]">
        <Panel className="min-w-0">
          <Scroller title="Recommended Lands for You" viewAll="/buy-land" titleClass="text-[20px] font-semibold text-ink" cols="auto-cols-[88%] sm:auto-cols-[46%] lg:auto-cols-[42%]">
            {recommended.map((l) => (
              <div key={l.id} className="snap-start lg:w-auto">
                <RecoCard land={l} saved={saved.has(l.id)} />
              </div>
            ))}
          </Scroller>
        </Panel>
        <Panel>
          <PanelHead title="Recent Notifications" href="/dashboard/notifications" />
          <NotificationList items={notes.slice(0, 4)} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.05fr_0.9fr]">
        <Panel>
          <PanelHead title="Your Saved Lands" href="/dashboard/saved" />
          <div className="mt-6 space-y-4">
            {savedLands.slice(0, 2).map((l) => (
              <MiniRow
                key={l.id}
                land={l}
                right={
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/lands/${l.slug}`} className="text-[15px] font-semibold leading-snug text-ink hover:text-brand">
                        {l.title}
                      </Link>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint">
                        <SaveButton landId={l.id} saved variant="bookmark" />
                      </span>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-[13px] text-body">
                      <MapPin className="h-3.5 w-3.5 fill-[#d1d5db] text-white" /> {l.taluka}, {l.district}, {l.state}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[12px] text-ink">
                      {areaLabel(l.area)} <span className="h-3 w-px bg-line" /> <b>{inr(l.price)}</b> <span className="text-muted">{inr(perAcre(l.price, l.area))} per Acre</span>
                    </p>
                  </>
                }
              />
            ))}
            {savedLands.length === 0 && <p className="text-[14px] text-muted">Tap the ♡ on any land to save it here.</p>}
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Land You’re Interested in" href="/dashboard/interests" />
          <div className="mt-6 space-y-4">
            {myInterests.slice(0, 2).map((i) => {
              const l = db.lands.find((x) => x.id === i.landId);
              if (!l) return null;
              return (
                <MiniRow
                  key={i.id}
                  land={l}
                  right={
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/lands/${l.slug}`} className="truncate text-[15px] font-semibold text-ink hover:text-brand">
                          {l.title}
                        </Link>
                        <StatusPill status={i.status} investor />
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[13px] text-body">
                        <MapPin className="h-3.5 w-3.5 fill-[#d1d5db] text-white" /> {l.taluka}, {l.district}, {l.state}
                      </p>
                      <p className="mt-1 text-[12px] text-ink">
                        {areaLabel(l.area)} <span className="mx-1 text-line">|</span> <b>{inr(l.price)}</b>
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Link href={`/lands/${l.slug}`} className="btn btn-outline h-8 flex-1 text-[13px]">
                          View
                        </Link>
                        <CallButton landId={l.id} label="Call Farmer" className="btn btn-primary h-8 flex-[1.6] text-[13px]" />
                      </div>
                    </>
                  }
                />
              );
            })}
            {myInterests.length === 0 && <p className="text-[14px] text-muted">Click “I&apos;m Interested” on a land to connect with the farmer.</p>}
          </div>
        </Panel>

        <Panel>
          <div id="farmers" />
          <PanelHead title="Farmers You've Connected With" href="/dashboard/interests" />
          <ul className="mt-6 space-y-5">
            {farmers.slice(0, 4).map((f) => {
              const land = db.lands.find((l) => l.ownerId === f.id && (myInterests.some((i) => i.landId === l.id) || myCalls.some((c) => c.landId === l.id)));
              return (
                <li key={f.id} className="flex items-center gap-3">
                  <Avatar src={f.avatar} name={f.name} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-ink">{f.name}</p>
                    <p className="truncate text-[13px] text-body">{land?.title ?? "Farmer"}</p>
                    <p className="flex items-center gap-1 truncate text-[11.5px] text-muted">
                      <MapPin className="h-3 w-3 fill-[#9ca3af] text-white" /> {f.village ?? land?.village}, {f.district}, {f.state}
                    </p>
                  </div>
                  {land && (
                    <Link href={`/lands/${land.slug}`} className="btn btn-outline h-8 px-4 text-[13px]">
                      View
                    </Link>
                  )}
                  <a href={`tel:${f.phone.replace(/[^\d+]/g, "")}`} className="btn btn-primary h-8 px-4 text-[13px]">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                </li>
              );
            })}
            {farmers.length === 0 && <li className="text-[14px] text-muted">Farmers you call or who respond to you will appear here.</li>}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-6">
        <div id="preferences" className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-ink">My Land Preferences</h2>
            <p className="mt-0.5 text-[13.5px] text-muted">Tell us what you&apos;re looking for so we can show you better matches.</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#pref-form" className="text-[13.5px] font-medium text-[#2563eb] hover:underline">
              Edit Preferences →
            </a>
            <AlertsToggle on={prefs.alerts} />
          </div>
        </div>
        <div id="pref-form" className="mt-4">
          <PreferencesForm prefs={prefs} />
        </div>
      </Panel>

      <div className="mt-6">
        <ServicesPromo />
      </div>
    </div>
  );
}
