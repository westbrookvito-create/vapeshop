import { Router } from "express";
import { db } from "../db.js";
import { notifyNewOrder } from "../bot.js";

export const ordersRouter = Router();

const STATUSES = ["new", "confirmed", "processing", "shipped", "completed", "cancelled"];

ordersRouter.get("/", (req, res) => {
  const { userId, status } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM orders WHERE 1=1";
  const args: any[] = [];
  if (userId) {
    sql += " AND user_id = ?";
    args.push(Number(userId));
  }
  if (status) {
    sql += " AND status = ?";
    args.push(status);
  }
  sql += " ORDER BY id DESC";
  const rows = db.prepare(sql).all(...args) as any[];
  res.json(rows.map(formatOrder));
});

ordersRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: "not_found" });
  res.json(formatOrder(row));
});

ordersRouter.post("/", (req, res) => {
  const b = req.body;
  const info = db.prepare(`
    INSERT INTO orders (user_id, user_name, user_username, items, subtotal, discount, total, status, delivery_method, address, payment_method, promo_code, comment)
    VALUES (@user_id, @user_name, @user_username, @items, @subtotal, @discount, @total, 'new', @delivery_method, @address, @payment_method, @promo_code, @comment)
  `).run({
    user_id: b.userId,
    user_name: b.userName || "",
    user_username: b.userUsername || "",
    items: JSON.stringify(b.items || []),
    subtotal: b.subtotal,
    discount: b.discount || 0,
    total: b.total,
    delivery_method: b.deliveryMethod || "delivery",
    address: b.address || "",
    payment_method: b.paymentMethod || "card",
    promo_code: b.promoCode || "",
    comment: b.comment || "",
  });

  if (b.promoCode) {
    db.prepare("UPDATE promo_codes SET used_count = used_count + 1 WHERE code = ?").run(b.promoCode);
  }

  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(info.lastInsertRowid);
  const order = formatOrder(row);
  notifyNewOrder(order).catch(() => {});
  res.status(201).json(order);
});

ordersRouter.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: "invalid_status" });
  const existing = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "not_found" });
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  res.json(formatOrder(row));
});

function formatOrder(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userUsername: row.user_username,
    items: JSON.parse(row.items || "[]"),
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    status: row.status,
    deliveryMethod: row.delivery_method,
    address: row.address,
    paymentMethod: row.payment_method,
    promoCode: row.promo_code,
    comment: row.comment,
    createdAt: row.created_at,
  };
}
