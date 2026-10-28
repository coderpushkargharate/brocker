"use client";

import { keepValues, useResetOnSuccess } from "@/lib/forms";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { saveCategoryAction, saveServiceSettingsAction } from "@/app/actions/services-admin";
import { Alert } from "@/components/auth/AuthForms";
import { SERVICE_ICONS } from "@/components/services/icons";
import type { ServiceCategory, ServiceKind, ServiceSettings } from "@/lib/types";

export function CategoryForm({ cat, kind }: { cat?: ServiceCategory; kind: ServiceKind }) {
  const [state, action, pending] = useActionState(saveCategoryAction, undefined);
  const id = cat?.id ?? `new-${kind}`;
  const ref = useResetOnSuccess(state, !cat);
  return (
    <form ref={ref} onSubmit={keepValues(action)} className="space-y-3">
      {cat && <input type="hidden" name="id" value={cat.id} />}
      <input type="hidden" name="kind" value={kind} />
      <Alert error={state?.error} ok={state?.ok} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${id}-name`}>
            Name
          </label>
          <input id={`${id}-name`} name="name" required defaultValue={cat?.name} className="input" placeholder={kind === "labour" ? "Construction Labour" : "Building Material Supplier"} />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-short`}>
            Short name (tiles &amp; menus)
          </label>
          <input id={`${id}-short`} name="short" defaultValue={cat?.short} className="input" placeholder="Building Materials" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`${id}-desc`}>
          Description
        </label>
        <input id={`${id}-desc`} name="description" defaultValue={cat?.description} className="input" placeholder="Cement, Steel, Bricks, Sand, Tiles…" />
      </div>
      <div>
        <label className="label" htmlFor={`${id}-subs`}>
          {kind === "labour" ? "Skills" : "Subcategories"} (one per line)
        </label>
        <textarea id={`${id}-subs`} name="subcategories" rows={5} defaultValue={cat?.subcategories.join("\n")} className="input" />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="label" htmlFor={`${id}-icon`}>
            Icon
          </label>
          <select id={`${id}-icon`} name="icon" defaultValue={cat?.icon ?? "building"} className="input">
            {Object.keys(SERVICE_ICONS).map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor={`${id}-order`}>
            Order
          </label>
          <input id={`${id}-order`} name="order" type="number" defaultValue={cat?.order ?? 99} className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor={`${id}-img`}>
            Image (upload or path)
          </label>
          <div className="flex gap-2">
            <input id={`${id}-img`} name="image" defaultValue={cat?.image} className="input" placeholder="/images/svc/cat-building.jpg" />
            <input type="file" name="imageFile" accept="image/*" aria-label="Upload image" className="w-[110px] text-[12px]" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" name="active" defaultChecked={cat?.active ?? true} className="check" /> Visible on website
        </label>
        <button disabled={pending} className="btn btn-primary h-10 px-5 text-[14px]">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {cat ? "Save" : "Add Category"}
        </button>
      </div>
    </form>
  );
}

export function ServiceSettingsForm({ s }: { s: ServiceSettings }) {
  const [state, action, pending] = useActionState(saveServiceSettingsAction, undefined);
  const f = (name: keyof ServiceSettings, label: string, placeholder = "") => (
    <div>
      <label className="label" htmlFor={`ss-${name}`}>
        {label}
      </label>
      <input id={`ss-${name}`} name={name} defaultValue={String(s[name] ?? "")} className="input" placeholder={placeholder} />
    </div>
  );
  return (
    <form onSubmit={keepValues(action)} className="space-y-6">
      <Alert error={state?.error} ok={state?.ok} />
      <section>
        <h2 className="text-[17px] font-semibold text-ink">Business Services page – stats box</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {f("statBusinesses", "Verified Businesses", "5,000+")}
          {f("statCategories", "Service Categories", "100+")}
          {f("statEnquiries", "Customer Enquiries", "50,000+")}
          {f("statRating", "Average Rating", "4.8/5")}
        </div>
      </section>
      <section>
        <h2 className="text-[17px] font-semibold text-ink">Plans &amp; support</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {f("premiumPrice", "Premium price (₹ / month)", "1000")}
          {f("helpPhone", "Help phone / WhatsApp", "+91 98765 43210")}
          {f("helpHours", "Help hours", "Mon - Sat (9:00 AM - 7:00 PM)")}
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ss-pop">
            Popular searches – Business Services (one per line)
          </label>
          <textarea id="ss-pop" name="popularSearches" rows={7} defaultValue={s.popularSearches.join("\n")} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="ss-popl">
            Popular worker types – Labour page (one per line, must match a skill name)
          </label>
          <textarea id="ss-popl" name="popularLabourSearches" rows={7} defaultValue={s.popularLabourSearches.join("\n")} className="input" />
        </div>
      </section>
      <input type="hidden" name="statWorkers" value={s.statWorkers} />
      <button disabled={pending} className="btn btn-primary h-11 px-6 text-[15px]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
      </button>
    </form>
  );
}
