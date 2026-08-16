import { useEffect, useState } from "react";
import { api, type Customer } from "../../lib/api";
import { formatDate, formatPrice } from "../../lib/format";
import Header from "../../components/Header";
import { SearchIcon } from "../../components/Icons";
import { ListSkeleton } from "../../components/Skeletons";
import { useToast } from "../../store/toast";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [search, setSearch] = useState("");
  const show = useToast((s) => s.show);

  const load = () => api.users.list(search || undefined).then(setCustomers);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleBan = async (c: Customer) => {
    await api.users.ban(c.telegramId, !c.isBanned);
    show(c.isBanned ? "Клиент разблокирован" : "Клиент заблокирован", "success");
    load();
  };

  return (
    <div className="page">
      <Header title="Клиенты" back sticky={false} subtitle={customers ? `${customers.length} клиентов` : undefined} />

      <div style={{ padding: "0 20px 14px" }}>
        <div className="glass" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
          <SearchIcon size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по имени или username" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 14.5 }} />
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {customers === null ? (
          <ListSkeleton count={5} height={80} />
        ) : (
          customers.map((c) => {
            const initials = `${c.firstName[0] || ""}${c.lastName[0] || ""}`.toUpperCase() || "?";
            return (
              <div key={c.telegramId} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, opacity: c.isBanned ? 0.55 : 1 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: "var(--accent-grad)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-faint" style={{ fontSize: 11.5, marginTop: 2 }}>
                    {c.username ? `@${c.username}` : `ID ${c.telegramId}`} · с {formatDate(c.createdAt)}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 3, fontWeight: 700 }}>
                    {c.ordersCount} заказов · {formatPrice(c.ordersTotal)}
                  </div>
                </div>
                <button
                  onClick={() => toggleBan(c)}
                  className="chip"
                  style={{ background: c.isBanned ? "rgba(181,88,63,0.15)" : "var(--surface-2)", color: c.isBanned ? "var(--red)" : "var(--text-dim)", flexShrink: 0 }}
                >
                  {c.isBanned ? "Разблокировать" : "Блок"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
