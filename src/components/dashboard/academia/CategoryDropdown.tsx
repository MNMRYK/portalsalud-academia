import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2, Check } from "lucide-react";
import styles from "../Academia.module.css";

interface CategoryDropdownProps {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
}

export function CategoryDropdown({
  categories,
  value,
  onChange,
  onAddCategory,
  onRemoveCategory,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleAdd = () => {
    const name = draft.trim();
    if (!name || categories.includes(name)) return;
    onAddCategory(name);
    onChange(name);
    setDraft("");
  };

  return (
    <div className={styles.catField} ref={ref}>
      <button
        type="button"
        className={styles.catTrigger}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? undefined : styles.catPlaceholder}>
          {value || "Selecciona una categoría"}
        </span>
        <ChevronDown size={17} />
      </button>

      {open && (
        <div className={styles.catMenu}>
          {categories.map((cat) => (
            <div
              key={cat}
              className={`${styles.catItem} ${
                cat === value ? styles.catItemActive : ""
              }`}
              onClick={() => {
                onChange(cat);
                setOpen(false);
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                {cat === value && <Check size={15} />}
                {cat}
              </span>
              <button
                type="button"
                className={styles.catItemDelete}
                aria-label={`Eliminar categoría ${cat}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCategory(cat);
                  if (cat === value) onChange("");
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <div className={styles.catAddRow}>
            <input
              className={styles.catAddInput}
              placeholder="Nueva categoría…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <button type="button" className={styles.catAddBtn} onClick={handleAdd}>
              <Plus size={14} strokeWidth={2.5} /> Añadir nueva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
