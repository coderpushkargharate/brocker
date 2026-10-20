import Link from "next/link";
import {
  ArrowUp,
  Bell,
  CircleHelp,
  Eye,
  FileCheck2,
  Headphones,
  Heart,
  MessageCircle,
  Megaphone,
  Phone,
  Sprout,
  Users,
  MessageSquareText,
} from "lucide-react";
import { site } from "@/lib/config";
import { timeAgo } from "@/lib/format";
import type { Notification } from "@/lib/types";

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6 ${className}`}>{children}</section>;
}

export function PanelHead({ title, href, linkLabel = "View All", icon }: { title: React.ReactNode; href?: string; linkLabel?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-[19px] font-semibold text-ink">
        {icon}
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-[14px] font-medium text-brand hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function StatCard({ label, value, icon, tone, foot, children, href }: { label: string; value: React.ReactNode; icon: React.ReactNode; tone: string; foot?: React.ReactNode; children?: React.ReactNode; href?: string }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14.5px] text-[#374151]">{label}</p>
          <p className="mt-1 text-[30px] font-semibold leading-tight text-ink">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${tone}`}>{icon}</span>
      </div>
      {children}
      {foot && <div className="mt-3 text-[13px] text-muted">{foot}</div>}
    </>
  );
  const cls = "block rounded-2xl border border-line bg-white p-5 shadow-card transition hover:shadow-soft";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function QualityRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#167208" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.24} fontWeight="600" fill="#0b1229">
        {value}%
      </text>
    </svg>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
      <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
    </div>
  );
}

const N_ICON: Record<Notification["kind"], { icon: typeof Bell; c: string }> = {
  interest: { icon: Users, c: "bg-[#ecfdf3] text-[#16803c]" },
  call: { icon: Phone, c: "bg-[#eff6ff] text-[#2563eb]" },
  view: { icon: Eye, c: "bg-[#fff7ed] text-[#ea580c]" },
  document: { icon: FileCheck2, c: "bg-[#ecfdf3] text-[#16803c]" },
  investor: { icon: Megaphone, c: "bg-[#f5f3ff] text-[#7c3aed]" },
  land: { icon: Sprout, c: "bg-[#ecfdf3] text-[#16803c]" },
  message: { icon: MessageSquareText, c: "bg-[#eff6ff] text-[#2563eb]" },
  system: { icon: Bell, c: "bg-[#f5f3ff] text-[#7c3aed]" },
};

export function NotificationList({ items, compact }: { items: Notification[]; compact?: boolean }) {
  if (!items.length) return <p className="mt-5 text-[14px] text-muted">You&apos;re all caught up. No notifications yet.</p>;
  return (
    <ul className={`mt-5 ${compact ? "space-y-4" : "space-y-5"}`}>
      {items.map((n) => {
        const I = N_ICON[n.kind] ?? N_ICON.system;
        const body = (
          <>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${I.c}`}>
              <I.icon className="h-[18px] w-[18px]" fill={n.kind === "call" || n.kind === "document" ? "currentColor" : "none"} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[14.5px] leading-snug ${n.read ? "text-[#374151]" : "font-semibold text-ink"}`}>{n.text}</span>
              <span className="mt-1 block text-[12.5px] text-muted">{timeAgo(n.createdAt)}</span>
            </span>
            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ef4444]" aria-label="unread" />}
          </>
        );
        return (
          <li key={n.id}>
            {n.link ? (
              <Link href={n.link} className="flex gap-3 rounded-lg hover:bg-mint-50">
                {body}
              </Link>
            ) : (
              <div className="flex gap-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function NeedHelp() {
  const row = (icon: React.ReactNode, t: string, d: string, href: string) => (
    <a href={href} className="flex items-center gap-4 rounded-lg py-1 hover:bg-mint-50" target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-brand">{icon}</span>
      <span>
        <span className="block text-[15px] font-semibold text-ink">{t}</span>
        <span className="block text-[13px] text-muted">{d}</span>
      </span>
    </a>
  );
  return (
    <Panel>
      <PanelHead title="Need Help?" icon={<Headphones className="h-5 w-5 text-brand" />} />
      <p className="mt-1 text-[14.5px] text-muted">We are here to help you at every step.</p>
      <div className="mt-5 space-y-4">
        {row(<Phone className="h-[18px] w-[18px]" fill="currentColor" />, "Call Support", site.supportPhone, site.supportPhoneHref)}
        {row(<MessageCircle className="h-[18px] w-[18px]" />, "WhatsApp Support", "Chat with us", site.whatsapp)}
        {row(<CircleHelp className="h-[18px] w-[18px]" />, "Help Center", "View FAQs", "/faq")}
      </div>
      <Link href="/contact" className="btn btn-primary mt-6 h-10 w-full text-[14.5px] font-medium">
        Contact Support
      </Link>
    </Panel>
  );
}

export function Trend({ v }: { v: number }) {
  return (
    <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11.5px] font-semibold ${v >= 0 ? "bg-[#ecfdf3] text-[#16803c]" : "bg-[#fef2f2] text-[#dc2626]"}`}>
      <ArrowUp className={`h-3 w-3 ${v < 0 ? "rotate-180" : ""}`} /> {Math.abs(v)}%
    </span>
  );
}

export { Heart };
