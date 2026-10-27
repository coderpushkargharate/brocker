import type { Metadata } from "next";
import { readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { categoriesOf, serviceSettings } from "@/lib/services";
import { BusinessForm } from "@/components/services/BusinessForm";

export const metadata: Metadata = {
  title: "List Your Business – Get Enquiries from Local Customers",
  description: "List your building material shop, contracting, JCB, borewell, garden or home service business on AgriLand. Free basic listing, verified badge and direct Call & WhatsApp enquiries.",
  alternates: { canonical: "/list-business" },
};

export default async function ListBusinessPage() {
  const db = await readDB();
  const user = await getCurrentUser();
  const settings = serviceSettings(db);
  return (
    <div className="bg-page pb-16 pt-6">
      <div className="container-dash">
        <BusinessForm categories={categoriesOf(db, "business")} premiumPrice={settings.premiumPrice} helpPhone={settings.helpPhone} helpHours={settings.helpHours} loggedIn={Boolean(user)} />
      </div>
    </div>
  );
}
