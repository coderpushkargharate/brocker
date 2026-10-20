import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { NotificationList, Panel } from "@/components/dashboard/Widgets";
import { MarkAllRead } from "@/components/dashboard/ClientWidgets";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser(undefined, "/dashboard/notifications");
  const notes = readDB()
    .notifications.filter((n) => n.userId === user.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const unread = notes.filter((n) => !n.read).length;
  return (
    <div className="container-dash max-w-[860px] pt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold text-ink">Notifications</h1>
          <p className="text-[15px] text-muted">{unread} unread</p>
        </div>
        {unread > 0 && <MarkAllRead />}
      </div>
      <Panel className="mt-6">
        <NotificationList items={notes} />
      </Panel>
    </div>
  );
}
