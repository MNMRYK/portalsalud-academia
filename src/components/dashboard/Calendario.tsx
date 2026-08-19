import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Video,
  MapPin,
  Shield,
  Lock,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ScreenShare,
  Clock,
  Euro,
  Timer,
  Stethoscope,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { ConsultaWorkspace } from "./ConsultaWorkspace";
import { toast } from "sonner";
import styles from "./Dashboard.module.css";
import s from "./Calendario.module.css";

interface Appointment {
  id: string;
  patient: string;
  initials: string;
  /** yyyy-mm-dd */
  date: string;
  time: string;
  mode: "video" | "presencial";
  reason: string;
}

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

const seedAppointments: Appointment[] = [
  {
    id: "a1",
    patient: "Elena Martín",
    initials: "EM",
    date: iso(today),
    time: "10:00",
    mode: "video",
    reason: "Revisión Fase 2 · Antiinflamatorio",
  },
  {
    id: "a2",
    patient: "Lucía Fernández",
    initials: "LF",
    date: iso(today),
    time: "12:30",
    mode: "presencial",
    reason: "Primera consulta",
  },
  {
    id: "a3",
    patient: "Marcos Iglesias",
    initials: "MI",
    date: iso(addDays(today, 1)),
    time: "09:15",
    mode: "video",
    reason: "Mantenimiento",
  },
  {
    id: "a4",
    patient: "Javier Morán",
    initials: "JM",
    date: iso(addDays(today, 3)),
    time: "16:45",
    mode: "video",
    reason: "Seguimiento intestinal",
  },
];

const availableSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "16:00", "16:30", "17:00", "17:30",
];

interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  buffer: number;
}

interface ServiceFormState {
  name: string;
  description: string;
  duration: string;
  price: string;
  buffer: string;
}

const emptyServiceForm: ServiceFormState = {
  name: "",
  description: "",
  duration: "45",
  price: "65",
  buffer: "10",
};

const mockPatients = [
  { id: "p1", name: "Elena Martín" },
  { id: "p2", name: "Lucía Fernández" },
  { id: "p3", name: "Marcos Iglesias" },
  { id: "p4", name: "Javier Morán" },
  { id: "p5", name: "Carmen Ortiz" },
];

const initialServices: ServiceType[] = [
  {
    id: "sv1",
    name: "Primera visita",
    description: "Historia clínica completa, valoración inicial y plan de fases.",
    duration: 60,
    price: 90,
    buffer: 15,
  },
  {
    id: "sv2",
    name: "Revisión",
    description: "Seguimiento de evolución, ajuste de pauta y métricas clínicas.",
    duration: 45,
    price: 65,
    buffer: 10,
  },
  {
    id: "sv3",
    name: "Sesión rápida",
    description: "Consulta breve para dudas puntuales o ajustes de suplementación.",
    duration: 20,
    price: 35,
    buffer: 5,
  },
];

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const dayNames = ["L", "M", "X", "J", "V", "S", "D"];

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  // JS: 0 = Sunday. We want Monday first.
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = startOffset; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: addDays(last, 1), inMonth: false });
  }
  return cells;
}

