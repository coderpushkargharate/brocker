import fs from "fs";
import path from "path";
import postgres from "postgres";
import type { DB } from "./types";
import { buildSeed } from "./seed";
import { normalizeLandType } from "./config";

/**
 * Storage for the whole app state.
 * - DATABASE_URL / POSTGRES_URL set (Vercel Postgres / Neon / Supabase): stored in Postgres → works on Vercel.
 * - Otherwise: a JSON file in ./data (local development or a VPS).
 *   On Vercel without a database the file goes to /tmp, so the site loads but changes are temporary.
 */

const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? "/tmp/agriland-data" : path.join(process.cwd(), "data"));
const FILE = path.join(DATA_DIR, "db.json");

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, "uploads");
export const usingPostgres = Boolean(PG_URL);

type Cache = { db: DB | null; version: number; checkedAt: number; sql?: postgres.Sql; ready?: Promise<void> };
const g = globalThis as unknown as { __agriDb?: Cache };
const cache: Cache = (g.__agriDb ||= { db: null, version: -1, checkedAt: 0 });

// ---------- Postgres ----------
function sql() {
  if (!cache.sql) {
    cache.sql = postgres(PG_URL, {
      ssl: /localhost|127\.0\.0\.1/.test(PG_URL) ? false : "require",
      max: Number(process.env.PG_POOL_MAX) || 3,
      idle_timeout: 20,
      prepare: false, // works with pgbouncer / Neon / Supabase poolers
    });
  }
  return cache.sql;
}

async function ensureTable() {
  cache.ready ||= (async () => {
    const s = sql();
    await s`create table if not exists agriland_state (id int primary key, data jsonb not null, version int not null default 0, updated_at timestamptz not null default now())`;
    const existing = await s`select 1 from agriland_state where id = 1`;
    // first run: fill the database with the demo data and the admin account
    if (existing.length === 0) await s`insert into agriland_state (id, data, version) values (1, ${s.json(buildSeed() as never)}, 1) on conflict (id) do nothing`;
  })().catch((e) => {
    cache.ready = undefined;
    throw e;
  });
  return cache.ready;
}

async function pgRead(): Promise<DB> {
  await ensureTable();
  const s = sql();
  // re-check the version at most every 1.5s; fetch the full data only when it changed
  if (cache.db && Date.now() - cache.checkedAt < 1500) return cache.db;
  const [{ version }] = await s<{ version: number }[]>`select version from agriland_state where id = 1`;
  if (!cache.db || version !== cache.version) {
    const [row] = await s<{ data: DB; version: number }[]>`select data, version from agriland_state where id = 1`;
    cache.db = row.data;
    cache.version = row.version;
  }
  cache.checkedAt = Date.now();
  return cache.db!;
}

async function pgMutate<T>(fn: (db: DB) => T): Promise<T> {
  await ensureTable();
  const s = sql();
  for (let attempt = 0; attempt < 6; attempt++) {
    const [row] = await s<{ data: DB; version: number }[]>`select data, version from agriland_state where id = 1`;
    const db = row.data;
    const result = fn(db);
    const updated = await s`update agriland_state set data = ${s.json(db as never)}, version = version + 1, updated_at = now() where id = 1 and version = ${row.version}`;
    if (updated.count === 1) {
      cache.db = db;
      cache.version = row.version + 1;
      cache.checkedAt = Date.now();
      return result;
    }
    // someone else saved at the same time – try again with fresh data
  }
  throw new Error("Could not save changes, please try again.");
}

// ---------- JSON file ----------
function fileWrite(db: DB) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = FILE + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, FILE);
  cache.db = db;
  cache.version = fs.statSync(FILE).mtimeMs;
}

function fileRead(): DB {
  if (!fs.existsSync(FILE)) {
    fileWrite(buildSeed());
    return cache.db!;
  }
  const mtime = fs.statSync(FILE).mtimeMs;
  if (!cache.db || mtime !== cache.version) {
    cache.db = JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
    cache.version = mtime;
  }
  return cache.db;
}

let queue: Promise<unknown> = Promise.resolve();

// ---------- public API ----------

/** Small in-place fixes so data saved by older versions still fits the current app. */
function upgrade(db: DB) {
  db.views ??= [];
  for (const l of db.lands) l.landType = normalizeLandType(l.landType);
  for (const u of db.users) if (u.preferences) u.preferences.landType = normalizeLandType(u.preferences.landType);
}

/** Read the whole database. Treat the result as read-only; use mutate() to change data. */
export async function readDB(): Promise<DB> {
  const db = usingPostgres ? await pgRead() : fileRead();
  upgrade(db);
  return db;
}

/** Apply a change and save it. */
export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  if (usingPostgres) return pgMutate((db) => {
    upgrade(db);
    return fn(db);
  });
  const run = queue.then(() => {
    const db = structuredClone(fileRead());
    upgrade(db);
    const result = fn(db);
    fileWrite(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export function newId() {
  return crypto.randomUUID();
}
