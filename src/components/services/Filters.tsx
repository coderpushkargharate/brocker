"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, MapPin, Plus, Search } from "lucide-react";
import { DISTRICTS, SUB_DISTRICTS } from "@/lib/config";
import { EXPERIENCE_OPTIONS, WAGE_MAX, WAGE_MIN } from "@/lib/services-config";

type Q = Record<string, string | undefined>;

export function useQueryNav(current: Q, anchor = "") {
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const push = (patch: Q, opts?: { base?: string; scroll?: boolean }) => {
    const p = new URLSearchParams();
    const next = { ...current, ...patch, page: undefined };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    start(() => router.push(`${opts?.base ?? path}${p.size ? `?${p}` : ""}${anchor}`, { scroll: opts?.scroll ?? false }));
  };
  return { push, pending };
}

export function Select({ value, onChange, options, label, className = "", icon }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; label: string; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={`relative ${className}`}>
      {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink">{icon}</span>}
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`h-[42px] w-full appearance-none rounded-lg border border-[#d1d5db] bg-white pr-9 text-[14.5px] text-ink outline-none focus:border-leaf ${icon ? "pl-10" : "pl-3.5"}`}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
    </div>
  );
}

const districtOpts = (all = "Select District") => [{ v: "", l: all }, ...DISTRICTS.map((d) => ({ v: d, l: d }))];
const talukaOpts = (district?: string) => [{ v: "", l: "Select Taluka" }, ...(district ? SUB_DISTRICTS[district] ?? [] : []).map((t) => ({ v: t, l: t }))];

function CheckList({ items, selected, onToggle, initial = 5 }: { items: [string, number][]; selected: string[]; onToggle: (v: string) => void; initial?: number }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, initial);
  return (
    <>
      <ul className="mt-3 space-y-2.5">
        {shown.map(([name, count]) => (
          <li key={name}>
            <label className="flex cursor-pointer items-center gap-3 text-[14px] text-ink">
              <input type="checkbox" className="check rounded" checked={selected.includes(name)} onChange={() => onToggle(name)} />
              <span className="flex-1">{name}</span>
              <span className="text-[13px] text-muted">({count})</span>
            </label>
          </li>
        ))}
      </ul>
      {items.length > initial && (
        <button type="button" onClick={() => setAll((a) => !a)} className="mt-3 flex items-center gap-1.5 text-[13.5px] font-semibold text-brand">
          <Plus className="h-4 w-4" /> {all ? "Show Less" : `Show ${items.length - initial} More`}
        </button>
      )}
    </>
  );
}

const toggleIn = (csv: string | undefined, v: string) => {
  const s = new Set((csv ?? "").split(",").filter(Boolean));
  if (s.has(v)) s.delete(v);
  else s.add(v);
  return [...s].join(",") || undefined;
};

// ---------- Business ----------

