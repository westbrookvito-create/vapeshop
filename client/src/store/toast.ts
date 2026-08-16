import { create } from "zustand";

export type Toast = { id: number; message: string; kind: "success" | "error" | "info" };

let counter = 0;

type ToastState = {
  toasts: Toast[];
  show: (message: string, kind?: Toast["kind"]) => void;
  dismiss: (id: number) => void;
};

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  show: (message, kind = "info") => {
    const id = ++counter;
    set((state) => ({ toasts: [...state.toasts, { id, message, kind }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), 2600);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
