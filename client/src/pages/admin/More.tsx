import { useNavigate } from "react-router-dom";
import { TagIcon, BoxIcon, UsersIcon, SettingsIcon, ChevronRightIcon, LogOutIcon } from "../../components/Icons";
import { useSession } from "../../store/session";

export default function AdminMore() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);

  const items = [
    { icon: BoxIcon, label: "Категории", subtitle: "Разделы каталога", to: "/admin/categories", accent: "linear-gradient(135deg,#00c6ff,#0072ff)" },
    { icon: TagIcon, label: "Промокоды", subtitle: "Скидки и акции", to: "/admin/promo", accent: "linear-gradient(135deg,#bf9257,#8a6240)" },
    { icon: UsersIcon, label: "Клиенты", subtitle: "База покупателей", to: "/admin/customers", accent: "linear-gradient(135deg,#7c9463,#4c6440)" },
    { icon: SettingsIcon, label: "Настройки магазина", subtitle: "Доставка, оплата, контакты", to: "/admin/settings", accent: "linear-gradient(135deg,#6b8574,#3f5346)" },
  ];

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 18px) 20px 4px" }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Управление</div>
        <div className="text-faint" style={{ fontSize: 13 }}>Администратор: {user?.firstName}</div>
      </div>

      <div style={{ padding: "18px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <button key={item.to} onClick={() => navigate(item.to)} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: item.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
              <item.icon size={20} />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{item.label}</div>
              <div className="text-faint" style={{ fontSize: 12 }}>{item.subtitle}</div>
            </div>
            <ChevronRightIcon size={18} />
          </button>
        ))}
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <button onClick={() => navigate("/")} className="card" style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: 16, color: "var(--text-dim)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <LogOutIcon size={19} />
          </div>
          <div style={{ flex: 1, textAlign: "left", fontWeight: 700, fontSize: 14.5 }}>Вернуться в магазин</div>
          <ChevronRightIcon size={18} />
        </button>
      </div>
    </div>
  );
}
