import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ClipboardList, Send, CheckCircle2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Formularios.module.css";

const scaleOptions = [1, 2, 3, 4, 5];
const adherenceOptions = [
  "Sí, totalmente",
  "En parte",
  "Me ha costado",
  "No he podido",
];

/**
 * Vista Paciente — Recepción y respuesta del formulario (solo UI).
 * Al enviarse muestra un estado de confirmación simulado.
 */
export function PatientFormView() {
  const navigate = useNavigate();
  const [energy, setEnergy] = useState<number | null>(null);
  const [adherence, setAdherence] = useState<string | null>(null);
  const [sleep, setSleep] = useState("");
  const [comments, setComments] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate({ to: "/portal/plan" })}
              aria-label="Volver"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className={styles.title}>Formulario · Seguimiento Julio</h1>
              <p className={styles.titleSub}>
                Tu especialista, Sara, quiere conocer cómo te encuentras.
              </p>
            </div>
          </div>
        </header>

        {sent ? (
          <div className={styles.card}>
            <div className={styles.success}>
              <span className={styles.successIcon}>
                <CheckCircle2 size={40} strokeWidth={1.8} />
              </span>
              <h2 className={styles.successTitle}>¡Formulario enviado!</h2>
              <p className={styles.successText}>
                Tus respuestas se han enviado a Sara. Podrás consultarlas cuando
                quieras en tu sección de Documentos.
              </p>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => navigate({ to: "/portal" })}
              >
                Volver a mi Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.formIntro}>
              <span className={styles.formIntroIcon}>
                <ClipboardList size={22} strokeWidth={1.9} />
              </span>
              <p className={styles.formIntroText}>
                Responde con sinceridad. Solo te llevará un par de minutos y
                ayudará a Sara a ajustar tu plan.
              </p>
            </div>

            <div className={styles.card}>
              {/* Pregunta 1: escala */}
              <div className={styles.question}>
                <label className={styles.questionLabel}>
                  <span className={styles.questionNum}>1.</span>
                  ¿Cómo valoras tu nivel de energía esta semana?
                </label>
                <div className={styles.scaleGroup}>
                  {scaleOptions.map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`${styles.scaleButton} ${
                        energy === n ? styles.scaleButtonActive : ""
                      }`}
                      onClick={() => setEnergy(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregunta 2: radio */}
              <div className={styles.question}>
                <label className={styles.questionLabel}>
                  <span className={styles.questionNum}>2.</span>
                  ¿Has cumplido la pauta nutricional acordada?
                </label>
                <div className={styles.radioGroup}>
                  {adherenceOptions.map((opt) => {
                    const selected = adherence === opt;
                    return (
                      <label
                        key={opt}
                        className={`${styles.radioRow} ${
                          selected ? styles.radioRowSelected : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="adherence"
                          value={opt}
                          checked={selected}
                          onChange={() => setAdherence(opt)}
                          style={{ display: "none" }}
                        />
                        <span
                          className={`${styles.radioDot} ${
                            selected ? styles.radioDotSelected : ""
                          }`}
                        >
                          {selected && <span className={styles.radioDotInner} />}
                        </span>
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pregunta 3: texto corto */}
              <div className={styles.question}>
                <label className={styles.questionLabel} htmlFor="q-sleep">
                  <span className={styles.questionNum}>3.</span>
                  ¿Cuántas horas duermes de media por noche?
                </label>
                <input
                  id="q-sleep"
                  className={styles.input}
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  placeholder="Ej. 7 horas"
                />
              </div>

              {/* Pregunta 4: textarea */}
              <div className={styles.question}>
                <label className={styles.questionLabel} htmlFor="q-comments">
                  <span className={styles.questionNum}>4.</span>
                  ¿Quieres compartir algo más con tu especialista?
                </label>
                <textarea
                  id="q-comments"
                  className={styles.textarea}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Escribe aquí cualquier observación…"
                />
              </div>
            </div>

            <div className={styles.footerBar}>
              <span className={styles.footerHint}>
                Tus respuestas son privadas y solo las verá Sara.
              </span>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setSent(true)}
              >
                <Send size={17} /> Enviar a Sara
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
