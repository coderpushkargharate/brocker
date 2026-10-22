import Link from "next/link";
import Image from "next/image";
import {
  CircleHelp,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  FolderOpen,
  ImageIcon,
  IndianRupee,
  Lightbulb,
  List,
  MapPinned,
  MessageSquareMore,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  User,
  Users,
  ChevronRight,
  BarChart3,
  Check,
  MapPin,
  NotebookPen,
} from "lucide-react";
import { readDB } from "@/lib/db";
import { listingQuality, profileStrength } from "@/lib/lands";
import { performance, within } from "@/lib/stats";
import { areaLabel, budgetLabel, formatDate, inr, perAcre, timeAgo } from "@/lib/format";
import type { PublicUser } from "@/lib/types";
import { Img, FALLBACK_LAND_IMAGE } from "../Img";
import { Avatar } from "../Avatar";
import { ServicesPromo } from "../ServicesPromo";
import { NeedHelp, NotificationList, Panel, PanelHead, ProgressBar, QualityRing, StatCard, Trend } from "./Widgets";
import { InterestStatusSelect, ListingMenu } from "./ClientWidgets";

const STATUS_CHIP: Record<string, string> = {
  active: "bg-[#7ed957] text-white",
  draft: "bg-[#6b7280]/80 text-white",
  pending: "bg-[#f59e0b] text-white",
  rejected: "bg-[#ef4444] text-white",
  sold: "bg-[#2563eb] text-white",
};

