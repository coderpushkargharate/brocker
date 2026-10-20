import Link from "next/link";
import { Check, Clock, Eye, Heart, Inbox, Map, Plus, Users, X } from "lucide-react";
import { readDB } from "@/lib/db";
import { formatDate, inr, timeAgo } from "@/lib/format";
import { setLandStatusAction } from "@/app/actions/admin";
import { Box, PageTitle } from "@/components/admin/Bits";
import { Img, FALLBACK_LAND_IMAGE } from "@/components/Img";

export const metadata = { title: "Overview" };

export default function AdminHome() {
  const db = readDB();
  const pending = db.lands.filter((l) => l.status === "pending");
  const stats = [
    { label: "Total Land Projects", v: db.lands.length, sub: `${db.lands.filter((l) => l.status === "active").length} live`, icon: Map, href: "/admin/lands" },
    { label: "Pending Review", v: pending.length, sub: "Need verification", icon: Clock, href: "/admin/lands?status=pending" },
    { label: "Users", v: db.users.length, sub: `${db.users.filter((u) => u.role === "farmer").length} farmers • ${db.users.filter((u) => u.role === "investor").length} investors`, icon: Users, href: "/admin/users" },
    { label: "Investor Interests", v: db.interests.length, sub: `${db.calls.length} calls logged`, icon: Heart, href: "/admin/interests" },
    { label: "Enquiries", v: db.enquiries.length, sub: `${db.enquiries.filter((e) => e.status === "new").length} new`, icon: Inbox, href: "/admin/enquiries" },
    { label: "Total Views", v: db.lands.reduce((s, l) => s + l.stats.views, 0).toLocaleString("en-IN"), sub: "All listings", icon: Eye, href: "/admin/lands?sort=views" },
  ];
  const recentUsers = [...db.users].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);

  return (
    <>
      <PageTitle title="Admin Overview" sub="Manage all land projects, users and enquiries.">
        <Link href="/admin/lands/new" className="btn btn-primary h-11 px-5 text-[14.5px]">
          <Plus className="h-4 w-4" /> Add New Land
        </Link>
      </PageTitle>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-white p-4 shadow-card hover:shadow-soft">
            <s.icon className="h-5 w-5 text-brand" />
            <p className="mt-3 text-[26px] font-bold text-ink">{s.v}</p>
            <p className="text-[13.5px] font-medium text-ink">{s.label}</p>
            <p className="text-[12px] text-muted">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Box>
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-ink">Waiting for Review ({pending.length})</h2>
            <Link href="/admin/lands?status=pending" className="text-[13.5px] font-semibold text-brand">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {pending.map((l) => {
              const owner = db.users.find((u) => u.id === l.ownerId);
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-4 py-3">
                  <div className="relative h-14 w-20 overflow-hidden rounded-lg">
                    <Img src={l.images[0] || FALLBACK_LAND_IMAGE} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/lands/${l.id}`} className="font-semibold text-ink hover:text-brand">
                      {l.title}
                    </Link>
                    <p className="text-[12.5px] text-muted">
                      {owner?.name} • {l.taluka}, {l.district} • {inr(l.price)} • {timeAgo(l.updatedAt)}
                    </p>
                  </div>
                  <form action={setLandStatusAction.bind(null, l.id, "active")}>
                    <button className="btn btn-primary h-9 px-3 text-[13px]">
                      <Check className="h-4 w-4" /> Approve
                    </button>
                  </form>
                  <form action={setLandStatusAction.bind(null, l.id, "rejected")}>
                    <button className="btn btn-ghost h-9 px-3 text-[13px] text-[#dc2626]">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </form>
                  <Link href={`/admin/lands/${l.id}`} className="btn btn-ghost h-9 px-3 text-[13px]">
                    Review
                  </Link>
                </li>
              );
            })}
            {pending.length === 0 && <li className="py-6 text-center text-[14px] text-muted">No listings waiting for review. 🎉</li>}
          </ul>
        </Box>

        <div className="space-y-6">
          <Box>
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-ink">Latest Enquiries</h2>
              <Link href="/admin/enquiries" className="text-[13.5px] font-semibold text-brand">
                View all
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {[...db.enquiries]
                .reverse()
                .slice(0, 4)
                .map((e) => (
                  <li key={e.id} className="py-2.5">
                    <p className="text-[14px] font-semibold text-ink">
                      {e.name} <span className="font-normal text-muted">• {e.subject}</span>
                    </p>
                    <p className="truncate text-[12.5px] text-body">{e.message}</p>
                  </li>
                ))}
              {db.enquiries.length === 0 && <li className="py-4 text-[14px] text-muted">No enquiries yet.</li>}
            </ul>
          </Box>
          <Box>
            <h2 className="text-[18px] font-semibold text-ink">New Users</h2>
            <ul className="mt-3 divide-y divide-line">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2.5 text-[14px]">
                  <span>
                    <b className="text-ink">{u.name}</b> <span className="text-muted capitalize">• {u.role}</span>
                  </span>
                  <span className="text-[12px] text-muted">{formatDate(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Box>
        </div>
      </div>
    </>
  );
}
