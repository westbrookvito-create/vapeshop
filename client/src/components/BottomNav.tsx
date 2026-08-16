import { NavLink } from "react-router-dom";
import { useCart } from "../store/cart";
import { GridIcon, GiftIcon, CartIcon, HeartIcon, UserIcon } from "./Icons";
import { haptic } from "../lib/telegram";

const items = [
  { to: "/", label: "Ассортимент", icon: GridIcon, end: true },
  { to: "/bonuses", label: "Бонусы", icon: GiftIcon },
  { to: "/cart", label: "Корзина", icon: CartIcon, cart: true },
  { to: "/favorites", label: "Избранное", icon: HeartIcon },
  { to: "/profile", label: "Профиль", icon: UserIcon },
];

export default function BottomNav() {
  const totalQty = useCart((s) => s.totalQty());

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
        }}
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
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
                        background: "var(--accent)",
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
    </nav>
  );
}
