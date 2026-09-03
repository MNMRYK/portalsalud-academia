import { useState } from "react";
import { Trophy, CheckCircle2, Circle, RotateCcw, CalendarRange, Tag } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useChallenges } from "../../context/ChallengesContext";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

/**
 * Vista Retos (Alumno): listado de retos activos, detalle con checklist
 * interactiva y barra de progreso real.
 */
export function AcademiaRetos() {
  const { activeChallenges, completedSteps, toggleStep, resetChallenge, progressOf } =
    useChallenges();
  const [selectedId, setSelectedId] = useState<string | null>(
    activeChallenges[0]?.id ?? null,
  );

  const selected =
    activeChallenges.find((c) => c.id === selectedId) ?? activeChallenges[0] ?? null;
  const done = selected ? completedSteps[selected.id] ?? [] : [];
  const prog = selected ? progressOf(selected.id) : { done: 0, total: 0, pct: 0 };

  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Retos</h1>
            <p className={styles.greetingSub}>
              Ponte a prueba con desafíos guiados paso a paso y sigue tu progreso real.
            </p>
          </div>
        </header>

        {activeChallenges.length === 0 ? (
          <div className={academia.retEmpty}>
            Ahora mismo no hay retos disponibles. Tu profesional publicará nuevos retos
            muy pronto.
          </div>
        ) : (
          <section className={academia.retLayout}>
            {/* Listado de retos */}
            <div className={academia.retList}>
              {activeChallenges.map((ch) => {
                const p = progressOf(ch.id);
                const isActive = selected?.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    className={`${academia.retListItem} ${
                      isActive ? academia.retListItemActive : ""
                    }`}
                    onClick={() => setSelectedId(ch.id)}
                  >
                    <span className={academia.retListTitle}>
                      <Trophy size={16} strokeWidth={2} />
                      {ch.title}
                    </span>
                    <span className={academia.retListMeta}>
                      {p.done}/{p.total} pasos · {ch.durationDays} días
                    </span>
                    <div className={academia.retBar}>
                      <div className={academia.retBarFill} style={{ width: `${p.pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detalle del reto */}
            {selected && (
              <article className={academia.retDetail}>
                <div className={academia.retDetailHead}>
                  <h2 className={academia.retDetailTitle}>{selected.title}</h2>
                  <button
                    type="button"
                    className={academia.retReset}
                    onClick={() => resetChallenge(selected.id)}
                  >
                    <RotateCcw size={14} strokeWidth={2.4} /> Reiniciar reto
                  </button>
                </div>
                <p className={academia.retDetailDesc}>{selected.desc}</p>

                <div className={academia.retChips}>
                  <span className={academia.retChip}>
                    <Tag size={13} /> {selected.category}
                  </span>
                  <span className={academia.retChip}>
                    <CalendarRange size={13} /> {selected.durationDays} días
                  </span>
                </div>

                <div className={academia.retProgressBlock}>
                  <span className={academia.retProgressLabel}>
                    <span>Progreso del reto</span>
                    <span>{prog.pct}%</span>
                  </span>
                  <div className={academia.retBar}>
                    <div className={academia.retBarFill} style={{ width: `${prog.pct}%` }} />
                  </div>
                  <span className={academia.retProgressHint}>
                    {prog.done} de {prog.total} pasos completados
                  </span>
                </div>

                <h3 className={academia.retStepsTitle}>Checklist</h3>
                <ul className={academia.retSteps}>
                  {selected.steps.map((step) => {
                    const checked = done.includes(step.id);
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          className={`${academia.retStep} ${
                            checked ? academia.retStepDone : ""
                          }`}
                          onClick={() => toggleStep(selected.id, step.id)}
                          aria-pressed={checked}
                        >
                          {checked ? (
                            <CheckCircle2 size={18} strokeWidth={2.2} />
                          ) : (
                            <Circle size={18} strokeWidth={2.2} />
                          )}
                          {step.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {prog.pct === 100 && (
                  <div className={academia.retSuccess}>
                    ¡Reto completado! Comparte tu logro en la comunidad.
                  </div>
                )}
              </article>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
