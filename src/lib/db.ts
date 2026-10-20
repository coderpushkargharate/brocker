import fs from "fs";
import path from "path";
import type { DB } from "./types";
import { buildSeed } from "./seed";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "db.json");

type Cache = { db: DB | null; mtime: number };
const g = globalThis as unknown as { __agriDb?: Cache };
const cache: Cache = (g.__agriDb ||= { db: null, mtime: 0 });

function writeFile(db: DB) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = FILE + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE);
  cache.db = db;
  cache.mtime = fs.statSync(FILE).mtimeMs;
}

/** Read the whole database (cached, reloaded when the file changes). */
export function readDB(): DB {
  if (!fs.existsSync(FILE)) {
    writeFile(buildSeed());
    return cache.db!;
  }
  const mtime = fs.statSync(FILE).mtimeMs;
  if (!cache.db || mtime !== cache.mtime) {
    cache.db = JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
    cache.mtime = mtime;
  }
  return cache.db;
}

let queue: Promise<unknown> = Promise.resolve();

/** Apply a change to the database and save it. Writes run one at a time. */
export function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(() => {
    const db = structuredClone(readDB());
    const result = fn(db);
    writeFile(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export function newId() {
  return crypto.randomUUID();
}

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, "uploads");
