"use client";

import { useState } from "react";
import { ChevronDown, IndianRupee, MapPin, Search, Sprout, SquareDashed } from "lucide-react";
import { BUDGETS, DISTRICTS, PROPERTY_TYPES, SUB_DISTRICTS } from "@/lib/config";

export function Field({
  icon,
  label,
  name,
  value,
  onChange,
  options,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  last?: boolean;
}) {
  const current = options.find((o) => o.value === value)?.label ?? options[0]?.label;
  return (
    <label className={`relative flex min-w-0 flex-1 items-center gap-3 px-4 py-3 ${last ? "" : "border-b border-line md:border-b-0 md:border-r"}`}>
      <span className="icon-tile h-11 w-11 shrink-0 text-leaf">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] text-muted">{label}</span>
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[15.5px] font-medium text-ink">{current}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
        </span>
      </span>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SearchBar({
  defaults,
  className = "",
}: {
  defaults?: { district?: string; taluka?: string; type?: string; budget?: string };
  className?: string;
}) {
  const [district, setDistrict] = useState(defaults?.district ?? "Pune");
  const [taluka, setTaluka] = useState(defaults?.taluka ?? "");
  const [type, setType] = useState(defaults?.type ?? "Agriculture Land");
  const [budget, setBudget] = useState(defaults?.budget ?? `${BUDGETS[1].min}-${BUDGETS[1].max}`);

  const talukas = district ? SUB_DISTRICTS[district] ?? [] : [];

  return (
    <form action="/buy-land" method="get" role="search" className={`flex flex-col rounded-2xl border border-line bg-white shadow-soft md:flex-row md:items-center md:py-3 md:pr-4 ${className}`}>
      <div className="flex flex-1 flex-col md:flex-row md:items-center">
        <Field
          icon={<MapPin className="h-5 w-5" />}
          label="District"
          name="district"
          value={district}
          onChange={(v) => {
            setDistrict(v);
            setTaluka("");
          }}
          options={[{ value: "", label: "All Districts" }, ...DISTRICTS.map((d) => ({ value: d, label: `${d}, Maharashtra` }))]}
        />
        <Field
          icon={<SquareDashed className="h-5 w-5" />}
          label="Sub-district"
          name="taluka"
          value={taluka}
          onChange={setTaluka}
          options={[{ value: "", label: district ? `All of ${district}` : "All Sub-districts" }, ...talukas.map((t) => ({ value: t, label: `${t}, ${district}` }))]}
        />
        <Field
          icon={<Sprout className="h-5 w-5" />}
          label="Property Type"
          name="type"
          value={type}
          onChange={setType}
          options={[{ value: "", label: "All Types" }, ...PROPERTY_TYPES.map((t) => ({ value: t, label: t }))]}
        />
        <Field
          icon={<IndianRupee className="h-5 w-5" />}
          label="Budget"
          name="budget"
          value={budget}
          onChange={setBudget}
          last
          options={[{ value: "", label: "Any Budget" }, ...BUDGETS.map((b) => ({ value: `${b.min}-${b.max}`, label: b.label }))]}
        />
      </div>
      <div className="p-4 md:p-0 md:pl-4">
        <button className="btn btn-leaf h-12 w-full rounded-lg px-8 text-[16px] font-medium md:w-[180px]">
          <Search className="h-5 w-5" /> Search Land
        </button>
      </div>
    </form>
  );
}
