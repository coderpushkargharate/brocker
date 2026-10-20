"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  FileText,
  FlaskConical,
  Heart,
  Info,
  Lightbulb,
  Link2,
  Loader2,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Package,
  PencilLine,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Tag,
  Upload,
  Video,
  X,
  Zap,
  CircleCheck,
  LocateFixed,
  Droplets,
  Rows3,
  Route,
  Sprout,
  ImageIcon,
  ListChecks,
} from "lucide-react";
import { saveLandAction } from "@/app/actions/lands";
import {
  AREA_UNITS,
  CROPS,
  DISTRICTS,
  DOCUMENT_TYPES,
  ELECTRICITY,
  FENCING,
  HIGHLIGHT_OPTIONS,
  LAND_CATEGORIES,
  PROPERTY_TYPES,
  ROAD_ACCESS,
  SOIL_TYPES,
  STATES,
  SUB_DISTRICTS,
  WATER_AVAILABILITY,
  WATER_SOURCES,
} from "@/lib/config";
import { inr } from "@/lib/format";
import type { DocKey, Land } from "@/lib/types";
import { Alert } from "../auth/AuthForms";

type Owner = { id: string; name: string };

function Section({ n, icon, title, sub, children }: { n: number; icon: React.ReactNode; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f2937] text-[14px] font-semibold text-white">{n}</span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
            <span className="text-muted">{icon}</span> {title}
          </h2>
          <p className="text-[12.5px] text-muted">{sub}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Req() {
  return <span className="text-[#ef4444]"> *</span>;
}

function Select({ name, value, onChange, options, label, required }: { name: string; value: string; onChange: (v: string) => void; options: string[]; label: string; required?: boolean }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required && <Req />}
      </label>
      <select id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)} className="input">
        {!options.includes(value) && <option value={value}>{value || "Select…"}</option>}
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

const nb = (l: Land | undefined, kind: string) => l?.nearby.find((n) => n.kind === kind);

