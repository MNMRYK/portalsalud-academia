import { useState } from "react";
import {
  Activity,
  ClipboardList,
  ListChecks,
  History,
  FolderLock,
  CalendarDays,
  Flag,
  Folder,
  FileText,
  Download,
  Wallet,
  User,
  Briefcase,
} from "lucide-react";
import {
  useTasks,
  type TaskPriority,
  type TaskAssignee,
} from "@/context/TasksContext";
import { useConsultations } from "@/context/ConsultationsContext";
import {
  useSymptomDiary,
  intensityLabel,
} from "@/context/SymptomDiaryContext";
import styles from "./Pacientes.module.css";

type TabId = "datos" | "diario" | "plan" | "historial" | "documentos";

const formatLongDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const priorityClass: Record<TaskPriority, string> = {
  Alta: styles.priorityHigh,
  Media: styles.priorityMedium,
  Baja: styles.priorityLow,
};

const assigneeMeta: Record<
  TaskAssignee,
  { icon: typeof Briefcase; label: string; iconClass: string }
> = {
  clinica: { icon: Briefcase, label: "Para la clínica", iconClass: styles.assigneeClinic },
  paciente: { icon: User, label: "Para ti", iconClass: styles.assigneePatient },
};

const consultStatusClass: Record<string, string> = {
  Completada: styles.statusCompleted,
  Pendiente: styles.statusPending,
  Cancelada: styles.statusCancelled,
};

const weightData = [
  { label: "Mar", value: 78, height: 92 },
  { label: "Abr", value: 76, height: 80 },
  { label: "May", value: 74, height: 66 },
  { label: "Jun", value: 72.5, height: 54 },
  { label: "Jul", value: 71, height: 44 },
];

// Diario compartido: solo entradas visibles para el paciente (sin notas internas).
const sharedDiary = [
  {
    id: "d1",
    date: "5 Jul 2026",
    energy: { label: "Alta", cls: styles.levelSage },
    inflammation: { label: "Baja", cls: styles.levelSage },
    note: "Buena adherencia a la pauta. Duermes mejor.",
  },
  {
    id: "d2",
    date: "28 Jun 2026",
    energy: { label: "Media", cls: styles.levelPlum },
    inflammation: { label: "Media", cls: styles.levelPlum },
    note: "Hinchazón abdominal tras comidas fuera de casa.",
  },
];

const documents = {
  Dietas: [
    { name: "Plan nutricional - Fase 2.pdf", meta: "PDF · 1.2 MB · 5 Jul 2026" },
    { name: "Pauta antiinflamatoria.pdf", meta: "PDF · 840 KB · 20 Jun 2026" },
  ],
  "Listas de la compra": [
    { name: "Lista semanal - Julio.pdf", meta: "PDF · 320 KB · 5 Jul 2026" },
  ],
};

/**
 * Réplica de la ficha clínica del Admin en modo SOLO LECTURA para el paciente.
 * Reutiliza las clases semánticas de Pacientes.module.css. Todos los controles
 * de edición y adición se ocultan (no se renderizan para el paciente).
 */
