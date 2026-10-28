import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Clock,
  CreditCard,
  FileText,
  Hash,
  Images,
  Info,
  LayoutGrid,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  Truck,
  UsersRound,
  Globe,
  Mail,
} from "lucide-react";
import { readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { categoryById, publicBusinesses } from "@/lib/services";
import { site } from "@/lib/config";
import { Img } from "@/components/Img";
import { JsonLd } from "@/components/JsonLd";
import { Crumbs, MapEmbed, mapsLink, Tag } from "@/components/services/Bits";
import { CallButton, SaveButton, ShareButton, TrackView, WhatsAppButton } from "@/components/services/Actions";
import { EnquiryForm } from "@/components/services/LeadForms";
import { PhotoGrid } from "@/components/services/PhotoGrid";
import { ReviewsBlock } from "@/components/services/Reviews";
import { BusinessCard, businessImage } from "@/components/services/Cards";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const db = await readDB();
  const user = await getCurrentUser();
  const b = db.businesses.find((x) => x.slug === slug);
  // admins can preview listings that are not live yet
  if (!b || (b.status !== "active" && user?.role !== "admin")) return null;
  return { db, user, b };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await load((await params).slug);
  if (!r) return { title: "Business not found" };
  const { b, db } = r;
  const cat = categoryById(db, b.categoryId);
  return {
    title: `${b.name} – ${cat?.short ?? b.subcategory} in ${b.area}, ${b.district}`,
    description: `${b.summary} ${b.tags.join(", ")}. Call or WhatsApp ${b.name}, ${b.area}, ${b.district}.`.slice(0, 300),
    alternates: { canonical: `/business-services/${b.slug}` },
    openGraph: { title: b.name, description: b.summary, images: [businessImage(b)] },
    robots: b.status !== "active" ? { index: false, follow: false } : undefined,
  };
}

