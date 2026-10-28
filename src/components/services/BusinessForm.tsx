"use client";

import { keepValues } from "@/lib/forms";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesColumnIncreasing,
  Check,
  CircleCheck,
  Crown,
  FileUp,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Store,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { saveBusinessAction } from "@/app/actions/services";
import { Alert } from "@/components/auth/AuthForms";
import { Img } from "@/components/Img";
import { DISTRICTS, SUB_DISTRICTS } from "@/lib/config";
import { BUSINESS_HIGHLIGHTS, BUSINESS_TYPES, EMPLOYEE_OPTIONS, PAYMENT_MODES, telLink, waLink } from "@/lib/services-config";
import { CatIcon } from "./icons";
import { WhatsAppIcon } from "./Actions";
import type { Business, ServiceCategory } from "@/lib/types";
import { Honeypot } from "@/components/FormGuard";

const DRAFT_KEY = "agri-business-draft";

const STEPS = [
  { t: "Business Category", d: "Select your category" },
  { t: "Business Details", d: "Basic information" },
  { t: "Contact Information", d: "Address & service area" },
  { t: "Services & Products", d: "Add your services" },
  { t: "Photos & Documents", d: "Upload photos" },
  { t: "Plans & Payment", d: "Choose listing plan" },
];

type Init = Partial<Record<string, string | string[]>>;

function fromBusiness(b?: Business): Init {
  if (!b) return { district: "Pune", plan: "free", businessType: "Proprietorship", sameWhatsapp: "on" };
  return {
    ...Object.fromEntries(Object.entries(b).filter(([, v]) => typeof v === "string" || typeof v === "number").map(([k, v]) => [k, String(v)])),
    services: b.services.map((s) => s.name),
    highlights: b.highlights,
    paymentModes: (b.paymentModes ?? "").split(",").map((s) => s.trim()),
    products: b.products.join(", "),
    tags: b.tags.join(", "),
    sameWhatsapp: !b.whatsapp || b.whatsapp === b.phone ? "on" : "",
    verified: b.verified ? "on" : "",
    premium: b.premium ? "on" : "",
  };
}

function readForm(f: HTMLFormElement | null): Init {
  if (!f) return {};
  const fd = new FormData(f);
  const out: Init = {};
  for (const k of new Set(fd.keys())) {
    const all = fd.getAll(k).filter((v) => typeof v === "string") as string[];
    out[k] = all.length > 1 || ["services", "highlights", "paymentModes"].includes(k) ? all : all[0];
  }
  return out;
}

const s = (v: Init[string]) => (Array.isArray(v) ? v[0] ?? "" : v ?? "");
const arr = (v: Init[string]) => (Array.isArray(v) ? v : v ? [v] : []);

function Card({ step, id, title, sub, children }: { step?: number; id: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
      {step && <p className="text-[12.5px] font-semibold text-brand">Step {step} of 6</p>}
      <h2 className="text-[22px] font-bold text-ink">{title}</h2>
      <p className="mb-5 text-[14px] text-body">{sub}</p>
      {children}
    </section>
  );
}

function Req() {
  return <span className="text-[#dc2626]"> *</span>;
}

