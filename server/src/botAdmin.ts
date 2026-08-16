import type { Bot, Context, SessionFlavor } from "grammy";
import { InlineKeyboard, session } from "grammy";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { getAdminIds } from "./auth.js";
import { uploadsDir } from "./routes/upload.js";

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8787}`;
const token = process.env.BOT_TOKEN || "";

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  processing: "В обработке",
  shipped: "В пути",
  completed: "Выполнен",
  cancelled: "Отменён",
};
const STATUS_FLOW = ["new", "confirmed", "processing", "shipped", "completed", "cancelled"];
const NICOTINE_ALL = [0, 3, 6, 20, 35, 50];
const PAGE_SIZE = 6;

type Product = {
  id: number; categoryId: number; name: string; brand: string; description: string; price: number;
  oldPrice: number | null; stock: number; nicotine: number[]; flavor: string; puffs: number | null;
  color: string; image: string | null; isFeatured: boolean; isNew: boolean; isActive: boolean;
};
type Category = { id: number; name: string; icon: string };
type Order = {
  id: number; userName: string; userUsername: string; items: { name: string; qty: number; price: number; flavor?: string }[];
  subtotal: number; discount: number; total: number; status: string; deliveryMethod: string; address: string;
  pickupPoint: { id: number; name: string; address: string; hours: string } | null;
  paymentMethod: string; promoCode: string; comment: string; createdAt: string;
};
type PromoCode = { id: number; code: string; discountPercent: number; active: boolean; usageLimit: number; usedCount: number };
type PickupPoint = { id: number; name: string; address: string; hours: string; isActive: boolean };

type WizardStep =
  | "photo" | "name" | "brand" | "category" | "price" | "old_price" | "stock"
  | "flavor" | "nicotine" | "puffs" | "description" | "confirm";

type AddProductState = {
  step: WizardStep;
  data: {
    image: string | null;
    name?: string;
    brand?: string;
    category_id?: number;
    price?: number;
    old_price?: number | null;
    stock?: number;
    flavor?: string;
    nicotine: number[];
    puffs?: number | null;
    description?: string;
  };
};

type PromoWizardStep = "code" | "discount" | "limit";
type AddPromoState = { step: PromoWizardStep; data: { code?: string; discountPercent?: number; usageLimit?: number } };

const CATEGORY_ICON_KEYS = ["disposable", "pod", "liquid", "salt", "cartridge", "accessory"];
type AddCategoryState = { step: "name" | "icon"; data: { name?: string } };
type RenameCategoryState = { categoryId: number };

type AddPointState = { step: "name" | "address" | "hours"; data: { name?: string; address?: string } };

interface SessionData {
  addProduct?: AddProductState;
  editPhoto?: { productId: number };
  addPromo?: AddPromoState;
  addCategory?: AddCategoryState;
  renameCategory?: RenameCategoryState;
  addPoint?: AddPointState;
}

export type BotContext = Context & SessionFlavor<SessionData>;

async function api<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${endpoint}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`API ${endpoint} failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function isAdmin(ctx: BotContext): boolean {
  const id = ctx.from?.id;
  return !!id && getAdminIds().includes(id);
}

function money(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n) + "₽";
}

async function downloadTelegramPhoto(ctx: BotContext, fileId: string): Promise<string> {
  const file = await ctx.api.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `${nanoid(12)}.jpg`;
  fs.writeFileSync(path.join(uploadsDir, filename), buf);
  return `/uploads/${filename}`;
}

function mainMenuKeyboard() {
  const kb = new InlineKeyboard()
    .text("Товары", "m:products").text("Заказы", "m:orders")
    .row()
    .text("Добавить товар", "m:addproduct")
    .row()
    .text("Категории", "m:categories").text("Точки самовывоза", "m:points")
    .row()
    .text("Промокоды", "m:promo").text("Статистика", "m:stats");
  return kb;
}

function backButton(target: string) {
  return new InlineKeyboard().text("Назад", target);
}

// ---------- Products ----------

