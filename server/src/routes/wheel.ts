import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { WHEEL_SEGMENTS, pickWeightedSegment } from "../wheel.js";

export const wheelRouter = Router();

const MIN_ORDERS = 3;

function getOrdersCount(telegramId: number): number {
  const row = db.prepare("SELECT COUNT(*) as c FROM orders WHERE user_id = ? AND status != 'cancelled'").get(telegramId) as { c: number };
  return row.c;
}

function formatSpin(row: any) {
  const segment = WHEEL_SEGMENTS[row.segment_index];
  return {
    segmentIndex: row.segment_index,
    type: row.prize_type,
    value: row.prize_value,
    label: segment?.label ?? "",
    promoCode: row.promo_code || null,
    spunAt: row.spun_at,
  };
}

wheelRouter.get("/:telegramId", (req, res) => {
  const telegramId = Number(req.params.telegramId);
  const ordersCount = getOrdersCount(telegramId);
  const existing = db.prepare("SELECT * FROM wheel_spins WHERE telegram_id = ?").get(telegramId) as any;
  res.json({
    ordersCount,
    ordersRequired: MIN_ORDERS,
    eligible: ordersCount >= MIN_ORDERS,
    spun: !!existing,
    prize: existing ? formatSpin(existing) : null,
    segments: WHEEL_SEGMENTS.map((s) => ({ type: s.type, value: s.value, label: s.label })),
  });
});

wheelRouter.post("/:telegramId/spin", (req, res) => {
  const telegramId = Number(req.params.telegramId);
  const ordersCount = getOrdersCount(telegramId);
  if (ordersCount < MIN_ORDERS) {
    return res.status(400).json({ error: "not_eligible" });
  }
  const existing = db.prepare("SELECT * FROM wheel_spins WHERE telegram_id = ?").get(telegramId);
  if (existing) {
    return res.status(400).json({ error: "already_spun" });
  }

  const index = pickWeightedSegment();
  const segment = WHEEL_SEGMENTS[index];
  let promoCode: string | null = null;

  if (segment.type === "discount") {
    promoCode = `LUCKY${telegramId}${nanoid(4).toUpperCase()}`;
    db.prepare("INSERT INTO promo_codes (code, discount_percent, active, usage_limit, used_count) VALUES (?, ?, 1, 1, 0)").run(
      promoCode,
      segment.value
    );
  } else if (segment.type === "points") {
    db.prepare("UPDATE users SET bonus_points = bonus_points + ? WHERE telegram_id = ?").run(segment.value, telegramId);
  }

  db.prepare(
    "INSERT INTO wheel_spins (telegram_id, segment_index, prize_type, prize_value, promo_code) VALUES (?, ?, ?, ?, ?)"
  ).run(telegramId, index, segment.type, segment.value, promoCode);

  const row = db.prepare("SELECT * FROM wheel_spins WHERE telegram_id = ?").get(telegramId);
  res.status(201).json(formatSpin(row));
});
