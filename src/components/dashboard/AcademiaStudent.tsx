import { useMemo, useState } from "react";
import {
  PlayCircle,
  Clock,
  Layers,
  CheckCircle2,
  GraduationCap,
  Award,
  Compass,
  Video,
  CalendarDays,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { PatientResourceLibrary } from "./PatientResourceLibrary";
import { useAcademy } from "../../context/AcademyContext";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";
import portal from "./Portal.module.css";
import recursos from "./Recursos.module.css";


export type StudentSection = "cursos" | "explorar" | "directo" | "recursos";

const monthShort = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthShort[m - 1]} ${y}`;
}

export function AcademiaStudent({ section = "cursos" }: { section?: StudentSection }) {
  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        {section === "cursos" && <MisCursos />}
        {section === "explorar" && <ExplorarCursos />}
        {section === "directo" && <ClasesDirecto />}
        {section === "recursos" && <RecursosAcademicos />}
      </main>
    </div>
  );
}

function StudentHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.greeting}>
        <h1 className={styles.greetingHi}>{title}</h1>
        <p className={styles.greetingSub}>{sub}</p>
      </div>
    </header>
  );
}

/* ============================================================
   Mis Cursos
   ============================================================ */
function MisCursos() {
  const { enrolledCourses } = useAcademy();
  const courses = enrolledCourses();

  const totalCompleted = courses.reduce((s, c) => s + c.completedLessons, 0);
  const totalLessons = courses.reduce((s, c) => s + c.lessons, 0);

  const stats: { value: string; label: string; icon: LucideIcon; cls: string }[] = [
    { value: String(courses.length), label: "Cursos inscritos", icon: Layers, cls: styles.iconPlum },
    { value: String(totalCompleted), label: "Lecciones completadas", icon: CheckCircle2, cls: styles.iconSage },
    { value: `${totalLessons}`, label: "Lecciones totales", icon: PlayCircle, cls: styles.iconTerracota },
    { value: String(courses.filter((c) => c.completedLessons >= c.lessons).length), label: "Cursos finalizados", icon: Award, cls: styles.iconPlum },
  ];

  return (
    <>
      <StudentHeader
        title="Mis Cursos"
        sub="Continúa tu formación desde donde lo dejaste."
      />

      <section className={academia.stats}>
        {stats.map(({ value, label, icon: Icon, cls }) => (
          <div key={label} className={academia.statCard}>
            <span className={`${academia.statIcon} ${cls}`}>
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className={academia.statValue}>{value}</span>
            <span className={academia.statLabel}>{label}</span>
          </div>
        ))}
      </section>

      <h2 className={styles.sectionTitle}>Cursos inscritos</h2>
      <section className={academia.courseGrid}>
        {courses.map((c) => (
          <article key={c.id} className={academia.courseCard}>
            <div className={`${academia.courseCover} ${academia[c.coverClass as keyof typeof academia]}`}>
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
              <div className={portal.miniProgress}>
                {c.completedLessons} de {c.lessons} lecciones completadas
              </div>
              <div className={portal.courseFooterStudent}>
                <button type="button" className={portal.continueButton}>
                  <PlayCircle size={16} />
                  {c.completedLessons > 0 ? "Continuar curso" : "Empezar curso"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

/* ============================================================
   Explorar Cursos (catálogo + inscripción)
   ============================================================ */
function ExplorarCursos() {
  const { catalog, isEnrolled, enroll } = useAcademy();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(catalog.map((c) => c.tag))),
    [catalog],
  );

  const dotColors = ["#a3bca0", "#d47f65", "#875c80", "#c9a24b"];

  const filtered = catalog.filter(
    (c) =>
      (activeCategory === "all" || c.tag === activeCategory) &&
      c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <StudentHeader
        title="Explorar Cursos"
        sub="Descubre todo el catálogo e inscríbete en un clic."
      />

      <div className={recursos.toolbar}>
        <div className={recursos.search}>
          <Search size={18} className={recursos.searchIcon} />
          <input
            className={recursos.searchInput}
            placeholder="Buscar cursos…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar cursos"
          />
        </div>
      </div>

      <div className={recursos.layout}>
        <aside className={recursos.rail}>
          <div className={recursos.railGroup}>
            <p className={recursos.railLabel}>Categorías</p>
            <button
              type="button"
              className={`${recursos.railItem} ${activeCategory === "all" ? recursos.railItemActive : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              <Layers size={18} className={recursos.railIcon} strokeWidth={2} />
              Todos los cursos
            </button>
            {categories.map((category, i) => {
              const count = catalog.filter((c) => c.tag === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  className={`${recursos.railItem} ${activeCategory === category ? recursos.railItemActive : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <span
                    className={recursos.railDot}
                    style={{ backgroundColor: dotColors[i % dotColors.length] }}
                  />
                  {category}
                  <span className={recursos.railCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className={academia.courseGrid}>
          {filtered.length === 0 && (
            <p className={recursos.empty}>
              No hay cursos que coincidan con tu búsqueda.
            </p>
          )}
          {filtered.map((c) => {
            const enrolled = isEnrolled(c.id);
            return (
              <article key={c.id} className={academia.courseCard}>
                <div className={`${academia.courseCover} ${academia[c.coverClass as keyof typeof academia]}`}>
                  <span className={academia.courseTag}>{c.tag}</span>
                  <GraduationCap size={40} strokeWidth={1.5} />
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
                  <div className={portal.courseFooterStudent}>
                    {enrolled ? (
                      <span className={portal.enrolledPill}>
                        <CheckCircle2 size={16} /> Ya estás inscrito
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={portal.enrollButton}
                        onClick={() => enroll(c.id)}
                      >
                        <Compass size={16} /> Inscribirme
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}


/* ============================================================
   Clases en Directo (solo lectura)
   ============================================================ */
function ClasesDirecto() {
  const { liveClasses } = useAcademy();

  return (
    <>
      <StudentHeader
        title="Clases en Directo"
        sub="Tus invitaciones a las sesiones en vivo de la comunidad."
      />

      <div className={portal.card}>
        <div className={portal.liveList}>
          {liveClasses.map((lc) => (
            <div key={lc.id} className={portal.liveItem}>
              <span className={portal.liveIcon}>
                <Video size={22} strokeWidth={1.9} />
              </span>
              <div className={portal.liveInfo}>
                <div className={portal.liveTitle}>{lc.title}</div>
                <div className={portal.liveMeta}>
                  <CalendarDays size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />
                  {formatDate(lc.date)} · {lc.time} · con {lc.host}
                </div>
              </div>
              <span
                className={`${portal.liveBadge} ${
                  lc.status === "recorded"
                    ? portal.liveBadgeRecorded
                    : portal.liveBadgeUpcoming
                }`}
              >
                {lc.status === "recorded" ? "Grabación" : "Próxima"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Recursos Académicos (solo lectura, con buscador + categorías)
   ============================================================ */
function RecursosAcademicos() {
  return (
    <>
      <StudentHeader
        title="Recursos Académicos"
        sub="Material de apoyo de tus cursos y clases."
      />
      <PatientResourceLibrary audience="academico" />
    </>
  );
}
