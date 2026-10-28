"use client";

import { keepValues } from "@/lib/forms";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, Camera, Check, CircleCheck, FileUp, ImagePlus, Loader2, MapPin, Phone, Star, UserRound, UsersRound } from "lucide-react";
import { saveWorkerAction } from "@/app/actions/services";
import { Honeypot } from "@/components/FormGuard";
import { Alert } from "@/components/auth/AuthForms";
import { Img } from "@/components/Img";
import { DISTRICTS, SUB_DISTRICTS } from "@/lib/config";
import { EXPERIENCE_OPTIONS, ID_PROOF_TYPES, WORK_RADIUS, waLink } from "@/lib/services-config";
import { WhatsAppIcon } from "./Actions";
import { HelpBox } from "./BusinessForm";
import type { ServiceCategory, Worker } from "@/lib/types";

const DRAFT_KEY = "agri-worker-draft";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STEPS = [
  { t: "Basic Information", d: "Your personal details" },
  { t: "Work Details", d: "Skills and experience" },
  { t: "Location & Availability", d: "Where and when you work" },
  { t: "Documents", d: "Upload ID proof and photos" },
  { t: "Review & Submit", d: "Check and publish profile" },
];

type Init = Partial<Record<string, string | string[]>>;
const s = (v: Init[string]) => (Array.isArray(v) ? v[0] ?? "" : v ?? "");
const arr = (v: Init[string]) => (Array.isArray(v) ? v : v ? [v] : []);

function fromWorker(w?: Worker): Init {
  if (!w) return { profileType: "individual", district: "Pune", sameWhatsapp: "on", availableToday: "on", workRadius: "Within 10 km", days: DAYS.slice(0, 6) };
  const out: Init = {
    ...Object.fromEntries(Object.entries(w).filter(([, v]) => typeof v === "string" || typeof v === "number").map(([k, v]) => [k, String(v)])),
    skills: w.skills,
    days: (w.availability ?? "").split(",").map((d) => d.trim()).filter(Boolean),
    sameWhatsapp: !w.whatsapp || w.whatsapp === w.phone ? "on" : "",
    availableToday: w.availableToday ? "on" : "",
    verified: w.verified ? "on" : "",
  };
  for (const [k, n] of Object.entries(w.skillCounts ?? {})) out[`count_${k}`] = String(n);
  return out;
}

function readForm(f: HTMLFormElement | null): Init {
  if (!f) return {};
  const fd = new FormData(f);
  const out: Init = {};
  for (const k of new Set(fd.keys())) {
    const all = fd.getAll(k).filter((v) => typeof v === "string") as string[];
    out[k] = all.length > 1 || ["skills", "days"].includes(k) ? all : all[0];
  }
  return out;
}

function Card({ step, id, title, sub, children }: { step?: number; id: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
      {step && <p className="text-[12.5px] font-semibold text-brand">Step {step} of 5</p>}
      <h2 className="text-[22px] font-bold text-ink">{title}</h2>
      <p className="mb-5 text-[14px] text-body">{sub}</p>
      {children}
    </section>
  );
}
const Req = () => <span className="text-[#dc2626]"> *</span>;

