import { useNavigate } from "react-router-dom";
import { useSession } from "../store/session";
import { useFavorites } from "../store/favorites";
import { ReceiptIcon, HeartIcon, BellIcon, SettingsIcon, ChevronRightIcon, WalletIcon } from "../components/Icons";

export default function Profile() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const isAdmin = useSession((s) => s.isAdmin);
  const favCount = useFavorites((s) => s.ids.length);

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "?";

  const menu = [
    { icon: ReceiptIcon, label: "Мои заказы", to: "/orders" },
    { icon: HeartIcon, label: "Избранное", to: "/favorites", badge: favCount || undefined },
    { icon: BellIcon, label: "Уведомления", to: "#" },
  ];

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 22px) 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "var(--accent-grad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-faint" style={{ fontSize: 13.5, marginTop: 2 }}>
              {user?.username ? `@${user.username}` : "Telegram пользователь"}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            background: "var(--cyan-grad)",
            borderRadius: "var(--radius-xl)",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#211708",
            boxShadow: "0 6px 20px rgba(138,98,64,0.22)",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", opacity: 0.75 }}>Бонусный счёт</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{user?.bonusPoints ?? 0} баллов</div>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WalletIcon size={24} />
          </div>
        </div>
      </div>

      {isAdmin && (
        <div style={{ padding: "16px 20px 0" }}>
          <button
            onClick={() => navigate("/admin")}
            className="card"
            style={{
              width: "100%",
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid var(--border-strong)",
              background: "var(--accent-grad-soft)",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-grad)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <SettingsIcon size={19} />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>Панель администратора</div>
              <div className="text-faint" style={{ fontSize: 12 }}>Заказы, товары, статистика</div>
            </div>
            <ChevronRightIcon size={18} />
          </button>
        </div>
      )}

      <div style={{ padding: "20px 20px 0" }}>
        <div className="card" style={{ padding: 4 }}>
          {menu.map((item, i) => (
            <button
              key={item.label}
              onClick={() => item.to !== "#" && navigate(item.to)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 12px",
                background: "none",
                border: "none",
                borderBottom: i < menu.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)" }}>
                <item.icon size={17} />
              </div>
              <span style={{ flex: 1, textAlign: "left", fontWeight: 700, fontSize: 14 }}>{item.label}</span>
              {item.badge ? (
                <span style={{ background: "var(--pink)", color: "#fff", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "2px 7px" }}>
                  {item.badge}
                </span>
              ) : null}
              <ChevronRightIcon size={17} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }} className="text-faint">
        <div style={{ fontSize: 12, textAlign: "center", lineHeight: 1.6 }}>
          CloudBar Vape Shop · 18+
          <br />
          Продукция содержит никотин, вызывает привыкание
        </div>
      </div>
    </div>
  );
}
