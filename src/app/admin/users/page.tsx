import Link from "next/link";
import { BadgeCheck, Ban, Trash2 } from "lucide-react";
import { readDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { deleteUserAction, toggleBlockUserAction, toggleVerifyUserAction } from "@/app/actions/admin";
import { Box, PageTitle } from "@/components/admin/Bits";
import { ConfirmButton } from "@/components/admin/AdminNav";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { Avatar } from "@/components/Avatar";

export const metadata = { title: "Users" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const { role = "", q = "" } = await searchParams;
  const me = await getCurrentUser();
  const db = (await readDB());
  let users = [...db.users].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  if (role) users = users.filter((u) => u.role === role);
  if (q) users = users.filter((u) => `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageTitle title="Users" sub={`${db.users.length} registered users`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Box>
          <form className="flex flex-wrap gap-3">
            <input name="q" defaultValue={q} placeholder="Search name, email, phone…" className="input min-w-[200px] flex-1" />
            <select name="role" defaultValue={role} className="input w-auto">
              <option value="">All roles</option>
              <option value="farmer">Farmers</option>
              <option value="investor">Investors</option>
              <option value="admin">Admins</option>
            </select>
            <button className="btn btn-dark h-[42px] px-5">Filter</button>
          </form>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13.5px]">
              <thead className="border-b border-line text-[12px] uppercase text-muted">
                <tr>
                  <th className="py-3">User</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Location</th>
                  <th className="py-3">Activity</th>
                  <th className="py-3">Joined</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => {
                  const lands = db.lands.filter((l) => l.ownerId === u.id).length;
                  const ints = db.interests.filter((i) => i.investorId === u.id).length;
                  const self = u.id === me?.id;
                  return (
                    <tr key={u.id} className={u.blocked ? "opacity-60" : ""}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} name={u.name} size={36} />
                          <div>
                            <p className="font-semibold text-ink">
                              {u.name} {u.verified && <BadgeCheck className="inline h-4 w-4 text-brand" />}
                              {u.blocked && <span className="ml-1 text-[11px] text-[#dc2626]">(blocked)</span>}
                            </p>
                            <p className="text-[12px] text-muted">
                              {u.email} • {u.phone || "no phone"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 capitalize">{u.role}</td>
                      <td className="py-3">{u.district ?? u.city ?? "—"}</td>
                      <td className="py-3 text-[12.5px] text-muted">
                        {u.role === "farmer" ? (
                          <Link href={`/admin/lands?q=${encodeURIComponent(u.name)}`} className="text-brand hover:underline">
                            {lands} lands
                          </Link>
                        ) : u.role === "investor" ? (
                          `${ints} interests • ${u.saved.length} saved`
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 text-[12.5px] text-muted">{formatDate(u.createdAt)}</td>
                      <td className="py-3">
                        {!self && u.role !== "admin" && (
                          <div className="flex justify-end gap-1.5">
                            <form action={toggleVerifyUserAction.bind(null, u.id)}>
                              <button className="rounded-md border border-line px-2 py-1 text-[12px] hover:bg-mint-50">{u.verified ? "Unverify" : "Verify"}</button>
                            </form>
                            <form action={toggleBlockUserAction.bind(null, u.id)}>
                              <button className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-[12px] hover:bg-[#fef2f2]">
                                <Ban className="h-3.5 w-3.5" /> {u.blocked ? "Unblock" : "Block"}
                              </button>
                            </form>
                            <form action={deleteUserAction.bind(null, u.id)}>
                              <ConfirmButton message={`Delete ${u.name}? Their lands and interests will also be removed.`} className="rounded-md border border-line p-1 text-[#dc2626] hover:bg-[#fef2f2]">
                                <Trash2 className="h-4 w-4" />
                              </ConfirmButton>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Box>
        <Box className="h-fit">
          <h2 className="mb-3 text-[17px] font-semibold text-ink">Add User</h2>
          <CreateUserForm />
        </Box>
      </div>
    </>
  );
}
