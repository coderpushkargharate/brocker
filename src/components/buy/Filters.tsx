"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, IndianRupee, MapPin, RotateCcw, SlidersHorizontal, SquareDashed, Sprout } from "lucide-react";
import { DISTRICTS, PROPERTY_TYPES } from "@/lib/config";
import { inr, inrShort } from "@/lib/format";

type Q = Record<string, string | undefined>;

function useQueryNav(current: Q) {
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  const push = (patch: Q) => {
    const p = new URLSearchParams();
    const next = { ...current, ...patch, page: undefined };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    // a location page is fixed to one district, so a new district means the general search page
    const base = "district" in patch && path.startsWith("/locations") ? "/buy-land" : path;
    start(() => router.push(`${base}${p.size ? `?${p}` : ""}`, { scroll: false }));
  };
  return { push, pending };
}

function DualRange({ min, max, step, value, onChange }: { min: number; max: number; step: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const thumb =
    "pointer-events-none absolute inset-0 h-1.5 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand";
  return (
    <div className="relative mt-4 h-1.5 rounded-full bg-[#e5e7eb]">
      <div className="absolute h-1.5 rounded-full bg-brand" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }} />
      <input type="range" aria-label="Minimum" min={min} max={max} step={step} value={value[0]} onChange={(e) => onChange([Math.min(+e.target.value, value[1] - step), value[1]])} className={thumb} />
      <input type="range" aria-label="Maximum" min={min} max={max} step={step} value={value[1]} onChange={(e) => onChange([value[0], Math.max(+e.target.value, value[0] + step)])} className={thumb} />
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; label: string }) {
  return (
    <div className="relative mt-3">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-[42px] w-full appearance-none rounded-lg border border-[#d1d5db] bg-white px-3.5 text-[15px] text-ink outline-none focus:border-leaf">
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
    </div>
  );
}

const BUDGET_MAX = 20_000_000;
const AREA_MAX = 50;

function parse(v: string | undefined, d: [number, number]): [number, number] {
  if (!v) return d;
  const [a, b] = v.split("-").map(Number);
  return [Number.isFinite(a) ? a : d[0], Number.isFinite(b) ? Math.min(b, d[1]) : d[1]];
}

export function Filters({ q }: { q: Q }) {
  const { push, pending } = useQueryNav(q);
  const [budget, setBudget] = useState<[number, number]>(parse(q.budget, [0, BUDGET_MAX]));
  const [area, setArea] = useState<[number, number]>(parse(q.area, [0, AREA_MAX]));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setBudget(parse(q.budget, [0, BUDGET_MAX])), [q.budget]);
  useEffect(() => setArea(parse(q.area, [0, AREA_MAX])), [q.area]);

  const debounced = (patch: Q) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push(patch), 450);
  };

  const check = (k: string, label: string) => (
    <label className="flex cursor-pointer items-center gap-3 text-[15px] text-ink">
      <input type="checkbox" className="check rounded" checked={q[k] === "1"} onChange={(e) => push({ [k]: e.target.checked ? "1" : undefined })} />
      {label}
    </label>
  );

  return (
    <section aria-label="Filters" className={`rounded-2xl border border-line bg-white p-6 shadow-card transition ${pending ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between border-b border-line pb-5">
        <h2 className="text-[17px] font-semibold text-ink">Filters</h2>
        <SlidersHorizontal className="h-5 w-5 text-brand" />
      </div>

      <h3 className="mt-5 flex items-center gap-2 text-[15px] text-ink">
        <MapPin className="h-4 w-4 text-muted" /> Location / District
      </h3>
      <Select label="District" value={q.district ?? ""} onChange={(v) => push({ district: v || undefined, taluka: undefined })} options={[{ v: "", l: "All Districts" }, ...DISTRICTS.map((d) => ({ v: d, l: d }))]} />

      <h3 className="mt-6 flex items-center gap-2 text-[15px] text-ink">
        <IndianRupee className="h-4 w-4 text-muted" /> Budget Range
      </h3>
      <p className="mt-3 text-[15px] font-bold text-ink">
        {inrShort(budget[0])} – {inrShort(budget[1])}
        {budget[1] >= BUDGET_MAX ? "+" : ""}
      </p>
      <DualRange
        min={0}
        max={BUDGET_MAX}
        step={100_000}
        value={budget}
        onChange={(v) => {
          setBudget(v);
          debounced({ budget: v[0] === 0 && v[1] >= BUDGET_MAX ? undefined : `${v[0]}-${v[1] >= BUDGET_MAX ? 1_000_000_000 : v[1]}` });
        }}
      />
      <p className="mt-3 flex justify-between text-[13px] text-muted">
        <span>{inr(budget[0])}</span>
        <span>{inr(budget[1])}</span>
      </p>

      <h3 className="mt-6 flex items-center gap-2 text-[15px] text-ink">
        <SquareDashed className="h-4 w-4 text-muted" /> Land Area
      </h3>
      <p className="mt-3 text-[15px] font-bold text-ink">
        {area[0]} – {area[1]}
        {area[1] >= AREA_MAX ? "+" : ""} Acres
      </p>
      <DualRange
        min={0}
        max={AREA_MAX}
        step={0.5}
        value={area}
        onChange={(v) => {
          setArea(v);
          debounced({ area: v[0] === 0 && v[1] >= AREA_MAX ? undefined : `${v[0]}-${v[1] >= AREA_MAX ? 100000 : v[1]}` });
        }}
      />
      <p className="mt-3 flex justify-between text-[13px] text-muted">
        <span>{area[0]} Acres</span>
        <span>{area[1]} Acres</span>
      </p>

      <h3 className="mt-6 flex items-center gap-2 text-[15px] text-ink">
        <Sprout className="h-4 w-4 text-muted" /> Land Type
      </h3>
      <Select label="Land Type" value={q.type ?? ""} onChange={(v) => push({ type: v || undefined })} options={[{ v: "", l: "All Types" }, ...PROPERTY_TYPES.map((t) => ({ v: t, l: t }))]} />

      <div className="mt-6 space-y-4">
        {check("water", "Water Availability")}
        {check("road", "Road Access")}
        {check("electricity", "Electricity")}
        {check("verified", "Verified Land Only")}
      </div>

      <button
        type="button"
        onClick={() => push({ district: undefined, taluka: undefined, budget: undefined, area: undefined, type: undefined, water: undefined, road: undefined, electricity: undefined, verified: undefined, category: undefined, q: undefined })}
        className="btn btn-outline mt-7 h-[42px] w-full font-medium"
      >
        <RotateCcw className="h-4 w-4" /> Clear Filters
      </button>
    </section>
  );
}

export function SortSelect({ q }: { q: Q }) {
  const { push } = useQueryNav(q);
  return (
    <label className="flex items-center gap-3 text-[14.5px] text-muted">
      Sort By:
      <span className="relative">
        <select value={q.sort ?? ""} onChange={(e) => push({ sort: e.target.value || undefined })} className="h-10 w-[175px] appearance-none rounded-lg border border-line bg-white px-3 text-[15px] text-ink outline-none">
          <option value="">Recommended</option>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="area-desc">Area: Largest First</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
      </span>
    </label>
  );
}
