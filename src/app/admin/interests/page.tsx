import Link from "next/link";
import { readDB } from "@/lib/db";
import { inr, timeAgo } from "@/lib/format";
import { Box, PageTitle } from "@/components/admin/Bits";
import { InterestStatusSelect } from "@/components/dashboard/ClientWidgets";

export const metadata = { title: "Investor Interests" };

export default async function AdminInterests() {
  const db = (await readDB());
  const list = [...db.interests].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return (
    <>
      <PageTitle title="Investor Interests" sub={`${list.length} interests • ${db.calls.length} calls logged`} />
      <Box>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[12px] uppercase text-muted">
              <tr>
                <th className="py-3">Investor</th>
                <th className="py-3">Land</th>
                <th className="py-3">Farmer</th>
                <th className="py-3">Message</th>
                <th className="py-3">When</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((i) => {
                const inv = db.users.find((u) => u.id === i.investorId);
                const land = db.lands.find((l) => l.id === i.landId);
                const farmer = land && db.users.find((u) => u.id === land.ownerId);
                return (
                  <tr key={i.id}>
                    <td className="py-3">
                      <p className="font-semibold text-ink">{inv?.name}</p>
                      <p className="text-[12px] text-muted">{inv?.phone}</p>
                    </td>
                    <td className="py-3">
                      {land ? (
                        <Link href={`/admin/lands/${land.id}`} className="text-brand hover:underline">
                          {land.title}
                        </Link>
                      ) : (
                        "—"
                      )}
                      <p className="text-[12px] text-muted">{land && inr(land.price)}</p>
                    </td>
                    <td className="py-3">{farmer?.name}</td>
                    <td className="max-w-[240px] truncate py-3 text-[12.5px] italic text-body">{i.message ?? "—"}</td>
                    <td className="py-3 text-[12.5px] text-muted">{timeAgo(i.createdAt)}</td>
                    <td className="py-3">
                      <InterestStatusSelect id={i.id} status={i.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}
