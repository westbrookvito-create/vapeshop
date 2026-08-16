import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useSession } from "../store/session";
import { api, type PickupPoint } from "../lib/api";
import { formatPrice } from "../lib/format";
import Header from "../components/Header";
import Sheet from "../components/Sheet";
import { TruckIcon, BoxIcon, WalletIcon, CheckIcon, MapPinIcon, BanknoteIcon, ChevronRightIcon } from "../components/Icons";
import { useToast } from "../store/toast";
import { hapticNotify } from "../lib/telegram";

export default function Checkout() {
  const navigate = useNavigate();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const user = useSession((s) => s.user);
  const show = useToast((s) => s.show);

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [comment, setComment] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [pointId, setPointId] = useState<number | null>(null);
  const [pointSheetOpen, setPointSheetOpen] = useState(false);

  useEffect(() => {
    api.pickupPoints.list().then((rows) => {
      setPoints(rows);
      setPointId((prev) => prev ?? rows[0]?.id ?? null);
    });
  }, []);

  const selectedPoint = points.find((p) => p.id === pointId) || null;

  const delivery = deliveryMethod === "delivery" ? (subtotal >= 3000 ? 0 : 300) : 0;
  const discount = promo ? Math.round((subtotal * promo.discountPercent) / 100) : 0;
  const total = subtotal + delivery - discount;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const res = await api.promo.validate(promoInput.trim());
      setPromo({ code: res.code, discountPercent: res.discountPercent });
      setPromoError("");
      hapticNotify("success");
    } catch {
      setPromo(null);
      setPromoError("Промокод не найден или недействителен");
      hapticNotify("error");
    }
  };

  const submit = async () => {
    if (deliveryMethod === "delivery" && !address.trim()) {
      show("Укажите адрес доставки", "error");
      return;
    }
    if (deliveryMethod === "pickup" && !pointId) {
      show("Выберите точку самовывоза", "error");
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.orders.create({
        userId: user?.telegramId || 0,
        userName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        userUsername: user?.username || "",
        items: lines.map((l) => ({ id: l.productId, name: l.name, price: l.price, qty: l.qty, flavor: l.flavor })),
        subtotal,
        discount,
        total,
        deliveryMethod,
        address: deliveryMethod === "delivery" ? address : "",
        pickupPointId: deliveryMethod === "pickup" ? pointId : null,
        paymentMethod,
        promoCode: promo?.code || "",
        comment,
      });
      clear();
      hapticNotify("success");
      show("Заказ оформлен!", "success");
      navigate(`/orders/${order.id}`);
    } catch {
      show("Не удалось оформить заказ", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: "calc(var(--nav-h) + var(--safe-bottom) + 110px)" }}>
      <Header title="Оформление заказа" back sticky={false} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div className="label">Способ получения</div>
          <div style={{ display: "flex", gap: 10 }}>
            <OptionCard active={deliveryMethod === "delivery"} onClick={() => setDeliveryMethod("delivery")} icon={<TruckIcon size={18} />} title="Доставка" subtitle="1-2 дня" />
            <OptionCard active={deliveryMethod === "pickup"} onClick={() => setDeliveryMethod("pickup")} icon={<BoxIcon size={18} />} title="Самовывоз" subtitle="Сегодня" />
          </div>
        </div>

        {deliveryMethod === "delivery" ? (
          <div>
            <div className="label">Адрес доставки</div>
            <textarea
              className="input"
              placeholder="Город, улица, дом, квартира"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>
        ) : (
          <div>
            <div className="label">Точка самовывоза</div>
            <button
              onClick={() => points.length > 1 && setPointSheetOpen(true)}
              className="card"
              style={{ width: "100%", padding: 14, display: "flex", gap: 10, alignItems: "center", border: "1px solid var(--border)" }}
            >
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>
                <MapPinIcon size={22} strokeWidth={1.6} />
              </span>
              <div style={{ textAlign: "left", flex: 1 }}>
                {selectedPoint ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedPoint.name}</div>
                    <div className="text-faint" style={{ fontSize: 12.5 }}>{selectedPoint.address}</div>
                    {selectedPoint.hours && <div className="text-faint" style={{ fontSize: 12.5 }}>{selectedPoint.hours}</div>}
                  </>
                ) : (
                  <div className="text-faint" style={{ fontSize: 13 }}>Загрузка точек…</div>
                )}
              </div>
              {points.length > 1 && <ChevronRightIcon size={17} />}
            </button>
          </div>
        )}

        <div>
          <div className="label">Оплата</div>
          <div style={{ display: "flex", gap: 10 }}>
            <OptionCard active={paymentMethod === "card"} onClick={() => setPaymentMethod("card")} icon={<WalletIcon size={18} />} title="Картой" subtitle="Онлайн" />
            <OptionCard active={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")} icon={<BanknoteIcon size={18} />} title="Наличными" subtitle="При получении" />
          </div>
        </div>

        <div>
          <div className="label">Промокод</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="Введите промокод"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase());
                setPromoError("");
              }}
              style={{ flex: 1 }}
            />
            <button className="btn btn-secondary" onClick={applyPromo}>
              Применить
            </button>
          </div>
          {promo && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 13, fontWeight: 700 }}>
              <CheckIcon size={15} /> Промокод {promo.code} применён: -{promo.discountPercent}%
            </div>
          )}
          {promoError && (
            <div style={{ marginTop: 8, color: "var(--red)", fontSize: 13, fontWeight: 600 }}>{promoError}</div>
          )}
        </div>

        <div>
          <div className="label">Комментарий к заказу</div>
          <textarea
            className="input"
            placeholder="Необязательно"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ resize: "none" }}
          />
        </div>

        <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <Row label="Сумма товаров" value={formatPrice(subtotal)} />
          {deliveryMethod === "delivery" ? (
            <Row label="Доставка" value={delivery === 0 ? "Бесплатно" : formatPrice(delivery)} />
          ) : (
            <Row label="Самовывоз" value="Бесплатно" />
          )}
          {discount > 0 && <Row label="Скидка" value={`-${formatPrice(discount)}`} highlight />}
          <div style={{ height: 1, background: "var(--border)" }} />
          <Row label="Итого" value={formatPrice(total)} big />
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
          background: "linear-gradient(0deg, var(--bg) 65%, transparent)",
          zIndex: 50,
        }}
      >
        <button className="btn btn-primary btn-block" style={{ maxWidth: 440 }} disabled={submitting} onClick={submit}>
          {submitting ? "Оформляем…" : `Оплатить ${formatPrice(total)}`}
        </button>
      </div>

      <Sheet open={pointSheetOpen} onClose={() => setPointSheetOpen(false)} title="Точка самовывоза">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {points.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPointId(p.id);
                setPointSheetOpen(false);
              }}
              className="card"
              style={{
                textAlign: "left",
                padding: "14px 16px",
                border: pointId === p.id ? "1.5px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14, color: pointId === p.id ? "var(--accent)" : "var(--text)" }}>{p.name}</div>
              <div className="text-faint" style={{ fontSize: 12.5, marginTop: 2 }}>{p.address}</div>
              {p.hours && <div className="text-faint" style={{ fontSize: 12.5 }}>{p.hours}</div>}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

function OptionCard({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: any; title: string; subtitle: string }) {
  return (
    <button
      onClick={onClick}
      className="card"
      style={{
        flex: 1,
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-grad-soft)" : "var(--surface)",
      }}
    >
      <span style={{ color: active ? "var(--accent)" : "var(--text-dim)", fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 13.5 }}>{title}</div>
        <div className="text-faint" style={{ fontSize: 11.5 }}>{subtitle}</div>
      </div>
    </button>
  );
}

function Row({ label, value, big, highlight }: { label: string; value: string; big?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className={big ? "" : "text-dim"} style={{ fontSize: big ? 16 : 14, fontWeight: big ? 800 : 600 }}>
        {label}
      </span>
      <span style={{ fontSize: big ? 19 : 14, fontWeight: 800, color: highlight ? "var(--green)" : "var(--text)" }}>{value}</span>
    </div>
  );
}
