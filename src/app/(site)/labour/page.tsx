import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, ChevronRight, CircleCheck, ClipboardList, IndianRupee, MapPin, SearchX, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { categoriesOf, categoryById, expCounts, searchWorkers, serviceSettings, SERVICE_PAGE_SIZE, skillCounts, workerVillages, type WorkerQuery } from "@/lib/services";
import { site } from "@/lib/config";
import { timeAgo } from "@/lib/format";
import { telLink, waLink } from "@/lib/services-config";
import { MapEmbed } from "@/components/services/Bits";
import { SortBy, ViewToggle, WorkerFilters, WorkerSearch } from "@/components/services/Filters";
import { WorkerCard, workerImage } from "@/components/services/Cards";
import { WhatsAppIcon } from "@/components/services/Actions";
import { Pagination } from "@/components/buy/Pagination";
import { JsonLd } from "@/components/JsonLd";
import { Img } from "@/components/Img";

type Props = { searchParams: Promise<WorkerQuery> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = await searchParams;
  const cat = categoryById(await readDB(), q.category);
  const where = q.village || q.taluka || q.district || "Pune & Maharashtra";
  const filtered = Object.entries(q).some(([k, v]) => v && k !== "category");
  return {
    title: q.tab === "work" ? "Find Work – Labour Jobs Near You" : `${cat ? cat.name : "Find Workers & Labour"} Near You in ${where}`,
    description: `Hire verified ${cat ? cat.name.toLowerCase() : "masons, helpers, painters, plumbers, electricians and farm labour"} in ${where}. See daily wage, experience and call or WhatsApp directly.`,
    alternates: { canonical: cat && !filtered ? `/labour?category=${cat.id}` : "/labour" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function LabourPage({ searchParams }: Props) {
  const q = await searchParams;
  const db = await readDB();
  const user = await getCurrentUser();
  const settings = serviceSettings(db);
  const cats = categoriesOf(db, "labour");
  const qs = q as Record<string, string | undefined>;
  const work = q.tab === "work";
  const { items, total, page, pages } = searchWorkers(q, db);
  const saved = new Set(user?.savedServices ?? []);
  const villages = workerVillages(db, q.district, q.taluka);
  const exps = Object.fromEntries(expCounts(db, q));
  const where = q.village || q.taluka || q.district || "Maharashtra";

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(qs)) if (v && k !== "page") sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    return `/labour${sp.size ? `?${sp}` : ""}#results`;
  };

  const jobs = db.serviceLeads
    .filter((l) => l.kind === "requirement" && l.published && l.status !== "closed" && db.serviceCategories.some((c) => c.id === l.categoryId && c.kind === "labour"))
    .filter((l) => (!q.district || l.district === q.district) && (!q.taluka || l.taluka === q.taluka))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const skillThumb = (skill: string) => {
    const c = cats.find((c) => c.subcategories.includes(skill));
    const w = db.workers.find((w) => w.status === "active" && w.skills[0] === skill && w.photo);
    return w ? workerImage(w) : c?.image ?? "/images/svc/lab-construction.jpg";
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Workers near you",
          numberOfItems: total,
          itemListElement: items.map((w, i) => ({ "@type": "ListItem", position: (page - 1) * SERVICE_PAGE_SIZE + i + 1, url: `${site.url}/labour/${w.slug}`, name: w.name })),
        }}
      />
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef6f0] to-white">
        <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
          <Image src="/images/svc/hero-labour.jpg" alt="" fill priority sizes="48vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0f7f2] via-[#f0f7f2]/30 to-transparent" />
        </div>
        <div className="container-dash relative py-8 lg:py-10">
          <span className="inline-block rounded-lg bg-brand px-3 py-1.5 text-[12.5px] font-bold uppercase tracking-wide text-white">{site.name} • Labour &amp; Workforce</span>
          <div className="mt-3 flex flex-col gap-5 xl:flex-row xl:items-center xl:gap-10">
            <div className="max-w-[560px]">
              <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[48px]">{work ? "Find Work Near You" : "Find Workers Near You"}</h1>
              <p className="mt-3 text-[15.5px] text-ink sm:text-[16.5px]">
                {work
                  ? "See labour requirements posted by customers and contractors near you. Call or WhatsApp them directly."
                  : "Get skilled and unskilled labour for construction, home work, farming and all types of projects. Local workers, verified profiles and direct contact."}
              </p>
            </div>
            <div className="flex overflow-hidden rounded-xl bg-white/90 shadow-soft">
              <Link href="/labour" className={`flex items-center gap-3 px-5 py-3 ${!work ? "bg-brand text-white" : "text-ink"}`}>
                <UserRound className="h-8 w-8" />
                <span>
                  <b className="block text-[16px]">Find a Worker</b>
                  <span className={`text-[12.5px] ${!work ? "text-white/85" : "text-body"}`}>Hire workers for your work</span>
                </span>
              </Link>
              <Link href="/labour?tab=work#results" className={`flex items-center gap-3 px-5 py-3 ${work ? "bg-brand text-white" : "text-ink"}`}>
                <UsersRound className="h-8 w-8" />
                <span>
                  <b className="block text-[16px]">Find Work</b>
                  <span className={`text-[12.5px] ${work ? "text-white/85" : "text-body"}`}>For labour &amp; job seekers</span>
                </span>
              </Link>
            </div>
          </div>
          <div className="mt-6">
            <WorkerSearch q={qs} villages={workerVillages(db, q.district, q.taluka)} />
          </div>
        </div>
      </section>

      {/* categories */}
      <section aria-label="Worker categories" className="container-dash mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,1fr)_1.05fr]">
        {cats.map((c) => (
          <Link
            key={c.id}
            href={`/labour?category=${c.id}#results`}
            className={`grid grid-cols-[120px_1fr] gap-3 rounded-2xl border bg-white p-2 shadow-card hover:shadow-soft ${q.category === c.id ? "border-brand ring-2 ring-brand/20" : "border-line"}`}
          >
            <span className="relative block h-[100px] overflow-hidden rounded-xl">
              <Img src={c.image} alt="" fill sizes="120px" className="object-cover" />
            </span>
            <span className="relative py-1.5 pr-2">
              <b className="block text-[15px] text-ink">{c.name}</b>
              <span className="mt-1 block text-[12.5px] leading-snug text-body">{c.description}</span>
              <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-line">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </Link>
        ))}
        <div className="rounded-2xl border border-[#cfe8d6] bg-mint-50 p-4 sm:col-span-2 xl:col-span-1">
          <h2 className="flex items-center gap-2 text-[18px] font-bold text-ink">
            <ClipboardList className="h-6 w-6 text-brand" /> Post Your Requirement
          </h2>
          <p className="mt-1 text-[13px] text-body">Need multiple workers for your project? Post your requirement and get quick responses from local workers.</p>
          <Link href="/post-requirement?type=labour" className="btn btn-primary mt-3 h-10 w-full text-[14px]">
            Post Requirement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div id="results" className="container-dash mt-8 grid scroll-mt-24 gap-6 pb-20 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_280px]">
        <aside>
          <WorkerFilters q={qs} skills={skillCounts(db, q)} villages={villages} exps={exps} />
        </aside>

        <section aria-label={work ? "Work requirements" : "Workers"} className="min-w-0">
          {work ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-bold text-ink">
                  {jobs.length} Work Requirement{jobs.length === 1 ? "" : "s"} in {q.taluka || q.district || "Maharashtra"}
                </h2>
                <Link href="/labour/register" className="btn btn-primary h-10 px-4 text-[13.5px]">
                  Register as a Worker
                </Link>
              </div>
              <ul className="mt-4 space-y-4">
                {jobs.map((j) => (
                  <li key={j.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[12.5px] text-muted">
                          {categoryById(db, j.categoryId)?.name} • Posted {timeAgo(j.createdAt)}
                        </p>
                        <h3 className="text-[18px] font-bold text-ink">
                          {j.workersNeeded ? `${j.workersNeeded} × ` : ""}
                          {j.item || "Workers"} needed
                        </h3>
                      </div>
                      {j.budget && (
                        <span className="flex items-center text-[18px] font-bold text-brand">
                          <IndianRupee className="h-4 w-4" />
                          {j.budget.replace(/^₹/, "")} / Day
                        </span>
                      )}
                    </div>
                    <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px] text-body">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {[j.village, j.taluka, j.district].filter(Boolean).join(", ")}
                      </span>
                      {j.startDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" /> Starts {new Date(j.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <UserRound className="h-4 w-4" /> {j.name}
                      </span>
                    </p>
                    {j.message && <p className="mt-2 text-[14px] text-ink">{j.message}</p>}
                    <div className="mt-3 flex gap-2">
                      <a href={telLink(j.phone)} className="btn btn-outline h-10 px-5 text-[14px]">
                        Call
                      </a>
                      <a href={waLink(j.phone, `Hello ${j.name}, I saw your requirement for ${j.item || "workers"} on AgriLand. I am interested.`)} target="_blank" rel="noopener noreferrer" className="btn h-10 bg-[#15803d] px-5 text-[14px] text-white">
                        <WhatsAppIcon /> WhatsApp
                      </a>
                    </div>
                  </li>
                ))}
                {jobs.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-10 text-center">
                    <BriefcaseBusiness className="mx-auto h-10 w-10 text-muted" />
                    <p className="mt-3 text-[17px] font-semibold text-ink">No open work requirements right now</p>
                    <p className="mt-1 text-[14px] text-body">Register your profile so customers can find and call you directly.</p>
                    <Link href="/labour/register" className="btn btn-primary mt-5 h-10 px-6 text-[14px]">
                      Register as a Worker
                    </Link>
                  </li>
                )}
              </ul>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[18px] font-bold text-ink">
                  {total.toLocaleString("en-IN")} Worker{total === 1 ? "" : "s"} Found in {where}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <SortBy
                    q={qs}
                    options={[
                      { v: "", l: "Most Relevant" },
                      { v: "rating", l: "Highest Rated" },
                      { v: "wage-asc", l: "Wage: Low to High" },
                      { v: "wage-desc", l: "Wage: High to Low" },
                      { v: "experience", l: "Most Experienced" },
                      { v: "newest", l: "Newest" },
                    ]}
                  />
                  <ViewToggle q={qs} />
                </div>
              </div>
              {q.view === "map" && (
                <div className="mt-4">
                  <MapEmbed query={`${q.village ? q.village + ", " : ""}${q.taluka ? q.taluka + ", " : ""}${q.district || "Pune"}, Maharashtra`} className="h-[320px]" zoom={q.village ? 13 : q.taluka ? 11 : 9} />
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {items.map((w) => (
                      <li key={w.id}>
                        <Link href={`/labour/${w.slug}`} className="flex items-center gap-3 rounded-xl border border-line bg-white p-2 hover:border-brand">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                            <Img src={workerImage(w)} alt="" fill sizes="48px" className="object-cover" />
                          </span>
                          <span className="min-w-0">
                            <b className="block truncate text-[14px] text-ink">{w.name}</b>
                            <span className="flex items-center gap-1 text-[12px] text-body">
                              <MapPin className="h-3 w-3" /> {w.village}, {w.taluka}
                            </span>
                          </span>
                          <span className="ml-auto text-[13px] font-bold text-brand">₹{w.wageMin}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {q.view !== "map" && (
                <div className="mt-4 space-y-4">
                  {items.map((w) => (
                    <WorkerCard key={w.id} w={w} saved={saved.has(w.id)} />
                  ))}
                  {items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white p-12 text-center">
                      <SearchX className="mx-auto h-10 w-10 text-muted" />
                      <p className="mt-3 text-[17px] font-semibold text-ink">No workers match your filters</p>
                      <p className="mt-1 text-[14px] text-body">Try another area or skill — or post your requirement and workers will contact you.</p>
                      <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <Link href="/labour#results" className="btn btn-outline h-10 px-6 text-[14px]">
                          View all workers
                        </Link>
                        <Link href="/post-requirement?type=labour" className="btn btn-primary h-10 px-6 text-[14px]">
                          Post Requirement
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {total > 0 && <Pagination page={page} pages={pages} total={total} pageSize={SERVICE_PAGE_SIZE} hrefFor={hrefFor} />}
            </>
          )}
        </section>

        <aside className="space-y-5 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 xl:col-span-1 xl:block xl:space-y-5">
          <section className="rounded-2xl border border-line bg-white p-4 shadow-card">
            <h2 className="text-[17px] font-bold text-ink">Popular Worker Types</h2>
            <ul className="mt-3 divide-y divide-line">
              {settings.popularLabourSearches.map((s) => (
                <li key={s}>
                  <Link href={`/labour?skill=${encodeURIComponent(s)}#results`} className="flex items-center gap-3 py-2 text-[14px] text-ink hover:text-brand">
                    <span className="relative h-8 w-12 shrink-0 overflow-hidden rounded">
                      <Img src={skillThumb(s)} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <span className="flex-1">{s}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/labour/register" className="mt-2 flex items-center justify-center gap-1.5 text-[13.5px] font-semibold text-brand">
              Are you a worker? Register free <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
          <section className="rounded-2xl border border-[#f5e3a8] bg-[#fff8e1] p-4">
            <h2 className="flex items-center gap-2 text-[17px] font-bold text-ink">
              <ShieldCheck className="h-6 w-6 fill-[#f5a623] text-white" /> Safety &amp; Tips
            </h2>
            <ul className="mt-3 space-y-2.5">
              {["Confirm wage and work details directly with the worker.", "Check worker experience and reviews.", "Meet in person before confirming.", `${site.name} only provides contact details, we are not responsible for transactions.`].map((t) => (
                <li key={t} className="flex gap-2 text-[13px] text-ink">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {t}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
