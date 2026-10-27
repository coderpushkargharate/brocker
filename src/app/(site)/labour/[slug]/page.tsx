import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, BriefcaseBusiness, CalendarCheck, CircleCheck, FileText, MapPin, UsersRound } from "lucide-react";
import { readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { categoryById, publicWorkers } from "@/lib/services";
import { site } from "@/lib/config";
import { wageLabel } from "@/lib/services-config";
import { Img } from "@/components/Img";
import { Crumbs, MapEmbed, Tag } from "@/components/services/Bits";
import { CallButton, SaveButton, ShareButton, TrackView, WhatsAppButton } from "@/components/services/Actions";
import { EnquiryForm } from "@/components/services/LeadForms";
import { PhotoGrid } from "@/components/services/PhotoGrid";
import { ReviewsBlock } from "@/components/services/Reviews";
import { RatingLine } from "@/components/services/Stars";
import { WorkerCard, workerImage } from "@/components/services/Cards";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const db = await readDB();
  const user = await getCurrentUser();
  const w = db.workers.find((x) => x.slug === slug);
  if (!w || (w.status !== "active" && user?.role !== "admin")) return null;
  return { db, user, w };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await load((await params).slug);
  if (!r) return { title: "Worker not found" };
  const { w } = r;
  return {
    title: `${w.name} – ${w.skills.slice(0, 2).join(", ")} in ${w.village}, ${w.district}`,
    description: `${w.description} ${wageLabel(w)}. ${w.experience} experience. Call or WhatsApp directly.`.slice(0, 300),
    alternates: { canonical: `/labour/${w.slug}` },
    openGraph: { title: w.name, description: w.description, images: [workerImage(w)] },
    robots: w.status !== "active" ? { index: false, follow: false } : undefined,
  };
}

