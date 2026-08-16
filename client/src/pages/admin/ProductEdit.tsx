import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Category } from "../../lib/api";
import Header from "../../components/Header";
import { useToast } from "../../store/toast";
import { TrashIcon, CheckIcon } from "../../components/Icons";

const GRADIENTS = [
  "linear-gradient(135deg,#7b2ff7,#f107a3)",
  "linear-gradient(135deg,#00c6ff,#0072ff)",
  "linear-gradient(135deg,#11998e,#38ef7d)",
  "linear-gradient(135deg,#f857a6,#ff5858)",
  "linear-gradient(135deg,#7f00ff,#e100ff)",
  "linear-gradient(135deg,#00d2ff,#3a47d5)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
  "linear-gradient(135deg,#ee0979,#ff6a00)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#0ba360,#3cba92)",
  "linear-gradient(135deg,#5f2c82,#49a09d)",
];
const NICOTINE_OPTIONS = [0, 3, 6, 20, 35, 50];
const EMOJI_OPTIONS = ["💨", "🍓", "🍉", "🍑", "🍋", "🫐", "🥭", "🍈", "🥤", "☁️", "🧊", "💎", "⚡️", "🔷", "🌀", "🔩", "🔌", "🧷", "🧰"];

const empty = {
  name: "", brand: "", description: "", price: 0, old_price: null as number | null, stock: 0,
  category_id: undefined as number | undefined, nicotine: [] as number[], flavor: "", puffs: null as number | null,
  gradient: GRADIENTS[0], emoji: "💨", is_featured: false, is_new: false, is_active: true,
};

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const show = useToast((s) => s.show);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.categories.list().then((cats) => {
      setCategories(cats);
      setForm((f) => (f.category_id ? f : { ...f, category_id: cats[0]?.id }));
    });
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    api.products.get(Number(id)).then((p) => {
      setForm({
        name: p.name, brand: p.brand, description: p.description, price: p.price, old_price: p.oldPrice, stock: p.stock,
        category_id: p.categoryId, nicotine: p.nicotine, flavor: p.flavor, puffs: p.puffs, gradient: p.gradient,
        emoji: p.emoji, is_featured: p.isFeatured, is_new: p.isNew, is_active: p.isActive,
      });
      setLoading(false);
    });
  }, [id, isNew]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim() || !form.category_id) {
      show("Заполните название и категорию", "error");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await api.products.create(form as any);
        show("Товар создан", "success");
        navigate(`/admin/products/${created.id}`, { replace: true });
      } else {
        await api.products.update(Number(id), form as any);
        show("Изменения сохранены", "success");
      }
    } catch {
      show("Не удалось сохранить", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id || isNew) return;
    if (!confirm("Удалить товар безвозвратно?")) return;
    await api.products.remove(Number(id));
    show("Товар удалён", "success");
    navigate("/admin/products");
  };

  if (loading) {
    return (
      <div className="page">
        <Header title="Товар" back sticky={false} />
        <div style={{ padding: 20 }}>
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingBottom: "calc(var(--nav-h) + var(--safe-bottom) + 90px)" }}>
      <Header
        title={isNew ? "Новый товар" : "Редактировать товар"}
        back
        sticky={false}
        right={
          !isNew && (
            <button onClick={remove} className="glass" style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", color: "var(--red)" }}>
              <TrashIcon size={16} />
            </button>
          )
        }
      />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: 96, height: 96, borderRadius: 26, background: form.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
            {form.emoji}
          </div>
        </div>

        <div>
          <div className="label">Иконка товара</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EMOJI_OPTIONS.map((e) => (
              <button key={e} onClick={() => set("emoji", e)} className="chip" style={{ fontSize: 17, padding: "6px 10px", background: form.emoji === e ? "var(--accent-grad)" : undefined, border: form.emoji === e ? "none" : undefined }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Цвет карточки</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GRADIENTS.map((g) => (
              <button
                key={g}
                onClick={() => set("gradient", g)}
                style={{
                  width: 34, height: 34, borderRadius: 10, background: g, border: form.gradient === g ? "2.5px solid var(--text)" : "2.5px solid transparent",
                }}
              />
            ))}
          </div>
        </div>

        <Field label="Название">
          <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Elf Bar BC5000" />
        </Field>

        <Field label="Бренд">
          <input className="input" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Elf Bar" />
        </Field>

        <Field label="Категория">
          <select className="input" value={form.category_id ?? ""} onChange={(e) => set("category_id", Number(e.target.value))}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Цена, ₽" style={{ flex: 1 }}>
            <input type="number" className="input" value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
          </Field>
          <Field label="Цена до скидки" style={{ flex: 1 }}>
            <input type="number" className="input" value={form.old_price ?? ""} onChange={(e) => set("old_price", e.target.value ? Number(e.target.value) : null)} placeholder="—" />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Остаток на складе" style={{ flex: 1 }}>
            <input type="number" className="input" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </Field>
          <Field label="Затяжек (если есть)" style={{ flex: 1 }}>
            <input type="number" className="input" value={form.puffs ?? ""} onChange={(e) => set("puffs", e.target.value ? Number(e.target.value) : null)} placeholder="—" />
          </Field>
        </div>

        <Field label="Вкус">
          <input className="input" value={form.flavor} onChange={(e) => set("flavor", e.target.value)} placeholder="Арбуз-лёд" />
        </Field>

        <div>
          <div className="label">Крепость никотина, мг</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {NICOTINE_OPTIONS.map((n) => {
              const active = form.nicotine.includes(n);
              return (
                <button
                  key={n}
                  className={`chip ${active ? "active" : ""}`}
                  onClick={() => set("nicotine", active ? form.nicotine.filter((x) => x !== n) : [...form.nicotine, n].sort((a, b) => a - b))}
                >
                  {n} мг
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Описание">
          <textarea className="input" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} style={{ resize: "none" }} />
        </Field>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Toggle label="Хит продаж" checked={form.is_featured} onChange={(v) => set("is_featured", v)} />
          <Toggle label="Новинка" checked={form.is_new} onChange={(v) => set("is_new", v)} />
          <Toggle label="Показывать в каталоге" checked={form.is_active} onChange={(v) => set("is_active", v)} />
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
        <button className="btn btn-primary btn-block" style={{ maxWidth: 440 }} disabled={saving} onClick={save}>
          <CheckIcon size={17} /> {saving ? "Сохраняем…" : "Сохранить товар"}
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="card"
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", border: "1px solid var(--border)" }}
    >
      <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
      <span
        style={{
          width: 42, height: 24, borderRadius: 999, background: checked ? "var(--accent-grad)" : "var(--surface-2)", position: "relative", transition: "background 0.15s ease", flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute", top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.15s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </span>
    </button>
  );
}
