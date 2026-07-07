import { useState } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Activity,
  ClipboardList,
  FolderLock,
  FileText,
  Upload,
  Download,
  Folder,
  X,
  Pencil,
  FolderPlus,
  Trash2,
  UploadCloud,
  AlertTriangle,
  Users,
  CalendarClock,
  BellRing,
  History,
  CalendarCheck,
  CalendarDays,
  ListChecks,
  Flag,
  LayoutDashboard,
  ChevronLeft,
  Eye,
  EyeOff,
  CreditCard,
  Wallet,
  Banknote,
  ArrowRightLeft,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { AddPatientModal } from "./AddPatientModal";
import { CategoryDropdown } from "./academia/CategoryDropdown";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useTasks,
  toISODate,
  type TaskPriority,
} from "@/context/TasksContext";
import {
  useConsultations,
  type Consultation,
  type ConsultationStatus,
  type PaymentMethod,
} from "@/context/ConsultationsContext";
import styles from "./Pacientes.module.css";

type TabId = "datos" | "diario" | "plan" | "documentos" | "historial";


const patientList = [
  { name: "Elena Martín", meta: "Fase 2 · Activo", initials: "EM", avClass: styles.avPlum },
  { name: "Lucía Fernández", meta: "Fase 1 · Activo", initials: "LF", avClass: styles.avTerracota },
  { name: "Marcos Iglesias", meta: "Mantenimiento", initials: "MI", avClass: styles.avSage },
  { name: "Javier Morán", meta: "Seguimiento", initials: "JM", avClass: styles.avLilac },
];

const kpis = [
  { label: "Total pacientes", value: "128", icon: Users, cls: styles.kpiTerracota },
  { label: "En seguimiento", value: "94", icon: Activity, cls: styles.kpiPlum },
  { label: "Próximas citas", value: "12", icon: CalendarClock, cls: styles.kpiSage },
  { label: "Alertas pendientes", value: "5", icon: BellRing, cls: styles.kpiLilac },
];

const upcomingAppointments = [
  { date: "8 Jul 2026", time: "09:30", patient: "Elena Martín", type: "Revisión de fase" },
  { date: "8 Jul 2026", time: "11:00", patient: "Lucía Fernández", type: "Primera consulta" },
  { date: "9 Jul 2026", time: "10:15", patient: "Marcos Iglesias", type: "Seguimiento" },
  { date: "9 Jul 2026", time: "16:45", patient: "Javier Morán", type: "Ajuste de pauta" },
  { date: "10 Jul 2026", time: "12:00", patient: "Elena Martín", type: "Analítica de control" },
];

const priorityClass: Record<TaskPriority, string> = {
  Alta: styles.priorityHigh,
  Media: styles.priorityMedium,
  Baja: styles.priorityLow,
};

const formatLongDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const treatmentPhases = [
  "Fase 1: Détox hepático",
  "Fase 2: Reducción de inflamación",
  "Fase 3: Reparación intestinal",
  "Fase 4: Mantenimiento y hábitos",
];

const weightData = [
  { label: "Mar", value: 78, height: 92 },
  { label: "Abr", value: 76, height: 80 },
  { label: "May", value: 74, height: 66 },
  { label: "Jun", value: 72.5, height: 54 },
  { label: "Jul", value: 71, height: 44 },
];

interface DiaryEntry {
  id: string;
  date: string;
  energy: { label: string; cls: string };
  inflammation: { label: string; cls: string };
  note: string;
  internal: boolean;
}

const levelClassByLabel: Record<string, string> = {
  Alta: styles.levelSage,
  Media: styles.levelPlum,
  Baja: styles.levelTerracota,
};
const inflammationClassByLabel: Record<string, string> = {
  Baja: styles.levelSage,
  Media: styles.levelPlum,
  Alta: styles.levelTerracota,
};

const initialDiaryEntries: DiaryEntry[] = [
  {
    id: "diary-1",
    date: "5 Jul 2026",
    energy: { label: "Alta", cls: styles.levelSage },
    inflammation: { label: "Baja", cls: styles.levelSage },
    note: "Buena adherencia a la pauta. Duerme mejor.",
    internal: false,
  },
  {
    id: "diary-2",
    date: "28 Jun 2026",
    energy: { label: "Media", cls: styles.levelPlum },
    inflammation: { label: "Media", cls: styles.levelPlum },
    note: "Hinchazón abdominal tras comidas fuera de casa.",
    internal: false,
  },
  {
    id: "diary-3",
    date: "21 Jun 2026",
    energy: { label: "Baja", cls: styles.levelTerracota },
    inflammation: { label: "Alta", cls: styles.levelTerracota },
    note: "Sospecha de intolerancia. No compartir aún con la paciente.",
    internal: true,
  },
];

