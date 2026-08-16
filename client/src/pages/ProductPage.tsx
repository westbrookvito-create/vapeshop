import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Product } from "../lib/api";
import { formatPrice } from "../lib/format";
import Header from "../components/Header";
import { HeartIcon, StarIcon, ChevronLeftIcon } from "../components/Icons";
import ProductImage from "../components/ProductImage";
import QuantityStepper from "../components/QuantityStepper";
import { useFavorites } from "../store/favorites";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { haptic, hapticNotify } from "../lib/telegram";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [nicotine, setNicotine] = useState<number | undefined>(undefined);
  const isFav = useFavorites((s) => (product ? s.isFavorite(product.id) : false));
  const toggleFav = useFavorites((s) => s.toggle);
  const addToCart = useCart((s) => s.add);
  const show = useToast((s) => s.show);

  useEffect(() => {
    if (!id) return;
    api.products.get(Number(id)).then((p) => {
      setProduct(p);
      if (p.nicotine.length) setNicotine(p.nicotine[0]);
    });
  }, [id]);

  if (!product) {
    return (
      <div className="page">
        <div style={{ padding: 20 }}>
          <div className="skeleton" style={{ aspectRatio: "1.1", marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 22, width: "70%", marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 16, width: "40%" }} />
        </div>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="page" style={{ paddingBottom: "calc(var(--nav-h) + var(--safe-bottom) + 100px)" }}>
      <div style={{ position: "relative", aspectRatio: "1.05" }}>
        <ProductImage image={product.image} color={product.color} categoryIcon={product.categoryIcon} iconSize={72} />
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: "calc(var(--safe-top) + 14px)",
            left: 16,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(10,10,18,0.35)",
            backdropFilter: "blur(6px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <button
          onClick={() => {
            toggleFav(product.id);
            haptic("light");
          }}
          style={{
            position: "absolute",
            top: "calc(var(--safe-top) + 14px)",
            right: 16,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(10,10,18,0.35)",
            backdropFilter: "blur(6px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isFav ? "var(--pink)" : "#fff",
          }}
        >
          <HeartIcon size={17} filled={isFav} />
        </button>
        <div style={{ position: "absolute", bottom: 14, left: 16, display: "flex", gap: 6 }}>
          {product.isNew && <span className="badge badge-new">New</span>}
          {product.oldPrice && <span className="badge badge-sale">-{Math.round((1 - product.price / product.oldPrice) * 100)}%</span>}
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div className="text-faint" style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          {product.brand}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, letterSpacing: "-0.01em", lineHeight: 1.25 }}>{product.name}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StarIcon size={15} filled />
            <span style={{ fontWeight: 800, fontSize: 14.5 }}>{product.rating.toFixed(1)}</span>
            <span className="text-faint" style={{ fontSize: 13 }}>({product.reviewsCount} отзывов)</span>
          </div>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: outOfStock ? "var(--red)" : product.stock <= 10 ? "var(--amber)" : "var(--green)",
            }}
          >
            {outOfStock ? "Нет в наличии" : product.stock <= 10 ? `Осталось ${product.stock} шт.` : "В наличии"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 800 }}>{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-faint" style={{ fontSize: 16, textDecoration: "line-through" }}>
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {product.flavor && product.flavor !== "—" && (
          <div style={{ marginTop: 20 }}>
            <div className="label">Вкус</div>
            <div className="chip active" style={{ cursor: "default" }}>
              {product.flavor}
            </div>
          </div>
        )}

        {product.nicotine.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="label">Крепость никотина, мг</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.nicotine.map((n) => (
                <button key={n} className={`chip ${nicotine === n ? "active" : ""}`} onClick={() => setNicotine(n)}>
                  {n === 0 ? "0 (без никотина)" : `${n} мг`}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.puffs && (
          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <div className="card" style={{ padding: "12px 14px", flex: 1 }}>
              <div className="text-faint" style={{ fontSize: 11.5, fontWeight: 700 }}>Затяжек</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>{product.puffs.toLocaleString("ru-RU")}</div>
            </div>
            <div className="card" style={{ padding: "12px 14px", flex: 1 }}>
              <div className="text-faint" style={{ fontSize: 11.5, fontWeight: 700 }}>Бренд</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 2 }}>{product.brand}</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <div className="label">Описание</div>
          <p className="text-dim" style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
            {product.description}
          </p>
        </div>

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="label" style={{ marginBottom: 0 }}>Количество</div>
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "calc(var(--nav-h) + var(--safe-bottom))",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          padding: "12px 20px",
          background: "linear-gradient(0deg, var(--bg) 60%, transparent)",
          zIndex: 50,
        }}
      >
        <div style={{ width: "100%", maxWidth: 440, display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 700 }}>Итого</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{formatPrice(product.price * qty)}</div>
          </div>
          <button
            disabled={outOfStock}
            className="btn btn-primary"
            style={{ flex: 2 }}
            onClick={() => {
              addToCart(product, { qty, nicotine });
              hapticNotify("success");
              show(`${product.name} добавлен в корзину`, "success");
            }}
          >
            {outOfStock ? "Нет в наличии" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}