export function ListingForm({ land, isAdmin, owners, backHref = "/dashboard" }: { land?: Land; isAdmin?: boolean; owners?: Owner[]; backHref?: string }) {
  const [state, action, pending] = useActionState(saveLandAction, undefined);

  const [f, setF] = useState({
    title: land?.title ?? "",
    landType: land?.landType ?? "Agricultural",
    area: land?.area ? String(land.area) : "",
    areaUnit: land?.areaUnit ?? "Acres",
    currentCrop: land?.currentCrop ?? "Sugarcane",
    village: land?.village ?? "",
    taluka: land?.taluka ?? "",
    district: land?.district ?? "Pune",
    state: land?.state ?? "Maharashtra",
    lat: land?.lat ? String(land.lat) : "",
    lng: land?.lng ? String(land.lng) : "",
    soilType: land?.soilType ?? "Black Soil",
    waterSource: land?.waterSource ?? "Well",
    waterAvailability: land?.waterAvailability ?? "Year-round",
    roadAccess: land?.roadAccess ?? "Paved Road",
    electricity: land?.electricity ?? "Available",
    fencing: land?.fencing ?? "Partially Fenced",
    price: land?.price ? String(land.price) : "",
    negotiable: land?.negotiable === false ? "no" : "yes",
    description: land?.description ?? "",
    nb_road: nb(land, "road") ? String(nb(land, "road")!.distanceKm) : "",
    nb_village: nb(land, "village") ? String(nb(land, "village")!.distanceKm) : "",
    nb_market: nb(land, "market") ? String(nb(land, "market")!.distanceKm) : "",
    nb_rail: nb(land, "rail") ? String(nb(land, "rail")!.distanceKm) : "",
    nb_city: nb(land, "city") ? `${nb(land, "city")!.detail} (${nb(land, "city")!.distanceKm} km)` : "",
    nb_highway: nb(land, "highway") ? `${nb(land, "highway")!.detail} (${nb(land, "highway")!.distanceKm} km)` : "",
  });
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const [highlights, setHighlights] = useState<string[]>(land?.highlights ?? ["Fertile Soil", "Good Water Availability", "Road Connectivity"]);
  const [kept, setKept] = useState<string[]>(land?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [docs, setDocs] = useState<Partial<Record<DocKey, string>>>({});
  const [showCoords, setShowCoords] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const pickInput = useRef<HTMLInputElement>(null);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // keep the real (hidden) file input in sync with the chosen photos
  useEffect(() => {
    if (!photoInput.current) return;
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    photoInput.current.files = dt.files;
  }, [files]);

  useEffect(() => {
    if (state?.error) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  const allImages = [...kept, ...previews];
  const area = Number(f.area) || 0;
  const price = Number(f.price.replace(/[^\d]/g, "")) || 0;
  const perAcre = area ? price / area : 0;
  const talukas = SUB_DISTRICTS[f.district] ?? [];
  const docState = (k: DocKey) => (docs[k] ? "new" : land?.documents.find((d) => d.key === k && d.file) ? land.documents.find((d) => d.key === k)!.status : "missing");

  const checks = [
    ["Basic Info", !!(f.title && area && f.landType)],
    ["Location", !!(f.village && f.taluka && f.district)],
    ["Features", !!(f.soilType && f.waterSource && f.roadAccess)],
    ["Photos", allImages.length >= 1],
    ["Documents", DOCUMENT_TYPES.filter((d) => d.required).every((d) => docState(d.key) !== "missing")],
    ["Pricing", price > 0],
    ["About You", f.description.trim().length >= 20],
    ["Connectivity", !!(f.nb_road || f.nb_market || f.nb_rail || f.nb_city)],
  ] as const;
  const allOk = checks.every(([, ok]) => ok);

  const useMyLocation = () => {
    if (!navigator.geolocation) return setGeoMsg("Location is not supported in this browser.");
    setGeoMsg("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setF((s) => ({ ...s, lat: p.coords.latitude.toFixed(5), lng: p.coords.longitude.toFixed(5) }));
        setGeoMsg("Location captured from your device.");
        setShowCoords(true);
      },
      () => setGeoMsg("Could not get your location. Please allow location access or enter it manually."),
    );
  };

  const highlightIcons: Record<string, React.ReactNode> = {
    "Fertile Soil": <Star className="h-3.5 w-3.5" />,
    "Good Water Availability": <FlaskConical className="h-3.5 w-3.5" />,
    "Road Connectivity": <Rows3 className="h-3.5 w-3.5" />,
    "Electricity Available": <Zap className="h-3.5 w-3.5" />,
    "Suitable for Multiple Crops": <MapIcon className="h-3.5 w-3.5" />,
    "Near Market": <Tag className="h-3.5 w-3.5" />,
    "Near Highway": <Route className="h-3.5 w-3.5" />,
  };

  return (
    <form action={action} className="container-dash pt-8">
      {land && <input type="hidden" name="id" value={land.id} />}
      {kept.map((src) => (
        <input key={src} type="hidden" name="existingImages" value={src} />
      ))}
      {highlights.map((h) => (
        <input key={h} type="hidden" name="highlights" value={h} />
      ))}
      <input type="hidden" name="lat" value={f.lat} />
      <input type="hidden" name="lng" value={f.lng} />
      <input ref={photoInput} type="file" name="photos" multiple accept="image/*" className="hidden" tabIndex={-1} aria-hidden />

      <Link href={backHref} className="inline-flex items-center gap-2 text-[15px] text-[#374151] hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> Back to My Listings
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[30px]">{land ? "Edit Land Listing" : "Add New Land Listing"}</h1>
          <p className="mt-1 text-[15px] text-muted">Provide accurate details to attract genuine investors and get better interest.</p>
        </div>
        <div className="flex gap-3">
          <button type="submit" name="intent" value="draft" disabled={pending} className="btn btn-ghost h-11 px-5 text-[15px] font-medium">
            <Save className="h-4 w-4" /> Save as Draft
          </button>
          <button type="submit" name="intent" value="publish" disabled={pending} className="btn btn-dark h-11 px-6 text-[15px] font-medium">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} {isAdmin ? "Save Listing" : land?.status === "active" ? "Save Changes" : "Preview & Publish"}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <Alert error={state?.error} ok={state?.ok} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_555px]">
        <div className="space-y-6">
          <Section n={1} icon={<LayoutGrid className="h-4 w-4" />} title="Basic Information" sub="Add basic details about your land.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="title">
                  Listing Title
                  <Req />
                </label>
                <input id="title" name="title" required value={f.title} onChange={(e) => set("title")(e.target.value)} className="input" placeholder="Green Valley Agricultural Land" maxLength={90} />
              </div>
              <Select name="landType" label="Land Type" required value={f.landType} onChange={set("landType")} options={PROPERTY_TYPES} />
              <div>
                <label className="label" htmlFor="area">
                  Total Area
                  <Req />
                </label>
                <div className="flex">
                  <input id="area" name="area" type="number" min="0" step="0.01" value={f.area} onChange={(e) => set("area")(e.target.value)} className="input rounded-r-none" placeholder="5" />
                  <select name="areaUnit" value={f.areaUnit} onChange={(e) => set("areaUnit")(e.target.value)} className="input w-[120px] rounded-l-none border-l-0" aria-label="Area unit">
                    {AREA_UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Select name="currentCrop" label="Current Crop / Land Use" value={f.currentCrop} onChange={set("currentCrop")} options={CROPS} />
            </div>
          </Section>

          <Section n={2} icon={<MapPin className="h-4 w-4" />} title="Location Details" sub="Add accurate location of your land.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="village">
                  Village
                  <Req />
                </label>
                <input id="village" name="village" value={f.village} onChange={(e) => set("village")(e.target.value)} className="input" placeholder="Shirur" />
              </div>
              <div>
                <label className="label" htmlFor="taluka">
                  Taluka
                  <Req />
                </label>
                <input id="taluka" name="taluka" list="talukas" value={f.taluka} onChange={(e) => set("taluka")(e.target.value)} className="input" placeholder="Shirur" />
                <datalist id="talukas">
                  {talukas.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              <Select name="district" label="District" required value={f.district} onChange={set("district")} options={DISTRICTS} />
              <Select name="state" label="State" required value={f.state} onChange={set("state")} options={STATES} />
            </div>
            <p className="label mt-4">
              Exact Location on Map
              <Req />
            </p>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="relative h-[140px] bg-[#eef1f5]">
                <svg viewBox="0 0 700 140" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                  <path d="M0 60 C 200 50, 330 100, 520 100 S 640 120, 700 125" fill="none" stroke="#c8d3e3" strokeWidth="3" />
                  <path d="M150 0 C 190 60, 220 110, 230 140" fill="none" stroke="#dfe3ea" strokeWidth="3" />
                  <path d="M430 0 C 400 50, 410 100, 440 140" fill="none" stroke="#dfe3ea" strokeWidth="3" />
                </svg>
                <span className="absolute left-[42%] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#1f2937] shadow-[0_0_0_8px_rgba(31,41,55,0.12)]">
                  <MapPin className="h-5 w-5 fill-white text-[#1f2937]" />
                </span>
                <button type="button" onClick={() => setShowCoords((s) => !s)} className="absolute bottom-4 right-3 rounded-md border border-line bg-white px-3 py-1.5 text-[13px] text-ink shadow-sm hover:bg-mint-50">
                  Adjust Location
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-[13px]">
                <span className="flex items-center gap-2 text-[#374151]">
                  <LocateFixed className="h-4 w-4 text-brand" /> Location: {[f.village, f.district, f.state].filter(Boolean).join(", ") || "Not set"}
                  {f.lat && f.lng && <span className="text-muted">({f.lat}, {f.lng})</span>}
                </span>
                <button type="button" onClick={useMyLocation} className="flex items-center gap-1 text-[#374151] hover:text-brand">
                  <Plus className="h-4 w-4" /> Use Current Location
                </button>
              </div>
            </div>
            {geoMsg && <p className="mt-2 text-[12.5px] text-muted">{geoMsg}</p>}
            {showCoords && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="latIn">
                    Latitude
                  </label>
                  <input id="latIn" value={f.lat} onChange={(e) => set("lat")(e.target.value)} className="input" placeholder="18.8268" inputMode="decimal" />
                </div>
                <div>
                  <label className="label" htmlFor="lngIn">
                    Longitude
                  </label>
                  <input id="lngIn" value={f.lng} onChange={(e) => set("lng")(e.target.value)} className="input" placeholder="74.3742" inputMode="decimal" />
                </div>
                <p className="text-[12px] text-muted sm:col-span-2">
                  Tip: open Google Maps, long-press your land and copy the coordinates shown.
                </p>
              </div>
            )}
          </Section>

          <Section n={3} icon={<Package className="h-4 w-4" />} title="Land Features" sub="Tell investors about land features & facilities.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Select name="soilType" label="Soil Type" required value={f.soilType} onChange={set("soilType")} options={SOIL_TYPES} />
              <Select name="waterSource" label="Water Source" required value={f.waterSource} onChange={set("waterSource")} options={WATER_SOURCES} />
              <Select name="waterAvailability" label="Water Availability" required value={f.waterAvailability} onChange={set("waterAvailability")} options={WATER_AVAILABILITY} />
              <Select name="roadAccess" label="Road Access" required value={f.roadAccess} onChange={set("roadAccess")} options={ROAD_ACCESS} />
              <Select name="electricity" label="Electricity" required value={f.electricity} onChange={set("electricity")} options={ELECTRICITY} />
              <Select name="fencing" label="Fencing" required value={f.fencing} onChange={set("fencing")} options={FENCING} />
            </div>
          </Section>

          <Section n={4} icon={<Camera className="h-4 w-4" />} title="Photos & Video" sub="Add clear photos and video to build trust.">
            <p className="label">
              Upload Photos
              <Req /> <span className="font-normal text-muted">(Minimum 5 photos recommended)</span>
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {kept.map((src) => (
                <div key={src} className="relative aspect-[108/89] overflow-hidden rounded-lg bg-mint">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setKept((k) => k.filter((x) => x !== src))} aria-label="Remove photo" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1f2937]/80 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {previews.map((src, i) => (
                <div key={src} className="relative aspect-[108/89] overflow-hidden rounded-lg bg-mint">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} aria-label="Remove photo" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1f2937]/80 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => pickInput.current?.click()} className="flex aspect-[108/89] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#cbd5e1] text-[12px] text-muted hover:border-brand hover:text-brand">
                <Plus className="h-5 w-5 rounded-full border border-current p-0.5" />
                Add More
                <br />
                Photos
              </button>
              <input
                ref={pickInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  setFiles((fs) => [...fs, ...list].slice(0, 20));
                  e.target.value = "";
                }}
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div>
                <p className="text-[13.5px] text-ink">Optional: Upload Video</p>
                <p className="text-[12px] text-muted">{video ? video.name : land?.video && !removeVideo ? "A video is already uploaded." : "Upload short video of your land (Max 60 sec, 50 MB)"}</p>
                {land?.video && !video && (
                  <label className="mt-1 flex items-center gap-2 text-[12px] text-muted">
                    <input type="checkbox" name="removeVideo" checked={removeVideo} onChange={(e) => setRemoveVideo(e.target.checked)} /> Remove existing video
                  </label>
                )}
              </div>
              <label className="btn btn-ghost h-9 cursor-pointer px-4 text-[14px] font-medium">
                <Video className="h-4 w-4" /> Upload Video
                <input type="file" name="video" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </Section>

          <Section n={5} icon={<FileText className="h-4 w-4" />} title="Documents" sub="Upload legal documents for verification.">
            <p className="label">
              Upload Documents
              <Req />
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {DOCUMENT_TYPES.map((d) => {
                const st = docState(d.key);
                return (
                  <div key={d.key} className="rounded-xl border border-line bg-[#fafafa] p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[13.5px] font-medium text-ink">
                          {d.label}
                          {d.required && " *"}
                        </p>
                        <p className={`text-[11.5px] ${st === "verified" ? "text-[#16803c]" : st === "pending" || st === "new" ? "text-[#b45309]" : d.required ? "text-[#ef4444]" : "text-muted"}`}>
                          {st === "verified" ? "Verified" : st === "pending" ? "Under review" : st === "new" ? docs[d.key] : d.hint}
                        </p>
                      </div>
                      {st === "verified" ? <CheckCircle2 className="h-4 w-4 fill-[#16803c] text-white" /> : <FileText className="h-4 w-4 text-muted" />}
                    </div>
                    <label className="mt-4 flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-[#9ca3af] bg-white text-[13px] text-ink hover:bg-mint-50">
                      <Upload className="h-3.5 w-3.5" /> {st === "missing" ? "Upload" : "Replace"}
                      <input
                        type="file"
                        name={`doc_${d.key}`}
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setDocs((s) => ({ ...s, [d.key]: file ? file.name : undefined }));
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 flex items-center gap-2 text-[12px] text-muted">
              <ShieldCheck className="h-4 w-4 text-[#16803c]" /> Your documents are securely stored and will be verified before your listing goes live.
            </p>
          </Section>

          <Section n={6} icon={<CircleDollarSign className="h-4 w-4" />} title="Pricing Details" sub="Set your asking price for the land.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="priceIn">
                  Total Asking Price
                  <Req />
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">₹</span>
                  <input
                    id="priceIn"
                    inputMode="numeric"
                    value={price ? price.toLocaleString("en-IN") : ""}
                    onChange={(e) => set("price")(e.target.value.replace(/[^\d]/g, ""))}
                    className="input pl-8 text-[16px]"
                    placeholder="25,00,000"
                  />
                  <input type="hidden" name="price" value={price || ""} />
                </div>
                <p className="mt-1 text-[11.5px] text-muted">Enter total price for the entire land</p>
              </div>
              <div>
                <p className="label">Price per Acre (Auto)</p>
                <div className="input flex items-center bg-[#f3f4f6] text-[16px] font-bold">
                  {perAcre ? inr(perAcre) : "₹0"} <span className="ml-1 text-[12.5px] font-normal text-muted">/ Acre</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6 text-[14px] text-ink">
              Price Negotiable?
              {["yes", "no"].map((v) => (
                <label key={v} className="flex cursor-pointer items-center gap-2">
                  <input type="radio" className="check" name="negotiable" value={v} checked={f.negotiable === v} onChange={() => set("negotiable")(v)} />
                  {v === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
          </Section>

          <Section n={7} icon={<Link2 className="h-4 w-4" />} title="Nearby Connectivity" sub="Add nearby places and connectivity details.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["nb_road", "Main Road"],
                  ["nb_village", "Village / Market"],
                  ["nb_market", "Agricultural Market"],
                  ["nb_rail", "Railway Station"],
                ] as const
              ).map(([k, l]) => (
                <div key={k}>
                  <label className="label text-[12.5px]" htmlFor={k}>
                    {l}
                  </label>
                  <div className="relative">
                    <input id={k} name={k} type="number" min="0" step="0.1" value={f[k]} onChange={(e) => set(k)(e.target.value)} className="input pr-10" placeholder="2" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">km</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label text-[12.5px]" htmlFor="nb_city">
                  Nearest City
                </label>
                <input id="nb_city" name="nb_city" value={f.nb_city} onChange={(e) => set("nb_city")(e.target.value)} className="input" placeholder="Pune (25 km)" />
              </div>
              <div>
                <label className="label text-[12.5px]" htmlFor="nb_highway">
                  Highway Access
                </label>
                <input id="nb_highway" name="nb_highway" value={f.nb_highway} onChange={(e) => set("nb_highway")(e.target.value)} className="input" placeholder="Pune-Nashik Highway (10 km)" />
              </div>
            </div>
          </Section>

          <Section n={8} icon={<PencilLine className="h-4 w-4" />} title="About This Land" sub="Describe your land and its highlights.">
            <label className="label" htmlFor="description">
              Tell investors about your land
              <Req />
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                rows={4}
                maxLength={1000}
                value={f.description}
                onChange={(e) => set("description")(e.target.value)}
                className="input resize-y pb-6"
                placeholder="Fertile black soil land with excellent water availability through well. Good road connectivity and suitable for sugarcane, vegetables, fruits and other crops."
              />
              <span className="absolute bottom-2 right-3 text-[11px] text-muted">{f.description.length} / 1000</span>
            </div>
            <p className="label mt-4">Land Highlights (Select all that apply)</p>
            <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-3">
              {HIGHLIGHT_OPTIONS.map((h) => (
                <label key={h} className="flex cursor-pointer items-center gap-2.5 text-[14px] text-ink">
                  <input type="checkbox" className="check" checked={highlights.includes(h)} onChange={(e) => setHighlights((s) => (e.target.checked ? [...s, h] : s.filter((x) => x !== h)))} />
                  {h}
                </label>
              ))}
            </div>
          </Section>

          {isAdmin && (
            <section className="rounded-2xl border-2 border-dashed border-brand/40 bg-mint-50 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink">
                <ShieldCheck className="h-5 w-5 text-brand" /> Admin Settings
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="status">
                    Status
                  </label>
                  <select id="status" name="status" defaultValue={land?.status ?? "active"} className="input">
                    <option value="active">Active (live)</option>
                    <option value="pending">Pending review</option>
                    <option value="draft">Draft</option>
                    <option value="sold">Sold</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="category">
                    Land Category
                  </label>
                  <select id="category" name="category" defaultValue={land?.category ?? ""} className="input">
                    <option value="">Auto-detect</option>
                    {LAND_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="ownerId">
                    Owner (Farmer)
                  </label>
                  <select id="ownerId" name="ownerId" defaultValue={land?.ownerId ?? owners?.[0]?.id} className="input">
                    {owners?.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-6 pb-2">
                  <label className="flex items-center gap-2 text-[14px]">
                    <input type="checkbox" className="check" name="verified" defaultChecked={land?.verified ?? true} /> Verified
                  </label>
                  <label className="flex items-center gap-2 text-[14px]">
                    <input type="checkbox" className="check" name="featured" defaultChecked={land?.featured ?? false} /> Featured
                  </label>
                </div>
              </div>
            </section>
          )}

          <Section n={isAdmin ? 9 : 9} icon={<CircleCheck className="h-4 w-4" />} title="Review & Publish" sub="Review all details before publishing.">
            <div className={`rounded-xl border p-4 ${allOk ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#fde68a] bg-[#fffbeb]"}`}>
              <p className={`flex items-center gap-2 text-[14px] font-semibold ${allOk ? "text-[#166534]" : "text-[#92400e]"}`}>
                {allOk ? <CheckCircle2 className="h-4 w-4 fill-[#16803c] text-white" /> : <Info className="h-4 w-4" />}
                {allOk ? "Almost there! Review all details before publishing." : "Complete the highlighted sections to publish."}
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {checks.map(([l, ok]) => (
                  <li key={l} className={`flex items-center gap-1.5 text-[13px] ${ok ? "text-[#374151]" : "text-[#b45309]"}`}>
                    {ok ? <Check className="h-3.5 w-3.5 text-[#16803c]" /> : <X className="h-3.5 w-3.5" />} {l}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button type="submit" name="intent" value="draft" disabled={pending} className="btn btn-ghost h-11 px-5 text-[15px] font-medium">
                <Save className="h-4 w-4" /> Save as Draft
              </button>
              <button type="submit" name="intent" value="publish" disabled={pending} className="btn btn-primary h-11 px-6 text-[15px] font-medium">
                {pending && <Loader2 className="h-4 w-4 animate-spin" />} {isAdmin ? "Save Listing" : land?.status === "active" ? "Save Changes" : "Publish Listing"}
              </button>
            </div>
          </Section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Eye className="h-4 w-4 text-muted" /> Listing Preview
            </h2>
            <p className="text-[12.5px] text-muted">This is how investors will see your listing</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-line">
              <div className="relative aspect-[511/176] bg-mint">
                {allImages[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={allImages[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[13px] text-muted">
                    <ImageIcon className="mr-2 h-5 w-5" /> Your cover photo
                  </span>
                )}
                <span className="chip absolute left-3 top-3 rounded bg-[#1f2937]/85 text-[11px] font-medium text-white">
                  <Check className="h-3 w-3" /> VERIFIED LAND
                </span>
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white">
                  <Heart className="h-4 w-4" />
                </span>
              </div>
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-1.5 bg-[#f3f4f6] p-2">
                  {allImages.slice(1, 5).map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className="aspect-[96/46] w-full rounded object-cover" />
                  ))}
                  {allImages.length > 5 && <span className="flex aspect-[96/46] items-center justify-center rounded bg-[#6b7280] text-center text-[10px] font-semibold leading-tight text-white">+{allImages.length - 5}<br />More Photos</span>}
                </div>
              )}
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-ink">{f.title || "Your listing title"}</h3>
                <p className="flex items-center gap-1 text-[13px] text-muted">
                  <MapPin className="h-3.5 w-3.5" /> {[f.village, f.district, f.state].filter(Boolean).join(", ") || "Location"}
                </p>
                <dl className="mt-3 grid grid-cols-3 rounded-lg border border-line text-center">
                  <div className="py-2">
                    <dd className="text-[14px] font-semibold text-ink">
                      {area || 0} {f.areaUnit}
                    </dd>
                    <dt className="text-[10.5px] text-muted">Total Area</dt>
                  </div>
                  <div className="py-2">
                    <dd className="text-[14px] font-semibold text-ink">{inr(price)}</dd>
                    <dt className="text-[10.5px] text-muted">Asking Price</dt>
                  </div>
                  <div className="py-2">
                    <dd className="text-[14px] font-semibold text-ink">{inr(perAcre)} / Acre</dd>
                    <dt className="text-[10.5px] text-muted">Price per Acre</dt>
                  </div>
                </dl>
                <p className="mt-4 text-[13.5px] font-semibold text-ink">Land Highlights</p>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12.5px] text-[#374151]">
                  {[f.soilType && `${f.soilType.replace(" Soil", "")} ${/fertile/i.test(highlights.join()) ? "Fertile " : ""}Soil`, ...highlights.filter((h) => h !== "Fertile Soil")].filter(Boolean).slice(0, 6).map((h) => (
                    <li key={h as string} className="flex items-center gap-1.5">
                      <span className="text-[#16803c]">{highlightIcons[h as string] ?? <Sprout className="h-3.5 w-3.5" />}</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Lightbulb className="h-4 w-4 text-brand" /> Tips to get more interest
            </h2>
            <ul className="mt-3 space-y-3">
              {[
                [ImageIcon, "Add more photos", <>Listings with more photos get <b className="text-brand">70% more views</b>.</>],
                [ListChecks, "Provide accurate details", "Accurate information builds trust with investors."],
                [FileText, "Upload verified documents", <>Verified listings get <b className="text-brand">3x more investor interest</b>.</>],
                [Tag, "Set competitive price", "Check market price and set a fair price."],
              ].map(([I, t, d]) => {
                const Icon = I as typeof ImageIcon;
                return (
                  <li key={t as string} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mint text-brand">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-semibold text-ink">{t as string}</span>
                      <span className="block text-[12px] text-muted">{d as React.ReactNode}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
              <Droplets className="hidden" /> Need Help?
            </h2>
            <p className="mt-1 text-[13.5px] text-muted">We are here to help you at every step.</p>
            <div className="mt-4 space-y-3 text-[14px]">
              <a href="tel:18001234567" className="block hover:text-brand">
                <b className="block text-ink">Call Support</b>
                <span className="text-muted">1800-123-4567</span>
              </a>
              <Link href="/faq" className="block hover:text-brand">
                <b className="block text-ink">Help Center</b>
                <span className="text-muted">View FAQs</span>
              </Link>
            </div>
            <Link href="/contact" className="btn btn-primary mt-4 h-10 w-full text-[14px]">
              Contact Support
            </Link>
          </section>
        </aside>
      </div>
    </form>
  );
}
