import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  PlayCircle,
  Clock,
  Layers,
  CheckCircle2,
  GraduationCap,
  Award,
  ArrowRight,
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
   Hub del alumno (5 secciones gamificadas)
   ============================================================ */
const workshops = [
  { id: "w1", title: "Taller: Batch cooking antiinflamatorio", date: "2026-09-04", time: "18:00" },
  { id: "w2", title: "Taller: Lectura de etiquetas en el súper", date: "2026-09-18", time: "19:30" },
];

const challenges = [
  {
    id: "c1",
    title: "Reto 7 días sin azúcares añadidos",
    steps: [
      { label: "Vaciar la despensa", done: true },
      { label: "Planificar 3 desayunos", done: true },
      { label: "Registrar 5 días seguidos", done: false },
    ],
  },
  {
    id: "c2",
    title: "Reto hidratación consciente",
    steps: [
      { label: "Calcular tu objetivo diario", done: true },
      { label: "Completar 10 días", done: false },
    ],
  },
];

const communityThreads = [
  { id: "t1", title: "¿Cómo organizáis la compra semanal?", replies: 14 },
  { id: "t2", title: "Recetas de cena rápidas y saciantes", replies: 27 },
  { id: "t3", title: "Dudas sobre la fase 2 del plan", replies: 6 },
];

