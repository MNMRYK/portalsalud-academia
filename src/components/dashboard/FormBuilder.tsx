import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ListChecks, Save } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { AssignFormModal } from "./AssignFormModal";
import styles from "./Formularios.module.css";

interface BankQuestion {
  id: string;
  text: string;
  category: string;
  default: boolean;
}

/** Banco simulado de ~30 preguntas disponibles para la plantilla. */
const questionBank: BankQuestion[] = [
  { id: "q1", text: "¿Cómo valoras tu nivel de energía esta semana?", category: "Bienestar", default: true },
  { id: "q2", text: "¿Cuántas horas duermes de media por noche?", category: "Descanso", default: true },
  { id: "q3", text: "¿Con qué frecuencia sientes hinchazón abdominal?", category: "Digestión", default: true },
  { id: "q4", text: "¿Has cumplido la pauta nutricional acordada?", category: "Adherencia", default: true },
  { id: "q5", text: "¿Cómo describes tu estado de ánimo general?", category: "Bienestar", default: false },
  { id: "q6", text: "¿Cuántos vasos de agua bebes al día?", category: "Hidratación", default: false },
  { id: "q7", text: "¿Has tenido antojos de azúcar esta semana?", category: "Alimentación", default: false },
  { id: "q8", text: "¿Realizas actividad física? ¿Con qué frecuencia?", category: "Actividad", default: false },
  { id: "q9", text: "¿Cómo son tus digestiones tras las comidas?", category: "Digestión", default: false },
  { id: "q10", text: "¿Notas mejoría en tu piel?", category: "Bienestar", default: false },
  { id: "q11", text: "¿Cuál es tu nivel de estrés (1-5)?", category: "Bienestar", default: false },
  { id: "q12", text: "¿Has saltado alguna comida esta semana?", category: "Alimentación", default: false },
  { id: "q13", text: "¿Cómo valoras la calidad de tu descanso?", category: "Descanso", default: false },
  { id: "q14", text: "¿Has notado cambios en tu peso?", category: "Evolución", default: false },
  { id: "q15", text: "¿Presentas dolores de cabeza recurrentes?", category: "Síntomas", default: false },
  { id: "q16", text: "¿Cómo es tu tránsito intestinal?", category: "Digestión", default: false },
  { id: "q17", text: "¿Consumes alcohol? ¿Con qué frecuencia?", category: "Hábitos", default: false },
  { id: "q18", text: "¿Cuántas comidas realizas al día?", category: "Alimentación", default: false },
  { id: "q19", text: "¿Has incorporado los suplementos recomendados?", category: "Adherencia", default: false },
  { id: "q20", text: "¿Sientes ansiedad relacionada con la comida?", category: "Bienestar", default: false },
  { id: "q21", text: "¿Cómo valoras tu concentración diaria?", category: "Bienestar", default: false },
  { id: "q22", text: "¿Has notado retención de líquidos?", category: "Síntomas", default: false },
  { id: "q23", text: "¿Cuál es tu nivel de saciedad tras comer?", category: "Alimentación", default: false },
  { id: "q24", text: "¿Consumes cafeína? ¿En qué cantidad?", category: "Hábitos", default: false },
  { id: "q25", text: "¿Cómo describes tu apetito general?", category: "Alimentación", default: false },
  { id: "q26", text: "¿Realizas las comidas con calma y sin pantallas?", category: "Hábitos", default: false },
  { id: "q27", text: "¿Notas gases o molestias tras ciertos alimentos?", category: "Digestión", default: false },
  { id: "q28", text: "¿Cómo valoras tu motivación con el tratamiento?", category: "Adherencia", default: false },
  { id: "q29", text: "¿Has tenido dificultad para conciliar el sueño?", category: "Descanso", default: false },
  { id: "q30", text: "¿Quieres compartir algo más con tu especialista?", category: "Observaciones", default: false },
];

/**
 * Vista Admin — Creación de plantilla de formulario dinámico (solo UI).
 * Título del formulario + banco de preguntas con toggles + acción de guardar.
 */
export function FormBuilder() {
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState("Seguimiento Julio");
  const [active, setActive] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(questionBank.map((q) => [q.id, q.default])) as Record<
        string,
        boolean
      >,
  );
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const activeCount = Object.values(active).filter(Boolean).length;

  const toggle = (id: string) =>
    setActive((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate({ to: "/formularios" })}
              aria-label="Volver"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className={styles.title}>Nueva plantilla de formulario</h1>
              <p className={styles.titleSub}>
                Crea un formulario de seguimiento y actívalo para tus pacientes.
              </p>
            </div>
          </div>
          <NotificationBell />
        </header>

        <div className={styles.card}>
          <label className={styles.fieldLabel} htmlFor="form-title">
            Título del formulario
          </label>
          <input
            id="form-title"
            className={styles.input}
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Ej. Seguimiento Julio"
          />
        </div>

        <div className={styles.card}>
          <div className={styles.bankHead}>
            <div>
              <h2 className={styles.cardTitle}>Preguntas disponibles</h2>
              <p className={styles.cardSub}>
                Activa las preguntas que quieras incluir en esta plantilla.
              </p>
            </div>
            <span className={styles.bankCount}>
              <ListChecks size={15} /> {activeCount} activas
            </span>
          </div>

          <div className={styles.questionList}>
            {questionBank.map((q) => {
              const on = active[q.id];
              return (
                <div
                  key={q.id}
                  className={`${styles.questionRow} ${
                    on ? styles.questionRowActive : ""
                  }`}
                >
                  <span className={styles.questionText}>
                    {q.text}
                    <span className={styles.questionCat}>{q.category}</span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`Activar: ${q.text}`}
                    className={`${styles.switch} ${on ? styles.switchOn : ""}`}
                    onClick={() => toggle(q.id)}
                  >
                    <span className={styles.switchKnob} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.footerBar}>
          <span className={styles.footerHint}>
            {activeCount} pregunta{activeCount === 1 ? "" : "s"} seleccionada
            {activeCount === 1 ? "" : "s"} de {questionBank.length}
          </span>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setIsAssignOpen(true)}
            disabled={activeCount === 0}
          >
            <Save size={17} /> Guardar y Asignar
          </button>
        </div>
      </main>

      <AssignFormModal
        open={isAssignOpen}
        formTitle={formTitle}
        onClose={() => setIsAssignOpen(false)}
      />
    </div>
  );
}
