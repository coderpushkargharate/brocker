import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getLandById } from "@/lib/lands";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata: Metadata = { title: "Edit Listing" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["farmer"], `/dashboard/listings/${id}/edit`);
  const land = await getLandById(id);
  if (!land || land.ownerId !== user.id) notFound();
  return <ListingForm land={land} backHref={`/dashboard/listings/${id}`} />;
}
