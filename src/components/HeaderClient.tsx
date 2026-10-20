"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Plus, ShieldCheck, User as UserIcon, UserCircle2, X, Bookmark } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import { logoutAction } from "@/app/actions/auth";
import type { Role } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/buy-land", label: "Buy Land" },
  { href: "/sell-land", label: "Sell Land" },
  { href: "/investors", label: "Investors" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

type U = { name: string; role: Role; avatar?: string } | null;

function activeHref(path: string, role?: Role) {
  if (path === "/") return "/";
  if (path.startsWith("/buy-land") || path.startsWith("/lands") || path.startsWith("/locations") || path.startsWith("/land-type")) return "/buy-land";
  if (path.startsWith("/dashboard")) return role === "investor" ? "/buy-land" : "/sell-land";
  return NAV.find((n) => n.href !== "/" && path.startsWith(n.href))?.href;
}

export function HeaderClient({ user, unread }: { user: U; unread: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = activeHref(path, user?.role);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [path]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "farmer" ? "Farmer" : "Investor";
  const dash = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex h-[76px] items-center justify-between gap-4 lg:h-[88px]">
        <Logo />

        <nav aria-label="Main" className="hidden h-full items-center gap-8 lg:flex">
          {NAV.map((n) => {
            const on = active === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-full items-center text-[15.5px] font-medium transition-colors ${on ? "text-brand" : "text-[#374151] hover:text-brand"}`}
              >
                {n.label}
                {on && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-brand" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard/notifications" aria-label={`Notifications (${unread} unread)`} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink hover:bg-mint-50">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>
                )}
              </Link>
              <span className="hidden h-10 w-px bg-line sm:block" />
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-3 rounded-full py-1 pr-1 text-left" aria-haspopup="menu" aria-expanded={menu}>
                  <Avatar src={user.avatar} name={user.name} size={42} />
                  <span className="hidden leading-tight sm:block">
                    <span className="block text-[15px] font-semibold text-ink">{user.name}</span>
                    <span className="block text-[13px] text-muted">{roleLabel}</span>
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
                </button>
                {menu && (
                  <div role="menu" className="absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden rounded-xl border border-line bg-white py-2 shadow-soft">
                    <MenuLink href={dash} icon={<LayoutDashboard className="h-4 w-4" />}>
                      {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                    </MenuLink>
                    {user.role === "farmer" && (
                      <MenuLink href="/dashboard/listings/new" icon={<Plus className="h-4 w-4" />}>
                        Add New Listing
                      </MenuLink>
                    )}
                    {user.role === "investor" && (
                      <MenuLink href="/dashboard/saved" icon={<Bookmark className="h-4 w-4" />}>
                        Saved Lands
                      </MenuLink>
                    )}
                    <MenuLink href="/dashboard/profile" icon={<UserIcon className="h-4 w-4" />}>
                      My Profile
                    </MenuLink>
                    {user.role === "admin" && (
                      <MenuLink href="/admin/lands" icon={<ShieldCheck className="h-4 w-4" />}>
                        Manage Lands
                      </MenuLink>
                    )}
                    <form action={logoutAction}>
                      <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#dc2626] hover:bg-[#fef2f2]">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary hidden h-11 rounded-lg px-6 text-[14.5px] shadow-[0_6px_14px_rgba(22,114,8,0.25)] sm:inline-flex">
              <UserCircle2 className="h-5 w-5" /> Log in /Sign Up
            </Link>
          )}
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-line lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Open menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-line bg-white lg:hidden">
          <div className="container-x flex flex-col py-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`rounded-lg px-3 py-3 text-[15px] font-medium ${active === n.href ? "bg-mint-50 text-brand" : "text-ink"}`}>
                {n.label}
              </Link>
            ))}
            {!user && (
              <Link href="/login" className="btn btn-primary mt-2 h-11">
                <UserCircle2 className="h-5 w-5" /> Log in /Sign Up
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-mint-50">
      <span className="text-brand">{icon}</span>
      {children}
    </Link>
  );
}