export async function FarmerDashboard({ user }: { user: PublicUser }) {
  const db = (await readDB());
  const mine = db.lands.filter((l) => l.ownerId === user.id).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  const ids = mine.map((l) => l.id);
  const interests = db.interests.filter((i) => ids.includes(i.landId)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const calls = db.calls.filter((c) => ids.includes(c.landId));
  const notes = db.notifications.filter((n) => n.userId === user.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const perf = performance(db, ids);
  const active = mine.filter((l) => l.status === "active");
  const drafts = mine.filter((l) => l.status === "draft").length;
  const pending = mine.filter((l) => l.status === "pending").length;
  const strength = profileStrength(user);
  const newThisWeek = interests.filter((i) => within(i.createdAt, 7)).length;
  const missedCalls = calls.length;
  const anyVerified = active.some((l) => l.verified);
  const docOk = active.some((l) => l.documents.filter((d) => d.status === "verified").length >= 3);

  return (
    <div className="container-dash pt-8">
      <h1 className="text-[28px] font-semibold tracking-[-0.01em] text-ink sm:text-[34px]">Welcome back, {user.name}! 👋</h1>
      <p className="mt-1 text-[16px] text-body">Here&apos;s what&apos;s happening with your land listings today.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Total Listings"
          value={mine.length}
          tone="bg-[#ecfdf3] text-[#16803c]"
          icon={<ClipboardCheck className="h-5 w-5" />}
          href="/dashboard/listings"
          foot={
            <span className="flex flex-wrap items-center gap-x-2">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> {active.length} Active
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#9ca3af]" /> {drafts} Draft
              </span>
              {pending > 0 && <span>• {pending} In review</span>}
            </span>
          }
        />
        <StatCard label="Investor Interests" value={interests.length} tone="bg-[#eff6ff] text-[#2563eb]" icon={<Users className="h-5 w-5" fill="currentColor" />} foot={<span><b className="font-medium text-[#16803c]">+{newThisWeek} New</b> this week</span>} href="/dashboard/interests" />
        <StatCard label="Profile Views" value={user.profileViews} tone="bg-[#fff7ed] text-[#ea580c]" icon={<Eye className="h-5 w-5" />} foot={<span><b className="font-medium text-[#16803c]">+{perf.views.week}</b> this week</span>} />
        <StatCard label="Calls" value={calls.length} tone="bg-[#f5f3ff] text-[#7c3aed]" icon={<MessageSquareMore className="h-5 w-5" />} foot={<span>{missedCalls} Calls •</span>} />
        <StatCard label="Profile Strength" value={`${strength}%`} tone="bg-[#ecfdf3] text-[#16803c]" icon={<ShieldCheck className="h-5 w-5" fill="currentColor" stroke="white" />} href="/dashboard/profile">
          <div className="mt-3">
            <ProgressBar value={strength} />
          </div>
          <p className="mt-2 text-[13px] text-muted">{strength >= 100 ? "Complete" : strength >= 70 ? "Almost Complete" : "Needs attention"}</p>
        </StatCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_434px]">
        <section aria-labelledby="mylist-h">
          <div className="flex items-center justify-between">
            <h2 id="mylist-h" className="flex items-center gap-2.5 text-[19px] font-semibold text-ink">
              <List className="h-5 w-5 text-brand" /> My Land Listings
            </h2>
            <Link href="/dashboard/listings/new" className="flex items-center gap-1.5 text-[15px] font-medium text-brand hover:underline">
              <Plus className="h-4 w-4" /> Add New Listing
            </Link>
          </div>
          <div className="mt-4 space-y-6">
            {mine.slice(0, 3).map((l) => {
              const q = listingQuality(l);
              const li = interests.filter((i) => i.landId === l.id).length;
              const lc = calls.filter((c) => c.landId === l.id).length;
              return (
                <article key={l.id} className="grid gap-4 rounded-2xl border border-line bg-white p-4 shadow-card sm:grid-cols-[192px_1fr_auto]">
                  <Link href={`/dashboard/listings/${l.id}`} className="relative block aspect-[192/140] overflow-hidden rounded-lg">
                    <Img src={l.images[0] || FALLBACK_LAND_IMAGE} alt={l.title} fill sizes="200px" className="object-cover" />
                    <span className={`absolute right-2 top-2 rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${STATUS_CHIP[l.status]}`}>{l.status === "pending" ? "In review" : l.status}</span>
                  </Link>
                  <div className="min-w-0">
                    <h3 className="text-[19px] font-semibold text-ink">
                      <Link href={`/dashboard/listings/${l.id}`} className="hover:text-brand">
                        {l.title}
                      </Link>
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-[14.5px] text-muted">
                      <MapPin className="h-4 w-4 fill-[#d1d5db] text-white" /> {l.taluka}, {l.district}, {l.state}
                    </p>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15.5px] text-ink">
                      <span>{areaLabel(l.area, l.areaUnit)}</span>
                      <span className="h-4 w-px bg-line" />
                      {l.status === "draft" ? (
                        <span className="text-[#374151]">Draft</span>
                      ) : (
                        <>
                          <b className="font-bold">{inr(l.price)}</b>
                          <span className="text-[13px] text-muted">{inr(perAcre(l.price, l.area))} per Acre</span>
                        </>
                      )}
                    </p>
                    {l.status === "draft" ? (
                      <p className="mt-5 flex items-center gap-1 text-[13px] text-muted">
                        <Clock className="h-4 w-4" /> Last edited on {formatDate(l.updatedAt)}
                      </p>
                    ) : (
                      <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#374151]">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" fill="currentColor" /> {li} Investor Interests
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4" fill="currentColor" /> {lc} Calls Received
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex flex-col items-center">
                      <QualityRing value={q} />
                      <span className="mt-1 text-[13px] text-[#374151]">Listing Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {l.status === "draft" || q < 70 ? (
                        <Link href={`/dashboard/listings/${l.id}/edit`} className="btn btn-outline h-9 w-[148px] text-[15px] font-medium">
                          Complete Listing
                        </Link>
                      ) : (
                        <Link href={`/dashboard/listings/${l.id}`} className="btn btn-ghost h-9 w-[148px] text-[15px] font-medium">
                          View Details
                        </Link>
                      )}
                      <ListingMenu id={l.id} slug={l.slug} live={l.status === "active"} />
                    </div>
                  </div>
                </article>
              );
            })}
            {mine.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-10 text-center">
                <p className="text-[17px] font-semibold text-ink">You haven&apos;t listed any land yet</p>
                <p className="mt-1 text-[14px] text-body">List your land free and connect with genuine verified investors.</p>
                <Link href="/dashboard/listings/new" className="btn btn-primary mt-5 h-11 px-6 text-[14px]">
                  <Plus className="h-4 w-4" /> Add New Listing
                </Link>
              </div>
            )}
          </div>
          {mine.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/dashboard/listings" className="btn btn-ghost h-10 px-6 text-[15px] font-medium">
                View All Listings
              </Link>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <Panel>
            <PanelHead title="Recent Notifications" href="/dashboard/notifications" />
            <NotificationList items={notes.slice(0, 5)} />
          </Panel>
          <Panel>
            <PanelHead title="Recent Investor Interests" href="/dashboard/interests" />
            <ul className="mt-5 space-y-5">
              {interests.slice(0, 3).map((i) => {
                const inv = db.users.find((u) => u.id === i.investorId);
                const land = mine.find((l) => l.id === i.landId);
                if (!inv) return null;
                return (
                  <li key={i.id} className="flex items-start gap-3">
                    <Avatar src={inv.avatar} name={inv.name} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[15px] font-semibold text-ink">{inv.name}</p>
                        <InterestStatusSelect id={i.id} status={i.status} />
                      </div>
                      <p className="text-[12.5px] text-muted">
                        {inv.city ?? inv.district}, {inv.state ?? "Maharashtra"}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[12px] text-muted">
                          Budget: {budgetLabel(inv.preferences?.budgetMin, inv.preferences?.budgetMax)} • {timeAgo(i.createdAt)}
                        </p>
                        <span className="flex gap-2">
                          <Link href={`/dashboard/listings/${land?.id ?? ""}#interests`} className="btn btn-outline h-8 px-4 text-[13px]">
                            View
                          </Link>
                          <a href={`tel:${inv.phone.replace(/[^\d+]/g, "")}`} className="btn btn-primary h-8 px-4 text-[13px]">
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
              {interests.length === 0 && <li className="text-[14px] text-muted">No investor interest yet. Complete your listings to attract investors.</li>}
            </ul>
            <Link href="/dashboard/interests" className="mt-5 inline-flex items-center gap-1 text-[13.5px] font-semibold text-brand hover:underline">
              View All Investor Interests <ChevronRight className="h-4 w-4" />
            </Link>
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel>
          <h2 className="flex items-center gap-2 text-[19px] font-semibold text-ink">
            <BarChart3 className="h-5 w-5 text-brand" /> Listing Performance <span className="text-[14px] font-normal text-muted">(This Month)</span>
          </h2>
          <dl className="mt-6 grid grid-cols-4 gap-2 text-center">
            {[
              ["Views", perf.views],
              ["Investor Interests", perf.interests],
              ["Calls Received", perf.calls],
              ["Messages", perf.messages],
            ].map(([k, v]) => {
              const s = v as { value: number; change: number };
              return (
                <div key={k as string}>
                  <dd className="text-[24px] font-semibold text-ink">{s.value}</dd>
                  <dt className="text-[12.5px] leading-tight text-muted">{k as string}</dt>
                  <dd className="mt-1.5">
                    <Trend v={s.change} />
                  </dd>
                </div>
              );
            })}
          </dl>
          <Link href="/dashboard/listings" className="mt-6 inline-block text-[14.5px] font-semibold text-brand hover:underline">
            See Performance Details
          </Link>
        </Panel>

        <Panel>
          <h2 className="text-[19px] font-semibold text-ink">Certified Agri Land</h2>
          <div className="mt-5 flex gap-5">
            <span className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-lg bg-mint-50">
              <ShieldCheck className="h-11 w-11 fill-brand text-white" />
              <span className="mt-1 rounded bg-brand px-1.5 text-[9px] font-semibold text-white">AgriLand</span>
            </span>
            <div className="flex-1">
              <p className="text-[14.5px] text-[#374151]">{anyVerified ? "Your active listings are verified and trusted." : "Get your listings verified to earn the certified badge."}</p>
              <ul className="mt-2 space-y-1.5 text-[13.5px] text-ink">
                {[
                  ["Document Verified", docOk],
                  ["Location Verified", anyVerified],
                  ["Ownership Verified", anyVerified],
                ].map(([t, ok]) => (
                  <li key={t as string} className="flex items-center justify-between">
                    {t as string}
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full ${ok ? "bg-[#16803c]" : "bg-[#d1d5db]"}`}>
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link href="/about#verification" className="mt-5 inline-flex items-center gap-1 text-[14.5px] font-medium text-brand hover:underline">
            Learn more about certification <CircleHelp className="h-4 w-4" />
          </Link>
        </Panel>

        <section className="relative min-h-[228px] overflow-hidden rounded-2xl">
          <Image src="/images/promo-buyers.jpg" alt="" fill sizes="440px" className="object-cover" />
          <div className="relative p-5">
            <h2 className="max-w-[230px] text-[19px] font-semibold leading-snug text-brand-600">Get More Buyers for Your Land!</h2>
            <p className="mt-2 max-w-[220px] text-[14.5px] leading-snug text-[#374151]">Promote your listing and reach thousands of serious investors.</p>
            <Link href="/contact?subject=Boost%20my%20listing" className="btn btn-primary mt-4 h-9 px-5 text-[14.5px] font-medium">
              Boost Your Listing
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Panel className="lg:row-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[19px] font-semibold text-ink">
              <User className="h-5 w-5 text-brand" /> My Profile
            </h2>
            <Link href="/dashboard/profile" className="flex items-center gap-1 text-[14.5px] text-brand hover:underline">
              Edit Profile <Pencil className="h-3.5 w-3.5" fill="currentColor" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <Avatar src={user.avatar} name={user.name} size={90} className="ring-4 ring-mint" />
            <p className="mt-3 text-[20px] font-semibold text-ink">{user.name}</p>
            {user.verified ? <span className="mt-1 rounded-full bg-mint px-3 py-0.5 text-[12.5px] font-medium text-brand">Verified Farmer</span> : <span className="mt-1 rounded-full bg-[#fffbeb] px-3 py-0.5 text-[12.5px] font-medium text-[#b45309]">Verification pending</span>}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[14.5px]">
            {[
              ["District", user.district],
              ["Mobile", user.phone],
              ["State", user.state],
              ["Village", user.village],
              ["Experience", user.experience],
              ["Taluka", user.taluka],
              ["Farming Type", user.farmingType],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[12.5px] text-muted">{k}</dt>
                <dd className="truncate text-ink">{v || "—"}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-center justify-between text-[14.5px] font-medium text-ink">
            Profile Strength <span>{strength}%</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={strength} />
          </div>
          <Link href="/dashboard/profile" className="btn btn-ghost mt-4 h-10 w-full text-[14.5px] font-normal">
            Complete Profile
          </Link>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHead title="Tips to Get More Investors" icon={<Lightbulb className="h-5 w-5 text-[#f59e0b]" />} href={mine[0] ? `/dashboard/listings/${mine[0].id}/edit` : "/dashboard/listings/new"} />
            <ul className="mt-3 divide-y divide-line">
              {[
                [ImageIcon, "Add clear and high-quality photos of your land."],
                [FileText, "Keep your documents up to date and verified."],
                [MapPinned, "Provide exact location for better trust."],
                [NotebookPen, "Write a good description about your land."],
                [IndianRupee, "Set a fair and competitive price."],
              ].map(([I, t]) => {
                const Icon = I as typeof ImageIcon;
                return (
                  <li key={t as string}>
                    <Link href={mine[0] ? `/dashboard/listings/${mine[0].id}/edit` : "/dashboard/listings/new"} className="flex items-center justify-between gap-3 py-3 text-[14.5px] text-[#374151] hover:text-brand">
                      <span className="flex items-center gap-3">
                        <Icon className="h-[18px] w-[18px] text-brand" /> {t as string}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <NeedHelp />
        <section className="lg:col-span-2" aria-labelledby="qa-h">
          <h2 id="qa-h" className="flex items-center gap-2 text-[15px] font-medium text-[#374151]">
            <FolderOpen className="h-4 w-4" fill="currentColor" /> Quick Actions
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {[
              { href: "/dashboard/listings/new", icon: <Plus className="h-4 w-4" />, c: "bg-mint text-brand", t: "Add New Listing", d: "List your land" },
              { href: "/dashboard/profile", icon: <Pencil className="h-4 w-4" />, c: "bg-[#eff6ff] text-[#2563eb]", t: "Edit Profile", d: "Update your details" },
              { href: "/faq", icon: <CircleHelp className="h-4 w-4" />, c: "bg-[#f5f3ff] text-[#7c3aed]", t: "Help Center", d: "Get support" },
              { href: "/dashboard/listings", icon: <FileText className="h-4 w-4" />, c: "bg-[#fff7ed] text-[#ea580c]", t: "My Documents", d: "Manage documents" },
            ].map((a) => (
              <Link key={a.t} href={a.href} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-card hover:shadow-soft">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${a.c}`}>{a.icon}</span>
                <span>
                  <span className="block text-[15px] font-semibold text-ink">{a.t}</span>
                  <span className="block text-[11.5px] text-muted">{a.d}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6">
        <ServicesPromo />
      </div>
    </div>
  );
}