async function renderProductList(page: number) {
  const products = await api<Product[]>("/products?active=all");
  const start = page * PAGE_SIZE;
  const slice = products.slice(start, start + PAGE_SIZE);
  const kb = new InlineKeyboard();
  for (const p of slice) {
    kb.text(`${p.isActive ? "" : "[скрыт] "}${p.name} — ${money(p.price)}`, `p:view:${p.id}`).row();
  }
  const navRow: [string, string][] = [];
  if (page > 0) navRow.push(["Назад", `p:list:${page - 1}`]);
  if (start + PAGE_SIZE < products.length) navRow.push(["Далее", `p:list:${page + 1}`]);
  if (navRow.length) {
    for (const [label, data] of navRow) kb.text(label, data);
    kb.row();
  }
  kb.text("В меню", "m:home");
  const text = products.length
    ? `Товары (${products.length}). Страница ${page + 1}.`
    : "Товаров пока нет.";
  return { text, kb };
}

async function renderProductDetail(id: number) {
  const p = await api<Product>(`/products/${id}`);
  const lines = [
    `${p.name}`,
    `Бренд: ${p.brand}`,
    `Цена: ${money(p.price)}${p.oldPrice ? ` (было ${money(p.oldPrice)})` : ""}`,
    `Остаток: ${p.stock} шт.`,
    p.flavor && p.flavor !== "—" ? `Вкус: ${p.flavor}` : null,
    p.nicotine.length ? `Никотин: ${p.nicotine.join(", ")} мг` : null,
    `Фото: ${p.image ? "загружено" : "нет — используется заглушка"}`,
    `Статус: ${p.isActive ? "показывается в каталоге" : "скрыт"}`,
  ].filter(Boolean);

  const kb = new InlineKeyboard()
    .text("Изменить фото", `p:photo:${p.id}`)
    .row()
    .text(p.isActive ? "Скрыть" : "Показать", `p:toggle:${p.id}`)
    .text("Удалить", `p:delete:${p.id}`)
    .row()
    .text("К списку товаров", "m:products");

  return { text: lines.join("\n"), kb };
}

// ---------- Orders ----------

async function renderOrderList(page: number) {
  const orders = await api<Order[]>("/orders");
  const start = page * PAGE_SIZE;
  const slice = orders.slice(start, start + PAGE_SIZE);
  const kb = new InlineKeyboard();
  for (const o of slice) {
    kb.text(`#${o.id} · ${STATUS_LABELS[o.status]} · ${money(o.total)}`, `o:view:${o.id}`).row();
  }
  const navRow: [string, string][] = [];
  if (page > 0) navRow.push(["Назад", `o:list:${page - 1}`]);
  if (start + PAGE_SIZE < orders.length) navRow.push(["Далее", `o:list:${page + 1}`]);
  if (navRow.length) {
    for (const [label, data] of navRow) kb.text(label, data);
    kb.row();
  }
  kb.text("В меню", "m:home");
  const text = orders.length ? `Заказы (${orders.length}). Страница ${page + 1}.` : "Заказов пока нет.";
  return { text, kb };
}

async function renderOrderDetail(id: number) {
  const o = await api<Order>(`/orders/${id}`);
  const items = o.items.map((i) => `• ${i.name}${i.flavor ? ` (${i.flavor})` : ""} × ${i.qty} — ${money(i.price * i.qty)}`);
  const lines = [
    `Заказ #${o.id} — ${STATUS_LABELS[o.status]}`,
    `Клиент: ${o.userName}${o.userUsername ? ` (@${o.userUsername})` : ""}`,
    "",
    ...items,
    "",
    `Сумма: ${money(o.subtotal)}`,
    o.discount > 0 ? `Скидка${o.promoCode ? ` (${o.promoCode})` : ""}: -${money(o.discount)}` : null,
    `Итого: ${money(o.total)}`,
    "",
    `${o.deliveryMethod === "delivery" ? "Доставка" : "Самовывоз"}: ${
      o.deliveryMethod === "pickup" && o.pickupPoint ? `${o.pickupPoint.name}, ${o.pickupPoint.address}` : o.address
    }`,
    `Оплата: ${o.paymentMethod === "card" ? "картой" : "наличными"}`,
    o.comment ? `Комментарий: ${o.comment}` : null,
  ].filter(Boolean);

  const kb = new InlineKeyboard();
  for (const s of STATUS_FLOW) {
    kb.text(`${o.status === s ? "> " : ""}${STATUS_LABELS[s]}`, `o:status:${o.id}:${s}`);
    if (STATUS_FLOW.indexOf(s) % 2 === 1) kb.row();
  }
  kb.row().text("К списку заказов", "m:orders");

  return { text: lines.join("\n"), kb };
}

