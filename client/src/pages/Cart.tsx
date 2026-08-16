import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { formatPrice } from "../lib/format";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import QuantityStepper from "../components/QuantityStepper";
import ProductImage from "../components/ProductImage";
import { CartIcon, TrashIcon } from "../components/Icons";
import { haptic } from "../lib/telegram";

export default function Cart() {
  const navigate = useNavigate();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (lines.length === 0) {
    return (
      <div className="page">
        <Header title="Корзина" sticky={false} />
        <EmptyState
          icon={<CartIcon size={30} strokeWidth={1.4} />}
          title="Корзина пуста"
          subtitle="Добавьте товары из каталога, чтобы оформить заказ"
          action={
            <button className="btn btn-primary" onClick={() => navigate("/catalog")}>
              Перейти в каталог
            </button>
          }
        />
      </div>
    );
  }

  const delivery = subtotal >= 3000 ? 0 : 300;

  return (
    <div className="page">
      <Header title="Корзина" subtitle={`${lines.length} ${lines.length === 1 ? "товар" : "товара"}`} sticky={false} />

      <div style={{ padding: "4px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {lines.map((l) => (
          <div key={`${l.productId}-${l.nicotine ?? "x"}`} className="card" style={{ display: "flex", gap: 12, padding: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
              <ProductImage image={l.image} color={l.color} iconSize={24} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{l.name}</div>
                <div className="text-faint" style={{ fontSize: 12, marginTop: 2 }}>
                  {[l.flavor, l.nicotine !== undefined ? `${l.nicotine} мг` : null].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{formatPrice(l.price * l.qty)}</span>
                <QuantityStepper size="sm" value={l.qty} onChange={(v) => setQty(l.productId, l.nicotine, v)} />
              </div>
            </div>
            <button
              onClick={() => {
                remove(l.productId, l.nicotine);
                haptic("light");
              }}
              style={{ background: "none", border: "none", color: "var(--text-faint)", alignSelf: "flex-start", padding: 2 }}
            >
              <TrashIcon size={17} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Row label="Сумма товаров" value={formatPrice(subtotal)} />
          <Row label="Доставка" value={delivery === 0 ? "Бесплатно" : formatPrice(delivery)} highlight={delivery === 0} />
          {delivery > 0 && (
            <div className="text-faint" style={{ fontSize: 12 }}>
              Бесплатная доставка от {formatPrice(3000)}
            </div>
          )}
          <div style={{ height: 1, background: "var(--border)" }} />
          <Row label="Итого" value={formatPrice(subtotal + delivery)} big />
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => navigate("/checkout")}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, big, highlight }: { label: string; value: string; big?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className={big ? "" : "text-dim"} style={{ fontSize: big ? 16 : 14, fontWeight: big ? 800 : 600 }}>
        {label}
      </span>
      <span style={{ fontSize: big ? 19 : 14, fontWeight: 800, color: highlight ? "var(--green)" : "var(--text)" }}>{value}</span>
    </div>
  );
}
