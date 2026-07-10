import { useState } from "react";
import { Search, X, Check, Send } from "lucide-react";
import styles from "./Formularios.module.css";

interface AssignPatient {
  name: string;
  meta: string;
  initials: string;
  avClass: string;
}

const patients: AssignPatient[] = [
  { name: "Elena Martín", meta: "Fase 2 · Activo", initials: "EM", avClass: styles.avPlum },
  { name: "Lucía Fernández", meta: "Fase 1 · Activo", initials: "LF", avClass: styles.avTerracota },
  { name: "Marcos Iglesias", meta: "Mantenimiento", initials: "MI", avClass: styles.avSage },
  { name: "Javier Morán", meta: "Seguimiento", initials: "JM", avClass: styles.avLilac },
  { name: "Carla Ríos", meta: "Fase 3 · Activo", initials: "CR", avClass: styles.avPlum },
  { name: "Diego Salas", meta: "Primera consulta", initials: "DS", avClass: styles.avSage },
];

/**
 * Modal de asignación de un formulario a pacientes (solo UI).
 * Buscador + lista con avatar y checkbox + botón de envío.
 */
export function AssignFormModal({
  open,
  formTitle,
  onClose,
}: {
  open: boolean;
  formTitle: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  if (!open) return null;

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h2 id="assign-title" className={styles.modalTitle}>
              Asignar formulario
            </h2>
            <p className={styles.modalSub}>
              «{formTitle || "Formulario sin título"}» · elige a quién enviarlo
            </p>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.searchBox}>
          <Search size={18} color="#a89bb0" />
          <input
            className={styles.searchInput}
            placeholder="Buscar paciente…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar paciente"
          />
        </div>

        <div className={styles.patientScroll}>
          {filtered.map((p) => {
            const isChecked = selected.includes(p.name);
            return (
              <button
                key={p.name}
                type="button"
                className={`${styles.patientRow} ${
                  isChecked ? styles.patientRowSelected : ""
                }`}
                onClick={() => toggle(p.name)}
              >
                <span className={`${styles.avatar} ${p.avClass}`}>
                  {p.initials}
                </span>
                <span className={styles.patientInfo}>
                  <span className={styles.patientName}>{p.name}</span>
                  <br />
                  <span className={styles.patientMeta}>{p.meta}</span>
                </span>
                <span
                  className={`${styles.checkbox} ${
                    isChecked ? styles.checkboxOn : ""
                  }`}
                >
                  {isChecked && <Check size={15} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className={styles.formIntroText}>Sin resultados para «{query}».</p>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.primaryButton}
            disabled={selected.length === 0}
          >
            <Send size={16} />
            Enviar Formulario a Seleccionados
            {selected.length > 0 && ` (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
