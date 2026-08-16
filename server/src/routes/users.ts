import { Router } from "express";
import { db } from "../db.js";

export const usersRouter = Router();

usersRouter.get("/", (req, res) => {
  const { search } = req.query as Record<string, string | undefined>;
  let sql = "SELECT * FROM users WHERE 1=1";
  const args: any[] = [];
  if (search) {
    sql += " AND (first_name LIKE ? OR last_name LIKE ? OR username LIKE ?)";
    const like = `%${search}%`;
    args.push(like, like, like);
  }
  sql += " ORDER BY created_at DESC";
  const rows = db.prepare(sql).all(...args) as any[];
  const withStats = rows.map((r) => {
    const orderStats = db.prepare("SELECT COUNT(*) as c, COALESCE(SUM(total),0) as s FROM orders WHERE user_id = ?").get(r.telegram_id) as any;
    return formatUser(r, orderStats.c, orderStats.s);
  });
  res.json(withStats);
});

usersRouter.post("/upsert", (req, res) => {
  const b = req.body;
  const existing = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(b.telegramId) as any;
  if (existing) {
    db.prepare("UPDATE users SET first_name=?, last_name=?, username=? WHERE telegram_id=?").run(
      b.firstName || existing.first_name, b.lastName || existing.last_name, b.username || existing.username, b.telegramId
    );
  } else {
    db.prepare("INSERT INTO users (telegram_id, first_name, last_name, username) VALUES (?, ?, ?, ?)").run(
      b.telegramId, b.firstName || "", b.lastName || "", b.username || ""
    );
  }
  const row = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(b.telegramId) as any;
  res.json(formatUser(row, 0, 0));
});

usersRouter.patch("/:telegramId/ban", (req, res) => {
  const banned = req.body.banned ? 1 : 0;
  db.prepare("UPDATE users SET is_banned = ? WHERE telegram_id = ?").run(banned, req.params.telegramId);
  res.status(204).end();
});

function formatUser(row: any, ordersCount: number, ordersTotal: number) {
  return {
    telegramId: row.telegram_id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    phone: row.phone,
    bonusPoints: row.bonus_points,
    isBanned: !!row.is_banned,
    createdAt: row.created_at,
    ordersCount,
    ordersTotal,
  };
}
