import {
  Search,
  Bell,
  Plus,
  GraduationCap,
  Video,
  Clock,
  Users,
  PlayCircle,
  ArrowRight,
  BookOpen,
  Layers,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

const stats = [
  {
    value: "12",
    label: "Cursos publicados",
    icon: Layers,
    iconClass: styles.iconPlum,
  },
  {
    value: "148",
    label: "Lecciones totales",
    icon: PlayCircle,
    iconClass: styles.iconTerracota,
  },
  {
    value: "326",
    label: "Alumnos activos",
    icon: Users,
    iconClass: styles.iconSage,
  },
  {
    value: "3",
    label: "Clases en directo",
    icon: Video,
    iconClass: styles.iconPlum,
  },
];

const courses = [
  {
    title: "Fundamentos de Nutrición Antiinflamatoria",
    desc: "Bases científicas y protocolos para reducir la inflamación crónica.",
    tag: "Nutrición",
    lessons: 18,
    duration: "4h 30m",
    progress: 100,
    coverClass: academia.coverTerracota,
  },
  {
    title: "Salud Hormonal Femenina",
    desc: "Acompañamiento nutricional en cada etapa del ciclo y la menopausia.",
    tag: "Hormonal",
    lessons: 22,
    duration: "6h 10m",
    progress: 64,
    coverClass: academia.coverPlum,
  },
  {
    title: "Microbiota y Digestión",
    desc: "Estrategias para restaurar el equilibrio intestinal de tus pacientes.",
    tag: "Digestivo",
    lessons: 15,
    duration: "3h 45m",
    progress: 30,
    coverClass: academia.coverSage,
  },
  {
    title: "Cocina Terapéutica en Casa",
    desc: "Recetas y menús prácticos alineados con cada plan de tratamiento.",
    tag: "Cocina",
    lessons: 26,
    duration: "5h 20m",
    progress: 12,
    coverClass: academia.coverLilac,
  },
  {
    title: "Suplementación Basada en Evidencia",
    desc: "Cuándo, cómo y por qué recomendar suplementos con seguridad.",
    tag: "Avanzado",
    lessons: 14,
    duration: "3h 15m",
    progress: 0,
    coverClass: academia.coverPlum,
  },
  {
    title: "Coaching y Adherencia del Paciente",
    desc: "Herramientas de comunicación para mantener el compromiso a largo plazo.",
    tag: "Habilidades",
    lessons: 20,
    duration: "4h 50m",
    progress: 0,
    coverClass: academia.coverTerracota,
  },
];

export function Academia() {
  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Módulo Academia</h1>
            <p className={styles.greetingSub}>
              Gestiona tus cursos, lecciones y clases en directo desde un solo lugar.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.search}>
              <Search size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar cursos, lecciones…"
                aria-label="Buscador de la academia"
              />
            </div>
            <button type="button" className={styles.iconButton} aria-label="Notificaciones">
              <Bell size={19} />
            </button>
          </div>
        </header>

        <section className={academia.stats}>
          {stats.map(({ value, label, icon: Icon, iconClass }) => (
            <div key={label} className={academia.statCard}>
              <span className={`${academia.statIcon} ${iconClass}`}>
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className={academia.statValue}>{value}</span>
              <span className={academia.statLabel}>{label}</span>
            </div>
          ))}
        </section>

        <h2 className={styles.sectionTitle}>Acciones rápidas</h2>
        <section className={styles.quickGrid}>
          <button type="button" className={styles.quickCard}>
            <span className={`${styles.quickIcon} ${styles.iconTerracota}`}>
              <BookOpen size={22} strokeWidth={2} />
            </span>
            <span className={styles.quickCardTitle}>Añadir Lección</span>
            <span className={styles.quickCardDesc}>
              Sube un nuevo vídeo o material formativo a un curso existente.
            </span>
            <span className={styles.quickCardLink}>
              <Plus size={15} strokeWidth={2.5} /> Empezar
            </span>
          </button>
          <button type="button" className={styles.quickCard}>
            <span className={`${styles.quickIcon} ${styles.iconPlum}`}>
              <GraduationCap size={22} strokeWidth={2} />
            </span>
            <span className={styles.quickCardTitle}>Crear Curso</span>
            <span className={styles.quickCardDesc}>
              Estructura un nuevo itinerario formativo para tu comunidad.
            </span>
            <span className={styles.quickCardLink}>
              <Plus size={15} strokeWidth={2.5} /> Empezar
            </span>
          </button>
          <button type="button" className={styles.quickCard}>
            <span className={`${styles.quickIcon} ${styles.iconSage}`}>
              <Video size={22} strokeWidth={2} />
            </span>
            <span className={styles.quickCardTitle}>Crear Clase en Directo</span>
            <span className={styles.quickCardDesc}>
              Programa una sesión en vivo y notifica a tus alumnos.
            </span>
            <span className={styles.quickCardLink}>
              <Plus size={15} strokeWidth={2.5} /> Empezar
            </span>
          </button>
        </section>

        <div className={styles.panelHead}>
          <h2 className={styles.sectionTitle}>Cursos de la academia</h2>
          <button type="button" className={styles.linkButton}>
            Ver todos los cursos
          </button>
        </div>

        <section className={academia.courseGrid}>
          {courses.map((c) => (
            <article key={c.title} className={academia.courseCard}>
              <div className={`${academia.courseCover} ${c.coverClass}`}>
                <span className={academia.courseTag}>{c.tag}</span>
                <PlayCircle size={40} strokeWidth={1.6} />
              </div>
              <div className={academia.courseBody}>
                <span className={academia.courseTitle}>{c.title}</span>
                <span className={academia.courseDesc}>{c.desc}</span>
                <div className={academia.courseMeta}>
                  <span className={academia.courseMetaItem}>
                    <PlayCircle size={14} /> {c.lessons} lecciones
                  </span>
                  <span className={academia.courseMetaItem}>
                    <Clock size={14} /> {c.duration}
                  </span>
                </div>
                <div className={academia.progressWrap}>
                  <div className={academia.progressBar}>
                    <div
                      className={academia.progressFill}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                  <span className={academia.progressLabel}>
                    {c.progress === 0
                      ? "Borrador · sin publicar"
                      : `${c.progress}% publicado`}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
