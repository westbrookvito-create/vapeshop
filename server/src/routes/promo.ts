import { Router } from "express";
import { db } from "../db.js";

export const promoRouter = Router();

promoRouter.get("/", (_req, res) => {
  const rows = db.prepare("SELECT * FROM promo_codes ORDER BY id DESC").all() as any[];
  res.json(rows.map(formatPromo));
});

promoRouter.post("/", (req, res) => {
  const { code, discountPercent, usageLimit } = req.body;
  try {
    const info = db.prepare(
      "INSERT INTO promo_codes (code, discount_percent, active, usage_limit, used_count) VALUES (?, ?, 1, ?, 0)"
    ).run(String(code).toUpperCase(), discountPercent, usageLimit || 0);
    const row = db.prepare("SELECT * FROM promo_codes WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(formatPromo(row));
  } catch (e) {
    res.status(400).json({ error: "code_exists" });
  }
});

promoRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM promo_codes WHERE id = ?").get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: "not_found" });
  const active = req.body.active !== undefined ? (req.body.active ? 1 : 0) : existing.active;
  const discount = req.body.discountPercent ?? existing.discount_percent;
  const limit = req.body.usageLimit ?? existing.usage_limit;
  db.prepare("UPDATE promo_codes SET active=?, discount_percent=?, usage_limit=? WHERE id=?").run(active, discount, limit, req.params.id);
  const row = db.prepare("SELECT * FROM promo_codes WHERE id = ?").get(req.params.id);
  res.json(formatPromo(row));
});

promoRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM promo_codes WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

promoRouter.post("/validate", (req, res) => {
  const code = String(req.body.code || "").toUpperCase();
  const row = db.prepare("SELECT * FROM promo_codes WHERE code = ?").get(code) as any;
  if (!row || !row.active) return res.status(404).json({ error: "invalid_code" });
  if (row.usage_limit > 0 && row.used_count >= row.usage_limit) {
    return res.status(400).json({ error: "limit_reached" });
  }
  res.json(formatPromo(row));
});

function formatPromo(row: any) {
  return {
    id: row.id,
    code: row.code,
    discountPercent: row.discount_percent,
    active: !!row.active,
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    createdAt: row.created_at,
  };
}
