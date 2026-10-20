import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Droplet,
  Headphones,
  Info,
  Leaf,
  Link2,
  MapPin,
  Mountain,
  Phone,
  ShieldCheck,
  Sprout,
  Truck,
  Zap,
  FileText,
} from "lucide-react";
import { getCurrentUser, toPublic } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { getLandBySlug, similarLands } from "@/lib/lands";
import { areaLabel, areaShort, inr, perAcre, timeAgo } from "@/lib/format";
import { site } from "@/lib/config";
import { Gallery } from "@/components/land/Gallery";
import { Card, CardTitle, DocumentsGrid, LandInfo, MapCard, NearbyGrid } from "@/components/land/Parts";
import { ReadMore } from "@/components/land/ReadMore";
import { CallButton, InterestButton, SaveButton, ShareButtons, ViewTracker } from "@/components/LandActions";
import { Avatar } from "@/components/Avatar";
import { MiniLandCard } from "@/components/LandCard";
import { ServicesPromo } from "@/components/ServicesPromo";
import { JsonLd } from "@/components/JsonLd";
import { Scroller } from "@/components/Scroller";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = await getLandBySlug(slug);
  if (!l) return { title: "Land not found", robots: { index: false } };
  const where = `${l.taluka}, ${l.district}`;
  const title = `${l.title} – ${areaShort(l.area, l.areaUnit)} for Sale in ${where}`;
  const description = `${areaShort(l.area, l.areaUnit)} ${l.landType.toLowerCase()} land for sale in ${l.village}, ${where}, ${l.state} at ${inr(l.price)} (${inr(perAcre(l.price, l.area))}/acre). ${l.soilType}, ${l.waterSource} water, ${l.roadAccess.toLowerCase()}.${l.verified ? " Verified documents." : ""} Contact the farmer directly on AgriLand.`;
  return {
    title,
    description,
    alternates: { canonical: `/lands/${l.slug}` },
    robots: l.status === "active" ? undefined : { index: false, follow: false },
    openGraph: { type: "article", title, description, url: `/lands/${l.slug}`, images: l.images.slice(0, 4).map((src) => ({ url: src, alt: l.title })) },
    twitter: { card: "summary_large_image", title, description, images: l.images.slice(0, 1) },
  };
}

