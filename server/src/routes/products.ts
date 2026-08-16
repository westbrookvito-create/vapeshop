import { Router } from "express";
import { db } from "../db.js";

export const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  const { category, search, featured, active } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM products WHERE 1=1";
  const args: any[] = [];

  if (active !== "all") {
    sql += " AND is_active = 1";
  }
  if (category) {
    sql += " AND category_id = ?";
    args.push(Number(category));
  }
  if (search) {
    sql += " AND (name LIKE ? OR brand LIKE ? OR flavor LIKE ?)";
    const like = `%${search}%`;
    args.push(like, like, like);
  }
  if (featured === "1") {
    sql += " AND is_featured = 1";
  }
  sql += " ORDER BY is_featured DESC, id DESC";

  const rows = db.prepare(sql).all(...args) as any[];
  res.json(rows.map(formatProduct));
});

productsRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: "not_found" });
  res.json(formatProduct(row));
});

productsRouter.post("/", (req, res) => {
  const b = req.body;
  const stmt = db.prepare(`
    INSERT INTO products (category_id, name, brand, description, price, old_price, stock, rating, reviews_count, nicotine, flavor, puffs, gradient, emoji, is_featured, is_new, is_active)
    VALUES (@category_id, @name, @brand, @description, @price, @old_price, @stock, @rating, @reviews_count, @nicotine, @flavor, @puffs, @gradient, @emoji, @is_featured, @is_new, @is_active)
  `);
  const info = stmt.run({
    category_id: b.category_id,
    name: b.name,
    brand: b.brand || "",
    description: b.description || "",
    price: b.price,
    old_price: b.old_price ?? null,
    stock: b.stock ?? 0,
    rating: b.rating ?? 4.5,
    reviews_count: b.reviews_count ?? 0,
    nicotine: JSON.stringify(b.nicotine ?? []),
    flavor: b.flavor || "",
    puffs: b.puffs ?? null,
    gradient: b.gradient || "linear-gradient(135deg,#7b2ff7,#f107a3)",
    emoji: b.emoji || "💨",
    is_featured: b.is_featured ? 1 : 0,
    is_new: b.is_new ? 1 : 0,
    is_active: b.is_active === false ? 0 : 1,
  });
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(formatProduct(row));
});

productsRouter.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: "not_found" });
  const b = req.body;
  const merged = {
    category_id: b.category_id ?? existing.category_id,
    name: b.name ?? existing.name,
    brand: b.brand ?? existing.brand,
    description: b.description ?? existing.description,
    price: b.price ?? existing.price,
    old_price: b.old_price !== undefined ? b.old_price : existing.old_price,
    stock: b.stock ?? existing.stock,
    rating: b.rating ?? existing.rating,
    reviews_count: b.reviews_count ?? existing.reviews_count,
    nicotine: b.nicotine ? JSON.stringify(b.nicotine) : existing.nicotine,
    flavor: b.flavor ?? existing.flavor,
    puffs: b.puffs !== undefined ? b.puffs : existing.puffs,
    gradient: b.gradient ?? existing.gradient,
    emoji: b.emoji ?? existing.emoji,
    is_featured: b.is_featured !== undefined ? (b.is_featured ? 1 : 0) : existing.is_featured,
    is_new: b.is_new !== undefined ? (b.is_new ? 1 : 0) : existing.is_new,
    is_active: b.is_active !== undefined ? (b.is_active ? 1 : 0) : existing.is_active,
    id: req.params.id,
  };
  db.prepare(`
    UPDATE products SET category_id=@category_id, name=@name, brand=@brand, description=@description,
      price=@price, old_price=@old_price, stock=@stock, rating=@rating, reviews_count=@reviews_count,
      nicotine=@nicotine, flavor=@flavor, puffs=@puffs, gradient=@gradient, emoji=@emoji,
      is_featured=@is_featured, is_new=@is_new, is_active=@is_active
    WHERE id=@id
  `).run(merged);
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json(formatProduct(row));
});

productsRouter.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

function formatProduct(row: any) {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    brand: row.brand,
    description: row.description,
    price: row.price,
    oldPrice: row.old_price,
    stock: row.stock,
    rating: row.rating,
    reviewsCount: row.reviews_count,
    nicotine: JSON.parse(row.nicotine || "[]"),
    flavor: row.flavor,
    puffs: row.puffs,
    gradient: row.gradient,
    emoji: row.emoji,
    isFeatured: !!row.is_featured,
    isNew: !!row.is_new,
    isActive: !!row.is_active,
    createdAt: row.created_at,
  };
}
