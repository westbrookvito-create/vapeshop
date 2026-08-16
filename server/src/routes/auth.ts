import { Router } from "express";
import { parseInitData, isAdminUser } from "../auth.js";
import { db } from "../db.js";

export const authRouter = Router();

authRouter.post("/verify", (req, res) => {
  const { initData } = req.body as { initData: string };
  const { user, valid } = parseInitData(initData || "");

  if (!user) {
    return res.status(400).json({ error: "no_user" });
  }

  const existing = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(user.id) as any;
  if (existing) {
    db.prepare("UPDATE users SET first_name=?, last_name=?, username=? WHERE telegram_id=?").run(
      user.first_name || existing.first_name,
      user.last_name || existing.last_name,
      user.username || existing.username,
      user.id
    );
  } else {
    db.prepare("INSERT INTO users (telegram_id, first_name, last_name, username) VALUES (?, ?, ?, ?)").run(
      user.id, user.first_name || "", user.last_name || "", user.username || ""
    );
  }
  const row = db.prepare("SELECT * FROM users WHERE telegram_id = ?").get(user.id) as any;

  res.json({
    valid,
    isAdmin: isAdminUser(user.id),
    user: {
      telegramId: row.telegram_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      bonusPoints: row.bonus_points,
      isBanned: !!row.is_banned,
    },
  });
});
