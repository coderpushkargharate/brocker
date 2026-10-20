import { notFound } from "next/navigation";
import { readDB } from "@/lib/db";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata = { title: "Edit Land" };

export default async function AdminEditLand({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const land = db.lands.find((l) => l.id === id);
  if (!land) notFound();
  const owners = db.users.filter((u) => u.role === "farmer" || u.role === "admin").map((u) => ({ id: u.id, name: `${u.name}${u.role === "admin" ? " (Admin)" : ""}` }));
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <ListingForm land={land} isAdmin owners={owners} backHref={`/admin/lands/${id}`} />
    </div>
  );
}