export function BizSearch({ q, popular }: { q: Q; popular: string[] }) {
  const { push } = useQueryNav(q, "#results");
  const [text, setText] = useState(q.q ?? "");
  const [district, setDistrict] = useState(q.district ?? "");
  useEffect(() => setText(q.q ?? ""), [q.q]);
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q: text.trim() || undefined, district: district || undefined, taluka: district === q.district ? q.taluka : undefined }, { scroll: true });
        }}
        className="grid gap-2 rounded-2xl bg-white p-2 shadow-soft sm:grid-cols-[1fr_220px_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search service</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search service (e.g. JCB, Borewell, Cement, Electrician...)" className="h-12 w-full rounded-xl border border-line pl-12 pr-3 text-[15px] outline-none focus:border-leaf" />
        </label>
        <Select label="District" value={district} onChange={setDistrict} options={districtOpts("All Maharashtra")} className="[&_select]:h-12 [&_select]:rounded-xl" icon={<MapPin className="h-4 w-4" />} />
        <button className="btn btn-primary h-12 rounded-xl px-8 text-[16px]">
          <Search className="h-5 w-5" /> Search
        </button>
      </form>
      {popular.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[14px] font-medium text-ink">Popular Searches:</span>
          {popular.map((p) => (
            <button key={p} type="button" onClick={() => push({ q: p }, { scroll: true })} className="rounded-full border border-line bg-white/90 px-3.5 py-1.5 text-[12.5px] font-medium text-ink shadow-sm hover:border-brand hover:text-brand">
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BizFilters({ q, subs }: { q: Q; subs: [string, number][] }) {
  const { push, pending } = useQueryNav(q);
  return (
    <section aria-label="Filters" className={`rounded-2xl border border-line bg-white p-5 shadow-card transition ${pending ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h2 className="text-[18px] font-bold text-ink">Filter Results</h2>
        <button type="button" onClick={() => push({ district: undefined, taluka: undefined, sub: undefined, verified: undefined, q: undefined, category: undefined })} className="text-[13px] font-semibold text-brand">
          Clear All
        </button>
      </div>
      <h3 className="mt-4 text-[14.5px] font-semibold text-ink">Location</h3>
      <div className="mt-2 space-y-2.5">
        <Select label="District" value={q.district ?? ""} onChange={(v) => push({ district: v || undefined, taluka: undefined })} options={districtOpts("All Districts")} />
        <Select label="Taluka" value={q.taluka ?? ""} onChange={(v) => push({ taluka: v || undefined })} options={talukaOpts(q.district)} />
      </div>
      <h3 className="mt-5 text-[14.5px] font-semibold text-ink">Service Subcategory</h3>
      <CheckList items={subs} selected={(q.sub ?? "").split(",")} onToggle={(v) => push({ sub: toggleIn(q.sub, v) })} />
      <label className="mt-5 flex cursor-pointer items-center gap-3 border-t border-line pt-4 text-[14px] text-ink">
        <input type="checkbox" className="check rounded" checked={q.verified === "1"} onChange={(e) => push({ verified: e.target.checked ? "1" : undefined })} />
        Verified Businesses Only
      </label>
    </section>
  );
}

export function SortBy({ q, options }: { q: Q; options: { v: string; l: string }[] }) {
  const { push } = useQueryNav(q);
  return (
    <label className="flex items-center gap-2 text-[13.5px] text-body">
      Sort by:
      <Select label="Sort" value={q.sort ?? ""} onChange={(v) => push({ sort: v || undefined })} options={options} className="w-[175px] [&_select]:h-10 [&_select]:text-[13.5px]" />
    </label>
  );
}

// ---------- Labour ----------

export function WorkerSearch({ q, villages }: { q: Q; villages: string[] }) {
  const { push } = useQueryNav(q, "#results");
  const [text, setText] = useState(q.q ?? "");
  const [district, setDistrict] = useState(q.district ?? "");
  const [taluka, setTaluka] = useState(q.taluka ?? "");
  const [village, setVillage] = useState(q.village ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        push({ q: text.trim() || undefined, district: district || undefined, taluka: taluka || undefined, village: village || undefined, tab: undefined }, { scroll: true });
      }}
      className="grid gap-2 rounded-2xl bg-white p-2 shadow-soft md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_1fr_auto]"
    >
      <label className="relative md:col-span-2 xl:col-span-1">
        <span className="sr-only">Search worker type</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search worker type (e.g. Mason, Helper, Painter...)" className="h-12 w-full rounded-xl border border-line pl-12 pr-3 text-[15px] outline-none focus:border-leaf" />
      </label>
      <Select label="District" value={district} onChange={(v) => { setDistrict(v); setTaluka(""); setVillage(""); }} options={districtOpts()} className="[&_select]:h-12 [&_select]:rounded-xl" icon={<MapPin className="h-4 w-4" />} />
      <Select label="Taluka" value={taluka} onChange={(v) => { setTaluka(v); setVillage(""); }} options={talukaOpts(district)} className="[&_select]:h-12 [&_select]:rounded-xl" />
      <Select label="Village" value={village} onChange={setVillage} options={[{ v: "", l: "Select Village" }, ...villages.map((v) => ({ v, l: v }))]} className="[&_select]:h-12 [&_select]:rounded-xl" />
      <button className="btn btn-primary h-12 rounded-xl px-7 text-[16px] md:col-span-2 xl:col-span-1">
        <Search className="h-5 w-5" /> Search Workers
      </button>
    </form>
  );
}

function parseWage(v?: string): [number, number] {
  if (!v) return [WAGE_MIN, WAGE_MAX];
  const [a, b] = v.split("-").map(Number);
  return [a || WAGE_MIN, Math.min(b || WAGE_MAX, WAGE_MAX)];
}

export function WorkerFilters({ q, skills, villages, exps }: { q: Q; skills: [string, number][]; villages: string[]; exps: Record<string, number> }) {
  const { push, pending } = useQueryNav(q);
  const [wage, setWage] = useState(parseWage(q.wage));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setWage(parseWage(q.wage)), [q.wage]);
  const pct = (v: number) => ((v - WAGE_MIN) / (WAGE_MAX - WAGE_MIN)) * 100;
  const thumb =
    "pointer-events-none absolute inset-0 h-1.5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand";
  const setW = (v: [number, number]) => {
    setWage(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push({ wage: v[0] <= WAGE_MIN && v[1] >= WAGE_MAX ? undefined : `${v[0]}-${v[1]}` }), 450);
  };
  const check = (k: string, label: string, count?: number) => (
    <label className="flex cursor-pointer items-center gap-3 text-[14px] text-ink">
      <input type="checkbox" className="check rounded" checked={q[k] === "1"} onChange={(e) => push({ [k]: e.target.checked ? "1" : undefined })} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-[13px] text-muted">({count})</span>}
    </label>
  );
  return (
    <section aria-label="Filters" className={`rounded-2xl border border-line bg-white p-5 shadow-card transition ${pending ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between border-b border-line pb-4">
        <h2 className="text-[18px] font-bold text-ink">Filter Workers</h2>
        <button type="button" onClick={() => push({ district: undefined, taluka: undefined, village: undefined, skill: undefined, today: undefined, verified: undefined, wage: undefined, exp: undefined, type: undefined, q: undefined, category: undefined })} className="text-[13px] font-semibold text-brand">
          Clear All
        </button>
      </div>
      <h3 className="mt-4 text-[14.5px] font-semibold text-ink">Location</h3>
      <div className="mt-2 space-y-2.5">
        <Select label="District" value={q.district ?? ""} onChange={(v) => push({ district: v || undefined, taluka: undefined, village: undefined })} options={districtOpts("All Districts")} />
        <Select label="Taluka" value={q.taluka ?? ""} onChange={(v) => push({ taluka: v || undefined, village: undefined })} options={talukaOpts(q.district)} />
        <Select label="Village" value={q.village ?? ""} onChange={(v) => push({ village: v || undefined })} options={[{ v: "", l: "Select Village" }, ...villages.map((v) => ({ v, l: v }))]} />
      </div>
      <h3 className="mt-5 text-[14.5px] font-semibold text-ink">Worker Type</h3>
      <CheckList items={skills} selected={(q.skill ?? "").split(",")} onToggle={(v) => push({ skill: toggleIn(q.skill, v) })} />
      <h3 className="mt-5 text-[14.5px] font-semibold text-ink">Work Preference</h3>
      <div className="mt-3 space-y-2.5">
        {check("today", "Available Today")}
        {check("verified", "Verified Profiles")}
      </div>
      <h3 className="mt-5 text-[14.5px] font-semibold text-ink">Daily Wage Range</h3>
      <div className="relative mt-4 h-1.5 rounded-full bg-[#e5e7eb]">
        <div className="absolute h-1.5 rounded-full bg-brand" style={{ left: `${pct(wage[0])}%`, right: `${100 - pct(wage[1])}%` }} />
        <input type="range" aria-label="Minimum wage" min={WAGE_MIN} max={WAGE_MAX} step={50} value={wage[0]} onChange={(e) => setW([Math.min(+e.target.value, wage[1] - 50), wage[1]])} className={thumb} />
        <input type="range" aria-label="Maximum wage" min={WAGE_MIN} max={WAGE_MAX} step={50} value={wage[1]} onChange={(e) => setW([wage[0], Math.max(+e.target.value, wage[0] + 50)])} className={thumb} />
      </div>
      <p className="mt-3 text-[14px] text-ink">
        ₹{wage[0].toLocaleString("en-IN")} - ₹{wage[1].toLocaleString("en-IN")}
        {wage[1] >= WAGE_MAX ? "+" : ""}
      </p>
      <h3 className="mt-5 text-[14.5px] font-semibold text-ink">Experience</h3>
      <ul className="mt-3 space-y-2.5">
        {EXPERIENCE_OPTIONS.map((o) => (
          <li key={o.label}>
            <label className="flex cursor-pointer items-center gap-3 text-[14px] text-ink">
              <input type="checkbox" className="check rounded" checked={(q.exp ?? "").split(",").includes(o.label)} onChange={() => push({ exp: toggleIn(q.exp, o.label) })} />
              <span className="flex-1">{o.label}</span>
              <span className="text-[13px] text-muted">({exps[o.label] ?? 0})</span>
            </label>
          </li>
        ))}
      </ul>
      <h3 className="mt-5 text-[14.5px] font-semibold text-ink">Profile Type</h3>
      <div className="mt-2">
        <Select
          label="Profile type"
          value={q.type ?? ""}
          onChange={(v) => push({ type: v || undefined })}
          options={[
            { v: "", l: "All Profiles" },
            { v: "individual", l: "Individual Worker" },
            { v: "group", l: "Labour Group / Naka" },
          ]}
        />
      </div>
    </section>
  );
}

export function ViewToggle({ q }: { q: Q }) {
  const { push } = useQueryNav(q);
  const map = q.view === "map";
  return (
    <div className="flex gap-1.5">
      <button type="button" onClick={() => push({ view: undefined })} className={`rounded-md px-3 py-1.5 text-[12.5px] font-medium ${!map ? "bg-brand text-white" : "border border-line bg-white text-ink"}`}>
        ☰ List View
      </button>
      <button type="button" onClick={() => push({ view: "map" })} className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-[12.5px] font-medium ${map ? "bg-brand text-white" : "border border-line bg-white text-ink"}`}>
        <MapPin className="h-3.5 w-3.5" /> Map View
      </button>
    </div>
  );
}
