export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export function formatDate(iso: string): string {
  const d = new Date(iso.replace(" ", "T") + "Z");
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

export const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  processing: "В обработке",
  shipped: "В пути",
  completed: "Выполнен",
  cancelled: "Отменён",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "var(--cyan)",
  confirmed: "var(--accent)",
  processing: "var(--amber)",
  shipped: "var(--accent)",
  completed: "var(--green)",
  cancelled: "var(--red)",
};
