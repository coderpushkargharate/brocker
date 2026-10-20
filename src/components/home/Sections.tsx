import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Crosshair,
  Drill,
  FileSearch,
  FileText,
  Fence,
  Handshake,
  Lock,
  Map,
  MapPin,
  ShieldCheck,
  Sprout,
  Tractor,
  TreePine,
  User,
  UserRound,
  Users,
  FileCheck2,
} from "lucide-react";
import { SERVICES } from "../ServicesPromo";
import { FAQS } from "@/lib/faqs";
import { LAND_CATEGORIES } from "@/lib/config";

export function SectionHead({ eyebrow, title, sub, link, as: H = "h2" }: { eyebrow?: string; title: string; sub?: string; link?: { href: string; label: string }; as?: "h1" | "h2" }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <H className="h2">{title}</H>
        {sub && <p className="mt-1.5 text-[13.5px] text-body">{sub}</p>}
      </div>
      {link && (
        <Link href={link.href} className="flex items-center gap-1 text-[14px] font-semibold text-brand hover:underline">
          {link.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function BuySellCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="relative flex min-h-[215px] overflow-hidden rounded-2xl bg-[#d9f3c8]">
        <Image src="/images/buy-card.jpg" alt="Investor looking over green agricultural fields" fill sizes="(max-width:768px) 100vw, 610px" className="object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#c7f0ab]/90 via-[#e3f6d3]/50 to-transparent" />
        <div className="relative z-10 max-w-[340px] p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
            <TreePine className="h-5 w-5" fill="currentColor" />
          </span>
          <h2 className="mt-4 text-[21px] font-bold text-ink">Looking to Buy Land?</h2>
          <p className="mt-1.5 text-[13px] leading-snug text-body">Explore verified agricultural land and connect directly with genuine farmers.</p>
          <Link href="/buy-land" className="btn btn-primary mt-5 h-[34px] px-7 text-[13px]">
            Explore Land <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="relative flex min-h-[215px] overflow-hidden rounded-2xl bg-[#fbf3d9]">
        <Image src="/images/sell-card.jpg" alt="Farmer ploughing agricultural land with oxen" fill sizes="(max-width:768px) 100vw, 610px" className="object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf1cf]/90 via-[#faf6ea]/40 to-transparent" />
        <div className="relative z-10 max-w-[350px] p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
            <Tractor className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-[21px] font-bold text-ink">Have Land to Sell?</h2>
          <p className="mt-1.5 text-[13px] leading-snug text-body">List your land and connect with genuine verified investors across India.</p>
          <Link href="/dashboard/listings/new" className="btn mt-5 h-[34px] border border-brand bg-white px-6 text-[13px] text-ink hover:bg-mint-50">
            Sell Your Land <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const SERVICE_ICONS = [Map, Drill, UserRound, Fence, FileSearch, FileText];

export function LandServices() {
  return (
    <section aria-labelledby="services-h">
      <p className="eyebrow mb-1.5">Our Land Services</p>
      <h2 id="services-h" className="h2">
        Our Land Services
      </h2>
      <p className="mt-1.5 text-[13.5px] text-body">Complete land solutions, all in one place. From documentation to development</p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => {
          const Icon = SERVICE_ICONS[i];
          return (
            <li key={s.slug}>
              <Link href={`/services#${s.slug}`} className="block h-full rounded-2xl border border-[#dcefe3] bg-gradient-to-b from-white to-[#f1f9f4] p-7 transition hover:shadow-soft">
                <span className="icon-tile h-14 w-14 text-sea">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-8 text-[19px] font-semibold leading-snug text-ink">{s.title.replace("& Government", "& Government")}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-body">{s.text}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const WHY = [
  { icon: ShieldCheck, title: "Verified Land", text: "All important documents are verified before listing." },
  { icon: Users, title: "Direct Farmer Connection", text: "Connect directly with landowners." },
  { icon: Crosshair, title: "Accurate Location", text: "Know exactly where the land is located." },
  { icon: Lock, title: "Safe & Transparent", text: "Your information and communication are protected." },
  { icon: Handshake, title: "Genuine Investors", text: "Connect with people genuinely interested in agricultural land." },
];

export function WhyChoose() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#cfe9d7] bg-mint-50 p-6 sm:p-8">
      <h2 className="text-[26px] font-bold text-ink">Why Choose AgriLand?</h2>
      <p className="mt-2 max-w-[460px] text-[13px] text-brand">A trusted platform for investors and farmers, built on transparency and genuine connections.</p>
      <ul className="relative z-10 mt-6 grid gap-4 sm:grid-cols-2">
        {WHY.map((w, i) => (
          <li key={w.title} className={`rounded-2xl bg-white p-4 shadow-card ${i === 4 ? "sm:col-span-2" : ""}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-mint text-brand">
              <w.icon className="h-[18px] w-[18px]" fill={i === 0 || i === 3 ? "currentColor" : "none"} />
            </span>
            <h3 className="mt-3 text-[13.5px] font-semibold text-ink">{w.title}</h3>
            <p className="mt-0.5 text-[11.5px] leading-snug text-body">{w.text}</p>
          </li>
        ))}
      </ul>
      <svg className="absolute -bottom-6 right-4 h-28 w-28 text-[#cdeec0]" viewBox="0 0 100 100" aria-hidden>
        <path fill="currentColor" d="M90 10C55 10 25 25 18 60c-2 12 2 22 8 30 4-20 18-36 40-46-17 12-28 27-33 46 8 3 17 2 25-2 30-15 32-48 32-78z" />
      </svg>
    </div>
  );
}

function Steps({ items }: { items: { t: string; d: string }[] }) {
  return (
    <ol className="relative mt-4 space-y-4">
      <span className="absolute bottom-4 left-[11px] top-4 w-px bg-[#b8dcbf]" aria-hidden />
      {items.map((s, i) => (
        <li key={s.t} className="relative flex gap-3">
          <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">0{i + 1}</span>
          <span>
            <span className="block text-[13px] font-semibold text-ink">{s.t}</span>
            <span className="block text-[11.5px] text-body">{s.d}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorks() {
  return (
    <div className="rounded-3xl border border-[#cfe9d7] bg-mint-50 p-6 sm:p-8">
      <h2 className="text-[26px] font-bold text-ink">How It Works</h2>
      <p className="mt-2 text-[13px] text-body">Simple steps for a smoother and safer experience.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2.5 text-[14.5px] font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-mint text-brand">
              <User className="h-4 w-4" fill="currentColor" />
            </span>
            For Investors
          </h3>
          <Steps
            items={[
              { t: "Search", d: "Find land by location, budget and land type." },
              { t: "Compare", d: "Check land details, documents and location." },
              { t: "Show Interest", d: "Connect directly with the farmer." },
            ]}
          />
          <Link href="/buy-land" className="btn btn-outline mt-5 h-10 w-full rounded-xl text-[13px]">
            Explore Land <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div>
          <h3 className="flex items-center gap-2.5 text-[14.5px] font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-mint text-brand">
              <Sprout className="h-4 w-4" />
            </span>
            For Farmers
          </h3>
          <Steps
            items={[
              { t: "Add Your Land", d: "Enter land details and upload documents." },
              { t: "Get Verified", d: "We check important listing information." },
              { t: "Connect With Investors", d: "Receive genuine investor interest." },
            ]}
          />
          <Link href="/dashboard/listings/new" className="btn btn-outline mt-5 h-10 w-full rounded-xl text-[13px]">
            List Your Land <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-line bg-white p-5">
        <div className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-[14.5px] font-semibold text-ink">A safer way to connect</h3>
            <p className="mt-1 text-[12.5px] text-body">Verified land details help investors and farmers connect with confidence.</p>
          </div>
        </div>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink sm:pl-14">
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 fill-brand text-white" /> Verified Listings
          </li>
          <li className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-brand" /> Direct Connections
          </li>
          <li className="flex items-center gap-1.5">
            <FileCheck2 className="h-4 w-4 text-brand" /> Transparent Details
          </li>
        </ul>
      </div>
    </div>
  );
}

const LOCATIONS = [
  { name: "Pune", image: "/images/loc-pune.jpg" },
  { name: "Satara", image: "/images/loc-satara.jpg" },
  { name: "Nashik", image: "/images/loc-nashik.jpg" },
  { name: "Kolhapur", image: "/images/loc-kolhapur.jpg" },
  { name: "Ahmednagar", image: "/images/loc-ahmednagar.jpg" },
];

export function ExploreLocations({ counts }: { counts: Map<string, number> }) {
  return (
    <section aria-labelledby="loc-h">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="loc-h" className="h2">
            Explore by Location
          </h2>
          <p className="mt-1 text-[13.5px] text-body">Find lands across Maharashtra&apos;s top regions.</p>
        </div>
        <Link href="/buy-land" className="flex items-center gap-1 text-[14px] font-semibold text-brand hover:underline">
          View All Locations <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="no-scrollbar mt-7 grid snap-x grid-flow-col auto-cols-[70%] gap-4 overflow-x-auto sm:auto-cols-[40%] lg:grid-flow-row lg:grid-cols-5 lg:overflow-visible">
        {LOCATIONS.map((l) => (
          <li key={l.name} className="snap-start">
            <Link href={`/locations/${l.name.toLowerCase()}`} className="block overflow-hidden rounded-2xl border border-line bg-white transition hover:shadow-soft">
              <span className="relative block aspect-[235/112]">
                <Image src={l.image} alt={`Agricultural land in ${l.name}`} fill sizes="240px" className="object-cover" />
                <span className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <MapPin className="h-3.5 w-3.5 fill-brand text-white" />
                </span>
              </span>
              <span className="block px-3 py-2.5">
                <span className="block text-[15px] font-semibold text-ink">{l.name}</span>
                <span className="block text-[11.5px] text-body">{counts.get(l.name) ?? 0}+ Lands</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LandTypes() {
  return (
    <section aria-labelledby="type-h">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="type-h" className="h2">
            Find Land by Type
          </h2>
          <p className="mt-1 text-[13.5px] text-body">Choose from a variety of agricultural land options.</p>
        </div>
        <Link href="/buy-land" className="flex items-center gap-1 text-[14px] font-semibold text-brand hover:underline">
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {LAND_CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link href={`/land-type/${c.slug}`} className="relative block aspect-[192/134] overflow-hidden rounded-2xl border border-line transition hover:-translate-y-0.5 hover:shadow-soft">
              <Image src={c.image} alt={c.name} fill sizes="200px" className="object-cover" />
              <span className="sr-only">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SellBanner() {
  const items = ["Add land details", "Upload documents", "Upload photos", "Receive investor interest", "Add location", "Connect directly"];
  return (
    <section aria-labelledby="sell-h" className="relative overflow-hidden rounded-[28px] bg-pine">
      <div className="absolute inset-y-0 left-0 w-full md:w-[42%]">
        <Image src="/images/find-hero.jpg" alt="" fill sizes="520px" className="object-cover object-bottom" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-pine/50 to-pine md:from-transparent md:via-pine/30" />
      </div>
      <div className="relative grid items-center gap-6 px-6 py-8 sm:px-12 md:grid-cols-[1.25fr_1.3fr_auto] md:py-10">
        <div>
          <h2 id="sell-h" className="text-[24px] font-bold text-white drop-shadow sm:text-[25px]">
            Have Agricultural Land to Sell?
          </h2>
          <p className="mt-1 text-[13px] text-white/90 drop-shadow">List your land on AgriLand and connect with interested investors.</p>
        </div>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px] text-white">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 fill-[#4ade80] text-pine" /> {i}
            </li>
          ))}
        </ul>
        <Link href="/dashboard/listings/new" className="btn h-10 bg-white px-12 text-[13px] text-ink hover:bg-mint-50">
          List Your Land <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function FaqList({ items = FAQS.slice(0, 5) }: { items?: typeof FAQS }) {
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details key={f.q} className="group rounded-xl border border-line bg-white px-3 open:shadow-card">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-[13px] font-medium text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" />
          </summary>
          <p className="pb-3 text-[13px] leading-relaxed text-body">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection() {
  return (
    <section aria-labelledby="faq-h" className="grid gap-6 lg:grid-cols-[1fr_330px]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 id="faq-h" className="h2">
            Frequently Asked Questions
          </h2>
          <Link href="/faq" aria-label="All FAQs" className="text-muted hover:text-brand">
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <FaqList />
        <Link href="/faq" className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-sea hover:underline">
          View all FAQs <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <aside className="h-fit rounded-2xl border border-[#d5ede0] bg-white p-5 shadow-card">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-brand">
          <ShieldCheck className="h-5 w-5" fill="currentColor" stroke="white" />
        </span>
        <h3 className="mt-4 text-[14px] font-semibold text-ink">Verified Land Means Trust</h3>
        <p className="mt-1 max-w-[230px] text-[11px] leading-snug text-body">We verify all important documents before a land is listed.</p>
        <ul className="mt-4 space-y-2 border-b border-line pb-3 text-[12.5px] text-ink">
          {["Ownership details checked", "Location verified", "Documents reviewed", "Listing information verified"].map((x) => (
            <li key={x} className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-sea" /> {x}
            </li>
          ))}
        </ul>
        <Link href="/about#verification" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-sea hover:underline">
          Learn more <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </aside>
    </section>
  );
}

export function ReadyBanner() {
  return (
    <section aria-labelledby="ready-h" className="relative overflow-hidden rounded-[22px] border border-[#9fd6a5]">
      <div className="relative hidden aspect-[1245/127] md:block">
        <Image src="/images/ready-banner.jpg" alt="" fill sizes="1250px" className="object-cover" />
      </div>
      <div className="relative block aspect-[16/9] md:hidden">
        <Image src="/images/ready-banner.jpg" alt="" fill sizes="100vw" className="object-cover object-[75%_50%]" />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center md:flex-row md:justify-between md:gap-6 md:pl-[32%] md:pr-[2.6%] md:text-left">
        <div className="md:-ml-[12%] md:text-center">
          <h2 id="ready-h" className="text-[20px] font-bold text-white drop-shadow lg:text-[23px]">
            Ready to Find the Right Land?
          </h2>
          <p className="mt-0.5 text-[12px] text-white/95 drop-shadow">Explore verified agricultural land and connect directly with farmers.</p>
        </div>
        <Link href="/buy-land" className="btn h-10 w-[190px] rounded-lg bg-white text-[13px] text-brand shadow hover:bg-mint-50">
          Explore Land
        </Link>
      </div>
    </section>
  );
}
