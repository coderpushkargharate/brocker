"use client";

import { useState } from "react";
import { BadgeCheck, CalendarCheck, IndianRupee, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { DISTRICTS, SUB_DISTRICTS } from "@/lib/config";
import { Select, useQueryNav } from "./Filters";

type Q = Record<string, string | undefined>;

export function HubSearch({ q }: { q: Q }) {
  const { push } = useQueryNav(q, "#providers");
  const [text, setText] = useState(q.q ?? "");
  const [open, setOpen] = useState(false);
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: text.trim() || undefined }, { scroll: true });
        }}
        className="flex gap-2"
      >
        <label className="relative flex-1">
          <span className="sr-only">What service do you need?</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-ink" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What service do you need? e.g. JCB, Mason, Cement, Electrician..." className="h-14 w-full rounded-2xl border border-line bg-white pl-14 pr-3 text-[15.5px] shadow-soft outline-none focus:border-leaf" />
        </label>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn btn-primary h-14 rounded-2xl px-5 text-[16px]">
          <SlidersHorizontal className="h-5 w-5" /> <span className="hidden sm:inline">Filters</span>
        </button>
      </form>
      {open && (
        <div className="mt-3 grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft sm:grid-cols-3">
          <Select label="District" value={q.district ?? ""} onChange={(v) => push({ district: v || undefined, taluka: undefined })} options={[{ v: "", l: "All Districts" }, ...DISTRICTS.map((d) => ({ v: d, l: d }))]} icon={<MapPin className="h-4 w-4" />} />
          <Select label="Taluka" value={q.taluka ?? ""} onChange={(v) => push({ taluka: v || undefined })} options={[{ v: "", l: "All Talukas" }, ...(SUB_DISTRICTS[q.district ?? ""] ?? []).map((t) => ({ v: t, l: t }))]} />
          <button type="button" onClick={() => push({ q: undefined, district: undefined, taluka: undefined, cat: undefined, verified: undefined, today: undefined, sort: undefined })} className="btn btn-outline h-[42px]">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

export function HubLocation({ q }: { q: Q }) {
  const { push } = useQueryNav(q);
  const value = q.taluka ? `${q.district}|${q.taluka}` : q.district ? `${q.district}|` : "";
  const opts = [{ v: "", l: "All Maharashtra" }];
  for (const d of DISTRICTS) {
    opts.push({ v: `${d}|`, l: d });
    for (const t of SUB_DISTRICTS[d] ?? []) if (t !== d) opts.push({ v: `${d}|${t}`, l: `${t}, ${d}` });
  }
  return (
    <Select
      label="Your location"
      value={value}
      onChange={(v) => {
        const [d, t] = v.split("|");
        push({ district: d || undefined, taluka: t || undefined });
      }}
      options={opts}
      className="w-[220px] [&_select]:h-11 [&_select]:rounded-xl [&_select]:font-semibold"
      icon={<MapPin className="h-5 w-5 text-brand" />}
    />
  );
}

export function HubChips({ q, categories }: { q: Q; categories: { v: string; l: string }[] }) {
  const { push, pending } = useQueryNav(q, "#providers");
  const chip = (on: boolean) => `flex h-11 items-center gap-2 rounded-xl border px-4 text-[14.5px] font-medium ${on ? "border-brand bg-mint-50 text-brand" : "border-line bg-white text-ink"}`;
  return (
    <div className={`no-scrollbar flex gap-2 overflow-x-auto pb-1 ${pending ? "opacity-70" : ""}`}>
      <button type="button" className={chip(Boolean(q.district))} onClick={() => push({ district: q.district ? undefined : "Pune", taluka: undefined })}>
        <MapPin className="h-4 w-4" /> Nearby{q.district ? `: ${q.taluka || q.district}` : ""}
      </button>
      <button type="button" className={chip(q.verified === "1")} onClick={() => push({ verified: q.verified === "1" ? undefined : "1" })}>
        <BadgeCheck className="h-4 w-4" /> Verified
      </button>
      <button type="button" className={chip(q.today === "1")} onClick={() => push({ today: q.today === "1" ? undefined : "1" })}>
        <CalendarCheck className="h-4 w-4" /> Available Today
      </button>
      <button type="button" className={chip(q.sort === "price")} onClick={() => push({ sort: q.sort === "price" ? undefined : "price" })}>
        <IndianRupee className="h-4 w-4" /> Price
      </button>
      <Select label="Category" value={q.cat ?? ""} onChange={(v) => push({ cat: v || undefined })} options={[{ v: "", l: "All Categories" }, ...categories]} className="min-w-[200px] [&_select]:h-11 [&_select]:rounded-xl" />
    </div>
  );
}