export function PatientFicha({
  patientName,
  phase,
}: {
  patientName: string;
  phase: string;
}) {
  const { tasksForPatient } = useTasks();
  const { consultationsForPatient } = useConsultations();
  const [activeTab, setActiveTab] = useState<TabId>("datos");

  // El paciente solo ve sus propias tareas (asignadas a él).
  const myTasks = tasksForPatient(patientName).filter(
    (t) => t.assignee === "paciente",
  );
  const myConsultations = consultationsForPatient(patientName);

  const tabs: { id: TabId; label: string; icon: typeof Activity }[] = [
    { id: "datos", label: "Datos y Evolución", icon: Activity },
    { id: "diario", label: "Diario Clínico", icon: ClipboardList },
    { id: "plan", label: "Plan de Trabajo", icon: ListChecks },
    { id: "historial", label: "Historial de Consultas", icon: History },
    { id: "documentos", label: "Documentos", icon: FolderLock },
  ];

  return (
    <>
      <nav className={styles.tabs}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      {activeTab === "datos" && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>Resumen clínico</h3>
              <p className={styles.panelSub}>
                Datos generales y evolución de tu tratamiento.
              </p>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Peso actual</span>
              <div className={styles.summaryValue}>71 kg</div>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Objetivo</span>
              <div className={styles.summaryValue}>68 kg</div>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Adherencia</span>
              <div className={styles.summaryValue}>86%</div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Fase actual del tratamiento</span>
            <span className={`${styles.level} ${styles.levelPlum}`}>{phase}</span>
          </div>

          <div className={styles.chart}>
            <div className={styles.chartHead}>
              <span className={styles.chartMetric}>Evolución de peso</span>
              <span className={styles.chartDelta}>-7 kg en 5 meses</span>
            </div>
            <div className={styles.bars}>
              {weightData.map((d) => (
                <div key={d.label} className={styles.barCol}>
                  <span className={styles.barValue}>{d.value}</span>
                  <div className={styles.bar} style={{ height: `${d.height}%` }} />
                  <span className={styles.barLabel}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "diario" && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>Diario clínico y síntomas</h3>
              <p className={styles.panelSub}>
                Registros compartidos por tu especialista, ordenados por fecha.
              </p>
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nivel de energía</th>
                <th>Inflamación</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {sharedDiary.map((e) => (
                <tr key={e.id}>
                  <td className={styles.dateCell}>{e.date}</td>
                  <td>
                    <span className={`${styles.level} ${e.energy.cls}`}>
                      {e.energy.label}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.level} ${e.inflammation.cls}`}>
                      {e.inflammation.label}
                    </span>
                  </td>
                  <td className={styles.noteCell}>{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "plan" && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>Plan de trabajo</h3>
              <p className={styles.panelSub}>
                Tareas que tu especialista te ha asignado.
              </p>
            </div>
          </div>

          {myTasks.length === 0 ? (
            <p className={styles.taskEmpty}>No tienes tareas asignadas por ahora.</p>
          ) : (
            <ul className={styles.taskList}>
              {myTasks.map((t) => {
                const Icon = assigneeMeta[t.assignee].icon;
                return (
                  <li key={t.id}>
                    <div
                      className={`${styles.taskItem} ${styles.taskItemPatient} ${
                        t.isCompleted ? styles.taskItemDone : ""
                      }`}
                    >
                      <span
                        className={`${styles.taskAssigneeIcon} ${assigneeMeta[t.assignee].iconClass}`}
                        title={assigneeMeta[t.assignee].label}
                      >
                        <Icon size={16} />
                      </span>
                      <span className={styles.taskBody}>
                        <span className={styles.taskLabel}>{t.description}</span>
                        <span className={styles.taskMeta}>
                          <span className={styles.taskDate}>
                            <CalendarDays size={12} />
                            {formatLongDate(t.dueDate)}
                          </span>
                          <span
                            className={`${styles.priorityTag} ${priorityClass[t.priority]}`}
                          >
                            <Flag size={12} />
                            {t.priority}
                          </span>
                        </span>
                      </span>
                      <span
                        className={`${styles.taskStatusBadge} ${
                          t.isCompleted
                            ? styles.taskStatusDone
                            : styles.taskStatusPending
                        }`}
                      >
                        {t.isCompleted ? "Completado" : "Pendiente"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {activeTab === "historial" && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h3 className={styles.panelTitle}>Historial de consultas</h3>
              <p className={styles.panelSub}>
                Registro cronológico de tus consultas.
              </p>
            </div>
          </div>
          {myConsultations.length === 0 ? (
            <p className={styles.taskEmpty}>Todavía no tienes consultas registradas.</p>
          ) : (
            <ul className={styles.timeline}>
              {myConsultations.map((c) => (
                <li key={c.id} className={styles.timelineItem}>
                  <span className={styles.timelineDot} />
                  <div className={styles.timelineCard}>
                    <div className={styles.timelineTop}>
                      <span className={styles.timelineDate}>
                        {formatLongDate(c.date)} · {c.time}
                      </span>
                      <div className={styles.timelineTopRight}>
                        <span
                          className={`${styles.consultStatus} ${consultStatusClass[c.status]}`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                    <div className={styles.timelineBody}>
                      <p className={styles.timelineNote}>{c.note}</p>
                      {c.payment && (
                        <span className={styles.timelinePayment}>
                          <Wallet size={13} /> Pago: {c.payment.amount} € ·{" "}
                          {c.payment.method}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "documentos" && (
        <div className={styles.panel}>
          <div className={styles.docHead}>
            <div>
              <h3 className={styles.panelTitle}>Mis documentos</h3>
              <p className={styles.panelSub}>
                Archivos que tu especialista ha compartido contigo.
              </p>
            </div>
          </div>

          {Object.entries(documents).map(([folder, files]) => (
            <div key={folder} className={styles.folder}>
              <div className={styles.folderTitle}>
                <Folder size={18} className={styles.folderIcon} />
                <span className={styles.folderName}>{folder}</span>
              </div>
              <div className={styles.docList}>
                {files.map((f) => (
                  <div key={f.name} className={styles.docItem}>
                    <span className={styles.docIcon}>
                      <FileText size={20} />
                    </span>
                    <div className={styles.docInfo}>
                      <div className={styles.docName}>{f.name}</div>
                      <div className={styles.docMeta}>{f.meta}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.docAction}
                      aria-label={`Descargar ${f.name}`}
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
