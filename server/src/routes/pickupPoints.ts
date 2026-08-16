import { Router } from "express";
import { db } from "../db.js";

export const pickupPointsRouter = Router();

function formatPoint(row: any) {
  return { id: row.id, name: row.name, address: row.address, hours: row.hours, isActive: !!row.is_active };
}

pickupPointsRouter.get("/", (req, res) => {
  const { active } = req.query as Record<string, string | undefined>;
  const sql = active === "all" ? "SELECT * FROM pickup_points ORDER BY id" : "SELECT * FROM pickup_points WHERE is_active = 1 ORDER BY id";
  const rows = db.prepare(sql).all() as any[];
  res.json(rows.map(formatPoint));
});

pickupPointsRouter.post("/", (req, res) => {
  const { name, address, hours } = req.body;
  if (!name || !address) return res.status(400).json({ error: "name_and_address_required" });
  const info = db.prepare("INSERT INTO pickup_points (name, address, hours, is_active) VALUES (?, ?, ?, 1)").run(name, address, hours || "");
  const row = db.prepare("SELECT * FROM pickup_points WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(formatPoint(row));
});

pickupPointsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM pickup_points WHERE id = ?").get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: "not_found" });
  const name = req.body.name ?? existing.name;
  const address = req.body.address ?? existing.address;
  const hours = req.body.hours ?? existing.hours;
  const isActive = req.body.isActive !== undefined ? (req.body.isActive ? 1 : 0) : existing.is_active;
  db.prepare("UPDATE pickup_points SET name=?, address=?, hours=?, is_active=? WHERE id=?").run(name, address, hours, isActive, req.params.id);
  const row = db.prepare("SELECT * FROM pickup_points WHERE id = ?").get(req.params.id);
  res.json(formatPoint(row));
});

pickupPointsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM pickup_points WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
