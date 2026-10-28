"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Heart, Inbox, LayoutDashboard, LogOut, Map, Menu, Plus, Users, X, Store, HardHat, PhoneCall, Star, Tags, Settings, Newspaper, History } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { LogoMark } from "../Logo";

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/lands", label: "Land Projects", icon: Map },
  { href: "/admin/lands/new", label: "Add New Land", icon: Plus, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/interests", label: "Investor Interests", icon: Heart },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
];

const CONTENT_LINKS = [
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/audit-log", label: "Audit Log", icon: History },
];

const SERVICE_LINKS = [
  { href: "/admin/businesses", label: "Businesses", icon: Store },
  { href: "/admin/workers", label: "Workers & Labour", icon: HardHat },
  { href: "/admin/service-leads", label: "Leads & Requirements", icon: PhoneCall },
  { href: "/admin/service-reviews", label: "Reviews", icon: Star },
  { href: "/admin/service-categories", label: "Categories", icon: Tags },
  { href: "/admin/service-settings", label: "Service Settings", icon: Settings },
];

type Counts = { pending: number; enquiries: number; businesses?: number; workers?: number; leads?: number; reviews?: number };

export function AdminNav({ name, counts }: { name: string; counts: Counts }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isOn = (l: { href: string; exact?: boolean }) => (l.exact ? path === l.href : path.startsWith(l.href) && !(l.href === "/admin/lands" && path === "/admin/lands/new"));
  const serviceBadge: Record<string, number | undefined> = { "/admin/businesses": counts.businesses, "/admin/workers": counts.workers, "/admin/service-leads": counts.leads, "/admin/service-reviews": counts.reviews };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Admin">
      {LINKS.map((l) => {
        const badge = l.href === "/admin/lands" ? counts.pending : l.href === "/admin/enquiries" ? counts.enquiries : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium ${isOn(l) ? "bg-brand text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
          >
            <l.icon className="h-[18px] w-[18px]" /> {l.label}
            {badge > 0 && <span className="ml-auto rounded-full bg-[#f59e0b] px-2 text-[11px] font-bold text-white">{badge}</span>}
          </Link>
        );
      })}
      <p className="mt-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">Content</p>
      {CONTENT_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium ${isOn(l) ? "bg-brand text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
        >
          <l.icon className="h-[18px] w-[18px]" /> {l.label}
        </Link>
      ))}
      <p className="mt-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">Services &amp; Labour</p>
      {SERVICE_LINKS.map((l) => {
        const badge = serviceBadge[l.href] ?? 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium ${isOn(l) ? "bg-brand text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
          >
            <l.icon className="h-[18px] w-[18px]" /> {l.label}
            {badge > 0 && <span className="ml-auto rounded-full bg-[#f59e0b] px-2 text-[11px] font-bold text-white">{badge}</span>}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] text-white/80 hover:bg-white/10">
          <ExternalLink className="h-[18px] w-[18px]" /> View Website
        </Link>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] text-[#fca5a5] hover:bg-white/10">
            <LogOut className="h-[18px] w-[18px]" /> Logout
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-forest px-4 text-white lg:hidden">
        <span className="flex items-center gap-2 font-semibold">
          <LogoMark size={30} /> AgriLand Admin
        </span>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} className="flex h-11 w-11 items-center justify-center">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && <div className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col bg-forest lg:hidden">{nav}</div>}
      <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col bg-forest text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <LogoMark size={36} />
          <div>
            <p className="text-[17px] font-bold">
              Agri<span className="text-[#7ed957]">Land</span>
            </p>
            <p className="text-[11.5px] text-white/60">Admin • {name}</p>
          </div>
        </div>
        {nav}
      </aside>
    </>
  );
}

export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
