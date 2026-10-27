"use client";

import { useActionState, useRef, useState } from "react";
import { CircleCheck, Loader2, Phone, Send, Star } from "lucide-react";
import { serviceLeadAction, submitServiceReviewAction } from "@/app/actions/services";
import { Alert } from "@/components/auth/AuthForms";
import { DISTRICTS, SUB_DISTRICTS } from "@/lib/config";
import { waLink } from "@/lib/services-config";
import { WhatsAppIcon } from "./Actions";
import type { ServiceCategory } from "@/lib/types";

type Target = { type: "business" | "worker"; id: string; name: string; phone: string; whatsapp?: string };

/** "Get a Quote / Enquiry" box on a business or worker profile. */
export function EnquiryForm({ target, items, itemLabel = "Select Material", defaultDistrict = "Pune" }: { target: Target; items: string[]; itemLabel?: string; defaultDistrict?: string }) {
  const [state, action, pending] = useActionState(serviceLeadAction, undefined);
  const [district, setDistrict] = useState(defaultDistrict);
  const kindRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const sendWhatsApp = () => {
    const f = formRef.current;
    if (!f || !f.reportValidity()) return;
    const fd = new FormData(f);
    const g = (k: string) => String(fd.get(k) || "").trim();
    const text = [`Hello ${target.name}, I found you on AgriLand.`, `Name: ${g("name")}`, `Mobile: ${g("phone")}`, g("item") && `${itemLabel.replace("Select ", "")}: ${g("item")}`, `Location: ${[g("taluka"), g("district")].filter(Boolean).join(", ")}`, g("message") && `Requirement: ${g("message")}`].filter(Boolean).join("\n");
    // open WhatsApp right away (popup blockers allow it only inside the click), then save the enquiry
    window.open(waLink(target.whatsapp || target.phone, text), "_blank", "noopener");
    if (kindRef.current) kindRef.current.value = "enquiry";
    f.requestSubmit();
  };

  if (state?.ok)
    return (
      <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-5 text-center">
        <CircleCheck className="mx-auto h-10 w-10 text-brand" />
        <p className="mt-2 font-semibold text-ink">{state.ok}</p>
        <p className="mt-1 text-[13px] text-body">You can also call them directly at {target.phone}.</p>
      </div>
    );

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="targetType" value={target.type} />
      <input type="hidden" name="targetId" value={target.id} />
      <input ref={kindRef} type="hidden" name="kind" defaultValue="callback" />
      <Alert error={state?.error} />
      <div>
        <label className="label" htmlFor="eq-name">
          Name <span className="text-[#dc2626]">*</span>
        </label>
        <input id="eq-name" name="name" required className="input bg-white" placeholder="Your Name" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="eq-phone">
          Mobile Number <span className="text-[#dc2626]">*</span>
        </label>
        <div className="flex">
          <span className="flex items-center rounded-l-lg border border-r-0 border-line bg-[#f9fafb] px-3 text-[14px] font-medium text-ink">+91</span>
          <input id="eq-phone" name="phone" required type="tel" inputMode="numeric" pattern="[0-9 +\-]{10,15}" className="input rounded-l-none bg-white" placeholder="Enter mobile number" autoComplete="tel" />
        </div>
      </div>
      {items.length > 0 && (
        <div>
          <label className="label" htmlFor="eq-item">
            {itemLabel} <span className="text-[#dc2626]">*</span>
          </label>
          <select id="eq-item" name="item" required className="input bg-white" defaultValue="">
            <option value="" disabled>
              {itemLabel}
            </option>
            {items.map((i) => (
              <option key={i}>{i}</option>
            ))}
            <option>Other</option>
          </select>
        </div>
      )}
      <div>
        <span className="label">
          {target.type === "business" ? "Delivery Location" : "Work Location"} <span className="text-[#dc2626]">*</span>
        </span>
        <div className="grid grid-cols-2 gap-2">
          <select aria-label="District" name="district" value={district} onChange={(e) => setDistrict(e.target.value)} className="input bg-white">
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select aria-label="Taluka" name="taluka" className="input bg-white" defaultValue="">
            <option value="">Select Taluka</option>
            {(SUB_DISTRICTS[district] ?? []).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="eq-msg">
          Message <span className="font-normal text-muted">(Optional)</span>
        </label>
        <textarea id="eq-msg" name="message" rows={3} className="input bg-white" placeholder={target.type === "business" ? "Tell us your requirement (e.g. Cement 50 bags, Steel 1 ton...)" : "Tell us about the work (e.g. compound wall, 10 days)"} />
      </div>
      <button type="button" onClick={sendWhatsApp} disabled={pending} className="btn h-12 w-full bg-[#15803d] text-[15px] text-white hover:bg-[#166534]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <WhatsAppIcon className="h-5 w-5" />} Send Enquiry on WhatsApp
      </button>
      <p className="text-center text-[12px] text-muted">OR</p>
      <button
        type="submit"
        onClick={() => {
          if (kindRef.current) kindRef.current.value = "callback";
        }}
        disabled={pending}
        className="btn btn-outline h-12 w-full text-[15px]"
      >
        <Phone className="h-4 w-4" /> Request a Call Back
      </button>
    </form>
  );
}