export default async function LandPage({ params }: Props) {
  const { slug } = await params;
  const land = await getLandBySlug(slug);
  if (!land) notFound();
  const user = await getCurrentUser();
  const isOwner = user?.id === land.ownerId;
  if (land.status !== "active" && !isOwner && user?.role !== "admin") notFound();

  const db = (await readDB());
  const ownerRaw = db.users.find((u) => u.id === land.ownerId);
  const owner = ownerRaw ? toPublic(ownerRaw) : undefined;
  const interests = db.interests.filter((i) => i.landId === land.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const investors = interests.map((i) => db.users.find((u) => u.id === i.investorId)).filter(Boolean) as typeof db.users;
  const calls = db.calls.filter((c) => c.landId === land.id).length;
  const visits = interests.filter((i) => ["contacted", "responded"].includes(i.status)).length;
  const saved = new Set(user?.saved ?? []);
  const interested = !!user && interests.some((i) => i.investorId === user.id);
  const similar = similarLands(land, 8, db);
  const url = `${site.url}/lands/${land.slug}`;
  const crop = land.currentCrop && !/none/i.test(land.currentCrop) ? land.currentCrop : "Multiple Crops";

  const why = [
    `${land.soilType} ideal for multiple crops`,
    land.waterAvailability === "Year-round" ? "Good water availability all year round" : `${land.waterAvailability} water availability`,
    /paved|highway/i.test(land.roadAccess) ? "Excellent road connectivity" : "Accessible by road",
    land.verified ? "Verified documents & clear ownership" : "Documents under verification",
    "Peaceful location with growth potential",
  ];

  const highlights = [
    { icon: Sprout, c: "text-[#16803c] bg-[#ecfdf3]", t: `Suitable for ${crop}, Vegetables & Fruits`, d: "Rich topsoil ideal for extensive cash crop farming." },
    { icon: Droplet, c: "text-[#2563eb] bg-[#eff6ff]", t: `Good Water Availability (${land.waterSource.replace(/\s*\(\d+\)/, "")})`, d: `${land.waterAvailability} access through active water sources.` },
    { icon: Truck, c: "text-[#ea580c] bg-[#fff7ed]", t: `${land.roadAccess} Access`, d: "Direct connectivity to the taluka highway for easy transit." },
    { icon: Mountain, c: "text-[#b45309] bg-[#fffbeb]", t: `${land.soilType} – Highly Fertile`, d: "Naturally enriched with nitrogen and organic minerals." },
    { icon: Leaf, c: "text-[#16803c] bg-[#ecfdf3]", t: "Peaceful Location, Ideal for Farming", d: "Pollution free setting surrounded by green countryside." },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#listing`,
        name: land.title,
        description: land.description || `${land.title} in ${land.village}, ${land.district}`,
        image: land.images.map((i) => (i.startsWith("http") ? i : site.url + i)),
        sku: land.code,
        category: `${land.landType} Land`,
        brand: { "@type": "Brand", name: site.name },
        offers: {
          "@type": "Offer",
          price: land.price,
          priceCurrency: "INR",
          availability: land.status === "active" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          url,
          seller: owner ? { "@type": "Person", name: owner.name } : undefined,
        },
        additionalProperty: [
          { "@type": "PropertyValue", name: "Total Area", value: land.area, unitText: land.areaUnit },
          { "@type": "PropertyValue", name: "Soil Type", value: land.soilType },
          { "@type": "PropertyValue", name: "Water Source", value: land.waterSource },
          { "@type": "PropertyValue", name: "Road Access", value: land.roadAccess },
          { "@type": "PropertyValue", name: "Electricity", value: land.electricity },
        ],
      },
      {
        "@type": "Place",
        name: land.title,
        address: { "@type": "PostalAddress", addressLocality: land.village, addressRegion: land.state, addressCountry: "IN", streetAddress: `${land.village}, ${land.taluka}, ${land.district}` },
        geo: { "@type": "GeoCoordinates", latitude: land.lat, longitude: land.lng },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Buy Land", item: `${site.url}/buy-land` },
          { "@type": "ListItem", position: 3, name: land.district, item: `${site.url}/locations/${land.district.toLowerCase()}` },
          { "@type": "ListItem", position: 4, name: land.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="bg-page">
      <JsonLd data={ld} />
      {land.status === "active" && <ViewTracker landId={land.id} />}
      <div className="container-dash pb-16 pt-8">
        {land.status !== "active" && (
          <p className="mb-5 flex items-center gap-2 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[14px] text-ink">
            <Info className="h-5 w-5 text-[#b45309]" /> This listing is <b>{land.status}</b> and only visible to you{user?.role === "admin" ? " (admin)" : ""}.
          </p>
        )}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[15px] text-body">
          <Link href="/buy-land" className="flex items-center gap-2 hover:text-brand">
            <ArrowLeft className="h-4 w-4" /> Back to Search Results
          </Link>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[680px_1fr]">
          <Gallery images={land.images} title={land.title} video={land.video} landId={land.id} saved={saved.has(land.id)} verified={land.verified} />

          <div>
            <p className="flex items-center gap-4">
              <span className="chip rounded bg-[#dcfce7] text-[12px] font-bold text-[#166534]">{land.status === "active" ? "ACTIVE LISTING" : land.status.toUpperCase()}</span>
              <span className="text-[13px] text-muted">ID: {land.code}</span>
            </p>
            <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[38px]">{land.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-[15px] text-body">
              <MapPin className="h-4 w-4 fill-[#ef4444] text-white" /> {land.village === land.taluka ? land.village : `${land.village}, ${land.taluka}`}, {land.district}, {land.state}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                [areaLabel(land.area, land.areaUnit), "Total Area"],
                [inr(land.price), "Asking Price"],
                [inr(perAcre(land.price, land.area)), "Price per Acre", "/ Acre"],
                [land.landType, "Land Type"],
              ].map(([v, k, suf]) => (
                <div key={k} className="rounded-xl border border-line bg-white px-3.5 py-3">
                  <dd className="text-[17px] font-bold text-ink xl:text-[19px]">
                    {v}
                    {suf && <span className="ml-1 text-[11px] font-normal text-muted">{suf}</span>}
                  </dd>
                  <dt className="mt-0.5 text-[11.5px] text-muted">{k}</dt>
                </div>
              ))}
            </dl>

            {!isOwner ? (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <InterestButton landId={land.id} interested={interested} />
                <CallButton landId={land.id} />
              </div>
            ) : (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link href={`/dashboard/listings/${land.id}`} className="btn btn-primary h-[50px] text-[16px]">
                  Manage Listing
                </Link>
                <Link href={`/dashboard/listings/${land.id}/edit`} className="btn btn-ghost h-[50px] text-[16px]">
                  Edit Listing
                </Link>
              </div>
            )}

            <div className="mt-6 flex gap-4 rounded-xl border border-[#c6ecd6] bg-[#f0fbf4] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mint">
                <ShieldCheck className="h-5 w-5 fill-[#16803c] text-white" />
              </span>
              <div>
                <p className="text-[12.5px] font-bold uppercase tracking-wide text-ink">Fast Ownership Transfer Guaranteed</p>
                <p className="mt-0.5 text-[12.5px] text-[#166534]">Government verified 7/12 records and title clearance certificate directly available for download.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-[12.5px] font-medium uppercase tracking-wider text-muted">Share this listing</span>
              <ShareButtons landId={land.id} url={url} title={land.title} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.32fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardTitle icon={<Info className="h-4 w-4" />}>
                <span className="text-[16px]">Land Information</span>
              </CardTitle>
              <LandInfo land={land} />
            </Card>
            <Card>
              <CardTitle icon={<MapPin className="h-4 w-4 fill-brand text-white" />}>Location Details</CardTitle>
              <MapCard land={land} />
            </Card>
            <Card>
              <CardTitle icon={<FileText className="h-4 w-4" />}>Verified Documents</CardTitle>
              <DocumentsGrid land={land} />
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <h2 className="text-[20px] font-semibold text-ink">About This Land</h2>
              <div className="mt-4">
                <ReadMore text={land.description} />
              </div>
            </Card>
            <Card>
              <h2 className="text-[20px] font-semibold text-ink">Why Investors Like This Land?</h2>
              <ul className="mt-4 space-y-3.5">
                {why.map((w) => (
                  <li key={w} className="flex items-center gap-3 text-[15px] text-body">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16803c]" /> {w}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="text-[20px] font-semibold text-ink">Recent Investor Activity</h2>
              <ul className="mt-4 space-y-4">
                {interests.slice(0, 3).map((i) => {
                  const inv = db.users.find((u) => u.id === i.investorId);
                  if (!inv) return null;
                  const what = i.status === "contacted" || i.status === "responded" ? "Site Visit Scheduled" : i.status === "follow-up" ? "Viewed This Land Today" : "Interested in this land";
                  return (
                    <li key={i.id} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-3">
                        <Avatar src={inv.avatar} name={inv.name} size={32} />
                        <span className="leading-tight">
                          <span className="block text-[13.5px] font-semibold text-ink">{inv.name}</span>
                          <span className="block text-[12px] text-muted">{what}</span>
                        </span>
                      </span>
                      <span className="text-[11px] text-muted">{timeAgo(i.createdAt)}</span>
                    </li>
                  );
                })}
                {interests.length === 0 && <li className="text-[14px] text-muted">Be the first investor to show interest in this land.</li>}
              </ul>
              <Link href="/buy-land" className="btn btn-ghost mt-5 h-10 w-full text-[13px] text-brand">
                View All Activity <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardTitle icon={<Link2 className="h-4 w-4" />}>Nearby Connectivity</CardTitle>
          <NearbyGrid land={land} cols={3} />
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card>
            <h2 className="text-[20px] font-semibold text-ink">About the Farmer</h2>
            {owner && (
              <>
                <div className="mt-5 flex items-center gap-4">
                  <Avatar src={owner.avatar} name={owner.name} size={60} />
                  <div>
                    <p className="text-[17px] font-semibold text-ink">{owner.name}</p>
                    <p className="flex items-center gap-1 text-[13px] text-muted">
                      <MapPin className="h-3.5 w-3.5 fill-[#ef4444] text-white" /> {owner.village ?? land.village}, {owner.district ?? land.district}, {owner.state ?? land.state}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-[12.5px] text-muted">
                      Farmer
                      {owner.verified && (
                        <span className="chip rounded-full bg-mint px-2 py-0.5 text-[11.5px] text-[#16803c]">
                          <Check className="h-3 w-3" /> Verified Farmer
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 border-y border-line py-3 text-center">
                  <div className="border-r border-line">
                    <p className="text-[16px] font-semibold text-ink">{owner.farmerType ?? "Farmer"}</p>
                    <p className="text-[10.5px] uppercase text-muted">Farmer Type</p>
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-ink">{owner.totalLand ?? areaShort(land.area)}</p>
                    <p className="text-[10.5px] uppercase text-muted">Total Land Managed</p>
                  </div>
                </div>
                <p className="mt-4 text-[13px] italic leading-relaxed text-body">
                  &ldquo;{owner.bio ?? `${owner.name} is a ${owner.experience ?? "experienced"} farmer from ${owner.district ?? land.district}, practising ${owner.farmingType?.toLowerCase() ?? "agriculture"} with care for the land.`}&rdquo;
                </p>
                <Link href={`/buy-land?q=${encodeURIComponent(owner.name)}`} className="btn btn-ghost mt-5 h-10 w-full text-[13px]">
                  View Farmer Profile
                </Link>
              </>
            )}
          </Card>
          <Card>
            <h2 className="text-[20px] font-semibold text-ink">Land Highlights</h2>
            <ul className="mt-5 space-y-4">
              {highlights.map((h) => (
                <li key={h.t} className="flex gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${h.c}`}>
                    <h.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-semibold text-ink">{h.t}</span>
                    <span className="block text-[12px] text-muted">{h.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-[18px] font-semibold text-ink">
              <Zap className="h-5 w-5 fill-[#f59e0b] text-[#f59e0b]" /> High Investor Interest
            </h2>
            <p className="mt-1 text-[13px] text-muted">This land is getting a lot of attention!</p>
            <dl className="mt-6 grid grid-cols-3 border-b border-line pb-5 text-center">
              <div>
                <dd className="text-[26px] font-bold text-ink">{interests.length}</dd>
                <dt className="text-[12px] text-muted">Investors Interested</dt>
              </div>
              <div>
                <dd className="text-[26px] font-bold text-ink">{calls}</dd>
                <dt className="text-[12px] text-muted">Direct Connects</dt>
              </div>
              <div>
                <dd className="text-[26px] font-bold text-ink">{visits}</dd>
                <dt className="text-[12px] text-muted">Site Visits Scheduled</dt>
              </div>
            </dl>
            <div className="mt-5 flex justify-center -space-x-2">
              {investors.slice(0, 5).map((u) => (
                <Avatar key={u.id} src={u.avatar} name={u.name} size={30} className="ring-2 ring-white" />
              ))}
              {investors.length > 5 && <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#f3f4f6] text-[10px] font-semibold text-ink ring-2 ring-white">+{investors.length - 5}</span>}
            </div>
            <p className="mt-2 text-center text-[13px] text-body">
              {investors.length ? `${investors[0].name.split(" ")[0]} ${investors[0].name.split(" ")[1]?.[0] ?? ""}. ${investors.length > 1 ? `and ${investors.length - 1} others are` : "is"} interested in this land` : "Be the first to show interest"}
            </p>
            <a href="#interest" className="btn btn-ghost mt-4 h-10 w-full text-[13px]">
              See Interested Investors
            </a>
          </Card>
        </div>

        <div id="interest" className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-line bg-[#f7f8fa] p-6">
            <div className="grid items-center gap-6 md:grid-cols-[1fr_1fr]">
              <div>
                <h2 className="text-[22px] font-bold tracking-[-0.01em] text-ink">Interested in this land?</h2>
                <p className="mt-1 text-[13.5px] text-body">Show your interest and connect directly with the farmer.</p>
                {!isOwner && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <InterestButton landId={land.id} interested={interested} variant="small" />
                    <SaveButton landId={land.id} saved={saved.has(land.id)} variant="button" />
                  </div>
                )}
              </div>
              {owner && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-3">
                  <span className="flex items-center gap-3">
                    <Avatar src={owner.avatar} name={owner.name} size={48} />
                    <span className="leading-tight">
                      <span className="block text-[13.5px] font-semibold text-ink">{owner.name}</span>
                      <span className="block text-[11.5px] text-muted">
                        {land.village}, {land.district}, {land.state}
                      </span>
                    </span>
                  </span>
                  {!isOwner && <CallButton landId={land.id} className="btn btn-primary h-9 px-8 text-[13px]" />}
                </div>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-white p-6 text-center">
            <h2 className="flex items-center justify-center gap-2 text-[16px] font-semibold text-ink">
              <Headphones className="h-5 w-5 text-brand" /> Need Help?
            </h2>
            <p className="mt-1 text-[13px] text-muted">We are here to help you at every step.</p>
            <Link href="/contact" className="btn btn-primary mt-4 h-10 w-full text-[13px]">
              <Phone className="h-4 w-4" /> Contact Support
            </Link>
            <p className="mt-3 text-[12px] text-ink">
              <b>Call Us:</b>{" "}
              <a href={site.supportPhoneHref} className="hover:text-brand">
                {site.supportPhone}
              </a>
            </p>
          </section>
        </div>

        {similar.length > 0 && (
          <section className="mt-6 border-t border-line pt-8" aria-labelledby="similar-h">
            <Scroller title="Similar Agricultural Land" viewAll={`/locations/${land.district.toLowerCase()}`}>
              {similar.map((l) => (
                <div key={l.id} className="snap-start">
                  <MiniLandCard land={l} saved={saved.has(l.id)} />
                </div>
              ))}
            </Scroller>
          </section>
        )}

        <div className="mt-6">
          <ServicesPromo />
        </div>
      </div>
    </div>
  );
}
