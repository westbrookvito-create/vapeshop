import { Router } from "express";
import { db } from "../db.js";
import { notifyNewOrder } from "../bot.js";

export const ordersRouter = Router();

const STATUSES = ["new", "confirmed", "processing", "shipped", "completed", "cancelled"];

const SELECT_WITH_POINT = `
  SELECT o.*, pp.name as pickup_point_name, pp.address as pickup_point_address, pp.hours as pickup_point_hours
  FROM orders o LEFT JOIN pickup_points pp ON pp.id = o.pickup_point_id
`;

function generatePickupCode(): string {
  for (let i = 0; i < 20; i++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const clash = db
      .prepare("SELECT id FROM orders WHERE pickup_code = ? AND status NOT IN ('completed','cancelled')")
      .get(code);
    if (!clash) return code;
  }
  return String(Date.now()).slice(-6);
}

ordersRouter.get("/", (req, res) => {
  const { userId, status } = req.query as Record<string, string | undefined>;
  let sql = `${SELECT_WITH_POINT} WHERE 1=1`;
  const args: any[] = [];
  if (userId) {
    sql += " AND o.user_id = ?";
    args.push(Number(userId));
  }
  if (status) {
    sql += " AND o.status = ?";
    args.push(status);
  }
  sql += " ORDER BY o.id DESC";
  const rows = db.prepare(sql).all(...args) as any[];
  res.json(rows.map(formatOrder));
});

ordersRouter.get("/by-code/:code", (req, res) => {
  const row = db.prepare(`${SELECT_WITH_POINT} WHERE o.pickup_code = ?`).get(req.params.code.trim()) as any;
  if (!row) return res.status(404).json({ error: "not_found" });
  res.json(formatOrder(row));
});

ordersRouter.get("/:id", (req, res) => {
  const row = db.prepare(`${SELECT_WITH_POINT} WHERE o.id = ?`).get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: "not_found" });
  res.json(formatOrder(row));
});

ordersRouter.post("/", (req, res) => {
  const b = req.body;
  const isPickup = (b.deliveryMethod || "delivery") === "pickup";
  const info = db.prepare(`
    INSERT INTO orders (user_id, user_name, user_username, items, subtotal, discount, total, status, delivery_method, address, pickup_point_id, pickup_time, pickup_code, payment_method, promo_code, comment)
    VALUES (@user_id, @user_name, @user_username, @items, @subtotal, @discount, @total, 'new', @delivery_method, @address, @pickup_point_id, @pickup_time, @pickup_code, @payment_method, @promo_code, @comment)
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
    pickup_point_id: b.pickupPointId ?? null,
    pickup_time: isPickup ? b.pickupTime || "" : "",
    pickup_code: isPickup ? generatePickupCode() : null,
    payment_method: b.paymentMethod || "card",
    promo_code: b.promoCode || "",
    comment: b.comment || "",
  });

  if (b.promoCode) {
    db.prepare("UPDATE promo_codes SET used_count = used_count + 1 WHERE code = ?").run(b.promoCode);
  }

  const row = db.prepare(`${SELECT_WITH_POINT} WHERE o.id = ?`).get(info.lastInsertRowid);
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
  const row = db.prepare(`${SELECT_WITH_POINT} WHERE o.id = ?`).get(req.params.id);
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
    pickupPoint: row.pickup_point_id
      ? { id: row.pickup_point_id, name: row.pickup_point_name, address: row.pickup_point_address, hours: row.pickup_point_hours }
      : null,
    pickupTime: row.pickup_time || null,
    pickupCode: row.pickup_code || null,
    paymentMethod: row.payment_method,
    promoCode: row.promo_code,
    comment: row.comment,
    createdAt: row.created_at,
  };
}
