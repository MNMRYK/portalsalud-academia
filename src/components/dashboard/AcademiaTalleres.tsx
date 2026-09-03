import { Wrench, CalendarDays, Clock, Users } from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

interface Workshop {
  id: string;
  title: string;
  desc: string;
  date: string;
  time: string;
  seats: string;
  state: "Inscrito" | "Plazas libres" | "Completo";
}

const workshops: Workshop[] = [
  {
    id: "w1",
    title: "Batch cooking antiinflamatorio",
    desc: "Prepara en 2 horas la base de comidas de toda la semana.",
    date: "4 sep 2026",
    time: "18:00",
    seats: "12/20 plazas",
    state: "Inscrito",
  },
  {
    id: "w2",
    title: "Lectura de etiquetas en el súper",
    desc: "Aprende a detectar azúcares ocultos y reclamos engañosos.",
    date: "18 sep 2026",
    time: "19:30",
    seats: "8/20 plazas",
    state: "Plazas libres",
  },
  {
    id: "w3",
    title: "Cena rápida y saciante en 20 minutos",
    desc: "Taller práctico en directo con recetario descargable.",
    date: "2 oct 2026",
    time: "18:30",
    seats: "20/20 plazas",
    state: "Completo",
  },
];

/** Vista Talleres Prácticos (Alumno) — contenedor base para la interacción futura. */
export function AcademiaTalleres() {
  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Talleres Prácticos</h1>
            <p className={styles.greetingSub}>
              Sesiones 100 % prácticas para aplicar lo aprendido desde el minuto uno.
            </p>
          </div>
        </header>

        <section className={academia.wkGrid}>
          {workshops.map((w) => (
            <article key={w.id} className={academia.wkCard}>
              <span className={academia.wkIcon}>
                <Wrench size={20} strokeWidth={2} />
              </span>
              <h2 className={academia.wkTitle}>{w.title}</h2>
              <p className={academia.wkDesc}>{w.desc}</p>
              <div className={academia.wkMeta}>
                <span>
                  <CalendarDays size={14} /> {w.date}
                </span>
                <span>
                  <Clock size={14} /> {w.time}
                </span>
                <span>
                  <Users size={14} /> {w.seats}
                </span>
              </div>
              <div className={academia.wkFoot}>
                <span className={academia.retChip}>{w.state}</span>
                <button
                  type="button"
                  className={academia.retPrimary}
                  disabled={w.state !== "Plazas libres"}
                >
                  {w.state === "Inscrito" ? "Ya inscrito" : "Reservar plaza"}
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
