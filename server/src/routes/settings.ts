import { Router } from "express";
import { db } from "../db.js";

export const settingsRouter = Router();

settingsRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM settings").all() as { key: string; value: string }[];
  const obj: Record<string, string> = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

settingsRouter.put("/", (req, res) => {
  const upsert = db.prepare(`
    INSERT INTO settings (key, value) VALUES (@key, @value)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  const tx = db.transaction((entries: [string, string][]) => {
    for (const [key, value] of entries) upsert.run({ key, value: String(value) });
  });
  tx(Object.entries(req.body || {}));
  const rows = db.prepare("SELECT * FROM settings").all() as { key: string; value: string }[];
  const obj: Record<string, string> = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});
