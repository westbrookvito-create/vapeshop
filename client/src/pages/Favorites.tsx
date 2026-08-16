import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type Product } from "../lib/api";
import { useFavorites } from "../store/favorites";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import EmptyState from "../components/EmptyState";
import { ProductGridSkeleton } from "../components/Skeletons";
import { HeartIcon } from "../components/Icons";

export default function Favorites() {
  const navigate = useNavigate();
  const ids = useFavorites((s) => s.ids);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    api.products.list().then((all) => setProducts(all.filter((p) => ids.includes(p.id))));
  }, [ids]);

  return (
    <div className="page">
      <Header title="Избранное" back sticky={false} />
      <div style={{ padding: "0 20px" }}>
        {products === null ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<HeartIcon size={30} strokeWidth={1.4} />}
            title="Пока пусто"
            subtitle="Нажмите на сердечко у товара, чтобы добавить его сюда"
            action={
              <button className="btn btn-primary" onClick={() => navigate("/catalog")}>
                В каталог
              </button>
            }
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