function StudentHub() {
  const { enrolledCourses, progressOf, liveClasses } = useAcademy();
  const courses = enrolledCourses();
  const inProgress = courses
    .map((c) => ({ course: c, prog: progressOf(c.id) }))
    .sort((a, b) => b.prog.pct - a.prog.pct)
    .slice(0, 2);
  const upcoming = liveClasses.filter((lc) => lc.status !== "recorded").slice(0, 3);

  return (
    <section className={academia.hubGrid}>
      {/* 1. Mis Cursos */}
      <article className={`${academia.hubCard} ${academia.hubCardWide}`}>
        <div className={academia.hubHead}>
          <span className={`${academia.hubIcon} ${styles.iconPlum}`}>
            <GraduationCap size={20} strokeWidth={2} />
          </span>
          <span className={academia.hubTitle}>Mis Cursos</span>
          <span className={academia.hubBadge}>{courses.length} activos</span>
        </div>
        <p className={academia.hubDesc}>
          Sigue tu propio ritmo. Aprende paso a paso con rutas de aprendizaje
          diseñadas para transformar tus hábitos.
        </p>
        <div className={academia.hubBody}>
          {inProgress.map(({ course, prog }) => (
            <div key={course.id} className={academia.hubProgressRow}>
              <span className={academia.hubProgressLabel}>
                <span>{course.title}</span>
                <span>{prog.pct}%</span>
              </span>
              <div className={academia.hubBar}>
                <div className={academia.hubBarFill} style={{ width: `${prog.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <Link to="/academia" className={academia.hubLink}>
          Ver todos mis cursos <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </article>

      {/* 2. Clases en Directo */}
      <article className={academia.hubCard}>
        <div className={academia.hubHead}>
          <span className={`${academia.hubIcon} ${styles.iconSage}`}>
            <Video size={20} strokeWidth={2} />
          </span>
          <span className={academia.hubTitle}>Clases en Directo</span>
        </div>
        <p className={academia.hubDesc}>
          Conéctate en vivo. Resuelve tus dudas en tiempo real y profundiza en
          temas clave.
        </p>
        <div className={academia.hubBody}>
          {upcoming.map((lc) => (
            <div key={lc.id} className={academia.hubRow}>
              <CalendarDays size={15} />
              {lc.title}
              <span className={academia.hubRowMeta}>
                {formatDate(lc.date)} · {lc.time}
              </span>
            </div>
          ))}
        </div>
        <Link to="/academia/directo" className={academia.hubLink}>
          Ver agenda completa <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </article>

      {/* 3. Talleres Prácticos */}
      <article className={academia.hubCard}>
        <div className={academia.hubHead}>
          <span className={`${academia.hubIcon} ${styles.iconTerracota}`}>
            <Wrench size={20} strokeWidth={2} />
          </span>
          <span className={academia.hubTitle}>Talleres Prácticos</span>
        </div>
        <p className={academia.hubDesc}>
          Pasa a la acción. Sesiones 100% prácticas para aplicar lo aprendido
          desde el minuto uno.
        </p>
        <div className={academia.hubBody}>
          {workshops.map((w) => (
            <div key={w.id} className={academia.hubRow}>
              <Sparkles size={15} />
              {w.title}
              <span className={academia.hubRowMeta}>
                {formatDate(w.date)} · {w.time}
              </span>
            </div>
          ))}
        </div>
      </article>

      {/* 4. Retos */}
      <article className={academia.hubCard}>
        <div className={academia.hubHead}>
          <span className={`${academia.hubIcon} ${styles.iconSage}`}>
            <Trophy size={20} strokeWidth={2} />
          </span>
          <span className={academia.hubTitle}>Retos</span>
        </div>
        <p className={academia.hubDesc}>
          Ponte a prueba. Desafíos paso a paso con objetivos claros.
        </p>
        <div className={academia.hubBody}>
          {challenges.map((ch) => {
            const done = ch.steps.filter((s) => s.done).length;
            const pct = Math.round((done / ch.steps.length) * 100);
            return (
              <div key={ch.id} className={academia.hubProgressRow}>
                <span className={academia.hubProgressLabel}>
                  <span>{ch.title}</span>
                  <span>
                    {done}/{ch.steps.length}
                  </span>
                </span>
                <div className={academia.hubBar}>
                  <div className={academia.hubBarFill} style={{ width: `${pct}%` }} />
                </div>
                {ch.steps.map((s) => (
                  <span
                    key={s.label}
                    className={`${academia.hubCheck} ${s.done ? academia.hubCheckDone : ""}`}
                  >
                    {s.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {s.label}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </article>

      {/* 5. Comunidad */}
      <article className={academia.hubCard}>
        <div className={academia.hubHead}>
          <span className={`${academia.hubIcon} ${styles.iconPlum}`}>
            <MessagesSquare size={20} strokeWidth={2} />
          </span>
          <span className={academia.hubTitle}>Comunidad</span>
          <span className={academia.hubBadge}>Foro</span>
        </div>
        <p className={academia.hubDesc}>
          Únete a la tribu. Comparte, debate y apóyate en compañeros y
          profesores.
        </p>
        <div className={academia.hubBody}>
          {communityThreads.map((t) => (
            <div key={t.id} className={academia.hubRow}>
              <MessagesSquare size={15} />
              {t.title}
              <span className={academia.hubRowMeta}>{t.replies} respuestas</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

/* ============================================================
   Mis Cursos
   ============================================================ */
function MisCursos() {
  const { enrolledCourses, progressOf } = useAcademy();
  const courses = enrolledCourses();

  const totalCompleted = courses.reduce((s, c) => s + c.completedLessons, 0);
  const totalLessons = courses.reduce((s, c) => s + c.lessons, 0);

  const stats: { value: string; label: string; icon: LucideIcon; cls: string }[] = [
    { value: String(courses.length), label: "Cursos inscritos", icon: Layers, cls: styles.iconPlum },
    { value: String(totalCompleted), label: "Lecciones completadas", icon: CheckCircle2, cls: styles.iconSage },
    { value: `${totalLessons}`, label: "Lecciones totales", icon: PlayCircle, cls: styles.iconTerracota },
    { value: String(courses.filter((c) => progressOf(c.id).pct >= 100).length), label: "Cursos finalizados", icon: Award, cls: styles.iconPlum },
  ];

  return (
    <>
      <StudentHeader
        title="Mis Cursos"
        sub="Continúa tu formación desde donde lo dejaste."
      />

      <StudentHub />

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
        {courses.map((c) => {
          const prog = progressOf(c.id);
          return (
            <article key={c.id} className={academia.courseCard}>
              <Link
                to="/academia/curso/$courseId"
                params={{ courseId: c.id }}
                style={{ textDecoration: "none", color: "inherit", display: "contents" }}
              >
                <div className={`${academia.courseCover} ${academia[c.coverClass as keyof typeof academia]}`}>
                  <span className={academia.courseTag}>{c.tag}</span>
                  <PlayCircle size={40} strokeWidth={1.6} />
                </div>
              </Link>
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
                  {prog.done} de {prog.total} lecciones completadas
                </div>
                <div className={academia.progressBar}>
                  <div
                    className={academia.progressFill}
                    style={{ width: `${prog.pct}%` }}
                  />
                </div>
                <div className={portal.courseFooterStudent}>
                  {prog.pct >= 100 ? (
                    <Link
                      to="/academia/curso/$courseId"
                      params={{ courseId: c.id }}
                      className={portal.completedButton}
                    >
                      <CheckCircle2 size={16} />
                      Ver curso completado
                    </Link>
                  ) : (
                    <Link
                      to="/academia/curso/$courseId"
                      params={{ courseId: c.id }}
                      className={portal.continueButton}
                    >
                      <PlayCircle size={16} />
                      {prog.done > 0 ? "Continuar curso" : "Empezar curso"}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}


/* ============================================================
   Explorar Cursos (catálogo + inscripción)
   ============================================================ */
function ExplorarCursos() {
  const { availableCourses } = useAcademy();
  const navigate = useNavigate();
  const catalog = availableCourses();
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

  const openCourse = (id: string) =>
    navigate({ to: "/academia/curso/$courseId", params: { courseId: id } });

  return (
    <>
      <StudentHeader
        title="Explorar Cursos"
        sub="Descubre nuevos cursos y amplía tu formación."
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
              No hay cursos nuevos que coincidan con tu búsqueda. ¡Ya estás
              inscrito en todo lo demás!
            </p>
          )}
          {filtered.map((c) => (
            <article
              key={c.id}
              className={academia.courseCard}
              onClick={() => openCourse(c.id)}
            >
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
                  <span className={portal.enrollButton}>
                    Ver detalles <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </article>
          ))}
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