export function BusinessForm({
  categories,
  mode = "public",
  initial,
  premiumPrice,
  helpPhone,
  helpHours,
  loggedIn,
}: {
  categories: ServiceCategory[];
  mode?: "public" | "admin";
  initial?: Business;
  premiumPrice: number;
  helpPhone: string;
  helpHours: string;
  loggedIn: boolean;
}) {
  const admin = mode === "admin";
  const [state, action, pending] = useActionState(saveBusinessAction, undefined);
  const [init, setInit] = useState<Init>(() => fromBusiness(initial));
  const [formKey, setFormKey] = useState(0);
  const [live, setLive] = useState<Init>(init);
  const [draftNote, setDraftNote] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initial?.logo);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initial?.cover || initial?.images[0]);
  const [newPhotos, setNewPhotos] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // restore a saved draft (public form only)
  useEffect(() => {
    if (admin) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Init;
      setInit(d);
      setLive(d);
      setFormKey((k) => k + 1);
      setDraftNote("We restored your saved draft. Photos need to be added again.");
    } catch {
      // ignore broken drafts
    }
  }, [admin]);

  useEffect(() => {
    if (state?.ok && !admin) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (state?.error) document.getElementById("form-alert")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state, admin]);

  const catId = s(live.categoryId);
  const cat = categories.find((c) => c.id === catId);
  const services = arr(live.services);
  const plan = s(live.plan) || "free";

  const done = useMemo(
    () => [
      Boolean(cat && s(live.subcategory)),
      s(live.name).trim().length >= 3 && s(live.description).trim().length >= 20,
      s(live.contactName).trim().length >= 2 && s(live.phone).replace(/\D/g, "").length >= 10 && Boolean(s(live.address).trim()) && Boolean(s(live.district)),
      services.length > 0 || Boolean(s(live.customServices).trim()),
      Boolean(logoUrl || coverUrl || newPhotos),
      admin || s(live.agree) === "on",
    ],
    [live, cat, services.length, logoUrl, coverUrl, newPhotos, admin],
  );
  const doneCount = done.filter(Boolean).length;
  const pct = Math.round((doneCount / 6) * 100);
  const required = [0, 1, 2, 3, 5];
  const firstMissing = required.find((i) => !done[i]);

  const onChange = () => setLive(readForm(formRef.current));

  const saveDraft = () => {
    const d = readForm(formRef.current);
    delete d.agree;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      setDraftNote("Draft saved on this device. You can come back and finish later.");
    } catch {
      setDraftNote("Could not save the draft in this browser.");
    }
  };

  const next = () => {
    if (firstMissing === undefined) formRef.current?.requestSubmit();
    else document.getElementById(`step-${firstMissing + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (state?.ok && !admin)
    return (
      <div className="mx-auto max-w-[640px] rounded-2xl border border-[#bbf7d0] bg-white p-8 text-center shadow-card">
        <CircleCheck className="mx-auto h-14 w-14 text-brand" />
        <h2 className="mt-3 text-[24px] font-bold text-ink">Your business has been submitted!</h2>
        <p className="mt-2 text-[15px] text-body">
          Our team will verify your details and make your listing live within 24 hours.
          {plan === "premium" && ` For the Premium plan (₹${premiumPrice.toLocaleString("en-IN")}/month) we will call you to complete the payment.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/business-services" className="btn btn-primary h-11 px-6">
            Browse Business Services
          </Link>
          <a href={waLink(helpPhone, "Hello, I just listed my business on AgriLand.")} target="_blank" rel="noopener noreferrer" className="btn btn-outline h-11 px-6">
            <WhatsAppIcon /> WhatsApp Support
          </a>
        </div>
      </div>
    );

  const field = (name: string, label: React.ReactNode, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`bf-${name}`}>
        {label}
      </label>
      <input id={`bf-${name}`} name={name} defaultValue={s(init[name])} className="input" {...props} />
    </div>
  );

  const previewTags = (services.length ? services : (s(live.tags) || "").split(",").map((x) => x.trim()).filter(Boolean)).slice(0, 4);

  return (
    <div className={`grid gap-6 ${admin ? "xl:grid-cols-[1fr_300px]" : "lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_300px]"}`}>
      {/* left: steps */}
      {!admin && (
        <aside className="hidden space-y-5 lg:block">
          <ol className="rounded-2xl border border-line bg-white p-3 shadow-card">
            {STEPS.map((st, i) => {
              const active = i === (firstMissing ?? 5);
              return (
                <li key={st.t}>
                  <a href={`#step-${i + 1}`} className={`flex items-start gap-3 rounded-xl p-3 ${active ? "bg-mint-50" : "hover:bg-[#f9fafb]"}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${done[i] ? "bg-brand text-white" : active ? "bg-brand text-white" : "border border-line bg-white text-ink"}`}>{done[i] ? <Check className="h-4 w-4" /> : i + 1}</span>
                    <span>
                      <b className={`block text-[14px] ${active ? "text-brand" : "text-ink"}`}>{st.t}</b>
                      <span className="text-[12.5px] text-body">{st.d}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
          <WhyList helpPhone={helpPhone} helpHours={helpHours} />
        </aside>
      )}

      {/* middle: the form */}
      <form key={formKey} ref={formRef} onSubmit={keepValues(action)} onChange={onChange} className="relative min-w-0 space-y-5">
        {!admin && <Honeypot />}
        {!admin && <ListBusinessHeader loggedIn={loggedIn} />}
        {initial && <input type="hidden" name="id" value={initial.id} />}
        <div id="form-alert">
          <Alert error={state?.error} />
          {draftNote && <p className="mt-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2.5 text-[13.5px] text-[#1e40af]">{draftNote}</p>}
        </div>

        {admin && (
          <Card id="admin" title="Admin Settings" sub="Visibility, badges and rating for this business.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="bf-status">
                  Status
                </label>
                <select id="bf-status" name="status" defaultValue={s(init.status) || "active"} className="input">
                  <option value="active">Active (live)</option>
                  <option value="pending">Pending review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <label className="flex items-center gap-2 pt-6 text-[14px]">
                <input type="checkbox" name="verified" defaultChecked={s(init.verified) === "on" || !initial} className="check" /> Verified badge
              </label>
              <label className="flex items-center gap-2 pt-6 text-[14px]">
                <input type="checkbox" name="premium" defaultChecked={s(init.premium) === "on"} className="check" /> Premium listing
              </label>
              {initial && field("slug", "URL slug", { placeholder: "shree-ganesh-building-materials" })}
              {initial && (
                <div className="sm:col-span-2">
                  <span className="label">Rating (override)</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-[13.5px]">
                      <input type="checkbox" name="ratingOverride" className="check" /> Set manually
                    </label>
                    <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={initial.rating} className="input w-24" aria-label="Rating" />
                    <input name="reviewCount" type="number" min="0" defaultValue={initial.reviewCount} className="input w-28" aria-label="Review count" />
                    <span className="text-[12.5px] text-muted">avg / number of reviews</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* step 1 */}
        <Card step={1} id="step-1" title="Business Category" sub="Select the main category and subcategory for your business.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Business category">
            {categories.map((c, i) => (
              <label key={c.id} className={`relative cursor-pointer overflow-hidden rounded-xl border-2 bg-white transition ${catId === c.id ? "border-brand shadow-[0_0_0_3px_rgba(22,114,8,0.12)]" : "border-line hover:border-[#cbd5e1]"}`}>
                <input type="radio" name="categoryId" value={c.id} defaultChecked={s(init.categoryId) === c.id} className="sr-only" />
                <span className="relative block h-[90px]">
                  <Img src={c.image} alt="" fill sizes="240px" className="object-cover" />
                  {catId === c.id && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </span>
                <span className="flex gap-2.5 p-3">
                  <CatIcon name={c.icon} className="mt-0.5 h-7 w-7 shrink-0 text-brand" />
                  <span>
                    <b className="block text-[13.5px] leading-snug text-ink">
                      {i + 1}. {c.name}
                    </b>
                    <span className="mt-0.5 block text-[12px] leading-snug text-body">{c.description}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-5">
            <label className="label" htmlFor="bf-sub">
              Select Subcategory
              <Req />
            </label>
            <select id="bf-sub" name="subcategory" key={catId} defaultValue={cat?.subcategories.includes(s(init.subcategory)) ? s(init.subcategory) : ""} className="input">
              <option value="">{cat ? "Select subcategory" : "Choose a category first"}</option>
              {(cat?.subcategories ?? []).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <p className="mt-1 text-[12px] text-muted">Select the most relevant subcategory for your business.</p>
          </div>
        </Card>

        {/* step 2 */}
        <Card step={2} id="step-2" title="Business Details" sub="Tell us about your business.">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("name", <>Business Name<Req /></>, { required: true, maxLength: 120, placeholder: "e.g. Shree Ganesh Building Materials" })}
            <div>
              <label className="label" htmlFor="bf-type">
                Business Type
                <Req />
              </label>
              <select id="bf-type" name="businessType" defaultValue={s(init.businessType) || "Proprietorship"} className="input">
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {field("gst", <>GST Number <span className="font-normal text-muted">(Optional)</span></>, { maxLength: 15, placeholder: "27ABCDE1234F1Z5", className: "input uppercase" })}
            {field("since", "Year of Establishment", { type: "number", min: 1950, max: new Date().getFullYear(), placeholder: "2018" })}
            <div>
              <label className="label" htmlFor="bf-emp">
                Number of Employees
              </label>
              <select id="bf-emp" name="employees" defaultValue={s(init.employees)} className="input">
                <option value="">Select</option>
                {EMPLOYEE_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="bf-desc">
              Business Description
              <Req />
            </label>
            <textarea id="bf-desc" name="description" rows={4} maxLength={1500} defaultValue={s(init.description)} className="input" placeholder="We are a leading supplier of cement, steel, sand, bricks, tiles and all types of building materials in Pune..." />
            <p className="mt-1 text-right text-[12px] text-muted">{s(live.description).length}/1500</p>
          </div>
          {field("summary", <>Short Tagline <span className="font-normal text-muted">(shown on listing cards)</span></>, { maxLength: 160, placeholder: "All types of building materials with site delivery. Best quality and competitive rates." })}
        </Card>

        {/* step 3 */}
        <Card step={3} id="step-3" title="Contact Information & Address" sub="Your contact details will be visible to customers.">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("contactName", <>Contact Person Name<Req /></>, { required: true, autoComplete: "name", placeholder: "Rahul Patil" })}
            <div>
              <label className="label" htmlFor="bf-phone">
                Mobile Number
                <Req />
              </label>
              <div className="flex">
                <span className="flex items-center rounded-l-lg border border-r-0 border-line bg-[#f9fafb] px-3 text-[14px]">+91</span>
                <input id="bf-phone" name="phone" type="tel" required defaultValue={s(init.phone)} className="input rounded-l-none" placeholder="9876543210" autoComplete="tel" />
              </div>
              <label className="mt-1.5 flex items-center gap-2 text-[12.5px] text-body">
                <input type="checkbox" name="sameWhatsapp" defaultChecked={s(init.sameWhatsapp) === "on"} className="check !h-4 !w-4" /> Same number on WhatsApp
              </label>
            </div>
            {s(live.sameWhatsapp) !== "on" && field("whatsapp", "WhatsApp Number", { type: "tel", placeholder: "9876543210" })}
            {field("email", <>Email ID <span className="font-normal text-muted">(Optional)</span></>, { type: "email", placeholder: "rahul@ganeshmaterials.com" })}
            {field("website", <>Website <span className="font-normal text-muted">(Optional)</span></>, { placeholder: "https://www.ganeshmaterials.com" })}
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="bf-address">
              Full Address
              <Req />
            </label>
            <input id="bf-address" name="address" required defaultValue={s(init.address)} className="input" placeholder="Gat No. 123, Pune Mumbai Highway, Ravet" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="label" htmlFor="bf-district">
                District
                <Req />
              </label>
              <select id="bf-district" name="district" defaultValue={s(init.district) || "Pune"} className="input">
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="bf-taluka">
                Taluka
              </label>
              <select id="bf-taluka" name="taluka" key={s(live.district)} defaultValue={s(init.taluka)} className="input">
                <option value="">Select Taluka</option>
                {(SUB_DISTRICTS[s(live.district) || "Pune"] ?? []).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            {field("area", "Area / City", { placeholder: "Ravet" })}
            {field("pincode", "Pincode", { inputMode: "numeric", maxLength: 6, placeholder: "412101" })}
          </div>
          <div className="mt-4">{field("serviceArea", "Service Area", { placeholder: "Pune, PCMC and nearby areas" })}</div>
        </Card>

        {/* step 4 */}
        <Card step={4} id="step-4" title="Services & Products" sub="Select what you offer. These appear on your profile with photos.">
          <span className="label">
            Services you offer
            <Req />
          </span>
          {cat ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {[...new Set([...cat.subcategories, ...arr(init.services)])].map((x) => (
                <label key={x} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-[13.5px] text-ink has-[:checked]:border-brand has-[:checked]:bg-mint-50">
                  <input type="checkbox" name="services" value={x} defaultChecked={arr(init.services).includes(x)} className="check !h-4 !w-4" /> {x}
                </label>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-[#f9fafb] p-3 text-[13.5px] text-muted">Choose a category in Step 1 to see services.</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("customServices", <>Other services <span className="font-normal text-muted">(comma separated)</span></>, { placeholder: "e.g. Hardware, Waterproofing" })}
            {field("tags", <>Card tags <span className="font-normal text-muted">(comma separated)</span></>, { placeholder: "Cement, Steel, Sand, Bricks, Tiles" })}
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="bf-products">
              Products / Brands <span className="font-normal text-muted">(comma separated)</span>
            </label>
            <textarea id="bf-products" name="products" rows={2} defaultValue={s(init.products)} className="input" placeholder="UltraTech Cement, JSW TMT Steel, River Sand, Red Bricks…" />
          </div>
          <span className="label mt-4">Highlights</span>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_HIGHLIGHTS.map((h) => (
              <label key={h} className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[13px] has-[:checked]:border-brand has-[:checked]:bg-mint-50 has-[:checked]:text-brand">
                <input type="checkbox" name="highlights" value={h} defaultChecked={arr(init.highlights).includes(h)} className="sr-only" /> {h}
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("workingHours", "Working Hours", { placeholder: "Mon - Sat (8:00 AM - 8:00 PM)" })}
            {field("delivery", "Delivery Available", { placeholder: "Yes (Tractor / Truck / Dumper)" })}
            {field("priceLabel", "Price shown on card", { placeholder: "₹1,200 / Hour or Contact for Best Rate" })}
            <div>
              <label className="label" htmlFor="bf-avail">
                Availability badge
              </label>
              <select id="bf-avail" name="availability" defaultValue={s(init.availability)} className="input">
                <option value="">None</option>
                <option>Available Today</option>
                <option>In Stock</option>
                <option>Open Now</option>
              </select>
            </div>
            {field("customers", "Happy Customers", { placeholder: "500+" })}
            {field("projects", "Projects Done / Supplied", { placeholder: "1000+" })}
          </div>
          <span className="label mt-4">Payment Modes</span>
          <div className="flex flex-wrap gap-4">
            {PAYMENT_MODES.map((p) => (
              <label key={p} className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" name="paymentModes" value={p} defaultChecked={arr(init.paymentModes).includes(p)} className="check !h-4 !w-4" /> {p}
              </label>
            ))}
          </div>
        </Card>

        {/* step 5 */}
        <Card step={5} id="step-5" title="Photos & Documents" sub="Good photos get up to 5x more enquiries. JPG, PNG or WEBP up to 8 MB each.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line p-4 hover:border-brand">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mint text-brand">
                {logoUrl ? <Img src={logoUrl} alt="Logo preview" fill sizes="64px" className="object-cover" unoptimized /> : <Store className="h-7 w-7" />}
              </span>
              <span>
                <b className="block text-[14px] text-ink">Business Logo</b>
                <span className="text-[12px] text-muted">Square image works best</span>
              </span>
              <input type="file" name="logo" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && setLogoUrl(URL.createObjectURL(e.target.files[0]))} />
            </label>
            <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line p-4 hover:border-brand">
              <span className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-mint text-brand">
                {coverUrl ? <Img src={coverUrl} alt="Cover preview" fill sizes="96px" className="object-cover" unoptimized /> : <ImagePlus className="h-7 w-7" />}
              </span>
              <span>
                <b className="block text-[14px] text-ink">Cover Photo</b>
                <span className="text-[12px] text-muted">Shop, yard or work photo</span>
              </span>
              <input type="file" name="cover" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && setCoverUrl(URL.createObjectURL(e.target.files[0]))} />
            </label>
          </div>
          {initial && (initial.logo || initial.cover) && (
            <div className="mt-2 flex gap-5 text-[13px] text-body">
              {initial.logo && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="removeLogo" className="check !h-4 !w-4" /> Remove current logo
                </label>
              )}
              {initial.cover && (
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="removeCover" className="check !h-4 !w-4" /> Remove current cover
                </label>
              )}
            </div>
          )}
          {initial && initial.images.length > 0 && (
            <div className="mt-4">
              <span className="label">Current gallery (untick to remove)</span>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {initial.images.map((src) => (
                  <li key={src}>
                    <label className="relative block aspect-square cursor-pointer overflow-hidden rounded-lg border border-line">
                      <Img src={src} alt="" fill sizes="120px" className="object-cover" />
                      <input type="checkbox" name="keepImages" value={src} defaultChecked className="check absolute left-1.5 top-1.5" />
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line p-6 text-center hover:border-brand">
            <ImagePlus className="h-8 w-8 text-brand" />
            <b className="text-[14px] text-ink">{newPhotos ? `${newPhotos} photo${newPhotos > 1 ? "s" : ""} selected` : "Add Product / Work Photos"}</b>
            <span className="text-[12px] text-muted">Select multiple photos (up to 20)</span>
            <input type="file" name="images" accept="image/*" multiple className="sr-only" onChange={(e) => setNewPhotos(e.target.files?.length ?? 0)} />
          </label>
          <label className="mt-4 flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border border-line p-4 hover:border-brand">
            <FileUp className="h-6 w-6 text-brand" />
            <span className="flex-1">
              <b className="block text-[14px] text-ink">Business Documents <span className="font-normal text-muted">(Optional)</span></b>
              <span className="text-[12px] text-muted">GST certificate, Shop Act, Udyam – PDF or image. Only our team can see these.</span>
            </span>
            <input type="file" name="documents" accept="image/*,application/pdf" multiple className="w-full min-w-0 max-w-[200px] text-[12px]" />
          </label>
        </Card>

        {/* step 6 */}
        <Card step={6} id="step-6" title="Plans & Payment" sub="Choose how you want to appear on AgriLand.">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { v: "free", t: "Basic Listing", p: "Free", f: ["Business profile page", "Call & WhatsApp buttons", "Show in category search"] },
              { v: "premium", t: "Premium Listing", p: `₹${premiumPrice.toLocaleString("en-IN")} / month`, f: ["Featured in search results", "Premium badge", "More customer enquiries", "Verified business badge", "Photos, services and offers"] },
            ].map((o) => (
              <label key={o.v} className={`relative cursor-pointer rounded-xl border-2 p-4 ${plan === o.v ? "border-brand bg-mint-50" : "border-line"}`}>
                <input type="radio" name="plan" value={o.v} defaultChecked={(s(init.plan) || "free") === o.v} className="sr-only" />
                {o.v === "premium" && <Crown className="absolute right-3 top-3 h-6 w-6 fill-[#f5a623] text-[#f5a623]" />}
                <b className="block text-[16px] text-ink">{o.t}</b>
                <span className="text-[20px] font-extrabold text-brand">{o.p}</span>
                <ul className="mt-2 space-y-1">
                  {o.f.map((x) => (
                    <li key={x} className="flex items-center gap-2 text-[13px] text-body">
                      <Check className="h-4 w-4 text-brand" /> {x}
                    </li>
                  ))}
                </ul>
              </label>
            ))}
          </div>
          {plan === "premium" && <p className="mt-3 rounded-lg bg-[#fffbeb] px-4 py-2.5 text-[13px] text-[#92400e]">No online payment needed now. After verification our team will call you to activate Premium.</p>}
          {!admin && (
            <label className="mt-4 flex items-start gap-2.5 text-[13.5px] text-body">
              <input type="checkbox" name="agree" defaultChecked={s(init.agree) === "on"} className="check mt-0.5" />
              <span>I confirm the details are correct and I agree to the AgriLand listing terms. My contact number will be shown to customers.</span>
            </label>
          )}
          <button disabled={pending} className="btn btn-primary mt-5 h-12 w-full text-[16px] xl:hidden">
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} {admin ? "Save Business" : "Submit Listing"}
          </button>
        </Card>
      </form>

      {/* right: preview & progress */}
      <aside className="hidden space-y-5 xl:block">
        <div className="sticky top-28 space-y-5">
          <section className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <h2 className="text-[17px] font-bold text-ink">Preview (How it will look)</h2>
            <div className="mt-3 rounded-xl border border-line p-3">
              <div className="flex gap-3">
                <span className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg bg-mint">
                  <Img src={coverUrl || logoUrl || cat?.image || "/images/svc/cat-building.jpg"} alt="" fill sizes="84px" className="object-cover" unoptimized={coverUrl?.startsWith("blob:") || logoUrl?.startsWith("blob:") || undefined} />
                </span>
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded bg-brand px-1.5 py-0.5 text-[10.5px] font-semibold text-white">
                    <BadgeCheck className="h-3 w-3" /> Verified Business
                  </span>
                  <b className="mt-1 block truncate text-[15px] leading-snug text-ink">{s(live.name) || "Your Business Name"}</b>
                  <span className="flex items-center gap-1 text-[12px] text-body">
                    <Star className="h-3.5 w-3.5 fill-[#f5a623] text-[#f5a623]" /> New listing
                  </span>
                  <span className="flex items-center gap-1 truncate text-[12px] text-body">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {[s(live.area), s(live.district)].filter(Boolean).join(", ") || "Your area"}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {previewTags.map((t) => (
                  <span key={t} className="rounded bg-[#f3f4f6] px-2 py-0.5 text-[11px] text-ink">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <span className="btn btn-outline h-9 text-[13px]">
                  <Phone className="h-4 w-4" /> Call
                </span>
                <span className="btn h-9 bg-[#15803d] text-[13px] text-white">
                  <WhatsAppIcon /> WhatsApp
                </span>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-[#d6ecdc] bg-mint-50 p-4">
            <h2 className="text-[16px] font-bold text-ink">{admin ? "Profile Completeness" : "Business Registration Progress"}</h2>
            <div className="mt-2 flex items-center gap-3">
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-white">
                <span className="block h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
              </span>
              <span className="text-[13px] font-semibold text-ink">{pct}%</span>
            </div>
            <p className="mt-1 text-[12.5px] text-body">
              {doneCount} of 6 steps completed
            </p>
            <ul className="mt-3 space-y-2 rounded-xl bg-white p-3">
              {STEPS.map((st, i) => (
                <li key={st.t}>
                  <a href={`#step-${i + 1}`} className="flex items-center gap-2.5 text-[13.5px] text-ink">
                    {done[i] ? <CircleCheck className="h-5 w-5 fill-brand text-white" /> : <span className="h-5 w-5 rounded-full border-2 border-line" />}
                    {st.t}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          {!admin && (
            <section className="rounded-2xl border border-[#f5e3a8] bg-[#fff8e1] p-4">
              <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
                <Crown className="h-5 w-5 fill-[#f5a623] text-[#f5a623]" /> Premium Listing Benefits
              </h2>
              <ul className="mt-2 space-y-1.5">
                {["Featured in search results", "More customer enquiries", "Show photos, services and offers", "Verified business badge", "Direct Call & WhatsApp button"].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-[13px] text-ink">
                    <Check className="h-4 w-4 text-brand" /> {x}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <button type="button" onClick={next} disabled={pending} className="btn btn-primary h-12 w-full text-[16px]">
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {firstMissing === undefined ? (admin ? "Save Business" : "Submit Listing") : "Save & Continue"} <ArrowRight className="h-5 w-5" />
          </button>
          {!admin && (
            <p className="text-center text-[13.5px] text-body">
              or{" "}
              <button type="button" onClick={saveDraft} className="font-semibold text-brand underline">
                Save as Draft
              </button>
            </p>
          )}
        </div>
      </aside>

      {/* mobile bottom bar */}
      <div className="sticky bottom-0 z-30 col-span-full -mx-4 flex items-center gap-3 border-t border-line bg-white p-3 xl:hidden">
        <span className="text-[12.5px] text-body">
          <b className="text-ink">{pct}%</b> done
        </span>
        {!admin && (
          <button type="button" onClick={saveDraft} className="btn btn-ghost h-11 px-4 text-[14px]">
            Save Draft
          </button>
        )}
        <button type="button" onClick={next} disabled={pending} className="btn btn-primary h-11 flex-1 text-[15px]">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {firstMissing === undefined ? (admin ? "Save" : "Submit") : "Continue"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Left-column extras for the public page. */
export function WhyList({ helpPhone, helpHours }: { helpPhone: string; helpHours: string }) {
  const why = [
    [UsersRound, "Get more customers from your area"],
    [ShieldCheck, "Verified business profile"],
    [ImagePlus, "Show your services & photos"],
    [WhatsAppIcon, "Direct Call & WhatsApp enquiries"],
    [ChartNoAxesColumnIncreasing, "Grow your business"],
  ] as const;
  return (
    <>
      <section className="rounded-2xl border border-[#d6ecdc] bg-mint-50 p-5">
        <h2 className="text-[18px] font-bold text-ink">Why List on AgriLand?</h2>
        <ul className="mt-3 space-y-3">
          {why.map(([I, t]) => (
            <li key={t} className="flex items-center gap-3 text-[14px] text-ink">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <I className="h-5 w-5" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>
      <HelpBox helpPhone={helpPhone} helpHours={helpHours} />
    </>
  );
}

export function HelpBox({ helpPhone, helpHours }: { helpPhone: string; helpHours: string }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <a href={waLink(helpPhone, "Hello, I need help with AgriLand.")} target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white" aria-label="WhatsApp support">
          <Phone className="h-5 w-5" />
        </a>
        <span>
          <b className="block text-[16px] text-ink">Need Help?</b>
          <span className="text-[13px] text-body">Call or WhatsApp us</span>
        </span>
      </div>
      <a href={telLink(helpPhone)} className="mt-3 flex items-center gap-2 text-[17px] font-bold text-ink hover:text-brand">
        <Phone className="h-4 w-4" /> {helpPhone}
      </a>
      <p className="ml-6 text-[13px] text-body">{helpHours}</p>
    </section>
  );
}

export function ListBusinessHeader({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mint text-brand">
          <UserRoundPlus className="h-7 w-7" />
        </span>
        <div>
          <h1 className="font-display text-[26px] font-extrabold leading-tight text-ink sm:text-[32px]">List Your Business on AgriLand</h1>
          <p className="text-[15px] text-body">Get more enquiries, verified customers and grow your business.</p>
        </div>
      </div>
      {!loggedIn && (
        <Link href="/login?next=/list-business" className="rounded-xl border border-line bg-white px-4 py-2.5 text-[13.5px] text-body shadow-sm">
          Already have an account? <b className="text-brand">Login</b>
        </Link>
      )}
    </div>
  );
}