export default async function WorkerPage({ params }: Props) {
  const r = await load((await params).slug);
  if (!r) notFound();
  const { w, db, user } = r;
  const cat = categoryById(db, w.categoryId);
  const t = { type: "worker" as const, id: w.id, phone: w.phone, whatsapp: w.whatsapp, name: w.name };
  const reviews = db.serviceReviews.filter((x) => x.targetId === w.id && x.status === "approved").sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
  const group = w.profileType === "group";
  const similar = publicWorkers(db).filter((x) => x.id !== w.id && x.skills.some((s) => w.skills.includes(s))).slice(0, 3);
  const photos = [...(w.cover ? [w.cover] : []), ...w.workPhotos].filter((p, i, a) => a.indexOf(p) === i);
  const facts = [
    [BriefcaseBusiness, "Experience", w.experience],
    [UsersRound, "Profile Type", group ? `Labour Group${w.teamSize ? ` • ${w.teamSize}+ workers` : ""}` : w.teamSize ? `Individual • Team of ${w.teamSize}` : "Individual Worker"],
    [MapPin, "Work Area", w.workRadius],
    [CalendarCheck, "Availability", w.availableToday ? "Available Today" : w.availability || "Call to check"],
  ] as const;

  return (
    <>
      <TrackView type="worker" id={w.id} />
      {w.status !== "active" && <p className="bg-[#fef3c7] py-2 text-center text-[13.5px] font-medium text-[#92400e]">Admin preview – this profile is {w.status} and not visible to visitors.</p>}
      <div className="container-dash pb-20 pt-5">
        <Crumbs items={[{ name: "Labour & Workforce", href: "/labour" }, ...(cat ? [{ name: cat.name, href: `/labour?category=${cat.id}#results` }] : []), { name: w.name }]} />
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              {w.cover && (
                <div className="relative h-[160px] sm:h-[200px]">
                  <Img src={w.cover} alt="" fill priority sizes="(max-width:1024px) 100vw, 900px" className="object-cover" />
                </div>
              )}
              <div className={`flex flex-col gap-5 p-5 sm:flex-row ${w.cover ? "sm:-mt-16" : ""}`}>
                <span className="relative h-[130px] w-[130px] shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-mint shadow-soft">
                  <Img src={workerImage(w)} alt={w.name} fill sizes="130px" className="object-cover" />
                </span>
                <div className={`min-w-0 flex-1 ${w.cover ? "sm:pt-16" : ""}`}>
                  <h1 className="flex flex-wrap items-center gap-2 font-display text-[26px] font-extrabold text-ink sm:text-[30px]">
                    {w.name}
                    {w.verified && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-brand px-2 py-1 text-[12px] font-semibold text-white">
                        <BadgeCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </h1>
                  <div className="mt-1">
                    <RatingLine rating={w.rating} count={w.reviewCount} />
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[14px] text-body">
                    <MapPin className="h-4 w-4" /> {w.village}, {w.taluka}, {w.district}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {w.skills.map((s, i) => (
                      <Tag key={s} tone={i === 0 ? "green" : "gray"}>
                        {s}
                        {w.skillCounts?.[s] ? ` (${w.skillCounts[s]})` : ""}
                      </Tag>
                    ))}
                  </div>
                  {w.availableToday && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#dcf3e8] px-2 py-1 text-[12.5px] font-semibold text-brand">
                      <CircleCheck className="h-4 w-4" /> Available Today
                    </span>
                  )}
                </div>
                <div className="sm:pt-16 sm:text-right">
                  <p className="text-[26px] font-extrabold text-brand">{wageLabel(w)}</p>
                  <div className="mt-2 flex gap-2 sm:justify-end">
                    <SaveButton id={w.id} saved={(user?.savedServices ?? []).includes(w.id)} />
                    <ShareButton title={w.name} className="h-9 px-3 text-[13px]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-line p-4 sm:flex">
                <CallButton t={t} label="Call Now" className="h-11 px-6 text-[15px] sm:flex-1" />
                <WhatsAppButton t={t} className="h-11 px-6 text-[15px] sm:flex-1" />
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-[20px] font-bold text-ink">About the Work</h2>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-body">{w.description || "No description added yet."}</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {facts.map(([I, k, v]) => (
                  <div key={k} className="flex items-center gap-3 rounded-xl bg-[#f9fafb] p-3">
                    <I className="h-6 w-6 text-brand" />
                    <span>
                      <dt className="text-[12.5px] text-muted">{k}</dt>
                      <dd className="text-[14.5px] font-semibold text-ink">{v}</dd>
                    </span>
                  </div>
                ))}
              </dl>
            </section>

            {photos.length > 0 && (
              <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <h2 className="mb-4 text-[20px] font-bold text-ink">Work Photos</h2>
                <PhotoGrid images={photos} title={w.name} />
              </section>
            )}

            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="mb-4 text-[20px] font-bold text-ink">Reviews</h2>
              <ReviewsBlock info={w} reviews={reviews} targetType="worker" targetId={w.id} />
            </section>

            {similar.length > 0 && (
              <section>
                <h2 className="mb-4 text-[20px] font-bold text-ink">Similar Workers Nearby</h2>
                <div className="space-y-4">
                  {similar.map((s) => (
                    <WorkerCard key={s.id} w={s} saved={(user?.savedServices ?? []).includes(s.id)} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#d6ecdc] bg-gradient-to-b from-[#f2faf4] to-white p-5 shadow-card">
              <h2 className="text-[20px] font-bold text-ink">Hire {w.name.split(" ")[0]}</h2>
              <p className="mb-4 text-[13.5px] text-body">Send your work details. {group ? "The mukadam" : "The worker"} will call you back.</p>
              <EnquiryForm target={t} items={w.skills} itemLabel="Select Work" defaultDistrict={w.district} />
            </section>
            <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <h2 className="mb-3 text-[17px] font-bold text-ink">Location</h2>
              <MapEmbed query={`${w.village}, ${w.taluka}, ${w.district}, Maharashtra`} className="h-[200px]" zoom={12} />
            </section>
            {user?.role === "admin" && w.idProof && (
              <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
                <h2 className="text-[16px] font-bold text-ink">ID Proof (admin only)</h2>
                <a href={w.idProof} target="_blank" className="mt-2 flex items-center gap-2 text-[14px] text-brand hover:underline">
                  <FileText className="h-4 w-4" /> {w.idProofType || "Document"}
                </a>
              </section>
            )}
            <Link href="/labour/register" className="block rounded-2xl border border-dashed border-brand/40 bg-mint-50 p-5 text-center">
              <b className="text-[15px] text-ink">Looking for work?</b>
              <span className="mt-1 block text-[13px] text-body">Create your free worker profile on {site.name}.</span>
              <span className="btn btn-primary mt-3 h-10 px-5 text-[13.5px]">Register as a Worker</span>
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
