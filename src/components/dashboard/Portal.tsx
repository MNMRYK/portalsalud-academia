import { useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Circle,
  Phone,
  Info,
  FileText,
  Video,
  ClipboardList as MenuIcon,
  Download,
  Plus,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useUser } from "../../context/UserContext";
import { useTasks } from "../../context/TasksContext";
import { useConsultations } from "../../context/ConsultationsContext";
import {
  useResources,
  type Resource,
  type ResourceAudience,
} from "../../context/ResourcesContext";
import styles from "./Portal.module.css";

const monthLong = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${monthLong[m - 1]} de ${y}`;
}

function PortalShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.sub}>{sub}</p>
        </header>
        {children}
      </main>
    </div>
  );
}

/* ============================================================
   Mi Dashboard
   ============================================================ */
export function PortalDashboard() {
  const { patientName } = useUser();
  const { tasks } = useTasks();
  const { consultationsForPatient, cancelConsultation } = useConsultations();

  const today = new Date().toISOString().slice(0, 10);
  const patientTasks = tasks.filter(
    (t) => t.patientName === patientName && t.assignee === "paciente",
  );
  const pendingTasks = patientTasks.filter((t) => !t.isCompleted);

  const upcoming = consultationsForPatient(patientName)
    .filter((c) => c.status === "Pendiente" && c.date >= today)
    .sort((a, b) => (a.date > b.date ? 1 : -1));
  const nextAppointment = upcoming[0] ?? null;

  const [cancelledId, setCancelledId] = useState<string | null>(null);

  const stats: { value: string; label: string; icon: LucideIcon; cls: string }[] = [
    {
      value: String(pendingTasks.length),
      label: "Tareas pendientes",
      icon: ClipboardList,
      cls: styles.iconTerracota,
    },
    {
      value: nextAppointment ? formatLongDate(nextAppointment.date).split(" de ")[0] : "—",
      label: "Próxima cita",
      icon: CalendarDays,
      cls: styles.iconPlum,
    },
    {
      value: String(patientTasks.filter((t) => t.isCompleted).length),
      label: "Tareas completadas",
      icon: CheckCircle2,
      cls: styles.iconSage,
    },
  ];

  const handleCancel = () => {
    if (nextAppointment) {
      cancelConsultation(nextAppointment.id);
      setCancelledId(nextAppointment.id);
    }
  };

  const isCancelled = nextAppointment && cancelledId === nextAppointment.id;

  return (
    <PortalShell
      title="Hola, Elena"
      sub="Este es el resumen de tu acompañamiento en Nutralia."
    >
      <section className={styles.stats}>
        {stats.map(({ value, label, icon: Icon, cls }) => (
          <div key={label} className={styles.statCard}>
            <span className={`${styles.statIcon} ${cls}`}>
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </section>

      <h2 className={styles.sectionTitle}>Tu próxima cita</h2>
      {nextAppointment ? (
        <div className={styles.card}>
          <div className={styles.appointment}>
            <span className={styles.appointmentIcon}>
              <CalendarDays size={24} strokeWidth={1.9} />
            </span>
            <div className={styles.appointmentInfo}>
              <div className={styles.appointmentDate}>
                {formatLongDate(nextAppointment.date)} · {nextAppointment.time}
              </div>
              <div className={styles.appointmentMeta}>
                {nextAppointment.phase}
              </div>
            </div>
            {isCancelled ? (
              <span className={styles.cancelledBadge}>
                <Info size={15} /> Cita cancelada
              </span>
            ) : (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancelar cita
              </button>
            )}
          </div>
          {isCancelled && (
            <div className={styles.notice}>
              <Phone size={17} className={styles.noticeIcon} />
              <span>
                Tu cita ha quedado registrada como cancelada. Para reprogramarla,
                contacta con la clínica por teléfono (+34 600 123 456) o email
                (hola@nutralia.com). Nuestro equipo ya ha sido avisado.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.card}>
          <p className={styles.empty}>No tienes ninguna cita programada.</p>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Tus tareas pendientes</h2>
      <div className={styles.card}>
        {pendingTasks.length === 0 ? (
          <p className={styles.empty}>¡Estás al día! No tienes tareas pendientes.</p>
        ) : (
          <div className={styles.taskList}>
            {pendingTasks.map((t) => (
              <div key={t.id} className={styles.taskItem}>
                <Circle size={18} color="#c9a24b" />
                <div className={styles.taskBody}>
                  <div className={styles.taskDesc}>{t.description}</div>
                  <div className={styles.taskMeta}>Vence: {formatLongDate(t.dueDate)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}

/* ============================================================
   Plan de Acción (tareas del paciente + diario)
   ============================================================ */
const sharedDiary = [
  { id: "d1", date: "05 jul 2026", text: "Hoy me he sentido con más energía y he dormido mejor. Menos hinchazón por la tarde." },
  { id: "d2", date: "02 jul 2026", text: "Dolor de cabeza leve por la mañana. He aumentado la hidratación como acordamos." },
  { id: "d3", date: "28 jun 2026", text: "Buena semana en general. He cumplido la pauta antiinflamatoria sin dificultad." },
];

export function PortalPlan() {
  const { patientName } = useUser();
  const { tasks, toggleTask } = useTasks();

  const patientTasks = tasks.filter(
    (t) => t.patientName === patientName && t.assignee === "paciente",
  );

  return (
    <PortalShell
      title="Plan de Acción"
      sub="Tus tareas asignadas y tu diario de síntomas compartido."
    >
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Mis tareas</h2>
        </div>
        {patientTasks.length === 0 ? (
          <p className={styles.empty}>No tienes tareas asignadas por ahora.</p>
        ) : (
          <div className={styles.taskList}>
            {patientTasks.map((t) => (
              <div key={t.id} className={styles.taskItem}>
                {t.isCompleted ? (
                  <CheckCircle2 size={19} color="#5f8a5b" />
                ) : (
                  <Circle size={19} color="#c9a24b" />
                )}
                <div className={styles.taskBody}>
                  <div
                    className={`${styles.taskDesc} ${t.isCompleted ? styles.taskDescDone : ""}`}
                  >
                    {t.description}
                  </div>
                  <div className={styles.taskMeta}>
                    Vence: {formatLongDate(t.dueDate)} · Prioridad {t.priority}
                  </div>
                </div>
                {t.isCompleted ? (
                  <span className={styles.doneBadge}>
                    <CheckCircle2 size={15} /> Completada
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.completeButton}
                    onClick={() => toggleTask(t.id)}
                  >
                    <CheckCircle2 size={15} /> Completar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Diario de síntomas</h2>
          <button type="button" className={styles.disabledButton} disabled>
            <Plus size={15} /> Nueva entrada
          </button>
        </div>
        {sharedDiary.map((entry) => (
          <div key={entry.id} className={styles.diaryEntry}>
            <span className={styles.diaryDot} />
            <div>
              <div className={styles.diaryDate}>{entry.date}</div>
              <div className={styles.diaryText}>{entry.text}</div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}

/* ============================================================
   Recursos (clínicos o académicos) — solo lectura
   ============================================================ */
const resIconMeta: Record<Resource["type"], { icon: LucideIcon; cls: string; label: string }> = {
  pdf: { icon: FileText, cls: "resIconPdf", label: "PDF" },
  video: { icon: Video, cls: "resIconVideo", label: "Vídeo" },
  menu: { icon: MenuIcon, cls: "resIconMenu", label: "Menú" },
};

function ResourceList({ audience }: { audience: ResourceAudience }) {
  const { patientResources } = useResources();
  const items = patientResources(audience);

  if (items.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.empty}>
          Aún no hay recursos compartidos contigo en esta sección.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.resourceGrid}>
      {items.map((r) => {
        const meta = resIconMeta[r.type];
        const Icon = meta.icon;
        return (
          <article key={r.id} className={styles.resourceCard}>
            <span className={`${styles.resourceIcon} ${styles[meta.cls]}`}>
              <Icon size={24} strokeWidth={1.9} />
            </span>
            <div>
              <div className={styles.resourceName}>{r.name}</div>
              <span className={styles.resourceCat}>{r.category}</span>
            </div>
            <button type="button" className={styles.downloadButton}>
              <Download size={15} /> Descargar {meta.label}
            </button>
          </article>
        );
      })}
    </section>
  );
}

export function PortalRecursosClinicos() {
  return (
    <PortalShell
      title="Recursos Clínicos"
      sub="Material que tu especialista ha compartido contigo."
    >
      <ResourceList audience="clinico" />
    </PortalShell>
  );
}

/* ============================================================
   Mis Suscripciones y Pagos
   ============================================================ */
export function PortalSuscripciones() {
  const { patientName, hasAcademyAccess } = useUser();
  const { invoicesForPatient } = useConsultations();
  const invoices = invoicesForPatient(patientName);

  return (
    <PortalShell
      title="Mis Suscripciones y Pagos"
      sub="Consulta tus planes activos y tu historial de facturación."
    >
      <div className={styles.planCard}>
        <div>
          <div className={styles.planName}>Portal de Salud</div>
          <div className={styles.planMeta}>Acompañamiento clínico · renovación mensual</div>
        </div>
        <span className={styles.planPill}>Activo</span>
      </div>

      {hasAcademyAccess && (
        <div className={styles.planCard}>
          <div>
            <div className={styles.planName}>Academia Nutralia</div>
            <div className={styles.planMeta}>Acceso a cursos y clases en directo</div>
          </div>
          <span className={styles.planPill}>Activo</span>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Historial de facturación</h2>
      <div className={styles.card}>
        {invoices.length === 0 ? (
          <p className={styles.empty}>Todavía no hay pagos registrados.</p>
        ) : (
          <table className={styles.billingTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Importe</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={i}>
                  <td>{inv.date}</td>
                  <td>{inv.concept}</td>
                  <td>{inv.amount}</td>
                  <td>{inv.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalShell>
  );
}

/* ============================================================
   Mi Perfil
   ============================================================ */
export function PortalPerfil() {
  const { logout } = useUser();

  const fields = [
    { label: "Nombre completo", value: "Elena Martín García" },
    { label: "Correo electrónico", value: "elena.martin@email.com" },
    { label: "Teléfono", value: "+34 600 987 654" },
    { label: "Fase actual", value: "Fase 2: Reducción de inflamación" },
  ];

  return (
    <PortalShell title="Mi Perfil" sub="Tus datos personales y de contacto.">
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Datos personales</h2>
        </div>
        <div className={styles.profileGrid}>
          {fields.map((f) => (
            <div key={f.label} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </div>
          ))}
        </div>
        <div className={styles.footerLogout}>
          <button type="button" className={styles.logoutButton} onClick={logout}>
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
