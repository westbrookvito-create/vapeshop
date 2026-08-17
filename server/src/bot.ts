import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";
import { getAdminIds } from "./auth.js";
import { db } from "./db.js";
import { registerAdminHandlers, type BotContext } from "./botAdmin.js";

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || "";

export const bot = token ? new Bot<BotContext>(token) : null;

const WELCOME_TEXT =
  "Добро пожаловать в CloudBar Vape Shop.\n\n" +
  "Здесь вы найдёте одноразки, POD-системы, жидкости и аксессуары с быстрой доставкой.\n\n" +
  "Нажмите кнопку ниже, чтобы открыть каталог.";

const AGE_GATE_TEXT =
  "CloudBar Vape Shop продаёт никотинсодержащую продукцию.\n\n" +
  "Доступ к магазину разрешён только лицам старше 18 лет. Подтвердите свой возраст, чтобы продолжить.";

function isAgeConfirmed(telegramId: number): boolean {
  const row = db.prepare("SELECT age_confirmed FROM users WHERE telegram_id = ?").get(telegramId) as
    | { age_confirmed: number }
    | undefined;
  return !!row?.age_confirmed;
}

function upsertUserSeen(telegramId: number, firstName: string, lastName: string, username: string) {
  const existing = db.prepare("SELECT telegram_id FROM users WHERE telegram_id = ?").get(telegramId);
  if (existing) {
    db.prepare("UPDATE users SET first_name=?, last_name=?, username=? WHERE telegram_id=?").run(
      firstName,
      lastName,
      username,
      telegramId
    );
  } else {
    db.prepare("INSERT INTO users (telegram_id, first_name, last_name, username) VALUES (?, ?, ?, ?)").run(
      telegramId,
      firstName,
      lastName,
      username
    );
  }
}

function shopKeyboard() {
  return new InlineKeyboard().webApp("Открыть магазин", webAppUrl);
}

function ageGateKeyboard() {
  return new InlineKeyboard().text("Мне есть 18 лет", "age:yes").text("Мне нет 18 лет", "age:no");
}

if (bot) {
  bot.command("start", async (ctx) => {
    const id = ctx.from?.id;
    if (!id) return;
    upsertUserSeen(id, ctx.from?.first_name || "", ctx.from?.last_name || "", ctx.from?.username || "");

    if (isAgeConfirmed(id)) {
      await ctx.reply(WELCOME_TEXT, { reply_markup: shopKeyboard() });
    } else {
      await ctx.reply(AGE_GATE_TEXT, { reply_markup: ageGateKeyboard() });
    }
  });

  bot.callbackQuery("age:yes", async (ctx) => {
    const id = ctx.from.id;
    db.prepare("UPDATE users SET age_confirmed = 1 WHERE telegram_id = ?").run(id);
    await ctx.editMessageText(WELCOME_TEXT, { reply_markup: shopKeyboard() });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("age:no", async (ctx) => {
    await ctx.editMessageText(
      "Доступ к магазину закрыт: продажа никотинсодержащей продукции лицам младше 18 лет запрещена.\n\n" +
        "Если вы ошиблись, отправьте /start ещё раз."
    );
    await ctx.answerCallbackQuery();
  });

  registerAdminHandlers(bot);

  bot.catch((err) => {
    console.error("Bot error:", err);
  });
}

/** Sends a formatted order notification to all configured admin chat IDs. No-op if bot is not configured. */
export async function notifyNewOrder(order: {
  id: number;
  userName: string;
  userUsername: string;
  items: { name: string; qty: number; price: number; flavor?: string }[];
  total: number;
  deliveryMethod: string;
  address: string;
  pickupPoint?: { name: string; address: string } | null;
  pickupTime?: string | null;
  pickupCode?: string | null;
  paymentMethod: string;
}) {
  if (!bot) return;
  const lines = order.items.map((i) => `• ${i.name}${i.flavor ? ` (${i.flavor})` : ""} × ${i.qty} — ${i.price * i.qty}₽`);
  const deliveryLine =
    order.deliveryMethod === "delivery"
      ? `Доставка курьером: ${order.address}`
      : `Самовывоз: ${order.pickupPoint ? `${order.pickupPoint.name}, ${order.pickupPoint.address}` : order.address}${
          order.pickupTime ? ` · ${order.pickupTime}` : ""
        }`;
  const text =
    `Новый заказ #${order.id}\n\n` +
    `${lines.join("\n")}\n\n` +
    `Итого: ${order.total}₽\n` +
    `${deliveryLine}\n` +
    (order.pickupCode ? `Код выдачи: ${order.pickupCode}\n` : "") +
    `Оплата: ${order.paymentMethod === "card" ? "картой" : "наличными"}\n` +
    `Клиент: ${order.userName}${order.userUsername ? ` (@${order.userUsername})` : ""}`;
  const keyboard = new InlineKeyboard().text("Открыть заказ", `o:view:${order.id}`);

  for (const adminId of getAdminIds()) {
    try {
      await bot.api.sendMessage(adminId, text, { reply_markup: keyboard });
    } catch (e) {
      console.error(`Failed to notify admin ${adminId}:`, e);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!bot) {
    console.error("BOT_TOKEN is not set — cannot start bot polling.");
    process.exit(1);
  }
  bot.start();
  console.log("Bot started (long polling)...");
}
