import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Category } from "../../lib/api";
import Header from "../../components/Header";
import ProductImage from "../../components/ProductImage";
import { useToast } from "../../store/toast";
import { TrashIcon, CheckIcon, CameraIcon, UploadCloudIcon, XIcon } from "../../components/Icons";

const COLORS = [
  "#3c6449", "#4c6a55", "#5f9271", "#6b8574", "#7c9463", "#55703f",
  "#8a6240", "#a9784f", "#6b4a2e", "#4c584b", "#9c7b52", "#3f5346",
];
const NICOTINE_OPTIONS = [0, 3, 6, 20, 35, 50];

const empty = {
  name: "", brand: "", description: "", price: 0, old_price: null as number | null, stock: 0,
  category_id: undefined as number | undefined, nicotine: [] as number[], flavor: "", puffs: null as number | null,
  color: COLORS[0], image: null as string | null, is_featured: false, is_new: false, is_active: true,
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const show = useToast((s) => s.show);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        category_id: p.categoryId, nicotine: p.nicotine, flavor: p.flavor, puffs: p.puffs, color: p.color,
        image: p.image, is_featured: p.isFeatured, is_new: p.isNew, is_active: p.isActive,
      });
      setLoading(false);
    });
  }, [id, isNew]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      show("Выберите файл изображения", "error");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const { url } = await api.upload.image(dataUrl);
      set("image", url);
      show("Фото загружено", "success");
    } catch {
      show("Не удалось загрузить фото", "error");
    } finally {
      setUploading(false);
    }
  };

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
        <div>
          <div className="label">Фото товара</div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickPhoto} style={{ display: "none" }} />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="card"
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1.4",
              overflow: "hidden",
              cursor: "pointer",
              border: "1.5px dashed var(--border-strong)",
            }}
          >
            <ProductImage image={form.image} color={form.color} iconSize={40} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: form.image ? "rgba(11,17,13,0.45)" : "transparent",
                color: "#fff",
              }}
            >
              {uploading ? (
                <span style={{ fontSize: 13, fontWeight: 700 }}>Загрузка…</span>
              ) : (
                <>
                  <UploadCloudIcon size={26} strokeWidth={1.5} />
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{form.image ? "Заменить фото" : "Загрузить фото"}</span>
                </>
              )}
            </div>
            {form.image && !uploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  set("image", null);
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(11,17,13,0.55)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
          <div className="text-faint" style={{ fontSize: 11.5, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <CameraIcon size={13} /> JPG, PNG или WEBP, до 6 МБ
          </div>
        </div>

        <div>
          <div className="label">Цвет карточки (если без фото)</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => set("color", c)}
                style={{
                  width: 30, height: 30, borderRadius: 9, background: c, border: form.color === c ? "2.5px solid var(--text)" : "2.5px solid transparent",
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
              <option key={c.id} value={c.id}>{c.name}</option>
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
