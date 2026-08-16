import { useEffect, useState } from "react";
import { api, type Category } from "../../lib/api";
import Header from "../../components/Header";
import Sheet from "../../components/Sheet";
import { PlusIcon, TrashIcon, EditIcon } from "../../components/Icons";
import { useToast } from "../../store/toast";

const ICONS = ["🔥", "🧊", "🧪", "🧂", "🔋", "🛠", "🍓", "💎", "⚡️", "📦"];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const show = useToast((s) => s.show);

  const load = () => api.categories.list().then(setCategories);
  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setName("");
    setIcon(ICONS[0]);
    setSheetOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setIcon(c.icon);
    setSheetOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    if (editing) {
      await api.categories.update(editing.id, { name, icon });
    } else {
      await api.categories.create({ name, icon, sortOrder: (categories?.length ?? 0) + 1 });
    }
    setSheetOpen(false);
    show("Сохранено", "success");
    load();
  };

  const remove = async (c: Category) => {
    if (c.productCount > 0) {
      show("Нельзя удалить категорию с товарами", "error");
      return;
    }
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;
    await api.categories.remove(c.id);
    load();
  };

  return (
    <div className="page">
      <Header
        title="Категории"
        back
        sticky={false}
        right={
          <button onClick={openNew} className="btn btn-primary" style={{ width: 38, height: 38, borderRadius: "50%", padding: 0 }}>
            <PlusIcon size={17} strokeWidth={2.4} />
          </button>
        }
      />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {categories?.map((c) => (
          <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
            <span style={{ fontSize: 26 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{c.name}</div>
              <div className="text-faint" style={{ fontSize: 12 }}>{c.productCount} товаров</div>
            </div>
            <button onClick={() => openEdit(c)} className="glass" style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
              <EditIcon size={15} />
            </button>
            <button onClick={() => remove(c)} className="glass" style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", color: "var(--red)" }}>
              <TrashIcon size={15} />
            </button>
          </div>
        ))}
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? "Редактировать категорию" : "Новая категория"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div className="label">Иконка</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ICONS.map((e) => (
                <button key={e} onClick={() => setIcon(e)} className="chip" style={{ fontSize: 18, padding: "6px 11px", background: icon === e ? "var(--accent-grad)" : undefined }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="label">Название</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, Аксессуары" />
          </div>
          <button className="btn btn-primary btn-block" onClick={save}>
            Сохранить
          </button>
        </div>
      </Sheet>
    </div>
  );
}
