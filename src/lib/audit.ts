import { newId } from "./db";
import type { DB } from "./types";

/** Record an important admin / publishing action. Keeps the newest 2000 entries. */
export function audit(db: DB, who: { id: string; name: string }, action: string, target: string) {
  db.auditLog ??= [];
  db.auditLog.push({ id: newId(), at: new Date().toISOString(), userId: who.id, userName: who.name, action, target: target.slice(0, 200) });
  if (db.auditLog.length > 2000) db.auditLog = db.auditLog.slice(-2000);
}