// ---------- Promo ----------

async function renderPromoList() {
  const promos = await api<PromoCode[]>("/promo");
  const lines = promos.length
    ? promos.map((p) => `${p.code} — ${p.discountPercent}% · ${p.active ? "активен" : "выключен"} · использован ${p.usedCount}${p.usageLimit ? `/${p.usageLimit}` : ""} раз`)
    : ["Промокодов пока нет."];
  const kb = new InlineKeyboard().text("Создать промокод", "m:addpromo").row().text("В меню", "m:home");
  return { text: lines.join("\n"), kb };
}

// ---------- Categories ----------

async function renderCategoryList() {
  const categories = await api<(Category & { productCount: number })[]>("/categories");
  const kb = new InlineKeyboard();
  for (const c of categories) {
    kb.text(`${c.name} (${c.productCount})`, `c:view:${c.id}`).row();
  }
  kb.text("Добавить категорию", "m:addcategory").row().text("В меню", "m:home");
  const text = categories.length ? `Категории (${categories.length}):` : "Категорий пока нет.";
  return { text, kb };
}

async function renderCategoryDetail(id: number) {
  const categories = await api<(Category & { productCount: number })[]>("/categories");
  const c = categories.find((x) => x.id === id);
  if (!c) return { text: "Категория не найдена.", kb: backButton("m:categories") };
  const text = [`${c.name}`, `Иконка: ${c.icon}`, `Товаров: ${c.productCount}`].join("\n");
  const kb = new InlineKeyboard()
    .text("Переименовать", `c:rename:${c.id}`)
    .row()
    .text("Удалить", `c:delete:${c.id}`)
    .row()
    .text("К списку категорий", "m:categories");
  return { text, kb };
}

function categoryIconKeyboard() {
  const kb = new InlineKeyboard();
  CATEGORY_ICON_KEYS.forEach((key, i) => {
    kb.text(key, `wizcat:icon:${key}`);
    if (i % 2 === 1) kb.row();
  });
  return kb;
}

// ---------- Pickup points ----------

async function renderPointList() {
  const points = await api<PickupPoint[]>("/pickup-points?active=all");
  const kb = new InlineKeyboard();
  for (const p of points) {
    kb.text(`${p.isActive ? "" : "[выкл] "}${p.name}`, `pp:view:${p.id}`).row();
  }
  kb.text("Добавить точку", "m:addpoint").row().text("В меню", "m:home");
  const text = points.length ? `Точки самовывоза (${points.length}):` : "Точек пока нет.";
  return { text, kb };
}

async function renderPointDetail(id: number) {
  const points = await api<PickupPoint[]>("/pickup-points?active=all");
  const p = points.find((x) => x.id === id);
  if (!p) return { text: "Точка не найдена.", kb: backButton("m:points") };
  const text = [`${p.name}`, `Адрес: ${p.address}`, p.hours ? `Часы работы: ${p.hours}` : null, `Статус: ${p.isActive ? "активна" : "выключена"}`]
    .filter(Boolean)
    .join("\n");
  const kb = new InlineKeyboard()
    .text(p.isActive ? "Выключить" : "Включить", `pp:toggle:${p.id}`)
    .row()
    .text("Удалить", `pp:delete:${p.id}`)
    .row()
    .text("К списку точек", "m:points");
  return { text, kb };
}

// ---------- Registration ----------

