import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";
import { getAdminIds } from "./auth.js";

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || "";

export const bot = token ? new Bot(token) : null;

if (bot) {
  bot.command("start", async (ctx) => {
    const keyboard = new InlineKeyboard().webApp("Открыть магазин", webAppUrl);
    await ctx.reply(
      "Добро пожаловать в CloudBar Vape Shop.\n\n" +
        "Здесь вы найдёте одноразки, POD-системы, жидкости и аксессуары с быстрой доставкой.\n\n" +
        "Нажмите кнопку ниже, чтобы открыть каталог.",
      { reply_markup: keyboard }
    );
  });

  bot.command("admin", async (ctx) => {
    const id = ctx.from?.id;
    if (!id || !getAdminIds().includes(id)) {
      return ctx.reply("У вас нет доступа к админ-панели.");
    }
    const keyboard = new InlineKeyboard().webApp("Админ-панель", `${webAppUrl}?admin=1`);
    await ctx.reply("Открыть панель управления магазином:", { reply_markup: keyboard });
  });

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
  paymentMethod: string;
}) {
  if (!bot) return;
  const lines = order.items.map((i) => `• ${i.name}${i.flavor ? ` (${i.flavor})` : ""} × ${i.qty} — ${i.price * i.qty}₽`);
  const text =
    `Новый заказ #${order.id}\n\n` +
    `${lines.join("\n")}\n\n` +
    `Итого: ${order.total}₽\n` +
    `Доставка: ${order.deliveryMethod === "delivery" ? "курьером" : "самовывоз"}\n` +
    `Оплата: ${order.paymentMethod === "card" ? "картой" : "наличными"}\n` +
    `Клиент: ${order.userName}${order.userUsername ? ` (@${order.userUsername})` : ""}`;

  for (const adminId of getAdminIds()) {
    try {
      await bot.api.sendMessage(adminId, text);
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
