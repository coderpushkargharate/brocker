import { readDB } from "@/lib/db";
import { categoriesOf, serviceSettings } from "@/lib/services";
import { PageTitle } from "@/components/admin/Bits";
import { BusinessForm } from "@/components/services/BusinessForm";

export const metadata = { title: "Add Business" };

export default async function NewBusiness() {
  const db = await readDB();
  const s = serviceSettings(db);
  return (
    <>
      <PageTitle title="Add Business" sub="Create a business listing directly. It goes live immediately unless you choose another status." />
      <BusinessForm mode="admin" categories={categoriesOf(db, "business", true)} premiumPrice={s.premiumPrice} helpPhone={s.helpPhone} helpHours={s.helpHours} loggedIn />
    </>
  );
}
