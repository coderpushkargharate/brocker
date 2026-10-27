import { readDB } from "@/lib/db";
import { categoriesOf, serviceSettings } from "@/lib/services";
import { PageTitle } from "@/components/admin/Bits";
import { WorkerForm } from "@/components/services/WorkerForm";

export const metadata = { title: "Add Worker" };

export default async function NewWorker() {
  const db = await readDB();
  const s = serviceSettings(db);
  return (
    <>
      <PageTitle title="Add Worker / Labour Group" sub="Create a worker profile directly. Profile photo is optional for admins." />
      <WorkerForm mode="admin" categories={categoriesOf(db, "labour", true)} helpPhone={s.helpPhone} helpHours={s.helpHours} />
    </>
  );
}
