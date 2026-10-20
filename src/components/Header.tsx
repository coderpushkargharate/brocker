import { getCurrentUser } from "@/lib/auth";
import { readDB } from "@/lib/db";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const user = await getCurrentUser();
  const unread = user ? readDB().notifications.filter((n) => n.userId === user.id && !n.read).length : 0;
  return <HeaderClient user={user ? { name: user.name, role: user.role, avatar: user.avatar } : null} unread={unread} />;
}
