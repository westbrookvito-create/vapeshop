import { getTelegram } from "./telegram";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const initData = getTelegram().initData;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-telegram-init-data": initData,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export type Product = {
  id: number;
  categoryId: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  rating: number;
  reviewsCount: number;
  nicotine: number[];
  flavor: string;
  puffs: number | null;
  color: string;
  image: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  createdAt: string;
};

export type Category = { id: number; name: string; icon: string; sortOrder: number; productCount: number };

export type OrderItem = { id: number; name: string; price: number; qty: number; flavor?: string };

export type PickupPoint = { id: number; name: string; address: string; hours: string; isActive: boolean };

export type Order = {
  id: number;
  userId: number;
  userName: string;
  userUsername: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "new" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled";
  deliveryMethod: "delivery" | "pickup";
  address: string;
  pickupPoint: { id: number; name: string; address: string; hours: string } | null;
  paymentMethod: "card" | "cash";
  promoCode: string;
  comment: string;
  createdAt: string;
};

export type WheelSegment = { type: "discount" | "points" | "none"; value: number; label: string };
export type WheelPrize = { segmentIndex: number; type: string; value: number; label: string; promoCode: string | null; spunAt: string };
export type WheelState = {
  ordersCount: number;
  ordersRequired: number;
  eligible: boolean;
  spun: boolean;
  prize: WheelPrize | null;
  segments: WheelSegment[];
};

export type PromoCode = {
  id: number;
  code: string;
  discountPercent: number;
  active: boolean;
  usageLimit: number;
  usedCount: number;
  createdAt: string;
};

export type Customer = {
  telegramId: number;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  bonusPoints: number;
  isBanned: boolean;
  createdAt: string;
  ordersCount: number;
  ordersTotal: number;
};

export const api = {
  auth: {
    verify: () => request<{ valid: boolean; isAdmin: boolean; user: any }>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ initData: getTelegram().initData }),
    }),
  },
  products: {
    list: (params: { category?: number; search?: string; featured?: boolean; active?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.category) q.set("category", String(params.category));
      if (params.search) q.set("search", params.search);
      if (params.featured) q.set("featured", "1");
      if (params.active) q.set("active", params.active);
      return request<Product[]>(`/products?${q.toString()}`);
    },
    get: (id: number) => request<Product>(`/products/${id}`),
    create: (data: Partial<Product>) => request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Product>) => request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),
  },
  upload: {
    image: (dataUrl: string) => request<{ url: string }>("/upload", { method: "POST", body: JSON.stringify({ dataUrl }) }),
  },
  categories: {
    list: () => request<Category[]>("/categories"),
    create: (data: { name: string; icon: string; sortOrder?: number }) =>
      request<Category>("/categories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Category>) => request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/categories/${id}`, { method: "DELETE" }),
  },
  orders: {
    list: (params: { userId?: number; status?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.userId) q.set("userId", String(params.userId));
      if (params.status) q.set("status", params.status);
      return request<Order[]>(`/orders?${q.toString()}`);
    },
    get: (id: number) => request<Order>(`/orders/${id}`),
    create: (data: any) => request<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
    setStatus: (id: number, status: string) => request<Order>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },
  promo: {
    list: () => request<PromoCode[]>("/promo"),
    create: (data: { code: string; discountPercent: number; usageLimit?: number }) =>
      request<PromoCode>("/promo", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<PromoCode>) => request<PromoCode>(`/promo/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: number) => request<void>(`/promo/${id}`, { method: "DELETE" }),
    validate: (code: string) => request<PromoCode>("/promo/validate", { method: "POST", body: JSON.stringify({ code }) }),
  },
  users: {
    list: (search?: string) => request<Customer[]>(`/users?${search ? `search=${encodeURIComponent(search)}` : ""}`),
    ban: (telegramId: number, banned: boolean) =>
      request<void>(`/users/${telegramId}/ban`, { method: "PATCH", body: JSON.stringify({ banned }) }),
  },
  stats: {
    overview: () => request<any>("/stats/overview"),
  },
  settings: {
    get: () => request<Record<string, string>>("/settings"),
    update: (data: Record<string, string>) => request<Record<string, string>>("/settings", { method: "PUT", body: JSON.stringify(data) }),
  },
  pickupPoints: {
    list: () => request<PickupPoint[]>("/pickup-points"),
  },
  wheel: {
    get: (telegramId: number) => request<WheelState>(`/wheel/${telegramId}`),
    spin: (telegramId: number) => request<WheelPrize>(`/wheel/${telegramId}/spin`, { method: "POST" }),
  },
};
