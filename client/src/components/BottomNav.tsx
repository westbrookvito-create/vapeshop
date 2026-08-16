import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useSession } from "../store/session";
import { HomeIcon, GridIcon, CartIcon, ReceiptIcon, UserIcon, ChartIcon, BoxIcon, UsersIcon, GridIcon as MoreIcon } from "./Icons";
import { haptic } from "../lib/telegram";

const shopItems = [
  { to: "/", label: "Главная", icon: HomeIcon },
  { to: "/catalog", label: "Каталог", icon: GridIcon },
  { to: "/cart", label: "Корзина", icon: CartIcon, cart: true },
  { to: "/orders", label: "Заказы", icon: ReceiptIcon },
  { to: "/profile", label: "Профиль", icon: UserIcon },
];

const adminItems = [
  { to: "/admin", label: "Дашборд", icon: ChartIcon, end: true },
  { to: "/admin/products", label: "Товары", icon: BoxIcon },
  { to: "/admin/orders", label: "Заказы", icon: ReceiptIcon },
  { to: "/admin/customers", label: "Клиенты", icon: UsersIcon },
  { to: "/admin/more", label: "Ещё", icon: MoreIcon },
];

export default function BottomNav({ mode }: { mode: "shop" | "admin" }) {
  const totalQty = useCart((s) => s.totalQty());
  const isAdmin = useSession((s) => s.isAdmin);
  const navigate = useNavigate();
  const items = mode === "admin" ? adminItems : shopItems;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          alignItems: "stretch",
          height: "var(--nav-h)",
          paddingBottom: "var(--safe-bottom)",
          borderRadius: "20px 20px 0 0",
          borderBottom: "none",
          backdropFilter: "blur(20px)",
        }}
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : item.to === "/"}
            onClick={() => haptic("light")}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  color: isActive ? "var(--accent)" : "var(--text-faint)",
                  position: "relative",
                  transition: "color 0.15s ease",
                }}
              >
                <div style={{ position: "relative" }}>
                  <item.icon size={22} strokeWidth={isActive ? 2.1 : 1.8} />
                  {"cart" in item && totalQty > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -9,
                        background: "var(--pink)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        borderRadius: 999,
                        minWidth: 16,
                        height: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                      }}
                    >
                      {totalQty}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 10.5, fontWeight: isActive ? 800 : 600 }}>{item.label}</span>
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -8,
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
      {isAdmin && mode === "shop" && (
        <button
          onClick={() => navigate("/admin")}
          className="btn-primary"
          style={{
            position: "fixed",
            bottom: "calc(var(--nav-h) + var(--safe-bottom) + 14px)",
            right: "max(16px, calc(50vw - 224px))",
            borderRadius: "999px",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-glow)",
            border: "none",
            fontSize: 20,
          }}
          title="Админ-панель"
        >
          ⚙️
        </button>
      )}
    </nav>
  );
}
