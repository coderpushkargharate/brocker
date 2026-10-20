import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { readDB } from "@/lib/db";
import { DOCUMENT_TYPES } from "@/lib/config";
import { areaLabel, formatDate, inr, perAcre } from "@/lib/format";
import { listingQuality } from "@/lib/lands";
import { setDocumentStatusAction, setLandStatusAction } from "@/app/actions/admin";
import { deleteLandAction } from "@/app/actions/lands";
import { Box, PageTitle, STATUS_CHIP } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { Img } from "@/components/Img";
import { Avatar } from "@/components/Avatar";
import { LandInfo, NearbyGrid } from "@/components/land/Parts";

export const metadata = { title: "Review Land" };

export default async function AdminLandReview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const land = db.lands.find((l) => l.id === id);
  if (!land) notFound();
  const owner = db.users.find((u) => u.id === land.ownerId);
  const interests = db.interests.filter((i) => i.landId === land.id);

  return (
    <>
      <Link href="/admin/lands" className="mb-3 inline-flex items-center gap-2 text-[14px] text-muted hover:text-brand">
        <ArrowLeft className="h-4 w-4" /> All land projects
      </Link>
      <PageTitle title={land.title} sub={`${land.code} • ${land.village}, ${land.taluka}, ${land.district} • updated ${formatDate(land.updatedAt)}`}>
        <div className="flex flex-wrap gap-2">
          {land.status !== "active" && (
            <form action={setLandStatusAction.bind(null, land.id, "active")}>
              <button className="btn btn-primary h-10 px-4 text-[14px]">
                <Check className="h-4 w-4" /> Approve & Publish
              </button>
            </form>
          )}
          {land.status !== "rejected" && (
            <form action={setLandStatusAction.bind(null, land.id, "rejected")}>
              <button className="btn btn-ghost h-10 px-4 text-[14px] text-[#dc2626]">
                <X className="h-4 w-4" /> Reject
              </button>
            </form>
          )}
          <Link href={`/admin/lands/${land.id}/edit`} className="btn btn-ghost h-10 px-4 text-[14px]">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          {land.status === "active" && (
            <Link href={`/lands/${land.slug}`} target="_blank" className="btn btn-ghost h-10 px-4 text-[14px]">
              <ExternalLink className="h-4 w-4" /> Live page
            </Link>
          )}
          <form action={async () => {
            "use server";
            await deleteLandAction(land.id);
            const { redirect } = await import("next/navigation");
            redirect("/admin/lands");
          }}>
            <ConfirmButton message="Delete this land permanently?" className="btn btn-ghost h-10 px-4 text-[14px] text-[#dc2626]">
              <Trash2 className="h-4 w-4" /> Delete
            </ConfirmButton>
          </form>
        </div>
      </PageTitle>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Box>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {land.images.map((src, i) => (
                <a key={src + i} href={src} target="_blank" rel="noopener noreferrer" className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Img src={src} alt="" fill sizes="200px" className="object-cover" />
                </a>
              ))}
              {land.images.length === 0 && <p className="text-[14px] text-muted">No photos uploaded.</p>}
            </div>
            {land.video && <video src={land.video} controls className="mt-3 w-full rounded-lg" />}
          </Box>
          <Box>
            <h2 className="text-[17px] font-semibold text-ink">Details</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [areaLabel(land.area, land.areaUnit), "Area"],
                [inr(land.price), "Price"],
                [inr(perAcre(land.price, land.area)), "Per acre"],
                [`${listingQuality(land)}%`, "Quality"],
              ].map(([v, k]) => (
                <div key={k} className="rounded-lg bg-[#f9fafb] p-3">
                  <dd className="font-semibold text-ink">{v}</dd>
                  <dt className="text-[12px] text-muted">{k}</dt>
                </div>
              ))}
            </dl>
            <LandInfo land={land} />
            <p className="mt-4 whitespace-pre-line text-[14px] text-body">{land.description || "No description."}</p>
            <p className="mt-3 text-[13px] text-muted">Highlights: {land.highlights.join(", ") || "—"}</p>
            <NearbyGrid land={land} />
          </Box>
        </div>
        <div className="space-y-6">
          <Box>
            <p className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-ink">Status</span>
              <span className={`chip capitalize ${STATUS_CHIP[land.status]}`}>{land.status}</span>
            </p>
            <p className="mt-2 text-[13.5px] text-muted">
              Verified: <b className="text-ink">{land.verified ? "Yes" : "No"}</b> • Featured: <b className="text-ink">{land.featured ? "Yes" : "No"}</b>
            </p>
          </Box>
          <Box>
            <h2 className="text-[17px] font-semibold text-ink">Documents</h2>
            <ul className="mt-3 divide-y divide-line">
              {DOCUMENT_TYPES.map((d) => {
                const doc = land.documents.find((x) => x.key === d.key);
                return (
                  <li key={d.key} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                    <span>
                      <b className="text-ink">{d.label}</b>
                      <span className={`ml-2 text-[12px] ${doc?.status === "verified" ? "text-[#16803c]" : doc?.file ? "text-[#b45309]" : "text-muted"}`}>{doc?.file ? doc.status : "not uploaded"}</span>
                    </span>
                    {doc?.file && (
                      <span className="flex items-center gap-2">
                        {doc.file.startsWith("/api/") && (
                          <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-brand hover:underline">
                            Open
                          </a>
                        )}
                        <form action={setDocumentStatusAction.bind(null, land.id, d.key, doc.status === "verified" ? "pending" : "verified")}>
                          <button className={`rounded-md px-2 py-1 text-[12px] font-semibold ${doc.status === "verified" ? "bg-[#f3f4f6] text-[#374151]" : "bg-brand text-white"}`}>{doc.status === "verified" ? "Unverify" : "Verify"}</button>
                        </form>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Box>
          {owner && (
            <Box>
              <h2 className="text-[17px] font-semibold text-ink">Owner</h2>
              <div className="mt-3 flex items-center gap-3">
                <Avatar src={owner.avatar} name={owner.name} size={44} />
                <div className="text-[13.5px]">
                  <p className="font-semibold text-ink">{owner.name}</p>
                  <p className="text-muted">
                    {owner.email} • {owner.phone}
                  </p>
                </div>
              </div>
            </Box>
          )}
          <Box>
            <h2 className="text-[17px] font-semibold text-ink">Investor Interests ({interests.length})</h2>
            <ul className="mt-3 space-y-2 text-[13.5px]">
              {interests.map((i) => {
                const u = db.users.find((x) => x.id === i.investorId);
                return (
                  <li key={i.id} className="flex justify-between">
                    <span>{u?.name}</span>
                    <span className="capitalize text-muted">{i.status}</span>
                  </li>
                );
              })}
              {interests.length === 0 && <li className="text-muted">None yet.</li>}
            </ul>
          </Box>
        </div>
      </div>
    </>
  );
}
