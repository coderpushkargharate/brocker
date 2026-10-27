import { readDB } from "@/lib/db";
import { serviceSettings } from "@/lib/services";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ServiceSettingsForm } from "@/components/admin/ServiceAdminForms";

export const metadata = { title: "Service Settings" };

export default async function AdminServiceSettings() {
  const s = serviceSettings(await readDB());
  return (
    <>
      <PageTitle title="Service Settings" sub="Numbers, prices and quick-search buttons shown on the Business Services and Labour pages." />
      <Box>
        <ServiceSettingsForm s={s} />
      </Box>
    </>
  );
}
