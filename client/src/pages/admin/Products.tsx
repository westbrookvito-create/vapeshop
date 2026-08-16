import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Product, type Category } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { SearchIcon, PlusIcon, ChevronRightIcon } from "../../components/Icons";
import { ListSkeleton } from "../../components/Skeletons";
import EmptyState from "../../components/EmptyState";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();

  const load = () => {
    api.products.list({ active: "all", search: search || undefined, category: categoryFilter }).then(setProducts);
  };

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter]);

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 18px) 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Товары</div>
          <div className="text-faint" style={{ fontSize: 13 }}>{products?.length ?? "…"} позиций</div>
        </div>
        <button onClick={() => navigate("/admin/products/new")} className="btn btn-primary" style={{ width: 44, height: 44, borderRadius: "50%", padding: 0 }}>
          <PlusIcon size={20} strokeWidth={2.4} />
        </button>
      </div>

      <div style={{ padding: "14px 20px 0" }}>
        <div className="glass" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
          <SearchIcon size={17} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск товара" style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 14.5 }} />
        </div>
      </div>

      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, padding: "14px 20px", overflowX: "auto" }}>
        <button className={`chip ${!categoryFilter ? "active" : ""}`} onClick={() => setCategoryFilter(undefined)}>Все</button>
        {categories.map((c) => (
          <button key={c.id} className={`chip ${categoryFilter === c.id ? "active" : ""}`} onClick={() => setCategoryFilter(c.id)}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        {products === null ? (
          <ListSkeleton count={5} height={78} />
        ) : products.length === 0 ? (
          <EmptyState icon="📦" title="Товары не найдены" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {products.map((p) => (
              <button key={p.id} onClick={() => navigate(`/admin/products/${p.id}`)} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 10, opacity: p.isActive ? 1 : 0.55 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: p.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div className="text-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{p.brand}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5 }}>{formatPrice(p.price)}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: p.stock === 0 ? "var(--red)" : p.stock <= 10 ? "var(--amber)" : "var(--text-faint)" }}>
                      · {p.stock} шт.
                    </span>
                    {!p.isActive && <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--text-faint)" }}>· СКРЫТ</span>}
                  </div>
                </div>
                <ChevronRightIcon size={17} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
