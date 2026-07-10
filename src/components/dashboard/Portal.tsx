import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Circle,
  Phone,
  Info,
  Plus,
  LogOut,
  AlertTriangle,
  MessageCircle,
  CalendarPlus,
  CreditCard,
  Download,
  Mail,
  Camera,
  Lock,
  Bell,
  ShieldAlert,
  FileText,
  ArrowRight,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { PatientFicha } from "./PatientFicha";
import { PatientResourceLibrary } from "./PatientResourceLibrary";
import { useUser } from "../../context/UserContext";
import { useTasks } from "../../context/TasksContext";
import { useConsultations } from "../../context/ConsultationsContext";
import {
  useSymptomDiary,
  intensityLabel,
} from "../../context/SymptomDiaryContext";
import styles from "./Portal.module.css";

/** Datos de contacto de la especialista para reprogramar citas. */
const SPECIALIST = {
  name: "Sara Santos",
  phone: "+34 600 123 456",
  whatsapp: "https://wa.me/34600123456",
};


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
  const navigate = useNavigate();
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
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fase clínica actual del paciente (para la ficha en modo solo lectura).
  const currentPhase =
    nextAppointment?.phase ?? "Fase 2: Reducción de inflamación";

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

  // El botón "Cancelar cita" NO elimina directamente: abre un aviso de confirmación.
  const confirmCancel = () => {
    if (nextAppointment) {
      cancelConsultation(nextAppointment.id);
      setCancelledId(nextAppointment.id);
    }
    setShowCancelModal(false);
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
                onClick={() => setShowCancelModal(true)}
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
                contacta con {SPECIALIST.name} por teléfono ({SPECIALIST.phone}).
                Nuestro equipo ya ha sido avisado.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>
              <CalendarPlus size={26} strokeWidth={1.8} />
            </span>
            <div className={styles.emptyStateText}>
              <div className={styles.emptyStateTitle}>Sin cita programada</div>
              <div className={styles.emptyStateSub}>
                ¿Contactar con {SPECIALIST.name}?
              </div>
            </div>
            <a
              className={styles.emptyStateButton}
              href={SPECIALIST.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> Contactar
            </a>
          </div>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Tus tareas pendientes</h2>

      <div className={styles.formBanner}>
        <span className={styles.formBannerIcon}>
          <FileText size={24} strokeWidth={1.9} />
        </span>
        <div className={styles.formBannerBody}>
          <div className={styles.formBannerTitle}>
            Tienes un nuevo formulario de seguimiento pendiente de rellenar
          </div>
          <p className={styles.formBannerText}>
            «Seguimiento Julio» · enviado por Sara Santos
          </p>
        </div>
        <button
          type="button"
          className={styles.formBannerButton}
          onClick={() => navigate({ to: "/portal/formulario" })}
        >
          Comenzar <ArrowRight size={16} />
        </button>
      </div>

      <div className={styles.card}>
        <div
          className={styles.taskItem}
          style={{ cursor: "pointer" }}
          onClick={() => navigate({ to: "/portal/formulario" })}
        >
          <FileText size={18} color="#d47f65" />
          <div className={styles.taskBody}>
            <div className={styles.taskDesc}>
              Formulario «Seguimiento Julio»
            </div>
            <div className={styles.taskMeta}>Pendiente de rellenar</div>
          </div>
          <span className={styles.pendingBadge}>
            <Circle size={13} /> Pendiente
          </span>
        </div>

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

      <h2 className={styles.sectionTitle}>Mi seguimiento clínico</h2>
      <PatientFicha patientName={patientName} phase={currentPhase} />

      {showCancelModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCancelModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowCancelModal(false)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
            <span className={styles.modalIcon}>
              <AlertTriangle size={26} strokeWidth={1.9} />
            </span>
            <h2 id="cancel-title" className={styles.modalTitle}>
              ¿Estás seguro de cancelar tu cita?
            </h2>
            <p className={styles.modalText}>
              Para reprogramar, contacta con {SPECIALIST.name}:
            </p>
            <div className={styles.contactBox}>
              <a className={styles.contactRow} href={`tel:${SPECIALIST.phone.replace(/\s/g, "")}`}>
                <Phone size={16} /> {SPECIALIST.phone}
              </a>
              <a
                className={styles.contactRow}
                href={SPECIALIST.whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setShowCancelModal(false)}
              >
                Volver
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={confirmCancel}
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
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

const monthShort = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthShort[m - 1]} ${y}`;
}

function intensityBadgeClass(intensity: number): string {
  if (intensity <= 2) return styles.diaryBadgeLow;
  if (intensity === 3) return styles.diaryBadgeMid;
  return styles.diaryBadgeHigh;
}

export function PortalPlan() {
  const { patientName } = useUser();
  const { tasks, toggleTask } = useTasks();
  const { addEntry, entriesForPatient } = useSymptomDiary();

  const patientTasks = tasks.filter(
    (t) => t.patientName === patientName && t.assignee === "paciente",
  );

  const myEntries = entriesForPatient(patientName);

  const todayISO = new Date().toISOString().slice(0, 10);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [entryDate, setEntryDate] = useState(todayISO);
  const [entryIntensity, setEntryIntensity] = useState(3);
  const [entryNotes, setEntryNotes] = useState("");

  const resetEntry = () => {
    setEntryDate(todayISO);
    setEntryIntensity(3);
    setEntryNotes("");
  };

  const openEntry = () => {
    resetEntry();
    setIsEntryOpen(true);
  };

  const submitEntry = () => {
    addEntry({
      patientName,
      date: entryDate,
      intensity: entryIntensity,
      notes: entryNotes.trim(),
    });
    setIsEntryOpen(false);
    resetEntry();
    toast.success("Entrada registrada", {
      description: "Se ha compartido con tu especialista.",
    });
  };

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
          <button type="button" className={styles.addButton} onClick={openEntry}>
            <Plus size={15} /> Nueva entrada
          </button>
        </div>

        {myEntries.map((entry) => (
          <div key={entry.id} className={styles.diaryEntry}>
            <span className={styles.diaryDot} />
            <div>
              <div className={styles.diaryDate}>{formatShortDate(entry.date)}</div>
              {entry.notes && (
                <div className={styles.diaryText}>{entry.notes}</div>
              )}
              <span
                className={`${styles.diaryBadge} ${intensityBadgeClass(entry.intensity)}`}
              >
                Intensidad {entry.intensity}/5 · {intensityLabel(entry.intensity)}
              </span>
            </div>
          </div>
        ))}

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

      {isEntryOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsEntryOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setIsEntryOpen(false)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <span className={styles.modalIcon}>
              <ClipboardList size={26} strokeWidth={1.9} />
            </span>
            <h2 className={styles.modalTitle}>Nueva entrada del diario</h2>
            <p className={styles.modalText}>
              Registra cómo te encuentras. Tu especialista lo verá en tu ficha.
            </p>

            <div className={styles.formStack}>
              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="entry-date">
                  Fecha
                </label>
                <input
                  id="entry-date"
                  type="date"
                  className={styles.input}
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </div>

              <div className={styles.formField}>
                <span className={styles.formLabel}>
                  Intensidad del síntoma (1-5)
                </span>
                <div className={styles.intensityScale}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`${styles.intensityOption} ${
                        entryIntensity === n ? styles.intensityOptionActive : ""
                      }`}
                      onClick={() => setEntryIntensity(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel} htmlFor="entry-notes">
                  Notas / Observaciones
                </label>
                <textarea
                  id="entry-notes"
                  className={styles.textareaField}
                  placeholder="Describe cómo te sientes, síntomas o cambios que notes…"
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsEntryOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={submitEntry}
              >
                Guardar entrada
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

/* ============================================================
   Recursos Clínicos — solo lectura (con buscador + categorías)
   ============================================================ */
export function PortalRecursosClinicos() {
  return (
    <PortalShell
      title="Recursos Clínicos"
      sub="Material que tu especialista ha compartido contigo."
    >
      <PatientResourceLibrary audience="clinico" />
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

  const [showCancelAcademy, setShowCancelAcademy] = useState(false);
  const [academyCancelled, setAcademyCancelled] = useState(false);

  const clinicalContact =
    "mailto:hola@nutralia.com?subject=Gestión%20de%20mi%20plan%20clínico";

  return (
    <PortalShell
      title="Mis Suscripciones y Pagos"
      sub="Consulta tus planes activos, tu método de pago y tu historial de facturación."
    >
      <h2 className={styles.sectionTitle}>Planes activos</h2>

      {/* Portal de Salud — sin opción de cancelar online */}
      <div className={styles.planCard}>
        <div className={styles.planInfo}>
          <div className={styles.planName}>Portal de Salud</div>
          <div className={styles.planMeta}>
            Acompañamiento clínico · renovación mensual
          </div>
          <div className={styles.planBilling}>
            Próximo cobro: 5 de agosto de 2026 · 45€
          </div>
          <a className={styles.planManageLink} href={clinicalContact}>
            <Mail size={14} /> Contactar para gestionar plan clínico
          </a>
        </div>
        <span className={styles.planPill}>Activo</span>
      </div>

      {/* Academia Nutralia — cancelable con confirmación */}
      {hasAcademyAccess && (
        <div className={styles.planCard}>
          <div className={styles.planInfo}>
            <div className={styles.planName}>Academia Nutralia</div>
            <div className={styles.planMeta}>
              Acceso a cursos y clases en directo
            </div>
            <div className={styles.planBilling}>
              Próximo cobro: 1 de agosto de 2026 · 19€
            </div>
            {academyCancelled ? (
              <span className={styles.planCancelledNote}>
                <Info size={14} /> Suscripción cancelada · activa hasta el 1 de
                agosto de 2026
              </span>
            ) : (
              <button
                type="button"
                className={styles.planCancelLink}
                onClick={() => setShowCancelAcademy(true)}
              >
                Cancelar suscripción
              </button>
            )}
          </div>
          <span
            className={
              academyCancelled ? styles.planPillMuted : styles.planPill
            }
          >
            {academyCancelled ? "Cancelada" : "Activo"}
          </span>
        </div>
      )}

      {/* Método de pago */}
      <h2 className={styles.sectionTitle}>Método de pago</h2>
      <div className={styles.card}>
        <div className={styles.paymentMethod}>
          <span className={styles.paymentCardIcon}>
            <CreditCard size={24} strokeWidth={1.9} />
          </span>
          <div className={styles.paymentInfo}>
            <div className={styles.paymentCardNumber}>
              Tarjeta terminada en •••• 4567
            </div>
            <div className={styles.paymentCardExp}>Visa · Caduca 09/2027</div>
          </div>
          <button type="button" className={styles.secondaryButton}>
            Actualizar datos de pago
          </button>
        </div>
      </div>

      {/* Historial de facturación */}
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
                <th className={styles.billingColRight}>Factura</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={i}>
                  <td>{inv.date}</td>
                  <td>{inv.concept}</td>
                  <td>{inv.amount}</td>
                  <td>{inv.method}</td>
                  <td className={styles.billingColRight}>
                    <button
                      type="button"
                      className={styles.invoiceDownload}
                      aria-label={`Descargar factura del ${inv.date}`}
                      title="Descargar recibo (PDF)"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCancelAcademy && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCancelAcademy(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-academy-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setShowCancelAcademy(false)}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
            <span className={styles.modalIcon}>
              <AlertTriangle size={26} strokeWidth={1.9} />
            </span>
            <h2 id="cancel-academy-title" className={styles.modalTitle}>
              ¿Estás seguro de que quieres cancelar tu acceso a la comunidad?
            </h2>
            <p className={styles.modalText}>
              Perderás el acceso a los cursos y clases en directo al final del
              periodo de facturación actual.
            </p>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setShowCancelAcademy(false)}
              >
                Mantener suscripción
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => {
                  setAcademyCancelled(true);
                  setShowCancelAcademy(false);
                }}
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

/* ============================================================
   Mi Perfil
   ============================================================ */
export function PortalPerfil() {
  const { logout } = useUser();

  const [profile, setProfile] = useState({
    name: "Elena Martín García",
    email: "elena.martin@email.com",
    phone: "+34 600 987 654",
  });

  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyAcademy, setNotifyAcademy] = useState(false);

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <PortalShell
      title="Mi Perfil"
      sub="Gestiona tus datos personales, seguridad y preferencias."
    >
      {/* Tarjeta 1: Información personal */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Información personal</h2>
        </div>
        <div className={styles.avatarRow}>
          <div className={styles.avatarWrap}>
            <span className={styles.avatarLarge}>{initials}</span>
            <button
              type="button"
              className={styles.avatarEdit}
              aria-label="Subir foto de perfil"
              title="Subir foto"
            >
              <Camera size={15} />
            </button>
          </div>
          <div className={styles.avatarText}>
            <div className={styles.avatarName}>{profile.name}</div>
            <div className={styles.avatarHint}>Sube una foto de perfil</div>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nombre completo</span>
            <input
              className={styles.input}
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, name: e.target.value }))
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Correo electrónico</span>
            <input
              className={styles.input}
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile((p) => ({ ...p, email: e.target.value }))
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Teléfono</span>
            <input
              className={styles.input}
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </label>
        </div>

        <div className={styles.cardActions}>
          <button type="button" className={styles.primaryButton}>
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Tarjeta 2: Seguridad y contraseña */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            <Lock size={17} className={styles.cardTitleIcon} /> Seguridad y
            contraseña
          </h2>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Contraseña actual</span>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nueva contraseña</span>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Repetir nueva contraseña</span>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
            />
          </label>
        </div>
        <div className={styles.cardActions}>
          <button type="button" className={styles.secondaryButton}>
            Actualizar contraseña
          </button>
        </div>
      </div>

      {/* Tarjeta 3: Preferencias de notificaciones */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            <Bell size={17} className={styles.cardTitleIcon} /> Preferencias de
            notificaciones
          </h2>
        </div>
        <div className={styles.toggleList}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleText}>
              <div className={styles.toggleTitle}>
                Recordatorios de citas y tareas
              </div>
              <div className={styles.toggleSub}>
                Recibe avisos antes de tus consultas y vencimientos.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyReminders}
              className={`${styles.toggle} ${notifyReminders ? styles.toggleOn : ""}`}
              onClick={() => setNotifyReminders((v) => !v)}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleText}>
              <div className={styles.toggleTitle}>
                Comunicaciones de la academia y nuevos cursos
              </div>
              <div className={styles.toggleSub}>
                Novedades, talleres en directo y lanzamientos.
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyAcademy}
              className={`${styles.toggle} ${notifyAcademy ? styles.toggleOn : ""}`}
              onClick={() => setNotifyAcademy((v) => !v)}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        </div>
      </div>

      {/* Tarjeta 4: Zona de sesión */}
      <div className={styles.dangerCard}>
        <div className={styles.dangerHead}>
          <span className={styles.dangerIcon}>
            <ShieldAlert size={18} />
          </span>
          <div>
            <div className={styles.dangerTitle}>Sesión y cuenta</div>
            <div className={styles.dangerSub}>
              Aceptaste la Política de Privacidad el 12 de marzo de 2026.
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={logout}
          >
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
