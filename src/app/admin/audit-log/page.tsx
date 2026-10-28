import { readDB } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/format";
import { Box, PageTitle } from "@/components/admin/Bits";

export const metadata = { title: "Audit Log" };

export default async function AuditLog() {
  const db = await readDB();
  const rows = [...db.auditLog].reverse().slice(0, 300);
  return (
    <>
      <PageTitle title="Audit Log" sub="Recent publishing and account actions by admins (newest first, last 300)." />
      <Box>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-[14.5px] text-muted">Nothing recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13.5px]">
              <thead className="border-b border-line text-[12px] uppercase text-muted">
                <tr>
                  <th className="py-3">When</th>
                  <th className="py-3">Who</th>
                  <th className="py-3">Action</th>
                  <th className="py-3">Item</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 text-muted" title={formatDate(r.at)}>
                      {timeAgo(r.at)}
                    </td>
                    <td className="py-2.5 text-ink">{r.userName}</td>
                    <td className="py-2.5">
                      <code className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[12px]">{r.action}</code>
                    </td>
                    <td className="py-2.5 text-body">{r.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Box>
    </>
  );
}
