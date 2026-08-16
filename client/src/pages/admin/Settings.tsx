import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { api } from "../../lib/api";
import Header from "../../components/Header";
import { CheckIcon } from "../../components/Icons";
import { useToast } from "../../store/toast";

export default function AdminSettings() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const show = useToast((s) => s.show);

  useEffect(() => {
    api.settings.get().then((s) => {
      setForm(s);
      setLoading(false);
    });
  }, []);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await api.settings.update(form);
      show("Настройки сохранены", "success");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Header title="Настройки" back sticky={false} />
        <div style={{ padding: 20 }}>
          <div className="skeleton" style={{ height: 260 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingBottom: "calc(var(--nav-h) + var(--safe-bottom) + 90px)" }}>
      <Header title="Настройки магазина" back sticky={false} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Название магазина">
          <input className="input" value={form.shop_name || ""} onChange={(e) => set("shop_name", e.target.value)} />
        </Field>
        <Field label="Описание">
          <textarea className="input" rows={2} value={form.shop_description || ""} onChange={(e) => set("shop_description", e.target.value)} style={{ resize: "none" }} />
        </Field>
        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Стоимость доставки, ₽" style={{ flex: 1 }}>
            <input type="number" className="input" value={form.delivery_price || ""} onChange={(e) => set("delivery_price", e.target.value)} />
          </Field>
          <Field label="Бесплатно от, ₽" style={{ flex: 1 }}>
            <input type="number" className="input" value={form.free_delivery_from || ""} onChange={(e) => set("free_delivery_from", e.target.value)} />
          </Field>
        </div>
        <Field label="Telegram поддержки (username)">
          <input className="input" value={form.support_username || ""} onChange={(e) => set("support_username", e.target.value)} />
        </Field>
        <Field label="Минимальный возраст">
          <input type="number" className="input" value={form.min_age || ""} onChange={(e) => set("min_age", e.target.value)} />
        </Field>
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
        <button className="btn btn-primary btn-block" style={{ maxWidth: 440 }} disabled={saving} onClick={save}>
          <CheckIcon size={17} /> {saving ? "Сохраняем…" : "Сохранить настройки"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={style}>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}
