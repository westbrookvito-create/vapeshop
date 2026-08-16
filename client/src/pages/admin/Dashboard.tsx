import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, YAxis } from "recharts";
import { api } from "../../lib/api";
import { formatPrice, STATUS_COLORS, STATUS_LABELS } from "../../lib/format";
import StatCard from "../../components/StatCard";
import { WalletIcon, ReceiptIcon, BellIcon, UsersIcon, ChartIcon, BoxIcon } from "../../components/Icons";

type Overview = {
  revenue: number;
  ordersCount: number;
  newOrders: number;
  customersCount: number;
  avgOrder: number;
  lowStockCount: number;
  byDay: { day: string; revenue: number; orders: number }[];
  byStatus: { status: string; count: number }[];
  topProducts: { name: string; qty: number; revenue: number }[];
};

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    api.stats.overview().then(setData);
  }, []);

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 18px) 20px 4px" }}>
        <div className="chip active" style={{ marginBottom: 10, cursor: "default" }}>⚙️ Админ-панель</div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Дашборд</div>
        <div className="text-faint" style={{ fontSize: 13, marginTop: 2 }}>CloudBar Vape Shop</div>
      </div>

      {!data ? (
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 92 }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ padding: "18px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatCard label="Выручка" value={formatPrice(data.revenue)} delta="12.4%" icon={<WalletIcon size={18} />} accent="var(--accent-grad)" />
            <StatCard label="Заказов всего" value={String(data.ordersCount)} delta="8.1%" icon={<ReceiptIcon size={18} />} accent="var(--cyan-grad)" />
            <StatCard label="Новые заказы" value={String(data.newOrders)} icon={<BellIcon size={18} />} accent="linear-gradient(135deg,#ffb547,#ff8a3d)" />
            <StatCard label="Клиентов" value={String(data.customersCount)} delta="4.2%" icon={<UsersIcon size={18} />} accent="linear-gradient(135deg,#37e28c,#11998e)" />
            <StatCard label="Средний чек" value={formatPrice(data.avgOrder)} icon={<ChartIcon size={18} />} accent="linear-gradient(135deg,#ff4ecb,#b14bff)" />
            <StatCard label="Мало на складе" value={String(data.lowStockCount)} deltaPositive={false} icon={<BoxIcon size={18} />} accent="linear-gradient(135deg,#ff5c7a,#ff4ecb)" />
          </div>

          <div style={{ padding: "22px 20px 0" }}>
            <div className="card" style={{ padding: "18px 16px 8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Выручка за 14 дней</div>
              </div>
              <div style={{ height: 160, marginLeft: -12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.byDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b14bff" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#b14bff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tickFormatter={(d) => d.slice(8, 10) + "." + d.slice(5, 7)}
                      tick={{ fontSize: 10, fill: "var(--text-faint)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "var(--text-dim)" }}
                      formatter={(v: number) => [formatPrice(v), "Выручка"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#b14bff" strokeWidth={2.5} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ padding: "18px 20px 0" }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Статусы заказов</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.byStatus.map((s) => {
                  const max = Math.max(...data.byStatus.map((x) => x.count), 1);
                  return (
                    <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 90, fontSize: 12.5, fontWeight: 700, color: "var(--text-dim)", flexShrink: 0 }}>
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                      <div style={{ flex: 1, height: 8, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}>
                        <div style={{ width: `${(s.count / max) * 100}%`, height: "100%", background: STATUS_COLORS[s.status], borderRadius: 6 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, width: 20, textAlign: "right" }}>{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ padding: "18px 20px 0" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Топ товаров</div>
            <div className="card" style={{ padding: 4 }}>
              {data.topProducts.map((p, i) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderBottom: i < data.topProducts.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 22, fontWeight: 800, color: "var(--text-faint)", fontSize: 13 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div className="text-faint" style={{ fontSize: 11.5 }}>{p.qty} продано</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13.5 }}>{formatPrice(p.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
