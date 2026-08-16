import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Order } from "../../lib/api";
import { formatDate, formatPrice, STATUS_LABELS } from "../../lib/format";
import StatusBadge from "../../components/StatusBadge";
import { ListSkeleton } from "../../components/Skeletons";
import EmptyState from "../../components/EmptyState";
import { ChevronRightIcon, ReceiptIcon } from "../../components/Icons";

const STATUS_FILTERS = ["all", "new", "confirmed", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    api.orders.list(status === "all" ? {} : { status }).then(setOrders);
  }, [status]);

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 18px) 20px 4px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Заказы</div>
        <div className="text-faint" style={{ fontSize: 13 }}>{orders?.length ?? "…"} заказов</div>
      </div>

      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, padding: "14px 20px", overflowX: "auto" }}>
        {STATUS_FILTERS.map((s) => (
          <button key={s} className={`chip ${status === s ? "active" : ""}`} onClick={() => setStatus(s)}>
            {s === "all" ? "Все" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {orders === null ? (
          <ListSkeleton count={5} height={90} />
        ) : orders.length === 0 ? (
          <EmptyState icon={<ReceiptIcon size={30} strokeWidth={1.4} />} title="Заказов нет" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map((o) => (
              <button key={o.id} onClick={() => navigate(`/admin/orders/${o.id}`)} className="card" style={{ padding: 14, textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 14.5 }}>#{o.id} · {o.userName || "Гость"}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-faint" style={{ fontSize: 12 }}>{formatDate(o.createdAt)} · {o.items.length} товара</div>
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
