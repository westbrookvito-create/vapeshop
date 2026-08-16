import { useEffect, useState } from "react";
import { api, type WheelState } from "../lib/api";
import { useSession } from "../store/session";
import { useToast } from "../store/toast";
import { hapticNotify, haptic } from "../lib/telegram";
import { GiftIcon, LockIcon, CheckIcon } from "../components/Icons";

const SEGMENT_ANGLE = 360 / 8;

export default function Bonuses() {
  const user = useSession((s) => s.user);
  const addBonusPoints = useSession((s) => s.addBonusPoints);
  const show = useToast((s) => s.show);
  const [state, setState] = useState<WheelState | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<WheelState["prize"]>(null);

  useEffect(() => {
    if (!user?.telegramId) return;
    api.wheel.get(user.telegramId).then((s) => {
      setState(s);
      if (s.spun && s.prize) {
        setRevealed(s.prize);
        setRotation(targetRotation(s.prize.segmentIndex, 0));
      }
    });
  }, [user?.telegramId]);

  const spin = async () => {
    if (!user?.telegramId || spinning) return;
    setSpinning(true);
    haptic("medium");
    try {
      const prize = await api.wheel.spin(user.telegramId);
      setRotation((prev) => targetRotation(prize.segmentIndex, prev));
      setTimeout(() => {
        setRevealed(prize);
        setSpinning(false);
        if (prize.type === "points") addBonusPoints(prize.value);
        hapticNotify(prize.type === "none" ? "warning" : "success");
        show(prize.type === "none" ? "В этот раз не повезло" : `Ваш приз: ${prize.label}`, prize.type === "none" ? "info" : "success");
      }, 4200);
    } catch {
      setSpinning(false);
      show("Не удалось запустить колесо", "error");
    }
  };

  return (
    <div className="page">
      <div style={{ padding: "calc(var(--safe-top) + 22px) 20px 0" }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Бонусы</div>
        <div className="text-faint" style={{ fontSize: 13, marginTop: 2 }}>Баллы и колесо фортуны</div>
      </div>

      <div style={{ padding: "18px 20px 0" }}>
        <div
          style={{
            background: "var(--accent-grad)",
            borderRadius: "var(--radius-xl)",
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fff",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", opacity: 0.8 }}>Бонусный счёт</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{user?.bonusPoints ?? 0} баллов</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GiftIcon size={24} />
          </div>
        </div>
      </div>

      <div style={{ padding: "26px 20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="section-title" style={{ alignSelf: "flex-start", marginBottom: 4 }}>Колесо фортуны</div>
        <div className="text-faint" style={{ fontSize: 13, alignSelf: "flex-start", marginBottom: 20 }}>
          Доступно после 3 заказов — один раз на аккаунт
        </div>

        {!state ? (
          <div className="skeleton" style={{ width: 280, height: 280, borderRadius: "50%" }} />
        ) : !state.eligible ? (
          <LockedWheel ordersCount={state.ordersCount} ordersRequired={state.ordersRequired} />
        ) : (
          <>
            <Wheel segments={state.segments} rotation={rotation} spinning={spinning} />
            {!revealed ? (
              <button className="btn btn-primary" style={{ marginTop: 24, minWidth: 200 }} disabled={spinning} onClick={spin}>
                {spinning ? "Крутится…" : "Крутить колесо"}
              </button>
            ) : (
              <PrizeCard prize={revealed} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function targetRotation(segmentIndex: number, currentRotation: number) {
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const segmentCenter = segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  const neededStop = (360 - segmentCenter) % 360;
  let delta = neededStop - currentMod;
  if (delta < 0) delta += 360;
  const extraSpins = 5 * 360;
  return currentRotation + extraSpins + delta;
}

function colorForType(type: string) {
  if (type === "discount") return "#1f5c3f";
  if (type === "points") return "#4c8a68";
  return "#e3ebe6";
}

function Wheel({ segments, rotation, spinning }: { segments: WheelState["segments"]; rotation: number; spinning: boolean }) {
  const gradient = segments
    .map((s, i) => `${colorForType(s.type)} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`)
    .join(", ");

  return (
    <div style={{ position: "relative", width: 280, height: 280 }}>
      <div
        style={{
          position: "absolute",
          top: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "18px solid var(--text)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `conic-gradient(${gradient})`,
          border: "6px solid #fff",
          boxShadow: "var(--shadow-card), 0 0 0 1.5px var(--border)",
          position: "relative",
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "transform 4.1s cubic-bezier(0.15, 0.65, 0.1, 1)" : "none",
        }}
      >
        {segments.map((s, i) => {
          const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 110,
                textAlign: "center",
                transform: `rotate(${angle}deg) translate(0, -108px) rotate(${angle > 90 && angle < 270 ? 180 : 0}deg)`,
                transformOrigin: "0 0",
                marginLeft: -55,
                color: s.type === "none" ? "var(--text-dim)" : "#fff",
                fontSize: 12.5,
                fontWeight: 800,
              }}
            >
              {s.label}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#fff",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent)",
        }}
      >
        <GiftIcon size={24} />
      </div>
    </div>
  );
}

function LockedWheel({ ordersCount, ordersRequired }: { ordersCount: number; ordersRequired: number }) {
  const pct = Math.min(100, Math.round((ordersCount / ordersRequired) * 100));
  return (
    <div
      style={{
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textAlign: "center",
        padding: 30,
      }}
    >
      <div style={{ color: "var(--text-faint)" }}>
        <LockIcon size={34} strokeWidth={1.4} />
      </div>
      <div style={{ fontWeight: 800, fontSize: 15 }}>
        {ordersCount} из {ordersRequired} заказов
      </div>
      <div style={{ width: 140, height: 6, borderRadius: 999, background: "var(--surface-hover)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 999 }} />
      </div>
      <div className="text-faint" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
        Сделайте ещё {Math.max(0, ordersRequired - ordersCount)} заказ(а), чтобы открыть колесо фортуны
      </div>
    </div>
  );
}

function PrizeCard({ prize }: { prize: NonNullable<WheelState["prize"]> }) {
  return (
    <div className="card" style={{ marginTop: 24, padding: 18, width: "100%", maxWidth: 320, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-grad-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
          <CheckIcon size={18} />
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{prize.type === "none" ? "В этот раз не повезло" : `Вы выиграли: ${prize.label}`}</div>
      {prize.promoCode && (
        <div style={{ marginTop: 10 }}>
          <div className="text-faint" style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase" }}>Промокод</div>
          <div className="chip active" style={{ marginTop: 6, cursor: "default", fontSize: 14 }}>{prize.promoCode}</div>
          <div className="text-faint" style={{ fontSize: 11.5, marginTop: 6 }}>Примените его при оформлении заказа</div>
        </div>
      )}
      {prize.type === "points" && (
        <div className="text-faint" style={{ fontSize: 12.5, marginTop: 8 }}>Баллы уже начислены на счёт</div>
      )}
    </div>
  );
}
