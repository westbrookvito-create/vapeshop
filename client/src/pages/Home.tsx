import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Category, type Product } from "../lib/api";
import { useSession } from "../store/session";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";
import { SearchIcon, BellIcon, ArrowRightIcon } from "../components/Icons";

export default function Home() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [fresh, setFresh] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.categories.list(), api.products.list({ featured: true }), api.products.list()]).then(
      ([cats, feat, all]) => {
        setCategories(cats);
        setFeatured(feat);
        setFresh(all.filter((p) => p.isNew).slice(0, 6));
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 18px) 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="text-faint" style={{ fontSize: 12.5, fontWeight: 600 }}>
            С возвращением
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {user?.firstName ? `${user.firstName} 👋` : "Гость 👋"}
          </div>
        </div>
        <button
          className="glass"
          style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}
        >
          <BellIcon size={19} />
        </button>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <button
          onClick={() => navigate("/catalog")}
          className="glass"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            color: "var(--text-faint)",
            fontSize: 14.5,
          }}
        >
          <SearchIcon size={18} />
          Найти вкус, бренд, устройство…
        </button>
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <div
          style={{
            background: "var(--accent-grad)",
            borderRadius: "var(--radius-xl)",
            padding: "22px 20px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <div style={{ position: "absolute", right: -20, top: -20, fontSize: 120, opacity: 0.18, lineHeight: 1 }}>💨</div>
          <div style={{ position: "relative", color: "#fff" }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
              Промо недели
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, marginTop: 6, maxWidth: 200, lineHeight: 1.2 }}>
              -20% на жидкости по промокоду
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 12,
                padding: "7px 14px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.04em",
              }}
            >
              CLOUD20
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "22px 0 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 12px" }}>
          <div className="section-title">Категории</div>
        </div>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 10, padding: "0 20px", overflowX: "auto" }}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/catalog?category=${c.id}`)}
              className="card"
              style={{
                flexShrink: 0,
                width: 84,
                padding: "16px 8px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 26 }}>{c.icon}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "26px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-title">🔥 Хиты продаж</div>
          <button onClick={() => navigate("/catalog")} className="text-dim" style={{ background: "none", border: "none", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            Все <ArrowRightIcon size={14} />
          </button>
        </div>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {featured.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {fresh.length > 0 && (
        <div style={{ padding: "26px 20px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="section-title">✨ Новинки</div>
          </div>
          <div className="hide-scrollbar" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {fresh.map((p) => (
              <div key={p.id} style={{ width: 160, flexShrink: 0 }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
