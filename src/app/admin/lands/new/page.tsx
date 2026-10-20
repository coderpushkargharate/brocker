import { readDB } from "@/lib/db";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata = { title: "Add New Land" };

export default function AdminNewLand() {
  const owners = readDB()
    .users.filter((u) => u.role === "farmer" || u.role === "admin")
    .map((u) => ({ id: u.id, name: `${u.name}${u.role === "admin" ? " (Admin)" : ""}` }));
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <ListingForm isAdmin owners={owners} backHref="/admin/lands" />
    </div>
  );
}
