import type { DB } from "./types";

const DAY = 86400_000;

export function within(iso: string, fromDays: number, toDays = 0) {
  const t = Date.now() - new Date(iso).getTime();
  return t >= toDays * DAY && t < fromDays * DAY;
}

function pct(cur: number, prev: number) {
  if (!prev) return cur ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

/** Last 30 days vs the 30 days before, for a set of lands. */
export function performance(db: DB, landIds: string[]) {
  const ids = new Set(landIds);
  const views = (db.views ?? []).filter((v) => ids.has(v.landId));
  const ints = db.interests.filter((i) => ids.has(i.landId));
  const calls = db.calls.filter((c) => ids.has(c.landId));
  const msgs = ints.filter((i) => i.message);
  const m = <T extends { createdAt?: string; at?: string }>(arr: T[], from: number, to: number) => arr.filter((x) => within((x.createdAt ?? x.at)!, from, to)).length;
  const row = <T extends { createdAt?: string; at?: string }>(arr: T[]) => {
    const cur = m(arr, 30, 0);
    return { value: cur, change: pct(cur, m(arr, 60, 30)), week: m(arr, 7, 0) };
  };
  return { views: row(views), interests: row(ints), calls: row(calls), messages: row(msgs) };
}