export default async function BusinessPage({ params }: Props) {
  const r = await load((await params).slug);
  if (!r) notFound();
  const { b, db, user } = r;
  const cat = categoryById(db, b.categoryId);
  const approved = db.serviceReviews.filter((x) => x.targetId === b.id && x.status === "approved");
  const approvedCount = approved.length;
  const approvedAvg = approvedCount ? approved.reduce((s, r) => s + r.rating, 0) / approvedCount : 0;
  const reviews = [...approved].sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)).slice(0, 6);
  const saved = (user?.savedServices ?? []).includes(b.id);
  const t = { type: "business" as const, id: b.id, phone: b.phone, whatsapp: b.whatsapp, name: b.name };
  const photos = [...new Set([...b.images, ...b.services.map((s) => s.image).filter(Boolean)])] as string[];
  const years = b.since ? new Date().getFullYear() - b.since : 0;
  const chips = b.products.length ? b.products : b.tags;
  const similar = publicBusinesses(db).filter((x) => x.categoryId === b.categoryId && x.id !== b.id).slice(0, 2);
  const fullAddress = `${b.address}${b.pincode ? ` - ${b.pincode}` : ""}`;
  const material = b.categoryId === "building-material";

  const tabs = [
    ["overview", "Overview", LayoutGrid],
    ["services", "Services", LayoutGrid],
    ["products", "Products", Package],
    ["gallery", "Gallery", Images],
    ["reviews", "Reviews", Star],
    ["location", "Location", MapPin],
    ["about", "About", Info],
  ] as const;

  const facts = [
    [years ? `${years}+` : null, "Years Experience", UsersRound],
    [b.customers, "Happy Customers", Truck],
    [b.projects, "Projects Supplied", Building2],
    [b.highlights.includes("Best Market Rates") ? "Best" : b.verified ? "Verified" : null, b.highlights.includes("Best Market Rates") ? "Market Rates" : "Business", ShieldCheck],
  ].filter(([v]) => v) as [string, string, typeof UsersRound][];

  const details = [
    [Building2, "Business Name", b.name],
    [LayoutGrid, "Category", cat?.name],
    [Hash, "GST Number", b.gst],
    [CalendarDays, "Year of Establishment", b.since],
    [MapPin, "Service Area", b.serviceArea],
    [Truck, "Delivery Available", b.delivery],
    [Clock, "Working Hours", b.workingHours],
    [CreditCard, "Payment Mode", b.paymentModes],
    [CircleUserRound, "Contact Person", b.contactName],
  ].filter(([, , v]) => v) as [typeof Building2, string, string | number][];

  return (
    <>
      <TrackView type="business" id={b.id} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: b.name,
          description: b.description,
          url: `${site.url}/business-services/${b.slug}`,
          image: photos.slice(0, 5).map((i) => (i.startsWith("http") ? i : site.url + i)),
          telephone: b.phone,
          address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: b.area, addressRegion: b.state, postalCode: b.pincode, addressCountry: "IN" },
          // rating markup only from approved reviews stored on this site (stored totals can be admin-edited)
          ...(approvedCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: +approvedAvg.toFixed(1), reviewCount: approvedCount, bestRating: 5, worstRating: 1 } } : {}),
        }}
      />
      {b.status !== "active" && <p className="bg-[#fef3c7] py-2 text-center text-[13.5px] font-medium text-[#92400e]">Admin preview – this listing is {b.status} and not visible to visitors.</p>}

      {/* banner */}
      <section className="relative overflow-hidden bg-[#f3f6f4]">
        <div className="absolute inset-y-0 right-0 w-full md:w-[65%]">
          <Img src={b.cover || businessImage(b)} alt="" fill priority sizes="65vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f3f6f4] via-[#f3f6f4]/85 to-[#f3f6f4]/10" />
        </div>
        <div className="container-dash relative py-5">
          <Crumbs items={[{ name: "Business Services", href: "/business-services" }, ...(cat ? [{ name: cat.name, href: `/business-services?category=${cat.id}#results` }] : []), { name: b.name }]} />
          <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center">
            <span className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-soft sm:h-[150px] sm:w-[150px]">
              {b.logo ? <Img src={b.logo} alt={`${b.name} logo`} fill sizes="150px" className="object-cover" /> : <span className="text-[42px] font-bold text-brand">{b.name.slice(0, 2).toUpperCase()}</span>}
            </span>
            <div className="min-w-0 flex-1">
              {b.verified && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[12px] font-semibold text-white">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified Business
                </span>
              )}
              <h1 className="mt-2 font-display text-[28px] font-extrabold leading-tight text-ink sm:text-[36px]">{b.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-[14px]">
                {b.reviewCount > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow-sm">
                    <Star className="h-4 w-4 fill-[#f5a623] text-[#f5a623]" /> <b className="text-ink">{b.rating.toFixed(1)}</b> <span className="text-body">({b.reviewCount} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-ink shadow-sm">
                  <MapPin className="h-4 w-4" /> {b.area}, {b.district}, {b.state}
                </span>
                {b.since && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-ink shadow-sm">
                    <CalendarDays className="h-4 w-4" /> Since {b.since}
                  </span>
                )}
              </div>
              <p className="mt-3 max-w-[640px] text-[14.5px] leading-relaxed text-ink">{b.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {chips.slice(0, 5).map((c) => (
                  <span key={c} className="rounded-md border border-line bg-white px-2.5 py-1 text-[12px] font-medium text-ink">
                    {c}
                  </span>
                ))}
                {chips.length > 5 && (
                  <a href="#products" className="rounded-md bg-[#dcf3e8] px-2.5 py-1 text-[12px] font-semibold text-brand">
                    +{chips.length - 5} More
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:self-end">
              <SaveButton id={b.id} saved={saved} withLabel className="h-11 px-4 text-[14px]" />
              <ShareButton title={b.name} className="h-11 px-4 text-[14px]" />
              <CallButton t={t} label="Call Now" className="h-11 border-brand bg-brand px-5 text-[14px] text-white hover:bg-brand-600" />
              <WhatsAppButton t={t} className="h-11 px-5 text-[14px]" />
            </div>
          </div>
        </div>
      </section>

      <div className="container-dash grid gap-6 pb-20 pt-4 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <nav aria-label="Sections" className="no-scrollbar sticky top-[76px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-line bg-white px-4 lg:top-[88px]">
            {tabs.map(([id, label, I]) => (
              <a key={id} href={`#${id}`} className="flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-3 text-[14px] font-medium text-ink hover:border-brand hover:text-brand">
                <I className="h-4 w-4" /> {label}
              </a>
            ))}
          </nav>

          <section id="overview" className="scroll-mt-40 pt-6">
            <h2 className="text-[24px] font-bold text-ink">About Us</h2>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-body">{b.description}</p>
            {facts.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {facts.map(([v, l, I]) => (
                  <li key={l} className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-card">
                    <I className="h-9 w-9 shrink-0 text-brand" />
                    <span>
                      <b className="block text-[17px] text-ink">{v}</b>
                      <span className="text-[13px] text-body">{l}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="services" className="scroll-mt-40 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-[24px] font-bold text-ink">Our Services</h2>
                <p className="text-[14.5px] text-body">{b.serviceArea ? `We serve ${b.serviceArea}.` : `Serving ${b.district} and nearby areas.`}</p>
              </div>
              <a href="#enquiry" className="flex items-center gap-1 text-[14px] font-semibold text-brand">
                Get a Quote <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {b.services.map((s) => (
                <li key={s.name}>
                  <a href="#enquiry" className="block overflow-hidden rounded-xl border border-line bg-white shadow-card hover:shadow-soft">
                    <span className="relative block aspect-[16/9]">
                      <Img src={s.image || cat?.image || "/images/svc/cat-building.jpg"} alt={s.name} fill sizes="200px" className="object-cover" />
                    </span>
                    <span className="flex items-center justify-between gap-1 px-2.5 py-2 text-[13px] font-semibold text-ink">
                      {s.name} <ChevronRight className="h-4 w-4 shrink-0 rounded-full border border-line" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section id="products" className="scroll-mt-40 pt-8">
            <h2 className="text-[24px] font-bold text-ink">Products &amp; Specialities</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...new Set([...chips, ...b.tags])].map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </div>
          </section>

          <section id="gallery" className="scroll-mt-40 pt-8">
            <h2 className="mb-4 text-[24px] font-bold text-ink">Product Gallery</h2>
            <PhotoGrid images={photos} title={b.name} />
          </section>

          <section id="reviews" className="scroll-mt-40 pt-8">
            <h2 className="mb-4 text-[24px] font-bold text-ink">Customer Reviews</h2>
            <ReviewsBlock info={b} reviews={reviews} targetType="business" targetId={b.id} />
          </section>

          <section id="about" className="scroll-mt-40 pt-8">
            <h2 className="text-[24px] font-bold text-ink">Business Details</h2>
            <dl className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
              {details.map(([I, k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_1.3fr] gap-3 px-4 py-2.5 text-[14px]">
                  <dt className="flex items-center gap-2 text-body">
                    <I className="h-4 w-4 text-muted" /> {k}
                  </dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
              {b.email && (
                <div className="grid grid-cols-[1fr_1.3fr] gap-3 px-4 py-2.5 text-[14px]">
                  <dt className="flex items-center gap-2 text-body">
                    <Mail className="h-4 w-4 text-muted" /> Email
                  </dt>
                  <dd>
                    <a href={`mailto:${b.email}`} className="link font-normal">
                      {b.email}
                    </a>
                  </dd>
                </div>
              )}
              {b.website && (
                <div className="grid grid-cols-[1fr_1.3fr] gap-3 px-4 py-2.5 text-[14px]">
                  <dt className="flex items-center gap-2 text-body">
                    <Globe className="h-4 w-4 text-muted" /> Website
                  </dt>
                  <dd className="truncate">
                    <a href={b.website.startsWith("http") ? b.website : `https://${b.website}`} target="_blank" rel="noopener noreferrer nofollow" className="link font-normal">
                      {b.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {similar.length > 0 && (
            <section className="pt-10">
              <h2 className="mb-4 text-[22px] font-bold text-ink">Similar Businesses Nearby</h2>
              <div className="space-y-4">
                {similar.map((s) => (
                  <BusinessCard key={s.id} b={s} saved={(user?.savedServices ?? []).includes(s.id)} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:pt-4">
          <section id="enquiry" className="scroll-mt-28 rounded-2xl border border-[#d6ecdc] bg-gradient-to-b from-[#f2faf4] to-white p-5 shadow-card">
            <h2 className="text-[21px] font-bold text-ink">Get a Quote / Enquiry</h2>
            <p className="mb-4 text-[13.5px] text-body">Fill in your details and we will get back to you.</p>
            <EnquiryForm target={t} items={b.services.map((s) => s.name)} itemLabel={material ? "Select Material" : "Select Service"} defaultDistrict={b.district} />
          </section>
          <section id="location" className="scroll-mt-28 rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[18px] font-bold text-ink">Business Location</h2>
              <a href={mapsLink(`${b.name}, ${fullAddress}`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[13px] font-semibold text-brand">
                View on Google Maps <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="mt-2 flex gap-2 text-[14px] text-ink">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {fullAddress}
            </p>
            <MapEmbed query={`${b.area}, ${b.taluka}, ${b.district}, ${b.state}`} className="mt-3 h-[200px]" zoom={13} />
          </section>
          {b.documents.length > 0 && user?.role === "admin" && (
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-[16px] font-bold text-ink">Documents (admin only)</h2>
              <ul className="mt-2 space-y-1">
                {b.documents.map((d, i) => (
                  <li key={d}>
                    <a href={d} target="_blank" className="flex items-center gap-2 text-[14px] text-brand hover:underline">
                      <FileText className="h-4 w-4" /> Document {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <Link href="/list-business" className="block rounded-2xl border border-dashed border-brand/40 bg-mint-50 p-5 text-center">
            <b className="text-[15px] text-ink">Own a business?</b>
            <span className="mt-1 block text-[13px] text-body">List it on {site.name} and get direct enquiries.</span>
            <span className="btn btn-primary mt-3 h-10 px-5 text-[13.5px]">List Your Business</span>
          </Link>
        </aside>
      </div>
    </>
  );
}