export function WorkerForm({ categories, mode = "public", initial, helpPhone, helpHours }: { categories: ServiceCategory[]; mode?: "public" | "admin"; initial?: Worker; helpPhone: string; helpHours: string }) {
  const admin = mode === "admin";
  const [state, action, pending] = useActionState(saveWorkerAction, undefined);
  const [init, setInit] = useState<Init>(() => fromWorker(initial));
  const [formKey, setFormKey] = useState(0);
  const [live, setLive] = useState<Init>(init);
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initial?.photo);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initial?.cover);
  const [hasId, setHasId] = useState(Boolean(initial?.idProof));
  const [workCount, setWorkCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (admin) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as Init;
      setInit(d);
      setLive(d);
      setFormKey((k) => k + 1);
      setNote("We restored your saved draft. Please add your photos again.");
    } catch {}
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

  const cat = categories.find((c) => c.id === s(live.categoryId));
  const skills = arr(live.skills);
  const group = s(live.profileType) === "group";
  const wage = s(live.wageMin);

  const done = useMemo(
    () => [
      s(live.name).trim().length >= 2 && s(live.phone).replace(/\D/g, "").length >= 10 && (admin || Boolean(photoUrl)),
      Boolean(cat) && skills.length > 0 && Boolean(s(live.experience)) && Number(wage) >= 50,
      Boolean(s(live.district)) && Boolean(s(live.village).trim()),
      hasId || workCount > 0,
      admin || s(live.agree) === "on",
    ],
    [live, cat, skills.length, wage, photoUrl, hasId, workCount, admin],
  );
  const doneCount = done.filter(Boolean).length;
  const required = [0, 1, 2, 4];
  const firstMissing = required.find((i) => !done[i]);

  const saveDraft = () => {
    const d = readForm(formRef.current);
    delete d.agree;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      setNote("Draft saved on this device. You can finish later.");
    } catch {
      setNote("Could not save the draft in this browser.");
    }
  };
  const next = () => {
    if (firstMissing === undefined) formRef.current?.requestSubmit();
    else document.getElementById(`wstep-${firstMissing + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (state?.ok && !admin)
    return (
      <div className="mx-auto max-w-[640px] rounded-2xl border border-[#bbf7d0] bg-white p-8 text-center shadow-card">
        <CircleCheck className="mx-auto h-14 w-14 text-brand" />
        <h2 className="mt-3 text-[24px] font-bold text-ink">Registration submitted!</h2>
        <p className="mt-2 text-[15px] text-body">Our team will verify your profile and photos. Once approved, your profile goes live and customers can call or WhatsApp you directly.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/labour?tab=work#results" className="btn btn-primary h-11 px-6">
            See Work Near You
          </Link>
          <a href={waLink(helpPhone, "Hello, I registered as a worker on AgriLand.")} target="_blank" rel="noopener noreferrer" className="btn btn-outline h-11 px-6">
            <WhatsAppIcon /> WhatsApp Support
          </a>
        </div>
      </div>
    );

  const input = (name: string, label: React.ReactNode, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label" htmlFor={`wf-${name}`}>
        {label}
      </label>
      <input id={`wf-${name}`} name={name} defaultValue={s(init[name])} className="input" {...props} />
    </div>
  );

  return (
    <div className={`grid gap-6 ${admin ? "xl:grid-cols-[1fr_300px]" : "lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_310px]"}`}>
      {!admin && (
        <aside className="hidden space-y-5 lg:block">
          <ol className="rounded-2xl border border-line bg-white p-3 shadow-card">
            {STEPS.map((st, i) => {
              const active = i === (firstMissing ?? 4);
              return (
                <li key={st.t}>
                  <a href={`#wstep-${i + 1}`} className={`flex items-start gap-3 rounded-xl p-3 ${active ? "bg-mint-50" : "hover:bg-[#f9fafb]"}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold ${done[i] || active ? "bg-brand text-white" : "border border-line bg-white text-ink"}`}>{done[i] ? <Check className="h-4 w-4" /> : i + 1}</span>
                    <span>
                      <b className={`block text-[14px] ${active ? "text-brand" : "text-ink"}`}>{st.t}</b>
                      <span className="text-[12.5px] text-body">{st.d}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
          <HelpBox helpPhone={helpPhone} helpHours={helpHours} />
        </aside>
      )}

      <form key={formKey} ref={formRef} onSubmit={keepValues(action)} onChange={() => setLive(readForm(formRef.current))} className="relative min-w-0 space-y-5">
        <Honeypot />
        {initial && <input type="hidden" name="id" value={initial.id} />}
        <div id="form-alert">
          <Alert error={state?.error} />
          {note && <p className="mt-2 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-2.5 text-[13.5px] text-[#1e40af]">{note}</p>}
        </div>

        {admin && (
          <Card id="admin" title="Admin Settings" sub="Visibility, badge and rating for this profile.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="wf-status">
                  Status
                </label>
                <select id="wf-status" name="status" defaultValue={s(init.status) || "active"} className="input">
                  <option value="active">Active (live)</option>
                  <option value="pending">Pending review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <label className="flex items-center gap-2 pt-6 text-[14px]">
                <input type="checkbox" name="verified" defaultChecked={s(init.verified) === "on" || !initial} className="check" /> Verified badge
              </label>
              {input("expYears", "Experience (years, number)", { type: "number", min: 0, max: 60 })}
              {initial && input("slug", "URL slug")}
              {initial && (
                <div className="sm:col-span-2">
                  <span className="label">Rating (override)</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-[13.5px]">
                      <input type="checkbox" name="ratingOverride" className="check" /> Set manually
                    </label>
                    <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={initial.rating} className="input w-24" aria-label="Rating" />
                    <input name="reviewCount" type="number" min="0" defaultValue={initial.reviewCount} className="input w-28" aria-label="Review count" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <Card step={1} id="wstep-1" title="Basic Information" sub="Tell us about yourself so customers can contact you.">
          {input("name", <>Full Name<Req /></>, { required: true, autoComplete: "name", placeholder: "Ramesh Shankar Jadhav" })}
          <div className="mt-4">
            <label className="label" htmlFor="wf-phone">
              Mobile Number
              <Req />
            </label>
            <div className="flex gap-2">
              <div className="flex flex-1">
                <span className="flex items-center rounded-l-lg border border-r-0 border-line bg-[#f9fafb] px-3 text-[14px]">+91</span>
                <input id="wf-phone" name="phone" type="tel" required defaultValue={s(init.phone)} className="input rounded-l-none" placeholder="9876543210" autoComplete="tel" />
              </div>
              <label className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-lg border border-line text-muted has-[:checked]:border-[#15803d] has-[:checked]:bg-[#15803d] has-[:checked]:text-white" title="Same number on WhatsApp">
                <input type="checkbox" name="sameWhatsapp" defaultChecked={s(init.sameWhatsapp) === "on"} className="sr-only" />
                <WhatsAppIcon className="h-5 w-5" />
              </label>
            </div>
            {s(live.sameWhatsapp) !== "on" && <div className="mt-3">{input("whatsapp", "WhatsApp Number", { type: "tel", placeholder: "WhatsApp number" })}</div>}
          </div>
          <span className="label mt-4">
            Profile Type
            <Req />
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["individual", "Individual Worker", "I work alone", UserRound],
                ["group", "Labour Group / Naka", "I have a team of workers", UsersRound],
              ] as const
            ).map(([v, t, d, I]) => (
              <label key={v} className={`relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 ${s(live.profileType) === v ? "border-brand bg-mint-50" : "border-line"}`}>
                <input type="radio" name="profileType" value={v} defaultChecked={s(init.profileType) === v} className="sr-only" />
                <I className="h-8 w-8 text-brand" />
                <span>
                  <b className="block text-[14.5px] text-ink">{t}</b>
                  <span className="text-[12.5px] text-body">{d}</span>
                </span>
                {s(live.profileType) === v && <CircleCheck className="absolute right-3 top-3 h-5 w-5 fill-brand text-white" />}
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="label">
                Profile Photo
                {!admin && <Req />}
              </span>
              <label className="flex cursor-pointer items-center gap-3">
                <span className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-[#f9fafb]">
                  {photoUrl ? <Img src={photoUrl} alt="Profile preview" fill sizes="110px" className="object-cover" unoptimized={photoUrl.startsWith("blob:") || undefined} /> : <Camera className="h-7 w-7 text-muted" />}
                </span>
                <span className="text-[13px] text-body">
                  <b className="block text-ink">Upload Photo</b>
                  JPG, PNG (Max 8 MB)
                </span>
                <input type="file" name="photo" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && setPhotoUrl(URL.createObjectURL(e.target.files[0]))} />
              </label>
            </div>
            <div>
              <span className="label">
                Choose a Cover Photo <span className="font-normal text-muted">(Optional)</span>
              </span>
              <label className="flex cursor-pointer items-center gap-3">
                <span className="relative flex h-[110px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-line bg-[#f9fafb]">
                  {coverUrl ? <Img src={coverUrl} alt="Cover preview" fill sizes="150px" className="object-cover" unoptimized={coverUrl.startsWith("blob:") || undefined} /> : <ImagePlus className="h-7 w-7 text-muted" />}
                </span>
                <span className="text-[13px] text-body">
                  <b className="block text-ink">Upload Cover</b>
                  Photo of your work site
                </span>
                <input type="file" name="cover" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && setCoverUrl(URL.createObjectURL(e.target.files[0]))} />
              </label>
              {initial?.cover && (
                <label className="mt-1.5 flex items-center gap-2 text-[12.5px] text-body">
                  <input type="checkbox" name="removeCover" className="check !h-4 !w-4" /> Remove current cover
                </label>
              )}
            </div>
          </div>
        </Card>

        <Card step={2} id="wstep-2" title="Work Details" sub="Select the type of work you do and your experience.">
          <label className="label" htmlFor="wf-cat">
            Work Category
            <Req />
          </label>
          <select id="wf-cat" name="categoryId" defaultValue={s(init.categoryId)} className="input">
            <option value="">Select work category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="label mt-4">
            Sub Category / Skill
            <Req />
          </span>
          {cat ? (
            <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {[...new Set([...cat.subcategories, ...arr(init.skills)])].map((x) => (
                <div key={x} className="flex items-center gap-2">
                  <label className="flex flex-1 cursor-pointer items-center gap-2.5 text-[14px] text-ink">
                    <input type="checkbox" name="skills" value={x} defaultChecked={arr(init.skills).includes(x)} className="check rounded" /> {x}
                  </label>
                  {group && skills.includes(x) && <input name={`count_${x}`} type="number" min={1} defaultValue={s(init[`count_${x}`])} placeholder="No." aria-label={`Workers for ${x}`} className="input !h-8 w-16 !px-2 text-[13px]" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-[#f9fafb] p-3 text-[13.5px] text-muted">Choose a work category first.</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="wf-exp">
                Experience
                <Req />
              </label>
              <select id="wf-exp" name="experience" defaultValue={s(init.experience)} className="input">
                <option value="">Select experience</option>
                {[...new Set([...EXPERIENCE_OPTIONS.map((o) => o.label), ...(s(init.experience) ? [s(init.experience)] : [])])].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="wf-wage">
                {group ? "Daily Wage Range (₹)" : "Daily Wage (₹)"}
                <Req />
              </label>
              <div className="flex items-center gap-2">
                <input id="wf-wage" name="wageMin" type="number" min={50} required defaultValue={s(init.wageMin)} className="input" placeholder="700" />
                {group && <input name="wageMax" type="number" min={50} defaultValue={s(init.wageMax)} className="input" placeholder="800" aria-label="Maximum wage" />}
                <span className="shrink-0 text-[14px] text-body">/ Day</span>
              </div>
            </div>
            {group && input("teamSize", "Total Workers in Group", { type: "number", min: 2, placeholder: "50" })}
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="wf-desc">
              Work Description <span className="font-normal text-muted">(Optional)</span>
            </label>
            <textarea id="wf-desc" name="description" rows={3} maxLength={500} defaultValue={s(init.description)} className="input" placeholder="All types of masonry work, brick work, plaster, compound wall, and construction helper work." />
            <p className="mt-1 text-right text-[12px] text-muted">{s(live.description).length}/500</p>
          </div>
        </Card>

        <Card step={3} id="wstep-3" title="Location & Availability" sub="Where and when you are available for work.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="wf-district">
                District
                <Req />
              </label>
              <select id="wf-district" name="district" defaultValue={s(init.district) || "Pune"} className="input">
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="wf-taluka">
                Taluka
              </label>
              <select id="wf-taluka" name="taluka" key={s(live.district)} defaultValue={s(init.taluka)} className="input">
                <option value="">Select Taluka</option>
                {(SUB_DISTRICTS[s(live.district) || "Pune"] ?? []).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            {input("village", <>Village / Area<Req /></>, { required: true, placeholder: "Talegaon" })}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="wf-radius">
                Work Area
              </label>
              <select id="wf-radius" name="workRadius" defaultValue={s(init.workRadius) || "Within 10 km"} className="input">
                {[...new Set([...WORK_RADIUS, s(init.workRadius)].filter(Boolean))].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-[14px] has-[:checked]:border-brand has-[:checked]:bg-mint-50">
              <input type="checkbox" name="availableToday" defaultChecked={s(init.availableToday) === "on"} className="check" />
              <span>
                <b className="block text-ink">Available Today</b>
                <span className="text-[12px] text-muted">Show the green “Available Today” badge</span>
              </span>
            </label>
          </div>
          <span className="label mt-4">Working Days</span>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <label key={d} className="cursor-pointer rounded-lg border border-line px-3.5 py-1.5 text-[13.5px] has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-white">
                <input type="checkbox" name="days" value={d} defaultChecked={arr(init.days).includes(d)} className="sr-only" /> {d}
              </label>
            ))}
          </div>
        </Card>

        <Card step={4} id="wstep-4" title="Documents" sub="ID proof is only seen by our verification team – never shown publicly.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="wf-idtype">
                ID Proof Type
              </label>
              <select id="wf-idtype" name="idProofType" defaultValue={s(init.idProofType) || ID_PROOF_TYPES[0]} className="input">
                {ID_PROOF_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line px-4 py-2 hover:border-brand">
              <FileUp className="h-6 w-6 text-brand" />
              <span className="flex-1 text-[13px]">
                <b className="block text-ink">{hasId ? "ID proof added ✓" : "Upload ID Proof"}</b>
                <span className="text-muted">Photo or PDF</span>
              </span>
              <input type="file" name="idProof" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setHasId(Boolean(e.target.files?.length) || Boolean(initial?.idProof))} />
            </label>
          </div>
          {initial && initial.workPhotos.length > 0 && (
            <div className="mt-4">
              <span className="label">Current work photos (untick to remove)</span>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {initial.workPhotos.map((src) => (
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
            <b className="text-[14px] text-ink">{workCount ? `${workCount} work photo${workCount > 1 ? "s" : ""} selected` : "Add Work Photos"}</b>
            <span className="text-[12px] text-muted">Photos of your finished work build trust</span>
            <input type="file" name="workPhotos" accept="image/*" multiple className="sr-only" onChange={(e) => setWorkCount(e.target.files?.length ?? 0)} />
          </label>
        </Card>

        <Card step={5} id="wstep-5" title="Review & Submit" sub="Check your details before publishing your profile.">
          <dl className="grid gap-x-6 gap-y-2 rounded-xl bg-[#f9fafb] p-4 text-[14px] sm:grid-cols-2">
            {[
              ["Name", s(live.name)],
              ["Mobile", s(live.phone)],
              ["Profile Type", group ? "Labour Group / Naka" : "Individual Worker"],
              ["Category", cat?.name],
              ["Skills", skills.join(", ")],
              ["Experience", s(live.experience)],
              ["Daily Wage", wage ? `₹${wage}${group && s(live.wageMax) ? ` - ₹${s(live.wageMax)}` : ""} / Day` : ""],
              ["Location", [s(live.village), s(live.taluka), s(live.district)].filter(Boolean).join(", ")],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="w-28 shrink-0 text-muted">{k}</dt>
                <dd className={v ? "text-ink" : "text-[#dc2626]"}>{v || "Missing"}</dd>
              </div>
            ))}
          </dl>
          {!admin && (
            <label className="mt-4 flex items-start gap-2.5 text-[13.5px] text-body">
              <input type="checkbox" name="agree" defaultChecked={s(init.agree) === "on"} className="check mt-0.5" />
              <span>I confirm these details are true. My phone number will be shown to customers so they can call me.</span>
            </label>
          )}
          <button disabled={pending} className="btn btn-primary mt-5 h-12 w-full text-[16px]">
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />} {admin ? "Save Worker" : "Submit Profile"}
          </button>
        </Card>
      </form>

      <aside className="hidden xl:block">
        <div className="sticky top-28 space-y-5">
          <section className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-ink">Profile Preview</h2>
              <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[11.5px] font-semibold text-white">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              <span className="relative h-[90px] w-[90px] shrink-0 overflow-hidden rounded-xl bg-mint">
                <Img src={photoUrl || "/images/svc/lab-construction.jpg"} alt="" fill sizes="90px" className="object-cover" unoptimized={photoUrl?.startsWith("blob:") || undefined} />
              </span>
              <span className="min-w-0">
                <b className="block truncate text-[16px] text-ink">{s(live.name) || "Your Name"}</b>
                <span className="flex items-center gap-1 text-[12.5px] text-body">
                  <Star className="h-3.5 w-3.5 fill-[#f5a623] text-[#f5a623]" /> New profile
                </span>
                <span className="flex items-center gap-1 text-[12.5px] text-body">
                  <MapPin className="h-3.5 w-3.5" /> {[s(live.village), s(live.taluka)].filter(Boolean).join(", ") || "Your village"}
                </span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map((x) => (
                <span key={x} className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[12px] text-ink">
                  {x}
                </span>
              ))}
              {s(live.experience) && <span className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[12px] text-ink">{s(live.experience)} Experience</span>}
              <span className="rounded-md bg-[#f3f4f6] px-2 py-1 text-[12px] text-ink">{group ? "Labour Group" : "Individual Worker"}</span>
            </div>
            {s(live.availableToday) === "on" && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#dcf3e8] px-2 py-1 text-[12px] font-semibold text-brand">
                <CircleCheck className="h-3.5 w-3.5" /> Available Today
              </span>
            )}
            <p className="mt-2 text-[22px] font-extrabold text-ink">{wage ? `₹${wage} / Day` : "₹ – / Day"}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <span className="btn btn-outline h-10 text-[14px]">
                <Phone className="h-4 w-4" /> Call
              </span>
              <span className="btn h-10 bg-[#15803d] text-[14px] text-white">
                <WhatsAppIcon /> WhatsApp
              </span>
            </div>
          </section>
          {!admin && (
            <>
              <section className="rounded-2xl border border-[#f5e3a8] bg-[#fff8e1] p-4">
                <h2 className="text-[15px] font-bold text-ink">What happens after registration?</h2>
                <ol className="mt-3 space-y-2.5">
                  {[
                    ["Create your profile", "Fill basic details and work information"],
                    ["Our team verifies your profile", "We check your information and photos"],
                    ["Your profile goes live on AgriLand", "Customers can find and contact you"],
                    ["Start getting work enquiries", "Direct calls and WhatsApp from customers"],
                  ].map(([t, d], i) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">{i + 1}</span>
                      <span>
                        <b className="block text-[13px] text-ink">{t}</b>
                        <span className="text-[12px] text-body">{d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="rounded-2xl border border-[#d6ecdc] bg-mint-50 p-4">
                <h2 className="text-[15px] font-bold text-ink">Tips for a better profile</h2>
                <ul className="mt-2 space-y-1.5">
                  {["Use a clear and real photo", "Add your correct skills and experience", "Set your daily wage or price", "Keep your contact number active", "Add work photos to build trust"].map((x) => (
                    <li key={x} className="flex items-center gap-2 text-[13px] text-ink">
                      <Check className="h-4 w-4 text-brand" /> {x}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
          <button type="button" onClick={next} disabled={pending} className="btn btn-primary h-12 w-full text-[16px]">
            {pending && <Loader2 className="h-5 w-5 animate-spin" />}
            {firstMissing === undefined ? (admin ? "Save Worker" : "Submit Profile") : "Save & Continue"} <ArrowRight className="h-5 w-5" />
          </button>
          {!admin && (
            <p className="text-center text-[13.5px]">
              <button type="button" onClick={saveDraft} className="font-semibold text-brand underline">
                Save as Draft
              </button>
            </p>
          )}
          <p className="text-center text-[12px] text-muted">{doneCount} of 5 steps completed</p>
        </div>
      </aside>

      <div className="sticky bottom-0 z-30 col-span-full -mx-4 flex items-center gap-3 border-t border-line bg-white p-3 xl:hidden">
        <span className="text-[12.5px] text-body">
          <b className="text-ink">{doneCount}/5</b> steps
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
