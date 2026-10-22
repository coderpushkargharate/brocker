import fs from "fs";
import path from "path";
import postgres from "postgres";
import { MongoClient, type AnyBulkWriteOperation } from "mongodb";

// records keep their own string id as _id
type Doc = { _id: string; [k: string]: unknown };
import type { DB } from "./types";
import { buildSeed } from "./seed";
import { normalizeLandType } from "./config";

/**
 * Storage for the whole app state.
 * - MONGODB_URI set (MongoDB Atlas): one collection per record type (users, lands, ...).
 * - DATABASE_URL / POSTGRES_URL set (Vercel Postgres / Neon / Supabase): stored in Postgres → works on Vercel.
 * - Otherwise: a JSON file in ./data (local development or a VPS).
 *   On Vercel without a database the file goes to /tmp, so the site loads but changes are temporary.
 */

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGODB_URL || "";
const MONGO_DB = process.env.MONGODB_DB || "agriland";
const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? "/tmp/agriland-data" : path.join(process.cwd(), "data"));
const FILE = path.join(DATA_DIR, "db.json");

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, "uploads");
export const usingMongo = Boolean(MONGO_URL);
export const usingPostgres = !usingMongo && Boolean(PG_URL);

type Cache = { db: DB | null; version: number; checkedAt: number; sql?: postgres.Sql; mongo?: Promise<MongoClient>; ready?: Promise<void> };
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

// ---------- MongoDB ----------
// Each list in DB is its own collection; a "meta" document holds the counters and a version number
// that goes up on every save, so concurrent saves can't overwrite each other.

const LISTS = ["users", "lands", "interests", "notifications", "calls", "enquiries", "views"] as const;
type ListName = (typeof LISTS)[number];
const META_ID = "state";

/** Stable document id for a record. Views have no id, so they get landId|time|n. */
function keysFor(name: ListName, items: unknown[]) {
  if (name !== "views") return items.map((i) => String((i as { id: string }).id));
  const seen = new Map<string, number>();
  return (items as DB["views"]).map((v) => {
    const k = `${v.landId}|${v.at}`;
    const n = seen.get(k) ?? 0;
    seen.set(k, n + 1);
    return `${k}|${n}`;
  });
}

function mongo() {
  cache.mongo ||= new MongoClient(MONGO_URL, { maxPoolSize: Number(process.env.MONGO_POOL_MAX) || 5, serverSelectionTimeoutMS: 15000 })
    .connect()
    .catch((e) => {
      cache.mongo = undefined;
      throw e;
    });
  return cache.mongo.then((c) => c.db(MONGO_DB));
}

/** First data to load into an empty database: the local JSON file if there is one, otherwise the demo seed. */
function initialData(): DB {
  try {
    if (fs.existsSync(FILE)) return JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
  } catch {
    // unreadable file – fall back to the seed
  }
  return buildSeed();
}

async function ensureMongo() {
  cache.ready ||= (async () => {
    const db = await mongo();
    const meta = db.collection<{ _id: string; version: number; counters: DB["counters"] }>("meta");
    if (await meta.findOne({ _id: META_ID })) return;
    const data = initialData();
    for (const name of LISTS) {
      const items = (data[name] ?? []) as unknown[];
      const keys = keysFor(name, items);
      if (items.length) await db.collection<Doc>(name).bulkWrite(items.map((it, i) => ({ replaceOne: { filter: { _id: keys[i] }, replacement: it as Doc, upsert: true } })) as AnyBulkWriteOperation<Doc>[]);
    }
    await db.collection("users").createIndex({ email: 1 });
    await db.collection("users").createIndex({ phone: 1 });
    await db.collection("lands").createIndex({ slug: 1 });
    // inserting meta last marks the import as finished; a parallel first run just loses the race
    await meta.insertOne({ _id: META_ID, version: 1, counters: data.counters ?? { landCode: 9900 } }).catch((e) => {
      if (e?.code !== 11000) throw e;
    });
  })().catch((e) => {
    cache.ready = undefined;
    throw e;
  });
  return cache.ready;
}

async function mongoLoad(): Promise<{ db: DB; version: number }> {
  const mdb = await mongo();
  const meta = await mdb.collection<{ _id: string; version: number; counters: DB["counters"] }>("meta").findOne({ _id: META_ID });
  const lists = await Promise.all(LISTS.map((n) => mdb.collection(n).find({}, { projection: { _id: 0 } }).toArray()));
  const db = Object.fromEntries(LISTS.map((n, i) => [n, lists[i]])) as unknown as DB;
  db.counters = meta?.counters ?? { landCode: 9900 };
  return { db, version: meta?.version ?? 0 };
}

async function mongoRead(): Promise<DB> {
  await ensureMongo();
  if (cache.db && Date.now() - cache.checkedAt < 1500) return cache.db;
  const meta = await (await mongo()).collection<{ _id: string; version: number }>("meta").findOne({ _id: META_ID }, { projection: { version: 1 } });
  if (!cache.db || meta?.version !== cache.version) {
    const { db, version } = await mongoLoad();
    cache.db = db;
    cache.version = version;
  }
  cache.checkedAt = Date.now();
  return cache.db!;
}

async function mongoMutate<T>(fn: (db: DB) => T): Promise<T> {
  await ensureMongo();
  const mdb = await mongo();
  const client = await cache.mongo!;
  for (let attempt = 0; attempt < 6; attempt++) {
    const { db, version } = await mongoLoad();
    const before = Object.fromEntries(LISTS.map((n) => {
      const items = (db[n] ?? []) as unknown[];
      const keys = keysFor(n, items);
      return [n, new Map(items.map((it, i) => [keys[i], JSON.stringify(it)]))];
    })) as Record<ListName, Map<string, string>>;

    const result = fn(db);

    // work out only what changed, so a save writes a few documents instead of everything
    const ops: [ListName, AnyBulkWriteOperation<Doc>[]][] = [];
    for (const n of LISTS) {
      const items = (db[n] ?? []) as unknown[];
      const keys = keysFor(n, items);
      const old = before[n];
      const list: AnyBulkWriteOperation<Doc>[] = [];
      items.forEach((it, i) => {
        if (old.get(keys[i]) !== JSON.stringify(it)) list.push({ replaceOne: { filter: { _id: keys[i] }, replacement: JSON.parse(JSON.stringify(it)), upsert: true } });
        old.delete(keys[i]);
      });
      for (const gone of old.keys()) list.push({ deleteOne: { filter: { _id: gone } } });
      if (list.length) ops.push([n, list]);
    }

    const session = client.startSession();
    let saved = false;
    try {
      await session.withTransaction(async () => {
        const r = await mdb.collection<{ _id: string; version: number }>("meta").updateOne({ _id: META_ID, version }, { $inc: { version: 1 }, $set: { counters: db.counters } }, { session });
        if (r.modifiedCount !== 1) {
          // someone else saved first – abort and retry with fresh data
          await session.abortTransaction();
          return;
        }
        for (const [n, list] of ops) await mdb.collection<Doc>(n).bulkWrite(list, { session, ordered: false });
        saved = true;
      });
    } finally {
      await session.endSession();
    }
    if (saved) {
      cache.db = db;
      cache.version = version + 1;
      cache.checkedAt = Date.now();
      return result;
    }
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
  const db = usingMongo ? await mongoRead() : usingPostgres ? await pgRead() : fileRead();
  upgrade(db);
  return db;
}

/** Apply a change and save it. */
export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  if (usingMongo) return mongoMutate((db) => {
    upgrade(db);
    return fn(db);
  });
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