export function ReviewForm({ targetType, targetId }: { targetType: "business" | "worker"; targetId: string }) {
  const [state, action, pending] = useActionState(submitServiceReviewAction, undefined);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  if (state?.ok) return <Alert ok={state.ok} />;
  return (
    <form action={action} className="space-y-3 rounded-xl border border-line bg-[#f9fafb] p-4">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="rating" value={rating} />
      <Alert error={state?.error} />
      <div>
        <span className="label">Your Rating</span>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
              <Star className={`h-7 w-7 ${(hover || rating) >= n ? "fill-[#f5a623] text-[#f5a623]" : "text-[#d1d5db]"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="rv-name">
          Your Name
        </label>
        <input id="rv-name" name="name" required className="input bg-white" />
      </div>
      <div>
        <label className="label" htmlFor="rv-text">
          Your Review
        </label>
        <textarea id="rv-text" name="text" rows={3} required className="input bg-white" placeholder="How was the service, quality and delivery?" />
      </div>
      <button disabled={pending} className="btn btn-primary h-11 px-6 text-[14px]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Review
      </button>
    </form>
  );
}

/** Post a requirement – for workers or for business services. */
export function RequirementForm({ categories, defaultType, defaultCategory }: { categories: ServiceCategory[]; defaultType: "labour" | "service"; defaultCategory?: string }) {
  const [state, action, pending] = useActionState(serviceLeadAction, undefined);
  const [type, setType] = useState(defaultType);
  const shown = categories.filter((c) => (type === "labour" ? c.kind === "labour" : c.kind === "business"));
  const [cat, setCat] = useState(defaultCategory && shown.some((c) => c.id === defaultCategory) ? defaultCategory : shown[0]?.id ?? "");
  const [district, setDistrict] = useState("Pune");
  const current = categories.find((c) => c.id === cat);

  if (state?.ok)
    return (
      <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-8 text-center">
        <CircleCheck className="mx-auto h-12 w-12 text-brand" />
        <p className="mt-3 text-[18px] font-semibold text-ink">{state.ok}</p>
        <p className="mt-1 text-[14px] text-body">Our team also checks every requirement and shares it with matching providers.</p>
      </div>
    );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="kind" value="requirement" />
      <Alert error={state?.error} />
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="What do you need">
        {(
          [
            ["labour", "I need Workers", "Mason, helper, farm labour…"],
            ["service", "I need a Service", "Materials, JCB, borewell, contractor…"],
          ] as const
        ).map(([v, t, d]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={type === v}
            onClick={() => {
              setType(v);
              setCat(categories.find((c) => (v === "labour" ? c.kind === "labour" : c.kind === "business"))?.id ?? "");
            }}
            className={`rounded-xl border p-3 text-left ${type === v ? "border-brand bg-mint-50 ring-2 ring-brand/20" : "border-line bg-white"}`}
          >
            <b className="block text-[14.5px] text-ink">{t}</b>
            <span className="text-[12.5px] text-muted">{d}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="rq-cat">
            Category <span className="text-[#dc2626]">*</span>
          </label>
          <select id="rq-cat" name="categoryId" value={cat} onChange={(e) => setCat(e.target.value)} className="input">
            {shown.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rq-item">
            {type === "labour" ? "Worker Type" : "Service Needed"}
          </label>
          <select id="rq-item" name="item" className="input" key={cat}>
            {(current?.subcategories ?? []).map((s) => (
              <option key={s}>{s}</option>
            ))}
            <option>Other</option>
          </select>
        </div>
        {type === "labour" && (
          <div>
            <label className="label" htmlFor="rq-n">
              Number of Workers
            </label>
            <input id="rq-n" name="workersNeeded" type="number" min={1} max={500} defaultValue={1} className="input" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="rq-budget">
            {type === "labour" ? "Wage Offered (₹ / Day)" : "Budget (Optional)"}
          </label>
          <input id="rq-budget" name="budget" className="input" placeholder={type === "labour" ? "e.g. 700" : "e.g. ₹50,000"} />
        </div>
        <div>
          <label className="label" htmlFor="rq-date">
            Start Date
          </label>
          <input id="rq-date" name="startDate" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="rq-district">
            District <span className="text-[#dc2626]">*</span>
          </label>
          <select id="rq-district" name="district" value={district} onChange={(e) => setDistrict(e.target.value)} className="input">
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rq-taluka">
            Taluka
          </label>
          <select id="rq-taluka" name="taluka" className="input" key={district}>
            <option value="">Select Taluka</option>
            {(SUB_DISTRICTS[district] ?? []).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="rq-village">
            Village / Area
          </label>
          <input id="rq-village" name="village" className="input" placeholder="e.g. Talegaon" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="rq-msg">
          Work Details
        </label>
        <textarea id="rq-msg" name="message" rows={4} className="input" placeholder="Describe the work, duration and any special requirement…" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="rq-name">
            Your Name <span className="text-[#dc2626]">*</span>
          </label>
          <input id="rq-name" name="name" required className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="rq-phone">
            Mobile Number <span className="text-[#dc2626]">*</span>
          </label>
          <input id="rq-phone" name="phone" type="tel" required className="input" autoComplete="tel" placeholder="+91 98765 43210" />
        </div>
      </div>
      <button disabled={pending} className="btn btn-primary h-12 w-full text-[16px]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post Requirement
      </button>
    </form>
  );
}
