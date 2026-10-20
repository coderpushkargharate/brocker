import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { matchScore } from "@/lib/lands";
import { LandCard } from "@/components/LandCard";
import type { Land } from "@/lib/types";

export const metadata: Metadata = { title: "Saved Lands" };

export default async function SavedPage() {
  const user = await requireUser(undefined, "/dashboard/saved");
  const db = readDB();
  const lands = user.saved.map((id) => db.lands.find((l) => l.id === id)).filter((l): l is Land => !!l && l.status === "active");
  return (
    <div className="container-dash pt-8">
      <h1 className="text-[30px] font-semibold text-ink">Saved Lands</h1>
      <p className="text-[15px] text-muted">{lands.length} saved • tap the heart again to remove a land.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lands.map((l) => (
          <LandCard key={l.id} land={l} saved match={matchScore(l, user.preferences)} />
        ))}
      </div>
      {lands.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-12 text-center">
          <p className="text-[17px] font-semibold text-ink">No saved lands yet</p>
          <Link href="/buy-land" className="btn btn-primary mt-4 h-11 px-6">
            Explore Land
          </Link>
        </div>
      )}
    </div>
  );
}