export function Calendario() {
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<string>(iso(today));
  const [appointments, setAppointments] =
    useState<Appointment[]>(seedAppointments);
  const [activeCall, setActiveCall] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceType[]>(initialServices);
  const [serviceForm, setServiceForm] = useState<ServiceFormState | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);
  const [bookingPatient, setBookingPatient] = useState("");
  const [bookingService, setBookingService] = useState("");
  const [bookingMode, setBookingMode] = useState<"video" | "presencial">("video");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [automations, setAutomations] = useState({
    emailConfirm: true,
    smsReminder: true,
    whatsappReminder: false,
    autoReschedule: true,
  });

  const grid = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const bookedTimes = useMemo(
    () =>
      new Set(
        appointments.filter((a) => a.date === selectedDate).map((a) => a.time),
      ),
    [appointments, selectedDate],
  );

  const dailyAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === selectedDate)
        .sort((a, b) => (a.time < b.time ? -1 : 1)),
    [appointments, selectedDate],
  );

  const daysWithAppointments = useMemo(
    () => new Set(appointments.map((a) => a.date)),
    [appointments],
  );

  const goPrevMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNextMonth = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));

  const openBooking = (slot: string) => {
    setSelectedSlot(slot);
    setBookingSlot(slot);
    setBookingPatient("");
    setBookingService("");
    setBookingMode("video");
  };

  const closeBooking = () => {
    setBookingSlot(null);
    setSelectedSlot(null);
  };

  const initialsOf = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

  const confirmBooking = () => {
    if (!bookingSlot || !bookingPatient || !bookingService) return;
    const sv = services.find((x) => x.id === bookingService);
    const newAppt: Appointment = {
      id: `a-${Date.now()}`,
      patient: bookingPatient,
      initials: initialsOf(bookingPatient),
      date: selectedDate,
      time: bookingSlot,
      mode: bookingMode,
      reason: sv ? `${sv.name} · ${sv.duration} min` : "Consulta",
    };
    setAppointments((prev) => [...prev, newAppt]);
    toast.success(`Cita creada · ${selectedDate} a las ${bookingSlot}`, {
      description: `${bookingPatient} · ${sv?.name ?? "Consulta"}. Confirmación cifrada enviada.`,
    });
    closeBooking();
  };

  const openNewService = () => {
    setEditingServiceId(null);
    setServiceForm({ ...emptyServiceForm });
  };

  const openEditService = (sv: ServiceType) => {
    setEditingServiceId(sv.id);
    setServiceForm({
      name: sv.name,
      description: sv.description,
      duration: String(sv.duration),
      price: String(sv.price),
      buffer: String(sv.buffer),
    });
  };

  const closeServiceForm = () => {
    setServiceForm(null);
    setEditingServiceId(null);
  };

  const patchServiceForm = (patch: Partial<ServiceFormState>) =>
    setServiceForm((prev) => (prev ? { ...prev, ...patch } : prev));

  const saveService = () => {
    if (!serviceForm || !serviceForm.name.trim()) return;
    const parsed: Omit<ServiceType, "id"> = {
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
      duration: Number(serviceForm.duration) || 0,
      price: Number(serviceForm.price) || 0,
      buffer: Number(serviceForm.buffer) || 0,
    };
    if (editingServiceId) {
      setServices((prev) =>
        prev.map((sv) =>
          sv.id === editingServiceId ? { ...sv, ...parsed } : sv,
        ),
      );
      toast.success("Servicio actualizado", { description: parsed.name });
    } else {
      setServices((prev) => [...prev, { id: `sv-${Date.now()}`, ...parsed }]);
      toast.success("Servicio creado", { description: parsed.name });
    }
    closeServiceForm();
  };

  const confirmDeleteService = () => {
    const sv = services.find((x) => x.id === deleteServiceId);
    setServices((prev) => prev.filter((x) => x.id !== deleteServiceId));
    setDeleteServiceId(null);
    toast.success("Servicio eliminado", { description: sv?.name });
  };

  const toggleAuto = (key: keyof typeof automations) => {
    setAutomations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startCall = (appt: Appointment) => {
    setActiveCall(appt);
    setMicOn(true);
    setCamOn(true);
  };

  const endCall = () => {
    setActiveCall(null);
    toast.success("Videoconsulta finalizada", {
      description:
        "La sesión E2EE se cerró correctamente. No se conservan grabaciones.",
    });
  };

  const monthLabel = `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Calendario de Citas</h1>
            <p className={styles.greetingSub}>
              Agenda automática y videoconsultas cifradas de extremo a extremo.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.search}>
              <Search size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar paciente…"
                aria-label="Buscador de citas"
              />
            </div>
            <NotificationBell />
          </div>
        </header>

        <div className={s.securityBanner}>
          <span className={s.securityIcon}>
            <Shield size={22} strokeWidth={2} />
          </span>
          <div className={s.securityBody}>
            <div className={s.securityTitle}>
              Videoconsulta segura
              <span className={s.securityBadge}>
                <Lock size={11} strokeWidth={2.4} /> E2EE
              </span>
            </div>
            <p className={s.securityText}>
              Todas las llamadas están cifradas de extremo a extremo con
              claves efímeras por sesión. Ni el servidor ni terceros pueden
              descifrar audio o vídeo. Cumple RGPD y LOPDGDD.
            </p>
          </div>
        </div>

        <div className={s.layout}>
          {/* ==== Calendario mensual ==== */}
          <section className={s.card}>
            <div className={s.cardHeader}>
              <div>
                <div className={s.cardTitle}>
                  <CalendarDays size={18} strokeWidth={2} />
                  Agenda mensual
                </div>
                <div className={s.cardSub}>
                  Selecciona un día para ver o crear citas.
                </div>
              </div>
              <div className={s.headerNav}>
                <button
                  type="button"
                  className={s.navBtn}
                  onClick={goPrevMonth}
                  aria-label="Mes anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className={s.monthLabel}>{monthLabel}</span>
                <button
                  type="button"
                  className={s.navBtn}
                  onClick={goNextMonth}
                  aria-label="Mes siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className={s.grid}>
              {dayNames.map((d) => (
                <div key={d} className={s.dayName}>
                  {d}
                </div>
              ))}
              {grid.map(({ date, inMonth }) => {
                const key = iso(date);
                const isToday = key === iso(today);
                const isSelected = key === selectedDate;
                const hasAppt = daysWithAppointments.has(key);
                const cls = [
                  s.day,
                  !inMonth ? s.dayMuted : "",
                  isToday ? s.dayToday : "",
                  isSelected ? s.daySelected : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={key}
                    type="button"
                    className={cls}
                    onClick={() => setSelectedDate(key)}
                  >
                    {date.getDate()}
                    {hasAppt && <span className={s.dot} />}
                  </button>
                );
              })}
            </div>

            <div className={s.legend}>
              <div className={s.legendItem}>
                <span
                  className={s.legendDot}
                  style={{ backgroundColor: "#d47f65" }}
                />
                Día con citas
              </div>
              <div className={s.legendItem}>
                <span
                  className={s.legendDot}
                  style={{
                    backgroundColor: "#fbeee7",
                    border: "1px solid #d47f65",
                  }}
                />
                Día seleccionado
              </div>
            </div>
          </section>

          {/* ==== Columna derecha ==== */}
          <div className={s.rightCol}>
            <section className={s.card}>
              <div className={s.cardHeader}>
                <div>
                  <div className={s.cardTitle}>Huecos disponibles</div>
                  <div className={s.cardSub}>{selectedDate}</div>
                </div>
                <button
                  type="button"
                  className={s.iconBtn + " " + s.iconBtnPrimary}
                  onClick={bookSlot}
                  disabled={!selectedSlot}
                  style={{
                    width: "auto",
                    padding: "0 14px",
                    fontFamily: "Nunito, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    opacity: selectedSlot ? 1 : 0.5,
                    cursor: selectedSlot ? "pointer" : "not-allowed",
                  }}
                >
                  Reservar
                </button>
              </div>
              <div className={s.slots}>
                {availableSlots.map((t) => {
                  const booked = bookedTimes.has(t);
                  const selected = selectedSlot === t;
                  const cls = [
                    s.slot,
                    booked ? s.slotBooked : "",
                    selected ? s.slotSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      key={t}
                      type="button"
                      className={cls}
                      disabled={booked}
                      onClick={() => !booked && setSelectedSlot(t)}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={s.card}>
              <div className={s.cardHeader}>
                <div>
                  <div className={s.cardTitle}>Citas del día</div>
                  <div className={s.cardSub}>
                    {dailyAppointments.length} programadas
                  </div>
                </div>
              </div>

              {dailyAppointments.length === 0 ? (
                <div className={s.empty}>
                  No hay citas para este día. Selecciona un hueco para agendar.
                </div>
              ) : (
                <div className={s.apptList}>
                  {dailyAppointments.map((a) => (
                    <div key={a.id} className={s.apptItem}>
                      <div className={s.apptTime}>
                        <span className={s.apptTimeH}>{a.time}</span>
                        <span className={s.apptTimeD}>45 min</span>
                      </div>
                      <div className={s.apptBody}>
                        <div className={s.apptName}>{a.patient}</div>
                        <div className={s.apptMeta}>
                          {a.mode === "video" ? (
                            <span className={`${s.tag} ${s.tagVideo}`}>
                              <Video size={11} /> Videoconsulta
                            </span>
                          ) : (
                            <span className={`${s.tag} ${s.tagPresencial}`}>
                              <MapPin size={11} /> Presencial
                            </span>
                          )}
                          <span>{a.reason}</span>
                        </div>
                      </div>
                      <div className={s.apptActions}>
                        {a.mode === "video" && (
                          <button
                            type="button"
                            className={`${s.iconBtn} ${s.iconBtnPrimary}`}
                            onClick={() => startCall(a)}
                            aria-label="Iniciar videoconsulta"
                            title="Iniciar videoconsulta E2EE"
                          >
                            <Video size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          className={s.iconBtn}
                          aria-label="Llamar"
                          title="Contacto telefónico"
                        >
                          <Phone size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ==== Servicios / tipos de cita ==== */}
        <section className={`${s.card} ${s.automation}`}>
          <div className={s.cardHeader}>
            <div>
              <div className={s.cardTitle}>
                <Stethoscope size={18} strokeWidth={2} />
                Servicios y tipos de cita
              </div>
              <div className={s.cardSub}>
                Duración, precio y margen entre citas de cada servicio.
              </div>
            </div>
          </div>
          <div className={s.servicesGrid}>
            {services.map((sv) => (
              <article key={sv.id} className={s.serviceCard}>
                <div className={s.serviceName}>
                  {sv.name}
                  <span className={s.serviceHeadRight}>
                    <span className={s.servicePrice}>{sv.price} €</span>
                    <button
                      type="button"
                      className={s.serviceAction}
                      onClick={() => openEditService(sv)}
                      aria-label={`Editar ${sv.name}`}
                      title="Editar servicio"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className={`${s.serviceAction} ${s.serviceActionDanger}`}
                      onClick={() => setDeleteServiceId(sv.id)}
                      aria-label={`Eliminar ${sv.name}`}
                      title="Eliminar servicio"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
                <p className={s.serviceDesc}>{sv.description}</p>
                <div className={s.serviceMeta}>
                  <span className={s.serviceChip}>
                    <Clock size={12} /> {sv.duration} min
                  </span>
                  <span className={s.serviceChip}>
                    <Timer size={12} /> Buffer {sv.buffer} min
                  </span>
                  <span className={s.serviceChip}>
                    <Euro size={12} /> {sv.price} €
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ==== Automatizaciones ==== */}
        <section className={`${s.card} ${s.automation}`}>
          <div className={s.cardHeader}>
            <div>
              <div className={s.cardTitle}>Automatizaciones</div>
              <div className={s.cardSub}>
                Notificaciones y flujos automáticos por cada cita.
              </div>
            </div>
          </div>
          <div className={s.autoList}>
            <div className={s.autoItem}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Mail size={18} style={{ color: "#875c80" }} />
                <div className={s.autoText}>
                  <span className={s.autoLabel}>Confirmación por email</span>
                  <span className={s.autoDesc}>
                    Envía email de confirmación con enlace cifrado al reservar.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={`${s.toggle} ${automations.emailConfirm ? s.toggleOn : ""}`}
                onClick={() => toggleAuto("emailConfirm")}
                aria-label="Confirmación por email"
              />
            </div>
            <div className={s.autoItem}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Bell size={18} style={{ color: "#875c80" }} />
                <div className={s.autoText}>
                  <span className={s.autoLabel}>Recordatorio SMS · 24h antes</span>
                  <span className={s.autoDesc}>
                    Recuerda al paciente su cita el día previo.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={`${s.toggle} ${automations.smsReminder ? s.toggleOn : ""}`}
                onClick={() => toggleAuto("smsReminder")}
                aria-label="Recordatorio SMS"
              />
            </div>
            <div className={s.autoItem}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <MessageSquare size={18} style={{ color: "#875c80" }} />
                <div className={s.autoText}>
                  <span className={s.autoLabel}>Recordatorio por WhatsApp</span>
                  <span className={s.autoDesc}>
                    Notificación por WhatsApp 2h antes de la cita.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={`${s.toggle} ${automations.whatsappReminder ? s.toggleOn : ""}`}
                onClick={() => toggleAuto("whatsappReminder")}
                aria-label="Recordatorio WhatsApp"
              />
            </div>
            <div className={s.autoItem}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <CalendarDays size={18} style={{ color: "#875c80" }} />
                <div className={s.autoText}>
                  <span className={s.autoLabel}>Reprogramación automática</span>
                  <span className={s.autoDesc}>
                    Si el paciente cancela, ofrece el siguiente hueco disponible.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={`${s.toggle} ${automations.autoReschedule ? s.toggleOn : ""}`}
                onClick={() => toggleAuto("autoReschedule")}
                aria-label="Reprogramación automática"
              />
            </div>
          </div>
        </section>
      </main>

      {activeCall && (
        <div
          className={s.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Videoconsulta cifrada"
        >
          <div className={s.modal}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>
                <Video size={18} />
                {activeCall.patient} · {activeCall.time}
                <span className={s.e2eeBadge}>
                  <Lock size={11} strokeWidth={2.4} /> E2EE activo
                </span>
              </div>
              <button
                type="button"
                className={s.modalClose}
                onClick={endCall}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <div className={s.callSplit}>
            <div className={s.videoCol}>
            <div className={s.videoStage}>
              <div className={s.recording}>
                <span className={s.recDot} /> En directo
              </div>
              <div className={s.remoteAvatar}>{activeCall.initials}</div>
              <div className={s.remoteLabel}>{activeCall.patient}</div>
              <div className={s.selfTile}>Tú · Laura García</div>
            </div>

            <div className={s.callBar}>
              <button
                type="button"
                className={`${s.callBtn} ${!micOn ? s.callBtnOff : ""}`}
                onClick={() => setMicOn((v) => !v)}
                aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
                title={micOn ? "Silenciar" : "Activar micrófono"}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                type="button"
                className={`${s.callBtn} ${!camOn ? s.callBtnOff : ""}`}
                onClick={() => setCamOn((v) => !v)}
                aria-label={camOn ? "Apagar cámara" : "Encender cámara"}
                title={camOn ? "Apagar cámara" : "Encender cámara"}
              >
                {camOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <button
                type="button"
                className={s.callBtn}
                aria-label="Compartir pantalla"
                title="Compartir pantalla"
              >
                <ScreenShare size={18} />
              </button>
              <button
                type="button"
                className={`${s.callBtn} ${s.callBtnEnd}`}
                onClick={endCall}
                aria-label="Finalizar llamada"
                title="Finalizar llamada"
              >
                <PhoneOff size={20} />
              </button>
            </div>
            </div>

            <ConsultaWorkspace patient={activeCall.patient} />
            </div>

            <div className={s.modalFooter}>
              Cifrado extremo a extremo con claves efímeras · Sin grabación por defecto · RGPD
            </div>
          </div>
        </div>
      )}

      {/* ==== Modal: nueva reserva ==== */}
      {bookingSlot && (
        <div className={s.formOverlay} role="dialog" aria-modal="true">
          <div className={s.formModal}>
            <div className={s.formHeader}>
              <div className={s.formTitle}>
                <CalendarDays size={17} /> Nueva reserva
              </div>
              <button
                type="button"
                className={s.formClose}
                onClick={closeBooking}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <p className={s.formHint}>
              {selectedDate} · {bookingSlot}
            </p>

            <div className={s.field}>
              <label className={s.label} htmlFor="bk-patient">
                Paciente
              </label>
              <select
                id="bk-patient"
                className={s.input}
                value={bookingPatient}
                onChange={(e) => setBookingPatient(e.target.value)}
              >
                <option value="">Selecciona un paciente…</option>
                {mockPatients.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="bk-service">
                Servicio
              </label>
              <select
                id="bk-service"
                className={s.input}
                value={bookingService}
                onChange={(e) => setBookingService(e.target.value)}
              >
                <option value="">Selecciona un servicio…</option>
                {services.map((sv) => (
                  <option key={sv.id} value={sv.id}>
                    {sv.name} · {sv.duration} min · {sv.price} €
                  </option>
                ))}
              </select>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="bk-mode">
                Modalidad
              </label>
              <select
                id="bk-mode"
                className={s.input}
                value={bookingMode}
                onChange={(e) =>
                  setBookingMode(e.target.value as "video" | "presencial")
                }
              >
                <option value="video">Videoconsulta E2EE</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>

            <div className={s.formActions}>
              <button type="button" className={s.btnGhost} onClick={closeBooking}>
                Cancelar
              </button>
              <button
                type="button"
                className={s.btnPrimary}
                onClick={confirmBooking}
                disabled={!bookingPatient || !bookingService}
              >
                Confirmar reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== Modal: crear / editar servicio ==== */}
      {serviceForm && (
        <div className={s.formOverlay} role="dialog" aria-modal="true">
          <div className={s.formModal}>
            <div className={s.formHeader}>
              <div className={s.formTitle}>
                <Stethoscope size={17} />
                {editingServiceId ? "Editar servicio" : "Nuevo servicio"}
              </div>
              <button
                type="button"
                className={s.formClose}
                onClick={closeServiceForm}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="sv-name">
                Nombre del servicio
              </label>
              <input
                id="sv-name"
                className={s.input}
                value={serviceForm.name}
                onChange={(e) => patchServiceForm({ name: e.target.value })}
                placeholder="Ej. Revisión trimestral"
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="sv-desc">
                Descripción breve
              </label>
              <textarea
                id="sv-desc"
                className={`${s.input} ${s.textarea}`}
                value={serviceForm.description}
                onChange={(e) =>
                  patchServiceForm({ description: e.target.value })
                }
                placeholder="Qué incluye la sesión…"
              />
            </div>

            <div className={s.formRow}>
              <div className={s.field}>
                <label className={s.label} htmlFor="sv-dur">
                  Duración (min)
                </label>
                <input
                  id="sv-dur"
                  className={s.input}
                  type="number"
                  min={5}
                  value={serviceForm.duration}
                  onChange={(e) =>
                    patchServiceForm({ duration: e.target.value })
                  }
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="sv-price">
                  Precio (€)
                </label>
                <input
                  id="sv-price"
                  className={s.input}
                  type="number"
                  min={0}
                  value={serviceForm.price}
                  onChange={(e) => patchServiceForm({ price: e.target.value })}
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="sv-buffer">
                  Buffer (min)
                </label>
                <input
                  id="sv-buffer"
                  className={s.input}
                  type="number"
                  min={0}
                  value={serviceForm.buffer}
                  onChange={(e) => patchServiceForm({ buffer: e.target.value })}
                />
              </div>
            </div>

            <div className={s.formActions}>
              <button
                type="button"
                className={s.btnGhost}
                onClick={closeServiceForm}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={s.btnPrimary}
                onClick={saveService}
                disabled={!serviceForm.name.trim()}
              >
                {editingServiceId ? "Guardar cambios" : "Crear servicio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==== Modal: eliminar servicio ==== */}
      {deleteServiceId && (
        <div className={s.formOverlay} role="dialog" aria-modal="true">
          <div className={s.formModal}>
            <div className={s.formHeader}>
              <div className={s.formTitle}>
                <Trash2 size={17} /> Eliminar servicio
              </div>
              <button
                type="button"
                className={s.formClose}
                onClick={() => setDeleteServiceId(null)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            <p className={s.formHint}>
              ¿Seguro que quieres eliminar «
              {services.find((sv) => sv.id === deleteServiceId)?.name}»? Las
              citas ya agendadas no se verán afectadas.
            </p>
            <div className={s.formActions}>
              <button
                type="button"
                className={s.btnGhost}
                onClick={() => setDeleteServiceId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={s.btnDanger}
                onClick={confirmDeleteService}
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