const consultStatusClass: Record<string, string> = {
  Completada: styles.statusCompleted,
  Pendiente: styles.statusPending,
  Cancelada: styles.statusCancelled,
};

const paymentMethodMeta: Record<
  PaymentMethod,
  { icon: typeof CreditCard; label: string }
> = {
  Metálico: { icon: Banknote, label: "Metálico" },
  Tarjeta: { icon: CreditCard, label: "Tarjeta" },
  Transferencia: { icon: ArrowRightLeft, label: "Transferencia" },
};

const documents = {
  Dietas: [
    { name: "Plan nutricional - Fase 2.pdf", meta: "PDF · 1.2 MB · 5 Jul 2026" },
    { name: "Pauta antiinflamatoria.pdf", meta: "PDF · 840 KB · 20 Jun 2026" },
  ],
  "Listas de la compra": [
    { name: "Lista semanal - Julio.pdf", meta: "PDF · 320 KB · 5 Jul 2026" },
  ],
};

export function Pacientes() {
  const { addTask, toggleTask, removeTask, tasksForPatient, tasksForDate } =
    useTasks();

  const incomingPatient = (
    useLocation().state as { selectedPatient?: string | null }
  )?.selectedPatient;
  const [selectedPatient, setSelectedPatient] = useState<string | null>(
    incomingPatient ?? null,
  );
  const [activeTab, setActiveTab] = useState<TabId>("datos");
  const [phase, setPhase] = useState(treatmentPhases[1]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMetricOpen, setIsMetricOpen] = useState(false);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isApptOpen, setIsApptOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Filtro de fecha del panel "Acciones rápidas pendientes"
  const todayISO = toISODate(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDateOpen, setIsDateOpen] = useState(false);
  const filterDate = toISODate(selectedDate);
  const isToday = filterDate === todayISO;
  const dayTasks = tasksForDate(filterDate);

  // Modal "Añadir tarea" del Plan de Trabajo
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDue, setTaskDue] = useState(todayISO);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("Media");

  const patient = patientList.find((p) => p.name === selectedPatient) ?? null;
  const patientTasks = selectedPatient ? tasksForPatient(selectedPatient) : [];

  const openPatient = (name: string) => {
    setSelectedPatient(name);
    setActiveTab("datos");
  };



  const resetTaskForm = () => {
    setTaskDesc("");
    setTaskDue(todayISO);
    setTaskPriority("Media");
  };

  const submitTask = () => {
    if (!selectedPatient || !taskDesc.trim()) return;
    addTask({
      patientName: selectedPatient,
      description: taskDesc.trim(),
      dueDate: taskDue,
      priority: taskPriority,
    });
    resetTaskForm();
    setIsTaskOpen(false);
  };

  const tabs: { id: TabId; label: string; icon: typeof Activity }[] = [
    { id: "datos", label: "Datos y Evolución", icon: Activity },
    { id: "diario", label: "Diario Clínico", icon: ClipboardList },
    { id: "plan", label: "Plan de Trabajo", icon: ListChecks },
    { id: "historial", label: "Historial de Consultas", icon: History },
    { id: "documentos", label: "Documentos", icon: FolderLock },
  ];


  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Pacientes</h1>
            <p className={styles.titleSub}>
              CRM clínico: fichas, evolución y documentación de tus pacientes.
            </p>
          </div>

          <div className={styles.headerRight}>
            <NotificationBell />
            <div className={styles.search}>
              <Search size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar por nombre o DNI…"
                aria-label="Buscar pacientes"
              />
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} strokeWidth={2.5} /> Nuevo Paciente
            </button>
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={styles.rail}>
            <button
              type="button"
              className={`${styles.railItem} ${styles.railOverview} ${
                selectedPatient === null ? styles.railItemActive : ""
              }`}
              onClick={() => setSelectedPatient(null)}
            >
              <span className={`${styles.railAvatar} ${styles.railAvatarNeutral}`}>
                <LayoutDashboard size={18} />
              </span>
              <span>
                <span className={styles.railName}>Vista general</span>
                <br />
                <span className={styles.railMeta}>Panel de la clínica</span>
              </span>
            </button>

            <span className={styles.railTitle}>Pacientes</span>
            {patientList.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`${styles.railItem} ${
                  selectedPatient === p.name ? styles.railItemActive : ""
                }`}
                onClick={() => openPatient(p.name)}
              >
                <span className={`${styles.railAvatar} ${p.avClass}`}>{p.initials}</span>
                <span>
                  <span className={styles.railName}>{p.name}</span>
                  <br />
                  <span className={styles.railMeta}>{p.meta}</span>
                </span>
              </button>
            ))}
          </aside>

          {selectedPatient === null ? (
            <section key="overview" className={`${styles.stage} ${styles.viewFade}`}>
              <div className={styles.kpiGrid}>
                {kpis.map(({ label, value, icon: Icon, cls }) => (
                  <div key={label} className={styles.kpiCard}>
                    <span className={`${styles.kpiIcon} ${cls}`}>
                      <Icon size={20} />
                    </span>
                    <span className={styles.kpiValue}>{value}</span>
                    <span className={styles.kpiLabel}>{label}</span>
                  </div>
                ))}
              </div>

              <div className={styles.workGrid}>
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div>
                      <h3 className={styles.panelTitle}>Próximas citas</h3>
                      <p className={styles.panelSub}>
                        Agenda de consultas programadas para los próximos días.
                      </p>
                    </div>
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Paciente</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingAppointments.map((a, i) => (
                        <tr key={`${a.patient}-${i}`}>
                          <td className={styles.dateCell}>{a.date}</td>
                          <td>{a.time}</td>
                          <td>
                            <button
                              type="button"
                              className={styles.linkCell}
                              onClick={() => openPatient(a.patient)}
                            >
                              {a.patient}
                            </button>
                          </td>
                          <td className={styles.noteCell}>{a.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`${styles.panel} ${styles.actionsPanel}`}>
                  <div className={styles.panelHead}>
                    <div>
                      <h3 className={styles.panelTitle}>
                        Acciones rápidas pendientes
                      </h3>
                      <p className={styles.panelSub}>
                        Tareas con fecha límite en el día seleccionado.
                      </p>
                    </div>
                    <div className={styles.dateFilter}>
                      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={styles.datePickerTrigger}
                            aria-label="Filtrar tareas por fecha"
                          >
                            <CalendarDays size={16} />
                            {isToday ? "Hoy" : formatLongDate(filterDate)}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-50 pointer-events-auto"
                          align="end"
                        >
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (date) setSelectedDate(date);
                              setIsDateOpen(false);
                            }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className={styles.actionsScroll}>
                    {!isToday && (
                      <div className={styles.dateNotice}>
                        <CalendarDays size={15} />
                        Visualizando tareas del {formatLongDate(filterDate)}
                      </div>
                    )}

                    {dayTasks.length === 0 ? (
                      <p className={styles.taskEmpty}>
                        No hay tareas programadas para este día.
                      </p>
                    ) : (
                      <ul className={styles.taskList}>
                        {dayTasks.map((t) => (
                          <li key={t.id}>
                            <label
                              className={`${styles.taskItem} ${
                                t.isCompleted ? styles.taskItemDone : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                className={styles.taskCheck}
                                checked={t.isCompleted}
                                onChange={() => toggleTask(t.id)}
                              />
                              <span className={styles.taskBody}>
                                <span className={styles.taskLabel}>
                                  {t.description}
                                </span>
                                <span className={styles.taskMeta}>
                                  <span className={styles.taskPatient}>
                                    {t.patientName}
                                  </span>
                                  <span
                                    className={`${styles.priorityTag} ${priorityClass[t.priority]}`}
                                  >
                                    <Flag size={12} />
                                    {t.priority}
                                  </span>
                                </span>
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section
              key={selectedPatient}
              className={`${styles.file} ${styles.viewFade}`}
            >
              <button
                type="button"
                className={styles.backLink}
                onClick={() => setSelectedPatient(null)}
              >
                <ChevronLeft size={16} /> Volver a la vista general
              </button>

              <div className={styles.fileHeader}>
                <span className={`${styles.fileAvatar} ${patient?.avClass ?? styles.avPlum}`}>
                  {patient?.initials}
                </span>
                <div className={styles.fileHeaderInfo}>
                  <h2 className={styles.fileName}>{patient?.name}</h2>
                  <div className={styles.fileFacts}>
                    <div className={styles.fileFact}>
                      <span className={styles.fileFactLabel}>Edad</span>
                      <span className={styles.fileFactValue}>42 años</span>
                    </div>
                    <div className={styles.fileFact}>
                      <span className={styles.fileFactLabel}>Objetivo principal</span>
                      <span className={styles.fileFactValue}>Reducir inflamación</span>
                    </div>
                    <div className={styles.fileFact}>
                      <span className={styles.fileFactLabel}>DNI</span>
                      <span className={styles.fileFactValue}>12.345.678-A</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.outlineButton}
                  onClick={() => setIsProfileOpen(true)}
                >
                  <Pencil size={16} /> Editar datos
                </button>
              </div>

              <div className={styles.nextAppt}>
                <span className={styles.nextApptIcon}>
                  <CalendarCheck size={22} />
                </span>
                <div className={styles.nextApptInfo}>
                  <span className={styles.nextApptLabel}>Próxima cita programada</span>
                  <span className={styles.nextApptValue}>
                    12 Jul 2026 · 12:00 — Analítica de control
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.nextApptEdit}
                  onClick={() => setIsApptOpen(true)}
                >
                  <Pencil size={15} /> Editar
                </button>
              </div>

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
                        Datos generales y evolución del tratamiento.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.outlineButton}
                      onClick={() => setIsMetricOpen(true)}
                    >
                      <Plus size={16} strokeWidth={2.5} /> Añadir Métrica
                    </button>
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
                    <label className={styles.fieldLabel} htmlFor="phase">
                      Fase actual del tratamiento
                    </label>
                    <select
                      id="phase"
                      className={styles.select}
                      value={phase}
                      onChange={(e) => setPhase(e.target.value)}
                    >
                      {treatmentPhases.map((ph) => (
                        <option key={ph} value={ph}>
                          {ph}
                        </option>
                      ))}
                    </select>
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
                        Últimos registros del paciente ordenados por fecha.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => setIsEntryOpen(true)}
                    >
                      <Plus size={18} strokeWidth={2.5} /> Nueva Entrada
                    </button>
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
                      {diaryEntries.map((e) => (
                        <tr key={e.date}>
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
                        Tareas asociadas a {patient?.name}. Se sincronizan con las
                        acciones rápidas del panel general.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        resetTaskForm();
                        setIsTaskOpen(true);
                      }}
                    >
                      <Plus size={18} strokeWidth={2.5} /> Añadir tarea
                    </button>
                  </div>

                  {patientTasks.length === 0 ? (
                    <p className={styles.taskEmpty}>
                      Este paciente aún no tiene tareas. Crea la primera con
                      “Añadir tarea”.
                    </p>
                  ) : (
                    <ul className={styles.taskList}>
                      {patientTasks.map((t) => (
                        <li key={t.id}>
                          <div
                            className={`${styles.taskItem} ${
                              t.isCompleted ? styles.taskItemDone : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              className={styles.taskCheck}
                              checked={t.isCompleted}
                              onChange={() => toggleTask(t.id)}
                              aria-label={`Marcar tarea: ${t.description}`}
                            />
                            <span className={styles.taskBody}>
                              <span className={styles.taskLabel}>
                                {t.description}
                              </span>
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
                            <button
                              type="button"
                              className={styles.deleteAction}
                              onClick={() => removeTask(t.id)}
                              aria-label={`Eliminar tarea: ${t.description}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
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
                        Registro cronológico de las consultas del paciente.
                      </p>
                    </div>
                  </div>
                  <ul className={styles.timeline}>
                    {consultationHistory.map((c, i) => (
                      <li key={`${c.date}-${i}`} className={styles.timelineItem}>
                        <span className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineTop}>
                            <span className={styles.timelineDate}>{c.date}</span>
                            <span
                              className={`${styles.consultStatus} ${consultStatusClass[c.status]}`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className={styles.timelineNote}>{c.note}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "documentos" && (
                <div className={styles.panel}>
                  <div className={styles.docHead}>
                    <div>
                      <h3 className={styles.panelTitle}>Gestor de documentos seguros</h3>
                      <p className={styles.panelSub}>
                        Archivos privados del paciente organizados por carpeta.
                      </p>
                    </div>
                    <div className={styles.docHeadActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => setIsFolderOpen(true)}
                      >
                        <FolderPlus size={16} /> Nueva Carpeta
                      </button>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => setIsUploadOpen(true)}
                      >
                        <Upload size={16} /> Subir documento
                      </button>
                    </div>
                  </div>

                  {Object.entries(documents).map(([folder, files]) => (
                    <div key={folder} className={styles.folder}>
                      <div className={styles.folderTitle}>
                        <Folder size={18} className={styles.folderIcon} />
                        <span className={styles.folderName}>{folder}</span>
                        <button
                          type="button"
                          className={styles.deleteAction}
                          aria-label={`Eliminar carpeta ${folder}`}
                        >
                          <Trash2 size={16} />
                        </button>
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
                            <button
                              type="button"
                              className={styles.deleteAction}
                              aria-label={`Eliminar ${f.name}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <AddPatientModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {isTaskOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsTaskOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="task-title" className={styles.modalTitle}>
                  Añadir tarea
                </h2>
                <p className={styles.modalSub}>
                  Nueva tarea del plan de trabajo de {patient?.name}.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsTaskOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="task-desc">
                    Descripción de la tarea
                  </label>
                  <textarea
                    id="task-desc"
                    className={styles.textarea}
                    rows={3}
                    placeholder="Ej: Revisar analítica y actualizar la pauta…"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="task-due">
                      Fecha límite
                    </label>
                    <input
                      id="task-due"
                      type="date"
                      className={styles.textInputPlain}
                      value={taskDue}
                      onChange={(e) => setTaskDue(e.target.value || todayISO)}
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="task-priority">
                      Prioridad
                    </label>
                    <select
                      id="task-priority"
                      className={styles.selectPlain}
                      value={taskPriority}
                      onChange={(e) =>
                        setTaskPriority(e.target.value as TaskPriority)
                      }
                    >
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsTaskOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitTask}
                disabled={!taskDesc.trim()}
              >
                Guardar tarea
              </button>
            </footer>
          </div>
        </div>
      )}


      {isApptOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsApptOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="appt-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="appt-title" className={styles.modalTitle}>
                  Editar cita programada
                </h2>
                <p className={styles.modalSub}>
                  Actualiza la fecha, hora y tipo de la próxima consulta.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsApptOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="appt-date">
                    Fecha
                  </label>
                  <input
                    id="appt-date"
                    type="date"
                    className={styles.textInputPlain}
                    defaultValue="2026-07-12"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="appt-time">
                    Hora
                  </label>
                  <input
                    id="appt-time"
                    type="time"
                    className={styles.textInputPlain}
                    defaultValue="12:00"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="appt-type">
                    Tipo de consulta
                  </label>
                  <input
                    id="appt-type"
                    type="text"
                    className={styles.textInputPlain}
                    defaultValue="Analítica de control"
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsApptOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Guardar cita
              </button>
            </footer>
          </div>
        </div>
      )}

      {isMetricOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsMetricOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="metric-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="metric-title" className={styles.modalTitle}>
                  Nuevo registro de evolución
                </h2>
                <p className={styles.modalSub}>
                  Registra una nueva métrica para el seguimiento del paciente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsMetricOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-date">
                    Fecha
                  </label>
                  <input
                    id="metric-date"
                    type="date"
                    className={styles.textInputPlain}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-phase">
                    Fase del tratamiento
                  </label>
                  <select
                    id="metric-phase"
                    className={styles.selectPlain}
                    defaultValue={treatmentPhases[1]}
                  >
                    {treatmentPhases.map((ph) => (
                      <option key={ph} value={ph}>
                        {ph}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-weight">
                    Peso actual (kg)
                  </label>
                  <input
                    id="metric-weight"
                    type="number"
                    step="0.1"
                    className={styles.textInputPlain}
                    placeholder="Ej: 71.5"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-adherence">
                    Adherencia al plan (%)
                  </label>
                  <input
                    id="metric-adherence"
                    type="number"
                    min="0"
                    max="100"
                    className={styles.textInputPlain}
                    placeholder="Ej: 86"
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsMetricOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Guardar registro
              </button>
            </footer>
          </div>
        </div>
      )}

      {isEntryOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsEntryOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="entry-title" className={styles.modalTitle}>
                  Registrar síntoma
                </h2>
                <p className={styles.modalSub}>
                  Añade una nueva entrada al diario clínico del paciente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsEntryOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="entry-energy">
                    Nivel de Energía
                  </label>
                  <select id="entry-energy" className={styles.select} defaultValue="Media">
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="entry-inflammation">
                    Inflamación
                  </label>
                  <select
                    id="entry-inflammation"
                    className={styles.select}
                    defaultValue="Media"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="entry-notes">
                    Notas adicionales
                  </label>
                  <textarea
                    id="entry-notes"
                    className={styles.textarea}
                    rows={4}
                    placeholder="Describe síntomas, adherencia u observaciones relevantes…"
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsEntryOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Guardar
              </button>
            </footer>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsProfileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="profile-title" className={styles.modalTitle}>
                  Editar Perfil Clínico
                </h2>
                <p className={styles.modalSub}>
                  Actualiza los datos básicos y estáticos del paciente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsProfileOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-name">
                    Nombre completo
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    className={styles.textInputPlain}
                    defaultValue={patient?.name}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-age">
                    Edad
                  </label>
                  <input
                    id="profile-age"
                    type="number"
                    min="0"
                    className={styles.textInputPlain}
                    defaultValue={42}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-sex">
                    Sexo
                  </label>
                  <select
                    id="profile-sex"
                    className={styles.selectPlain}
                    defaultValue="Mujer"
                  >
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-dni">
                    DNI
                  </label>
                  <input
                    id="profile-dni"
                    type="text"
                    className={styles.textInputPlain}
                    defaultValue="12.345.678-A"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-goal">
                    Objetivo principal
                  </label>
                  <input
                    id="profile-goal"
                    type="text"
                    className={styles.textInputPlain}
                    defaultValue="Reducir inflamación"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-target-weight">
                    Peso objetivo (kg)
                  </label>
                  <input
                    id="profile-target-weight"
                    type="number"
                    step="0.1"
                    className={styles.textInputPlain}
                    defaultValue={68}
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooterSplit}>
              <button
                type="button"
                className={styles.dangerGhostButton}
                onClick={() => {
                  setIsProfileOpen(false);
                  setDeleteConfirm("");
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 size={16} /> Eliminar paciente
              </button>
              <div className={styles.footerRight}>
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => setIsProfileOpen(false)}
                >
                  Cancelar
                </button>
                <button type="button" className={styles.primaryButton}>
                  Guardar cambios
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {isFolderOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsFolderOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="folder-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="folder-title" className={styles.modalTitle}>
                  Crear nueva carpeta segura
                </h2>
                <p className={styles.modalSub}>
                  Organiza los documentos del paciente en una nueva carpeta.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsFolderOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="folder-name">
                  Nombre de la carpeta
                </label>
                <input
                  id="folder-name"
                  type="text"
                  className={styles.textInputPlain}
                  placeholder="Nombre de la carpeta (Ej: Analíticas)"
                />
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsFolderOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Crear carpeta
              </button>
            </footer>
          </div>
        </div>
      )}

      {isUploadOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsUploadOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="upload-title" className={styles.modalTitle}>
                  Subir nuevo documento al paciente
                </h2>
                <p className={styles.modalSub}>
                  Añade un archivo seguro a la ficha del paciente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsUploadOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <label className={styles.dropzone} htmlFor="upload-file">
                <span className={styles.dropzoneIcon}>
                  <UploadCloud size={28} />
                </span>
                <span className={styles.dropzoneText}>
                  Arrastra tu archivo aquí o haz clic para explorar
                </span>
                <input id="upload-file" type="file" className={styles.fileInputHidden} />
              </label>

              <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="upload-name">
                    Nombre del documento
                  </label>
                  <input
                    id="upload-name"
                    type="text"
                    className={styles.textInputPlain}
                    placeholder="Ej: Analítica sangre - Julio"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="upload-folder">
                    Carpeta de destino
                  </label>
                  <select
                    id="upload-folder"
                    className={styles.selectPlain}
                    defaultValue={Object.keys(documents)[0]}
                  >
                    {Object.keys(documents).map((folder) => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsUploadOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Subir documento
              </button>
            </footer>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsDeleteOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="delete-title" className={styles.modalTitleDanger}>
                  ¿Eliminar paciente definitivamente?
                </h2>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsDeleteOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.dangerBox}>
                <AlertTriangle size={20} className={styles.dangerIcon} />
                <p className={styles.dangerText}>
                  Estás a punto de eliminar a este paciente y todo su historial
                  clínico, documentos y métricas. Esta acción no se puede deshacer.
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="delete-confirm">
                  Escribe <strong>ELIMINAR</strong> para confirmar
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  className={styles.textInputPlain}
                  placeholder="ELIMINAR"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                disabled={deleteConfirm.trim() !== "ELIMINAR"}
              >
                <Trash2 size={16} /> Sí, eliminar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
