import { Plus, Trash2 } from "lucide-react";
import { readDB } from "@/lib/db";
import { deleteCategoryAction } from "@/app/actions/services-admin";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { CategoryForm } from "@/components/admin/ServiceAdminForms";
import { CatIcon } from "@/components/services/icons";
import { Img } from "@/components/Img";
import type { ServiceKind } from "@/lib/types";

export const metadata = { title: "Service Categories" };

export default async function AdminCategories() {
  const db = await readDB();
  const section = (kind: ServiceKind, title: string) => {
    const cats = db.serviceCategories.filter((c) => c.kind === kind).sort((a, b) => a.order - b.order);
    return (
      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-ink">{title}</h2>
        {cats.map((c) => {
          const used = kind === "business" ? db.businesses.filter((b) => b.categoryId === c.id).length : db.workers.filter((w) => w.categoryId === c.id).length;
          return (
            <Box key={c.id} className="!p-0">
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Img src={c.image} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <CatIcon name={c.icon} className="h-6 w-6 shrink-0 text-brand" />
                  <span className="min-w-0 flex-1">
                    <b className="block text-[15.5px] text-ink">
                      {c.order}. {c.name} {!c.active && <span className="chip ml-1 bg-[#f3f4f6] text-[#374151]">Hidden</span>}
                    </b>
                    <span className="block truncate text-[12.5px] text-muted">
                      {used} {kind === "business" ? "businesses" : "workers"} • {c.subcategories.length} {kind === "labour" ? "skills" : "subcategories"} • /{c.id}
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold text-brand">Edit</span>
                </summary>
                <div className="border-t border-line p-4">
                  <CategoryForm cat={c} kind={kind} />
                  <form action={deleteCategoryAction.bind(null, c.id)} className="mt-3 border-t border-line pt-3">
                    <ConfirmButton message={used ? `"${c.name}" has ${used} profiles, so it will be hidden instead of deleted. Continue?` : `Delete "${c.name}"?`} className="flex items-center gap-1.5 text-[13px] font-medium text-[#dc2626]">
                      <Trash2 className="h-4 w-4" /> {used ? "Hide category" : "Delete category"}
                    </ConfirmButton>
                  </form>
                </div>
              </details>
            </Box>
          );
        })}
        <Box className="!p-0">
          <details>
            <summary className="flex cursor-pointer list-none items-center gap-2 p-4 font-semibold text-brand [&::-webkit-details-marker]:hidden">
              <Plus className="h-4 w-4" /> Add {kind === "labour" ? "labour" : "business"} category
            </summary>
            <div className="border-t border-line p-4">
              <CategoryForm kind={kind} />
            </div>
          </details>
        </Box>
      </section>
    );
  };
  return (
    <>
      <PageTitle title="Service Categories" sub="Edit the categories, subcategories and skills shown on the Business Services and Labour pages." />
      <div className="grid gap-8 xl:grid-cols-2">
        {section("business", "Business Service Categories")}
        {section("labour", "Labour & Workforce Categories")}
      </div>
    </>
  );
}
