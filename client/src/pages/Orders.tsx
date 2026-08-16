import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Order } from "../lib/api";
import { useSession } from "../store/session";
import { formatDate, formatPrice } from "../lib/format";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { ListSkeleton } from "../components/Skeletons";
import { ChevronRightIcon } from "../components/Icons";

export default function Orders() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    api.orders.list({ userId: user.telegramId }).then(setOrders);
  }, [user]);

  return (
    <div className="page">
      <Header title="Мои заказы" sticky={false} />
      <div style={{ padding: "0 20px" }}>
        {orders === null ? (
          <ListSkeleton count={3} height={96} />
        ) : orders.length === 0 ? (
          <EmptyState icon="📦" title="Заказов пока нет" subtitle="Оформите первый заказ, и он появится здесь" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map((o) => (
              <button key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="card" style={{ padding: 14, textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>Заказ #{o.id}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-faint" style={{ fontSize: 12.5 }}>{formatDate(o.createdAt)}</div>
                <div className="text-dim" style={{ fontSize: 13, lineHeight: 1.4 }}>
                  {o.items.map((i) => i.name).join(", ")}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{formatPrice(o.total)}</span>
                  <ChevronRightIcon size={17} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
