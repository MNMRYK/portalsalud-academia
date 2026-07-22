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
  X,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
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

  const bookSlot = () => {
    if (!selectedSlot) return;
    const newAppt: Appointment = {
      id: `a-${Date.now()}`,
      patient: "Nueva cita",
      initials: "NC",
      date: selectedDate,
      time: selectedSlot,
      mode: "video",
      reason: "Consulta agendada automáticamente",
    };
    setAppointments((prev) => [...prev, newAppt]);
    setSelectedSlot(null);
    toast.success(`Cita creada · ${selectedDate} a las ${selectedSlot}`, {
      description: "Se ha enviado confirmación cifrada al paciente.",
    });
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

            <div className={s.modalFooter}>
              Cifrado extremo a extremo con claves efímeras · Sin grabación por defecto · RGPD
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
