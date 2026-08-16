import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, type Category, type Product } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import { SearchIcon, FilterIcon, XIcon, LeafIcon } from "../components/Icons";
import CategoryIcon from "../components/CategoryIcon";
import Sheet from "../components/Sheet";

type SortKey = "popular" | "price_asc" | "price_desc" | "new";

const SHOP_NAME = "TestVape";

export default function Assortment() {
  const [params, setParams] = useSearchParams();
  const categoryId = params.get("category") ? Number(params.get("category")) : undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    api.categories.list().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.products.list({ category: categoryId, search: search || undefined }).then((rows) => {
      setProducts(rows);
      setLoading(false);
    });
  }, [categoryId, search]);

  const sorted = useMemo(() => {
    const copy = [...products];
    switch (sort) {
      case "price_asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price_desc":
        return copy.sort((a, b) => b.price - a.price);
      case "new":
        return copy.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      default:
        return copy.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.reviewsCount - a.reviewsCount);
    }
  }, [products, sort]);

  const sortLabels: Record<SortKey, string> = {
    popular: "Популярные",
    price_asc: "Сначала дешевле",
    price_desc: "Сначала дороже",
    new: "Новинки",
  };

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 18px) 20px 4px" }}>
        <div className="text-faint" style={{ fontSize: 12.5, fontWeight: 600 }}>
          {SHOP_NAME}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2, marginBottom: 14 }}>Ассортимент</div>

        <div style={{ display: "flex", gap: 8 }}>
          <div className="glass" style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <SearchIcon size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Найти по названию, вкусу, бренду"
              style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 14.5 }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--text-faint)", display: "flex" }}>
                <XIcon size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="glass"
            style={{ width: 44, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <FilterIcon size={18} />
          </button>
        </div>
      </div>

      {!search && (
        <div style={{ padding: "16px 20px 0" }}>
          <div
            style={{
              background: "var(--accent-grad)",
              borderRadius: "var(--radius-xl)",
              padding: "18px 20px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <div style={{ position: "absolute", right: -14, top: -14, opacity: 0.18, color: "#fff" }}>
              <LeafIcon size={110} strokeWidth={1.1} />
            </div>
            <div style={{ position: "relative", color: "#fff" }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
                Промо недели
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4, maxWidth: 220, lineHeight: 1.2 }}>
                -20% на жидкости по промокоду
              </div>
              <div
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: "6px 13px",
                  background: "rgba(255,255,255,0.22)",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                }}
              >
                CLOUD20
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hide-scrollbar" style={{ display: "flex", gap: 8, padding: "16px 20px", overflowX: "auto" }}>
        <button className={`chip ${!categoryId ? "active" : ""}`} onClick={() => setParams({})}>
          Все товары
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoryId === c.id ? "active" : ""}`}
            onClick={() => setParams({ category: String(c.id) })}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <CategoryIcon icon={c.icon} size={14} /> {c.name}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="text-faint" style={{ fontSize: 13 }}>
            {loading ? "Загрузка…" : `${sorted.length} товаров`}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{sortLabels[sort]}</span>
        </div>

        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : sorted.length === 0 ? (
          <EmptyState icon={<SearchIcon size={30} strokeWidth={1.4} />} title="Ничего не найдено" subtitle="Попробуйте изменить запрос или выбрать другую категорию" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Сортировка">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(Object.keys(sortLabels) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSort(key);
                setFilterOpen(false);
              }}
              className="card"
              style={{
                textAlign: "left",
                padding: "14px 16px",
                border: sort === key ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                fontWeight: sort === key ? 800 : 600,
                color: sort === key ? "var(--accent)" : "var(--text)",
              }}
            >
              {sortLabels[key]}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
