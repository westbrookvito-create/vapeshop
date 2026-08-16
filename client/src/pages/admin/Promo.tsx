import { useEffect, useState } from "react";
import { api, type PromoCode } from "../../lib/api";
import Header from "../../components/Header";
import Sheet from "../../components/Sheet";
import { PlusIcon, TrashIcon } from "../../components/Icons";
import { useToast } from "../../store/toast";

export default function AdminPromo() {
  const [promos, setPromos] = useState<PromoCode[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(10);
  const [limit, setLimit] = useState(0);
  const show = useToast((s) => s.show);

  const load = () => api.promo.list().then(setPromos);
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!code.trim()) return;
    try {
      await api.promo.create({ code: code.trim(), discountPercent: discount, usageLimit: limit });
      setSheetOpen(false);
      setCode("");
      setDiscount(10);
      setLimit(0);
      show("Промокод создан", "success");
      load();
    } catch {
      show("Такой промокод уже существует", "error");
    }
  };

  const toggleActive = async (p: PromoCode) => {
    await api.promo.update(p.id, { active: !p.active });
    load();
  };

  const remove = async (p: PromoCode) => {
    if (!confirm(`Удалить промокод ${p.code}?`)) return;
    await api.promo.remove(p.id);
    load();
  };

  return (
    <div className="page">
      <Header
        title="Промокоды"
        back
        sticky={false}
        right={
          <button onClick={() => setSheetOpen(true)} className="btn btn-primary" style={{ width: 38, height: 38, borderRadius: "50%", padding: 0 }}>
            <PlusIcon size={17} strokeWidth={2.4} />
          </button>
        }
      />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {promos?.map((p) => (
          <div key={p.id} className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, opacity: p.active ? 1 : 0.55 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: "var(--accent-grad)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
              -{p.discountPercent}%
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.02em" }}>{p.code}</div>
              <div className="text-faint" style={{ fontSize: 12 }}>
                Использован {p.usedCount}{p.usageLimit > 0 ? ` из ${p.usageLimit}` : ""} раз
              </div>
            </div>
            <button onClick={() => toggleActive(p)} className="chip" style={{ background: p.active ? "rgba(55,226,140,0.15)" : "var(--surface-2)", color: p.active ? "var(--green)" : "var(--text-faint)" }}>
              {p.active ? "Активен" : "Выключен"}
            </button>
            <button onClick={() => remove(p)} style={{ background: "none", border: "none", color: "var(--text-faint)" }}>
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Новый промокод">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div className="label">Код</div>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER25" />
          </div>
          <div>
            <div className="label">Скидка, %</div>
            <input type="number" className="input" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
          </div>
          <div>
            <div className="label">Лимит использований (0 — без лимита)</div>
            <input type="number" className="input" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
          </div>
          <button className="btn btn-primary btn-block" onClick={create}>
            Создать промокод
          </button>
        </div>
      </Sheet>
    </div>
  );
}
