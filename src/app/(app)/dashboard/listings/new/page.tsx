import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata: Metadata = { title: "Add New Land Listing" };

export default async function NewListingPage() {
  await requireUser(["farmer"], "/dashboard/listings/new");
  return <ListingForm backHref="/dashboard" />;
}
