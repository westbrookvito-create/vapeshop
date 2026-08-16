import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, type Order } from "../../lib/api";
import { formatDate, formatPrice, STATUS_LABELS } from "../../lib/format";
import Header from "../../components/Header";
import StatusBadge from "../../components/StatusBadge";
import { TruckIcon, BoxIcon, WalletIcon, UserIcon } from "../../components/Icons";
import { useToast } from "../../store/toast";

const STATUS_FLOW = ["new", "confirmed", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const show = useToast((s) => s.show);

  const load = () => {
    if (!id) return;
    api.orders.get(Number(id)).then(setOrder);
  };

  useEffect(load, [id]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await api.orders.setStatus(order.id, status);
      setOrder(updated);
      show(`Статус изменён: ${STATUS_LABELS[status]}`, "success");
    } catch {
      show("Не удалось изменить статус", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (!order) {
    return (
      <div className="page">
        <Header title="Заказ" back sticky={false} />
        <div style={{ padding: 20 }}>
          <div className="skeleton" style={{ height: 240 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title={`Заказ #${order.id}`} subtitle={formatDate(order.createdAt)} back sticky={false} right={<StatusBadge status={order.status} />} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div className="label">Изменить статус</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                disabled={updating}
                onClick={() => updateStatus(s)}
                className={`chip ${order.status === s ? "active" : ""}`}
                style={s === "cancelled" && order.status !== "cancelled" ? { color: "var(--red)" } : undefined}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--accent-grad)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <UserIcon size={19} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5 }}>{order.userName || "Гость"}</div>
            <div className="text-faint" style={{ fontSize: 12.5 }}>{order.userUsername ? `@${order.userUsername}` : `ID: ${order.userId}`}</div>
          </div>
        </div>

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
          <div className="label">Доставка и оплата</div>
          <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <InfoRow icon={order.deliveryMethod === "delivery" ? <TruckIcon size={16} /> : <BoxIcon size={16} />} label={order.deliveryMethod === "delivery" ? "Доставка" : "Самовывоз"} value={order.address} />
            <InfoRow icon={<WalletIcon size={16} />} label="Оплата" value={order.paymentMethod === "card" ? "Картой онлайн" : "Наличными"} />
            {order.comment && <InfoRow icon="💬" label="Комментарий" value={order.comment} />}
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
