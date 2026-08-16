import { Router } from "express";
import { db } from "../db.js";

export const statsRouter = Router();

statsRouter.get("/overview", (_req, res) => {
  const revenue = db.prepare("SELECT COALESCE(SUM(total),0) as v FROM orders WHERE status != 'cancelled'").get() as any;
  const ordersCount = db.prepare("SELECT COUNT(*) as v FROM orders").get() as any;
  const newOrders = db.prepare("SELECT COUNT(*) as v FROM orders WHERE status = 'new'").get() as any;
  const customersCount = db.prepare("SELECT COUNT(*) as v FROM users").get() as any;
  const avgOrder = db.prepare("SELECT COALESCE(AVG(total),0) as v FROM orders WHERE status != 'cancelled'").get() as any;
  const lowStock = db.prepare("SELECT COUNT(*) as v FROM products WHERE stock <= 10 AND is_active = 1").get() as any;

  const byDay = db.prepare(`
    SELECT date(created_at) as day, COALESCE(SUM(total),0) as revenue, COUNT(*) as orders
    FROM orders
    WHERE created_at >= date('now', '-13 days')
    GROUP BY day ORDER BY day ASC
  `).all();

  const byStatus = db.prepare(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`).all();

  // Aggregate top products in JS (items are stored as a JSON blob per order)
  const orders = db.prepare("SELECT items FROM orders WHERE status != 'cancelled'").all() as any[];
  const productAgg = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    const items = JSON.parse(o.items || "[]");
    for (const it of items) {
      const key = it.name;
      const prev = productAgg.get(key) || { name: it.name, qty: 0, revenue: 0 };
      prev.qty += it.qty;
      prev.revenue += it.qty * it.price;
      productAgg.set(key, prev);
    }
  }
  const top = [...productAgg.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const byCategory = db.prepare(`
    SELECT c.name as category, COUNT(p.id) as count
    FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
    GROUP BY c.id ORDER BY c.sort_order
  `).all();

  res.json({
    revenue: revenue.v,
    ordersCount: ordersCount.v,
    newOrders: newOrders.v,
    customersCount: customersCount.v,
    avgOrder: Math.round(avgOrder.v),
    lowStockCount: lowStock.v,
    byDay,
    byStatus,
    topProducts: top,
    byCategory,
  });
});
