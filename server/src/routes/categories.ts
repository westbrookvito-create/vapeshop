import { Router } from "express";
import { db } from "../db.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", (_req, res) => {
  const rows = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
    FROM categories c ORDER BY sort_order ASC
  `).all() as any[];
  res.json(rows.map((r) => ({ id: r.id, name: r.name, icon: r.icon, sortOrder: r.sort_order, productCount: r.product_count })));
});

categoriesRouter.post("/", (req, res) => {
  const { name, icon, sortOrder } = req.body;
  const info = db.prepare("INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)").run(name, icon || "accessory", sortOrder ?? 0);
  res.status(201).json({ id: info.lastInsertRowid, name, icon, sortOrder: sortOrder ?? 0 });
});

categoriesRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: "not_found" });
  const name = req.body.name ?? existing.name;
  const icon = req.body.icon ?? existing.icon;
  const sortOrder = req.body.sortOrder ?? existing.sort_order;
  db.prepare("UPDATE categories SET name=?, icon=?, sort_order=? WHERE id=?").run(name, icon, sortOrder, req.params.id);
  res.json({ id: Number(req.params.id), name, icon, sortOrder });
});

categoriesRouter.delete("/:id", (req, res) => {
  const count = db.prepare("SELECT COUNT(*) as c FROM products WHERE category_id = ?").get(req.params.id) as { c: number };
  if (count.c > 0) return res.status(400).json({ error: "category_has_products" });
  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.status(204).end();
});
