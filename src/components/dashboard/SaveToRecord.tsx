import { useMemo, useState } from "react";
import { Save, Check } from "lucide-react";
import { toast } from "sonner";
import { useTasks, toISODate } from "@/context/TasksContext";
import { usePatientRecords } from "@/context/PatientRecordsContext";
import styles from "./AsistenteIA.module.css";

const PATIENTS = ["Elena Martín", "Lucía Fernández", "Marcos Iglesias", "Javier Morán"];

type Destino = "documentos" | "plan" | "datos";

const DESTINOS: Record<Destino, string> = {
  documentos: "Documentos",
  plan: "Plan de Trabajo",
  datos: "Datos y Evolución",
};

/** Preselecciona el destino a partir del contenido de la respuesta. */
function detectDestino(content: string, prompt: string): Destino {
  const text = `${prompt}\n${content}`.toLowerCase();
  const score = (words: string[]) =>
    words.reduce((n, w) => n + (text.split(w).length - 1), 0);
  const datos = score(["analítica", "analitica", "hemoglobina", "colesterol", "glucosa", "ferritina", "mg/dl", "valores de referencia", "vitamina d", "tsh", "triglicéridos"]);
  const plan = score(["tarea", "hábito", "habito", "objetivo semanal", "checklist", "plan de trabajo", "rutina"]);
  const docs = score(["menú", "menu", "dieta", "desayuno", "almuerzo", "comida", "cena", "pauta", "kcal"]);
  if (datos >= 3 && datos >= docs) return "datos";
  if (plan > docs) return "plan";
  if (datos > docs) return "datos";
  return "documentos";
}

const stripMd = (s: string) =>
  s.replace(/\*\*|__|`|\[ ?x? ?\]/gi, "").replace(/\s+/g, " ").trim();

/** Extrae líneas de lista (viñetas o numeradas) como tareas. */
function extractTasks(content: string): string[] {
  const items = content
    .split("\n")
    .map((l) => l.match(/^\s*(?:[-*+•]|\d+[.)])\s+(.*)$/)?.[1])
    .filter((x): x is string => !!x)
    .map(stripMd)
    .filter((x) => x.length > 3 && x.length < 200);
  return Array.from(new Set(items)).slice(0, 15);
}

function titleFrom(content: string, fallback: string) {
  const h = content.split("\n").find((l) => /^#{1,3}\s/.test(l));
  return h ? stripMd(h.replace(/^#+\s*/, "")).slice(0, 60) : fallback;
}

export function SaveToRecord({ content, prompt }: { content: string; prompt: string }) {
  const suggested = useMemo(() => detectDestino(content, prompt), [content, prompt]);
  const [patient, setPatient] = useState("");
  const [destino, setDestino] = useState<Destino>(suggested);
  const [saved, setSaved] = useState(false);
  const { addTask } = useTasks();
  const { addDocument, addEvolutionNote } = usePatientRecords();

  const save = () => {
    if (!patient) {
      toast.error("Selecciona un paciente antes de guardar.");
      return;
    }
    const today = toISODate(new Date());
    if (destino === "documentos") {
      const title = titleFrom(content, "Pauta Asistente IA");
      addDocument({
        patientName: patient,
        name: `${title} - ${today}.txt`,
        content,
        date: today,
      });
    } else if (destino === "plan") {
      const tasks = extractTasks(content);
      if (tasks.length === 0) {
        toast.error("No he encontrado tareas en forma de lista en esta respuesta.");
        return;
      }
      const due = new Date();
      due.setDate(due.getDate() + 7);
      tasks.forEach((description) =>
        addTask({
          patientName: patient,
          description,
          dueDate: toISODate(due),
          priority: "Media",
          assignee: "paciente",
        }),
      );
    } else {
      addEvolutionNote({
        patientName: patient,
        title: titleFrom(content, "Interpretación de analítica"),
        content,
        date: today,
      });
    }
    setSaved(true);
    toast.success(`Guardado en la ficha de ${patient} › pestaña "${DESTINOS[destino]}"`);
  };

  return (
    <div className={styles.savePanel}>
      <select
        className={styles.saveSelect}
        value={patient}
        onChange={(e) => {
          setPatient(e.target.value);
          setSaved(false);
        }}
        aria-label="Paciente"
      >
        <option value="">Selecciona paciente…</option>
        {PATIENTS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select
        className={styles.saveSelect}
        value={destino}
        onChange={(e) => {
          setDestino(e.target.value as Destino);
          setSaved(false);
        }}
        aria-label="Destino"
      >
        {(Object.keys(DESTINOS) as Destino[]).map((d) => (
          <option key={d} value={d}>
            {DESTINOS[d]}{d === suggested ? " (sugerido)" : ""}
          </option>
        ))}
      </select>
      <button type="button" className={styles.saveButton} onClick={save} disabled={saved}>
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? "Guardado" : "Guardar en Ficha"}
      </button>
    </div>
  );
}
