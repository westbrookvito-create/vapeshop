import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Order } from "../lib/api";
import { formatDate, formatPrice, STATUS_LABELS } from "../lib/format";
import Header from "../components/Header";
import { CheckIcon, TruckIcon, BoxIcon, WalletIcon } from "../components/Icons";

const FLOW = ["new", "confirmed", "processing", "shipped", "completed"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!id) return;
    api.orders.get(Number(id)).then(setOrder);
  }, [id]);

  if (!order) {
    return (
      <div className="page">
        <Header title="Заказ" back sticky={false} />
        <div style={{ padding: 20 }}>
          <div className="skeleton" style={{ height: 120, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const stepIndex = FLOW.indexOf(order.status);

  return (
    <div className="page">
      <Header title={`Заказ #${order.id}`} subtitle={formatDate(order.createdAt)} back sticky={false} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {cancelled ? (
          <div className="card" style={{ padding: 16, border: "1px solid rgba(255,92,122,0.3)", background: "rgba(255,92,122,0.08)" }}>
            <div style={{ fontWeight: 800, color: "var(--red)", fontSize: 15 }}>Заказ отменён</div>
            {order.comment && <div className="text-dim" style={{ fontSize: 13, marginTop: 4 }}>{order.comment}</div>}
          </div>
        ) : (
          <div className="card" style={{ padding: "20px 16px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {FLOW.map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", flex: i < FLOW.length - 1 ? 1 : "0 0 auto" }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: i <= stepIndex ? "var(--accent-grad)" : "var(--surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: i <= stepIndex ? "#fff" : "var(--text-faint)",
                    }}
                  >
                    {i < stepIndex ? <CheckIcon size={13} strokeWidth={3} /> : <span style={{ fontSize: 11, fontWeight: 800 }}>{i + 1}</span>}
                  </div>
                  {i < FLOW.length - 1 && (
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: i < stepIndex ? "var(--accent)" : "var(--surface-2)", margin: "0 4px" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 12, fontWeight: 800, fontSize: 15 }}>{STATUS_LABELS[order.status]}</div>
          </div>
        )}

        <div>
          <div className="label">Товары</div>
          <div className="card" style={{ padding: 4 }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderBottom: i < order.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                  {item.flavor && <div className="text-faint" style={{ fontSize: 12, marginTop: 2 }}>{item.flavor}</div>}
                  <div className="text-faint" style={{ fontSize: 12, marginTop: 2 }}>{item.qty} × {formatPrice(item.price)}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: "nowrap" }}>{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Информация о доставке</div>
          <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <InfoRow icon={order.deliveryMethod === "delivery" ? <TruckIcon size={16} /> : <BoxIcon size={16} />} label={order.deliveryMethod === "delivery" ? "Доставка" : "Самовывоз"} value={order.address} />
            <InfoRow icon={<WalletIcon size={16} />} label="Оплата" value={order.paymentMethod === "card" ? "Картой онлайн" : "Наличными при получении"} />
            {order.comment && !cancelled && <InfoRow icon="💬" label="Комментарий" value={order.comment} />}
          </div>
        </div>

        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Row label="Сумма товаров" value={formatPrice(order.subtotal)} />
          {order.discount > 0 && <Row label={`Скидка${order.promoCode ? ` (${order.promoCode})` : ""}`} value={`-${formatPrice(order.discount)}`} highlight />}
          <div style={{ height: 1, background: "var(--border)" }} />
          <Row label="Итого" value={formatPrice(order.total)} big />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div className="text-faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

function Row({ label, value, big, highlight }: { label: string; value: string; big?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className={big ? "" : "text-dim"} style={{ fontSize: big ? 16 : 14, fontWeight: big ? 800 : 600 }}>{label}</span>
      <span style={{ fontSize: big ? 19 : 14, fontWeight: 800, color: highlight ? "var(--green)" : "var(--text)" }}>{value}</span>
    </div>
  );
}
