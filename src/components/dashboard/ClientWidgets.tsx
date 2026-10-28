"use client";

import { keepValues } from "@/lib/forms";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Eye, IndianRupee, MapPin, MoreVertical, Pencil, Search, Sprout, SquareDashed, Trash2 } from "lucide-react";
import { deleteLandAction, markNotificationsReadAction, setInterestStatusAction, toggleAlertsAction, updatePreferencesAction } from "@/app/actions/lands";
import type { InterestStatus, Preferences } from "@/lib/types";
import { AREAS, BUDGETS, DISTRICTS, PROPERTY_TYPES } from "@/lib/config";
import { Field } from "../SearchBar";
import { Alert } from "../auth/AuthForms";

export function ListingMenu({ id, slug, live, afterDelete }: { id: string; slug: string; live: boolean; afterDelete?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const f = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);
  const item = "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13.5px] hover:bg-mint-50";
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="More actions" className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white hover:bg-[#f9fafb]">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-soft">
          <Link href={`/dashboard/listings/${id}`} className={item}>
            <Eye className="h-4 w-4 text-brand" /> View Details
          </Link>
          <Link href={`/dashboard/listings/${id}/edit`} className={item}>
            <Pencil className="h-4 w-4 text-brand" /> Edit Listing
          </Link>
          {live && (
            <Link href={`/lands/${slug}`} className={item}>
              <ExternalLink className="h-4 w-4 text-brand" /> View Public Page
            </Link>
          )}
          <button
            disabled={pending}
            className={`${item} text-[#dc2626]`}
            onClick={() => {
              if (!confirm("Delete this listing permanently? This cannot be undone.")) return;
              start(async () => {
                await deleteLandAction(id);
                if (afterDelete) router.push(afterDelete);
              });
            }}
          >
            <Trash2 className="h-4 w-4" /> {pending ? "Deleting…" : "Delete Listing"}
          </button>
        </div>
      )}
    </div>
  );
}

const STATUS_STYLE: Record<InterestStatus, string> = {
  new: "bg-[#ecfdf3] text-[#16803c] border-[#bbf7d0]",
  contacted: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
  "follow-up": "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
  responded: "bg-[#ecfdf3] text-[#16803c] border-[#bbf7d0]",
  closed: "bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]",
};
const STATUS_LABEL: Record<InterestStatus, string> = { new: "New", contacted: "Contacted", "follow-up": "Follow-up", responded: "Responded", closed: "Closed" };

export function InterestStatusSelect({ id, status }: { id: string; status: InterestStatus }) {
  const [pending, start] = useTransition();
  const [v, setV] = useState(status);
  return (
    <span className={`relative inline-flex items-center rounded-full border px-2 py-0.5 text-[11.5px] font-semibold ${STATUS_STYLE[v]} ${pending ? "opacity-60" : ""}`}>
      {STATUS_LABEL[v]}
      <ChevronDown className="ml-0.5 h-3 w-3" />
      <select
        aria-label="Interest status"
        value={v}
        onChange={(e) => {
          const s = e.target.value as InterestStatus;
          setV(s);
          start(() => setInterestStatusAction(id, s));
        }}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {Object.entries(STATUS_LABEL).map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}

export function StatusPill({ status, investor }: { status: InterestStatus; investor?: boolean }) {
  const label = investor && status === "new" ? "Interested" : STATUS_LABEL[status];
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${investor && status === "new" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#2563eb]" : STATUS_STYLE[status]}`}>{label}</span>;
}

export function MarkAllRead() {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(() => markNotificationsReadAction())} className="text-[14px] font-medium text-brand hover:underline">
      {pending ? "Marking…" : "Mark all as read"}
    </button>
  );
}

export function AlertsToggle({ on }: { on: boolean }) {
  const [v, setV] = useState(on);
  const [pending, start] = useTransition();
  return (
    <button
      role="switch"
      aria-checked={v}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setV(!v);
          await toggleAlertsAction();
        })
      }
      className="flex items-center gap-2 text-[13.5px] text-ink"
    >
      New land alerts: <b className={v ? "text-brand" : "text-muted"}>{v ? "ON" : "OFF"}</b>
      <span className={`relative h-6 w-11 rounded-full transition ${v ? "bg-brand" : "bg-[#d1d5db]"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${v ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function PreferencesForm({ prefs }: { prefs: Preferences }) {
  const [state, action, pending] = useActionState(updatePreferencesAction, undefined);
  const [district, setDistrict] = useState(prefs.district);
  const [budget, setBudget] = useState(`${prefs.budgetMin}-${prefs.budgetMax}`);
  const [area, setArea] = useState(`${prefs.areaMin}-${prefs.areaMax}`);
  const [type, setType] = useState(prefs.landType);
  const budgetOpts = BUDGETS.map((b) => ({ value: `${b.min}-${b.max}`, label: b.label }));
  if (!budgetOpts.some((o) => o.value === budget)) budgetOpts.unshift({ value: budget, label: "Custom budget" });
  const areaOpts = AREAS.map((a) => ({ value: `${a.min}-${a.max}`, label: a.label }));
  if (!areaOpts.some((o) => o.value === area)) areaOpts.unshift({ value: area, label: "Custom area" });
  return (
    <form onSubmit={keepValues(action)}>
      <input type="hidden" name="alerts" value={prefs.alerts ? "on" : ""} />
      <div className="flex flex-col xl:flex-row xl:items-center">
        <div className="grid flex-1 md:grid-cols-2 xl:flex xl:flex-row xl:items-center">
          <Field icon={<MapPin className="h-5 w-5" />} label="Location" name="district" value={district} onChange={setDistrict} options={[{ value: "", label: "Any Location" }, ...DISTRICTS.map((d) => ({ value: d, label: `${d}, Maharashtra` }))]} />
          <Field icon={<IndianRupee className="h-5 w-5" />} label="Budget" name="budget" value={budget} onChange={setBudget} options={budgetOpts} />
          <Field icon={<SquareDashed className="h-5 w-5" />} label="Land Area" name="area" value={area} onChange={setArea} options={areaOpts} />
          <Field icon={<Sprout className="h-5 w-5" />} label="Land Type" name="landType" value={type} onChange={setType} last options={PROPERTY_TYPES.map((t) => ({ value: t, label: t }))} />
        </div>
        <div className="flex gap-2 p-4 xl:p-0 xl:pl-4">
          <button type="submit" name="search" value="0" disabled={pending} className="btn btn-ghost h-12 px-4 text-[14px]">
            Save
          </button>
          <button type="submit" name="search" value="1" disabled={pending} className="btn btn-leaf h-12 flex-1 px-7 text-[15.5px] font-medium xl:w-[170px]">
            <Search className="h-5 w-5" /> Search Land
          </button>
        </div>
      </div>
      <div className="mt-2">
        <Alert error={state?.error} ok={state?.ok} />
      </div>
    </form>
  );
}
