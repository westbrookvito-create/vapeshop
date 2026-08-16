import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../lib/api";

export type CartLine = {
  productId: number;
  name: string;
  price: number;
  color: string;
  image: string | null;
  flavor?: string;
  nicotine?: number;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  add: (product: Product, opts?: { nicotine?: number; qty?: number }) => void;
  remove: (productId: number, nicotine?: number) => void;
  setQty: (productId: number, nicotine: number | undefined, qty: number) => void;
  clear: () => void;
  totalQty: () => number;
  subtotal: () => number;
};

function lineKey(l: { productId: number; nicotine?: number }) {
  return `${l.productId}-${l.nicotine ?? "x"}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (product, opts = {}) => {
        const qty = opts.qty ?? 1;
        set((state) => {
          const key = lineKey({ productId: product.id, nicotine: opts.nicotine });
          const existing = state.lines.find((l) => lineKey(l) === key);
          if (existing) {
            return {
              lines: state.lines.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + qty } : l)),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                color: product.color,
                image: product.image,
                flavor: product.flavor !== "—" ? product.flavor : undefined,
                nicotine: opts.nicotine,
                qty,
              },
            ],
          };
        });
      },
      remove: (productId, nicotine) =>
        set((state) => ({ lines: state.lines.filter((l) => lineKey(l) !== lineKey({ productId, nicotine })) })),
      setQty: (productId, nicotine, qty) =>
        set((state) => ({
          lines: qty <= 0
            ? state.lines.filter((l) => lineKey(l) !== lineKey({ productId, nicotine }))
            : state.lines.map((l) => (lineKey(l) === lineKey({ productId, nicotine }) ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [] }),
      totalQty: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.qty * l.price, 0),
    }),
    { name: "vapeshop-cart" }
  )
);