export function registerAdminHandlers(bot: Bot<BotContext>) {
  bot.use(session({ initial: (): SessionData => ({}) }));

  const adminOnly = async (ctx: BotContext, next: () => Promise<void>) => {
    if (!isAdmin(ctx)) {
      if (ctx.callbackQuery) await ctx.answerCallbackQuery({ text: "Нет доступа", show_alert: true });
      else await ctx.reply("У вас нет доступа к админ-панели.");
      return;
    }
    await next();
  };

  bot.command("admin", adminOnly, async (ctx) => {
    ctx.session.addProduct = undefined;
    ctx.session.editPhoto = undefined;
    ctx.session.addPromo = undefined;
    await ctx.reply("Панель управления CloudBar Vape Shop:", { reply_markup: mainMenuKeyboard() });
  });

  bot.callbackQuery("m:home", adminOnly, async (ctx) => {
    ctx.session.addProduct = undefined;
    ctx.session.editPhoto = undefined;
    ctx.session.addPromo = undefined;
    await ctx.editMessageText("Панель управления CloudBar Vape Shop:", { reply_markup: mainMenuKeyboard() });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("m:products", adminOnly, async (ctx) => {
    const { text, kb } = await renderProductList(0);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^p:list:(\d+)$/, adminOnly, async (ctx) => {
    const page = Number(ctx.match![1]);
    const { text, kb } = await renderProductList(page);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^p:view:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const { text, kb } = await renderProductDetail(id);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^p:toggle:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const p = await api<Product>(`/products/${id}`);
    await api(`/products/${id}`, { method: "PUT", body: JSON.stringify({ is_active: !p.isActive }) });
    const { text, kb } = await renderProductDetail(id);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery({ text: p.isActive ? "Товар скрыт" : "Товар показан" });
  });

  bot.callbackQuery(/^p:delete:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const kb = new InlineKeyboard().text("Да, удалить", `p:delete:${id}:yes`).text("Отмена", `p:view:${id}`);
    await ctx.editMessageText("Удалить товар безвозвратно?", { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^p:delete:(\d+):yes$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    await api(`/products/${id}`, { method: "DELETE" });
    const { text, kb } = await renderProductList(0);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery({ text: "Товар удалён" });
  });

  bot.callbackQuery(/^p:photo:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    ctx.session.editPhoto = { productId: id };
    await ctx.reply("Отправьте новое фото товара одним сообщением.");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("m:orders", adminOnly, async (ctx) => {
    const { text, kb } = await renderOrderList(0);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^o:list:(\d+)$/, adminOnly, async (ctx) => {
    const page = Number(ctx.match![1]);
    const { text, kb } = await renderOrderList(page);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^o:view:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const { text, kb } = await renderOrderDetail(id);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^o:status:(\d+):(\w+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const status = ctx.match![2];
    await api(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    const { text, kb } = await renderOrderDetail(id);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery({ text: `Статус: ${STATUS_LABELS[status]}` });
  });

  bot.callbackQuery("m:stats", adminOnly, async (ctx) => {
    const s = await api<any>("/stats/overview");
    const text = [
      "Статистика магазина",
      "",
      `Выручка: ${money(s.revenue)}`,
      `Заказов всего: ${s.ordersCount}`,
      `Новых заказов: ${s.newOrders}`,
      `Клиентов: ${s.customersCount}`,
      `Средний чек: ${money(s.avgOrder)}`,
      `Товаров с низким остатком: ${s.lowStockCount}`,
    ].join("\n");
    await ctx.editMessageText(text, { reply_markup: backButton("m:home") });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("m:promo", adminOnly, async (ctx) => {
    const { text, kb } = await renderPromoList();
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("m:addpromo", adminOnly, async (ctx) => {
    ctx.session.addPromo = { step: "code", data: {} };
    await ctx.reply("Введите код промокода (например, SUMMER25):");
    await ctx.answerCallbackQuery();
  });

  // ---------- Categories ----------

  bot.callbackQuery("m:categories", adminOnly, async (ctx) => {
    const { text, kb } = await renderCategoryList();
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^c:view:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const { text, kb } = await renderCategoryDetail(id);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^c:rename:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    ctx.session.renameCategory = { categoryId: id };
    await ctx.reply("Введите новое название категории:");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^c:delete:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const kb = new InlineKeyboard().text("Да, удалить", `c:delete:${id}:yes`).text("Отмена", `c:view:${id}`);
    await ctx.editMessageText("Удалить категорию? Это возможно только если в ней нет товаров.", { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^c:delete:(\d+):yes$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    try {
      await api(`/categories/${id}`, { method: "DELETE" });
      const { text, kb } = await renderCategoryList();
      await ctx.editMessageText(text, { reply_markup: kb });
      await ctx.answerCallbackQuery({ text: "Категория удалена" });
    } catch {
      await ctx.answerCallbackQuery({ text: "В категории есть товары — сначала перенесите их", show_alert: true });
    }
  });

  bot.callbackQuery("m:addcategory", adminOnly, async (ctx) => {
    ctx.session.addCategory = { step: "name", data: {} };
    await ctx.reply("Введите название новой категории:");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^wizcat:icon:(\w+)$/, adminOnly, async (ctx) => {
    const wiz = ctx.session.addCategory;
    if (!wiz || wiz.step !== "icon") return ctx.answerCallbackQuery();
    const icon = ctx.match![1];
    try {
      const created = await api<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({ name: wiz.data.name, icon }),
      });
      ctx.session.addCategory = undefined;
      await ctx.editMessageText(`Категория «${created.name}» создана.`, { reply_markup: backButton("m:categories") });
    } catch {
      await ctx.editMessageText("Не удалось создать категорию.");
    }
    await ctx.answerCallbackQuery();
  });

  // ---------- Pickup points ----------

  bot.callbackQuery("m:points", adminOnly, async (ctx) => {
    const { text, kb } = await renderPointList();
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^pp:view:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const { text, kb } = await renderPointDetail(id);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^pp:toggle:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const points = await api<PickupPoint[]>("/pickup-points?active=all");
    const p = points.find((x) => x.id === id);
    await api(`/pickup-points/${id}`, { method: "PUT", body: JSON.stringify({ isActive: !p?.isActive }) });
    const { text, kb } = await renderPointDetail(id);
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^pp:delete:(\d+)$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    const kb = new InlineKeyboard().text("Да, удалить", `pp:delete:${id}:yes`).text("Отмена", `pp:view:${id}`);
    await ctx.editMessageText("Удалить точку самовывоза?", { reply_markup: kb });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^pp:delete:(\d+):yes$/, adminOnly, async (ctx) => {
    const id = Number(ctx.match![1]);
    await api(`/pickup-points/${id}`, { method: "DELETE" });
    const { text, kb } = await renderPointList();
    await ctx.editMessageText(text, { reply_markup: kb });
    await ctx.answerCallbackQuery({ text: "Точка удалена" });
  });

  bot.callbackQuery("m:addpoint", adminOnly, async (ctx) => {
    ctx.session.addPoint = { step: "name", data: {} };
    await ctx.reply("Введите название точки самовывоза:");
    await ctx.answerCallbackQuery();
  });

  // ---------- Add product wizard ----------

  bot.callbackQuery("m:addproduct", adminOnly, async (ctx) => {
    ctx.session.addProduct = { step: "photo", data: { image: null, nicotine: [] } };
    await ctx.reply("Добавление товара.\n\nПришлите фото товара одним сообщением, либо отправьте /skip, чтобы добавить без фото.");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^wiz:cat:(\d+)$/, adminOnly, async (ctx) => {
    const wiz = ctx.session.addProduct;
    if (!wiz || wiz.step !== "category") return ctx.answerCallbackQuery();
    wiz.data.category_id = Number(ctx.match![1]);
    wiz.step = "price";
    await ctx.editMessageText(`Категория выбрана.\n\nВведите цену, ₽:`);
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery(/^wiz:nic:(\d+)$/, adminOnly, async (ctx) => {
    const wiz = ctx.session.addProduct;
    if (!wiz || wiz.step !== "nicotine") return ctx.answerCallbackQuery();
    const n = Number(ctx.match![1]);
    const set = new Set(wiz.data.nicotine);
    if (set.has(n)) set.delete(n);
    else set.add(n);
    wiz.data.nicotine = [...set].sort((a, b) => a - b);
    await ctx.editMessageText("Крепость никотина (можно выбрать несколько), затем нажмите Готово:", {
      reply_markup: nicotineKeyboard(wiz.data.nicotine),
    });
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("wiz:nic:done", adminOnly, async (ctx) => {
    const wiz = ctx.session.addProduct;
    if (!wiz || wiz.step !== "nicotine") return ctx.answerCallbackQuery();
    wiz.step = "puffs";
    await ctx.editMessageText("Количество затяжек (если применимо), или /skip:");
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("wiz:save", adminOnly, async (ctx) => {
    const wiz = ctx.session.addProduct;
    if (!wiz) return ctx.answerCallbackQuery();
    try {
      const created = await api<Product>("/products", {
        method: "POST",
        body: JSON.stringify({
          name: wiz.data.name,
          brand: wiz.data.brand || "",
          category_id: wiz.data.category_id,
          price: wiz.data.price,
          old_price: wiz.data.old_price ?? null,
          stock: wiz.data.stock ?? 0,
          flavor: wiz.data.flavor || "",
          nicotine: wiz.data.nicotine,
          puffs: wiz.data.puffs ?? null,
          description: wiz.data.description || "",
          image: wiz.data.image,
        }),
      });
      ctx.session.addProduct = undefined;
      await ctx.editMessageText(`Товар «${created.name}» добавлен.`, { reply_markup: backButton("m:products") });
    } catch {
      await ctx.editMessageText("Не удалось сохранить товар. Попробуйте снова через /admin.");
    }
    await ctx.answerCallbackQuery();
  });

  bot.callbackQuery("wiz:cancel", adminOnly, async (ctx) => {
    ctx.session.addProduct = undefined;
    ctx.session.addPromo = undefined;
    await ctx.editMessageText("Отменено.", { reply_markup: backButton("m:home") });
    await ctx.answerCallbackQuery();
  });

  bot.on("message:photo", adminOnly, async (ctx) => {
    const photos = ctx.message.photo;
    const fileId = photos[photos.length - 1].file_id;

    if (ctx.session.editPhoto) {
      const { productId } = ctx.session.editPhoto;
      ctx.session.editPhoto = undefined;
      try {
        const url = await downloadTelegramPhoto(ctx, fileId);
        await api(`/products/${productId}`, { method: "PUT", body: JSON.stringify({ image: url }) });
        const { text, kb } = await renderProductDetail(productId);
        await ctx.reply("Фото обновлено.");
        await ctx.reply(text, { reply_markup: kb });
      } catch {
        await ctx.reply("Не удалось загрузить фото. Попробуйте ещё раз.");
      }
      return;
    }

    const wiz = ctx.session.addProduct;
    if (wiz && wiz.step === "photo") {
      try {
        wiz.data.image = await downloadTelegramPhoto(ctx, fileId);
      } catch {
        wiz.data.image = null;
      }
      wiz.step = "name";
      await ctx.reply("Фото сохранено.\n\nВведите название товара:");
    }
  });

  bot.on("message:text", adminOnly, async (ctx) => {
    const text = ctx.message.text.trim();
    if (text.startsWith("/")) {
      if (text === "/cancel") {
        ctx.session.addProduct = undefined;
        ctx.session.addPromo = undefined;
        ctx.session.editPhoto = undefined;
        ctx.session.addCategory = undefined;
        ctx.session.renameCategory = undefined;
        ctx.session.addPoint = undefined;
        await ctx.reply("Отменено.");
      }
      if (text !== "/skip") return;
    }

    const promoWiz = ctx.session.addPromo;
    if (promoWiz) return handlePromoWizardText(ctx, promoWiz, text);

    const categoryWiz = ctx.session.addCategory;
    if (categoryWiz) return handleCategoryWizardText(ctx, categoryWiz, text);

    const renameWiz = ctx.session.renameCategory;
    if (renameWiz) return handleRenameCategoryText(ctx, renameWiz, text);

    const pointWiz = ctx.session.addPoint;
    if (pointWiz) return handlePointWizardText(ctx, pointWiz, text);

    const wiz = ctx.session.addProduct;
    if (!wiz) return;
    await handleProductWizardText(ctx, wiz, text);
  });
}

function nicotineKeyboard(selected: number[]) {
  const kb = new InlineKeyboard();
  NICOTINE_ALL.forEach((n, i) => {
    const label = selected.includes(n) ? `${n} мг (выбрано)` : `${n} мг`;
    kb.text(label, `wiz:nic:${n}`);
    if (i % 2 === 1) kb.row();
  });
  kb.row().text("Готово", "wiz:nic:done");
  return kb;
}

async function handleProductWizardText(ctx: BotContext, wiz: AddProductState, text: string) {
  switch (wiz.step) {
    case "photo":
      if (text !== "/skip") {
        await ctx.reply("Пришлите фото файлом изображения или отправьте /skip.");
        return;
      }
      wiz.step = "name";
      await ctx.reply("Введите название товара:");
      return;

    case "name":
      if (!text) return ctx.reply("Название не может быть пустым. Введите название товара:");
      wiz.data.name = text;
      wiz.step = "brand";
      await ctx.reply("Введите бренд:");
      return;

    case "brand":
      wiz.data.brand = text;
      wiz.step = "category";
      {
        const categories = await api<Category[]>("/categories");
        const kb = new InlineKeyboard();
        categories.forEach((c, i) => {
          kb.text(c.name, `wiz:cat:${c.id}`);
          if (i % 2 === 1) kb.row();
        });
        await ctx.reply("Выберите категорию:", { reply_markup: kb });
      }
      return;

    case "price": {
      const price = Number(text.replace(",", "."));
      if (!price || price <= 0) return ctx.reply("Введите корректную цену числом, ₽:");
      wiz.data.price = Math.round(price);
      wiz.step = "old_price";
      await ctx.reply("Цена до скидки, ₽ (если есть), или /skip:");
      return;
    }

    case "old_price":
      if (text !== "/skip") {
        const oldPrice = Number(text.replace(",", "."));
        wiz.data.old_price = oldPrice > 0 ? Math.round(oldPrice) : null;
      }
      wiz.step = "stock";
      await ctx.reply("Остаток на складе, шт.:");
      return;

    case "stock": {
      const stock = Number(text);
      wiz.data.stock = Number.isFinite(stock) && stock >= 0 ? Math.round(stock) : 0;
      wiz.step = "flavor";
      await ctx.reply("Вкус (если есть), или /skip:");
      return;
    }

    case "flavor":
      if (text !== "/skip") wiz.data.flavor = text;
      wiz.step = "nicotine";
      await ctx.reply("Крепость никотина (можно выбрать несколько), затем нажмите Готово:", {
        reply_markup: nicotineKeyboard(wiz.data.nicotine),
      });
      return;

    case "puffs":
      if (text !== "/skip") {
        const puffs = Number(text);
        wiz.data.puffs = Number.isFinite(puffs) && puffs > 0 ? Math.round(puffs) : null;
      }
      wiz.step = "description";
      await ctx.reply("Короткое описание товара, или /skip:");
      return;

    case "description": {
      if (text !== "/skip") wiz.data.description = text;
      wiz.step = "confirm";
      const d = wiz.data;
      const summary = [
        "Проверьте товар перед сохранением:",
        "",
        `Название: ${d.name}`,
        `Бренд: ${d.brand || "—"}`,
        `Цена: ${d.price}₽${d.old_price ? ` (было ${d.old_price}₽)` : ""}`,
        `Остаток: ${d.stock ?? 0} шт.`,
        d.flavor ? `Вкус: ${d.flavor}` : null,
        d.nicotine.length ? `Никотин: ${d.nicotine.join(", ")} мг` : null,
        d.puffs ? `Затяжек: ${d.puffs}` : null,
        d.description ? `Описание: ${d.description}` : null,
        `Фото: ${d.image ? "приложено" : "нет"}`,
      ].filter(Boolean);
      const kb = new InlineKeyboard().text("Сохранить", "wiz:save").text("Отмена", "wiz:cancel");
      await ctx.reply(summary.join("\n"), { reply_markup: kb });
      return;
    }

    default:
      return;
  }
}

async function handlePromoWizardText(ctx: BotContext, wiz: AddPromoState, text: string) {
  switch (wiz.step) {
    case "code":
      if (!text || text === "/skip") return ctx.reply("Введите код промокода:");
      wiz.data.code = text.toUpperCase();
      wiz.step = "discount";
      await ctx.reply("Размер скидки, % (число от 1 до 90):");
      return;

    case "discount": {
      const discount = Number(text);
      if (!discount || discount <= 0 || discount > 90) return ctx.reply("Введите скидку числом от 1 до 90:");
      wiz.data.discountPercent = Math.round(discount);
      wiz.step = "limit";
      await ctx.reply("Лимит использований (0 — без лимита):");
      return;
    }

    case "limit": {
      const limit = text === "/skip" ? 0 : Number(text);
      wiz.data.usageLimit = Number.isFinite(limit) && limit >= 0 ? Math.round(limit) : 0;
      try {
        await api("/promo", {
          method: "POST",
          body: JSON.stringify({ code: wiz.data.code, discountPercent: wiz.data.discountPercent, usageLimit: wiz.data.usageLimit }),
        });
        await ctx.reply(`Промокод ${wiz.data.code} создан.`, { reply_markup: backButton("m:promo") });
      } catch {
        await ctx.reply("Такой промокод уже существует. Попробуйте другой через /admin.");
      }
      ctx.session.addPromo = undefined;
      return;
    }
  }
}

async function handleCategoryWizardText(ctx: BotContext, wiz: AddCategoryState, text: string) {
  switch (wiz.step) {
    case "name":
      if (!text || text === "/skip") return ctx.reply("Введите название категории:");
      wiz.data.name = text;
      wiz.step = "icon";
      await ctx.reply("Выберите стиль иконки категории:", { reply_markup: categoryIconKeyboard() });
      return;
    default:
      return;
  }
}

async function handleRenameCategoryText(ctx: BotContext, wiz: RenameCategoryState, text: string) {
  if (!text || text === "/skip") return ctx.reply("Введите новое название категории:");
  try {
    await api(`/categories/${wiz.categoryId}`, { method: "PUT", body: JSON.stringify({ name: text }) });
    await ctx.reply("Категория переименована.", { reply_markup: backButton("m:categories") });
  } catch {
    await ctx.reply("Не удалось переименовать категорию.");
  }
  ctx.session.renameCategory = undefined;
}

async function handlePointWizardText(ctx: BotContext, wiz: AddPointState, text: string) {
  switch (wiz.step) {
    case "name":
      if (!text || text === "/skip") return ctx.reply("Введите название точки самовывоза:");
      wiz.data.name = text;
      wiz.step = "address";
      await ctx.reply("Введите адрес точки:");
      return;

    case "address":
      if (!text || text === "/skip") return ctx.reply("Введите адрес точки:");
      wiz.data.address = text;
      wiz.step = "hours";
      await ctx.reply("Часы работы (например, «Ежедневно 10:00–22:00»), или /skip:");
      return;

    case "hours": {
      const hours = text === "/skip" ? "" : text;
      try {
        await api("/pickup-points", {
          method: "POST",
          body: JSON.stringify({ name: wiz.data.name, address: wiz.data.address, hours }),
        });
        await ctx.reply(`Точка «${wiz.data.name}» добавлена.`, { reply_markup: backButton("m:points") });
      } catch {
        await ctx.reply("Не удалось создать точку самовывоза.");
      }
      ctx.session.addPoint = undefined;
      return;
    }
  }
}
