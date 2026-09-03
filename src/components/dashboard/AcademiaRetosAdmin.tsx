import { useState } from "react";
import { Plus, Pencil, Trash2, Trophy, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import {
  useChallenges,
  type Challenge,
  type ChallengeDraft,
} from "../../context/ChallengesContext";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

const emptyDraft: ChallengeDraft = {
  title: "",
  desc: "",
  category: "Alimentación",
  durationDays: 7,
  active: true,
  steps: [],
};

/** Vista Gestión de Retos (Admin): CRUD completo sobre los retos de la plataforma. */
export function AcademiaRetosAdmin() {
  const { challenges, progressOf, addChallenge, updateChallenge, removeChallenge } =
    useChallenges();
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<ChallengeDraft>(emptyDraft);
  const [stepsText, setStepsText] = useState("");
  const [deleting, setDeleting] = useState<Challenge | null>(null);

  const openCreate = () => {
    setDraft(emptyDraft);
    setStepsText("");
    setEditing(null);
    setCreating(true);
  };

  const openEdit = (ch: Challenge) => {
    setDraft({
      title: ch.title,
      desc: ch.desc,
      category: ch.category,
      durationDays: ch.durationDays,
      active: ch.active,
      steps: ch.steps,
    });
    setStepsText(ch.steps.map((s) => s.label).join("\n"));
    setCreating(false);
    setEditing(ch);
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = () => {
    const steps = stepsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((label, i) => ({ id: `s${i}-${label.slice(0, 8)}`, label }));
    const payload: ChallengeDraft = { ...draft, steps };
    if (editing) {
      updateChallenge(editing.id, payload);
    } else {
      addChallenge(payload);
    }
    closeForm();
  };

  const formOpen = creating || editing !== null;

  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Gestión de Retos</h1>
            <p className={styles.greetingSub}>
              Crea, edita, publica y elimina los retos que verán tus alumnos.
            </p>
          </div>
          <button type="button" className={academia.retPrimary} onClick={openCreate}>
            <Plus size={16} strokeWidth={2.6} /> Añadir reto
          </button>
        </header>

        <div className={academia.retTableWrap}>
          <table className={academia.retTable}>
            <thead>
              <tr>
                <th>Reto</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Pasos</th>
                <th>Estado</th>
                <th>Progreso medio</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {challenges.map((ch) => {
                const p = progressOf(ch.id);
                return (
                  <tr key={ch.id}>
                    <td>
                      <span className={academia.retCellTitle}>
                        <Trophy size={15} strokeWidth={2} />
                        {ch.title}
                      </span>
                      <span className={academia.retCellDesc}>{ch.desc}</span>
                    </td>
                    <td>{ch.category}</td>
                    <td>{ch.durationDays} días</td>
                    <td>{ch.steps.length}</td>
                    <td>
                      <span
                        className={`${academia.retState} ${
                          ch.active ? academia.retStateOn : academia.retStateOff
                        }`}
                      >
                        {ch.active ? "Publicado" : "Borrador"}
                      </span>
                    </td>
                    <td>{p.pct}%</td>
                    <td>
                      <div className={academia.retActions}>
                        <button
                          type="button"
                          className={academia.retIconBtn}
                          onClick={() => openEdit(ch)}
                          aria-label={`Editar ${ch.title}`}
                        >
                          <Pencil size={15} strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          className={`${academia.retIconBtn} ${academia.retIconBtnDanger}`}
                          onClick={() => setDeleting(ch)}
                          aria-label={`Eliminar ${ch.title}`}
                        >
                          <Trash2 size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {formOpen && (
        <div className={academia.retOverlay} role="dialog" aria-modal="true">
          <div className={academia.retModal}>
            <div className={academia.retModalHead}>
              <h2 className={academia.retModalTitle}>
                {editing ? "Editar reto" : "Nuevo reto"}
              </h2>
              <button
                type="button"
                className={academia.retIconBtn}
                onClick={closeForm}
                aria-label="Cerrar"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <label className={academia.retField}>
              <span>Nombre del reto</span>
              <input
                className={academia.retInput}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Reto 7 días sin azúcares añadidos"
              />
            </label>

            <label className={academia.retField}>
              <span>Descripción</span>
              <textarea
                className={academia.retTextarea}
                value={draft.desc}
                onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                rows={2}
              />
            </label>

            <div className={academia.retFieldRow}>
              <label className={academia.retField}>
                <span>Categoría</span>
                <input
                  className={academia.retInput}
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                />
              </label>
              <label className={academia.retField}>
                <span>Duración (días)</span>
                <input
                  className={academia.retInput}
                  type="number"
                  min={1}
                  value={draft.durationDays}
                  onChange={(e) =>
                    setDraft({ ...draft, durationDays: Number(e.target.value) })
                  }
                />
              </label>
            </div>

            <label className={academia.retField}>
              <span>Pasos del checklist (uno por línea)</span>
              <textarea
                className={academia.retTextarea}
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                rows={4}
                placeholder={"Vaciar la despensa\nPlanificar 3 desayunos"}
              />
            </label>

            <label className={academia.retCheckRow}>
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              />
              Publicado (visible para los alumnos)
            </label>

            <div className={academia.retModalFoot}>
              <button type="button" className={academia.retGhost} onClick={closeForm}>
                Cancelar
              </button>
              <button
                type="button"
                className={academia.retPrimary}
                onClick={submit}
                disabled={!draft.title.trim()}
              >
                {editing ? "Guardar cambios" : "Crear reto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className={academia.retOverlay} role="dialog" aria-modal="true">
          <div className={academia.retModal}>
            <h2 className={academia.retModalTitle}>Eliminar reto</h2>
            <p className={academia.retDetailDesc}>
              ¿Seguro que quieres eliminar «{deleting.title}»? Los alumnos perderán su
              progreso en este reto.
            </p>
            <div className={academia.retModalFoot}>
              <button
                type="button"
                className={academia.retGhost}
                onClick={() => setDeleting(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={academia.retDanger}
                onClick={() => {
                  removeChallenge(deleting.id);
                  setDeleting(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
