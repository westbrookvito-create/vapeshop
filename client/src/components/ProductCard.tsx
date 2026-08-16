import { useNavigate } from "react-router-dom";
import type { Product } from "../lib/api";
import { formatPrice } from "../lib/format";
import { HeartIcon, StarIcon, PlusIcon } from "./Icons";
import ProductImage from "./ProductImage";
import { useFavorites } from "../store/favorites";
import { useCart } from "../store/cart";
import { useToast } from "../store/toast";
import { haptic } from "../lib/telegram";

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const isFav = useFavorites((s) => s.isFavorite(product.id));
  const toggleFav = useFavorites((s) => s.toggle);
  const addToCart = useCart((s) => s.add);
  const show = useToast((s) => s.show);
  const outOfStock = product.stock <= 0;
  const hasFlavor = product.flavor && product.flavor !== "—";

  return (
    <div
      className="card"
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      <div style={{ position: "relative", aspectRatio: "1.15" }}>
        <ProductImage image={product.image} color={product.color} />

        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {product.isNew && <span className="badge badge-new">New</span>}
          {product.oldPrice && <span className="badge badge-sale">-{Math.round((1 - product.price / product.oldPrice) * 100)}%</span>}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(product.id);
            haptic("light");
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 30,
            height: 30,
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
          <HeartIcon size={15} filled={isFav} />
        </button>

        {outOfStock && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10,10,18,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            Нет в наличии
          </div>
        )}
      </div>

      <div style={{ padding: "11px 12px 13px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div className="text-faint" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
          {product.brand}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, minHeight: 34 }}>{product.name}</div>

        {(hasFlavor || product.nicotine.length > 0) && (
          <div className="text-faint" style={{ fontSize: 11, lineHeight: 1.3 }}>
            {[hasFlavor ? product.flavor : null, product.nicotine.length ? `${product.nicotine.join("/")} мг` : null]
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}>
          <StarIcon size={12} filled />
          <span style={{ fontWeight: 700 }}>{product.rating.toFixed(1)}</span>
          <span className="text-faint">({product.reviewsCount})</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: outOfStock ? "var(--red)" : product.stock <= 10 ? "var(--amber)" : "var(--green)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ color: outOfStock ? "var(--red)" : product.stock <= 10 ? "var(--amber)" : "var(--green)" }}>
            {outOfStock ? "Нет в наличии" : product.stock <= 10 ? `Осталось ${product.stock} шт.` : "В наличии"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{formatPrice(product.price)}</div>
            {product.oldPrice && (
              <div className="text-faint" style={{ fontSize: 12, textDecoration: "line-through" }}>
                {formatPrice(product.oldPrice)}
              </div>
            )}
          </div>
          <button
            disabled={outOfStock}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              haptic("medium");
              show(`${product.name} — в корзине`, "success");
            }}
            className="btn-primary"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "none",
            }}
          >
            <PlusIcon size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
