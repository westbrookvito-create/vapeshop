import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "vapeshop.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  old_price INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 4.5,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  nicotine TEXT NOT NULL DEFAULT '[]',
  flavor TEXT NOT NULL DEFAULT '',
  puffs INTEGER,
  color TEXT NOT NULL DEFAULT '#3c6449',
  image TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  telegram_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  bonus_points INTEGER NOT NULL DEFAULT 0,
  is_banned INTEGER NOT NULL DEFAULT 0,
  age_confirmed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pickup_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  hours TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  user_username TEXT NOT NULL DEFAULT '',
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  delivery_method TEXT NOT NULL DEFAULT 'delivery',
  address TEXT NOT NULL DEFAULT '',
  pickup_point_id INTEGER REFERENCES pickup_points(id),
  pickup_time TEXT NOT NULL DEFAULT '',
  pickup_code TEXT,
  payment_method TEXT NOT NULL DEFAULT 'card',
  promo_code TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  usage_limit INTEGER NOT NULL DEFAULT 0,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wheel_spins (
  telegram_id INTEGER PRIMARY KEY,
  segment_index INTEGER NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value INTEGER NOT NULL,
  promo_code TEXT,
  spun_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

`);

// Lightweight migrations for databases created before these columns existed.
for (const stmt of [
  "ALTER TABLE users ADD COLUMN age_confirmed INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE orders ADD COLUMN pickup_time TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN pickup_code TEXT",
]) {
  try {
    db.exec(stmt);
  } catch {
    // column already exists
  }
}

db.exec("CREATE INDEX IF NOT EXISTS idx_orders_pickup_code ON orders(pickup_code);");

export function seedIfEmpty() {
  const row = db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
  return row.c === 0;
}
