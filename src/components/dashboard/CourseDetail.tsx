import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  PlayCircle,
  Clock,
  Layers,
  Lock,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAcademy, type AcademyLesson } from "../../context/AcademyContext";
import styles from "./Dashboard.module.css";
import learn from "./AcademiaLearn.module.css";


/** Anillo de progreso circular. */
function ProgressRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={84} height={84} viewBox="0 0 84 84" className={learn.ringSvg}>
      <defs>
        <linearGradient id="academyGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a3bca0" />
          <stop offset="100%" stopColor="#875c80" />
        </linearGradient>
      </defs>
      <circle
        className={learn.ringTrack}
        cx={42}
        cy={42}
        r={r}
        fill="none"
        strokeWidth={8}
      />
      <circle
        className={learn.ringFill}
        cx={42}
        cy={42}
        r={r}
        fill="none"
        strokeWidth={8}
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 42 42)"
      />
      <text
        x={42}
        y={42}
        textAnchor="middle"
        dominantBaseline="central"
        className={learn.ringPct}
      >
        {pct}%
      </text>
    </svg>
  );
}

export function CourseDetail({ courseId }: { courseId: string }) {
  const {
    getCourse,
    lessonsOf,
    isEnrolled,
    isCompleted,
    progressOf,
    resumeLessonId,
    enroll,
  } = useAcademy();
  const navigate = useNavigate();

  const course = getCourse(courseId);

  if (!course) {
    return (
      <div className={styles.page}>
        <Sidebar />
        <main className={styles.main}>
          <Link to="/academia" className={learn.backLink}>
            <ChevronLeft size={17} /> Volver a la academia
          </Link>
          <p>No se ha encontrado el curso solicitado.</p>
        </main>
      </div>
    );
  }

  const enrolled = isEnrolled(course.id);
  const lessons = lessonsOf(course.id);
  const progress = progressOf(course.id);

  const openLesson = (lesson: AcademyLesson) => {
    if (!enrolled) return;
    navigate({
      to: "/academia/leccion/$courseId/$lessonId",
      params: { courseId: course.id, lessonId: lesson.id },
    });
  };

  const goResume = () =>
    navigate({
      to: "/academia/leccion/$courseId/$lessonId",
      params: { courseId: course.id, lessonId: resumeLessonId(course.id) },
    });

  const restartCourse = () => {
    resetCourse(course.id);
    toast.success("Progreso reiniciado", {
      description: "Has vuelto al inicio del curso.",
    });
    navigate({
      to: "/academia/leccion/$courseId/$lessonId",
      params: { courseId: course.id, lessonId: lessons[0]?.id ?? "" },
    });
  };

  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <Link
          to={enrolled ? "/academia" : "/academia/explorar"}
          className={learn.backLink}
        >
          <ChevronLeft size={17} />
          {enrolled ? "Volver a Mis Cursos" : "Volver a Explorar"}
        </Link>

        {/* Hero banner */}
        <div
          className={`${learn.hero} ${learn[course.coverClass as keyof typeof learn]}`}
        >
          <span className={learn.heroBadge}>{course.tag}</span>
          <h1 className={learn.heroTitle}>{course.title}</h1>
          <p className={learn.heroExcerpt}>{course.excerpt}</p>
          <div className={learn.heroMeta}>
            <span className={learn.heroMetaItem}>
              <Layers size={16} /> {course.lessons} lecciones
            </span>
            <span className={learn.heroMetaItem}>
              <Clock size={16} /> {course.duration} de contenido
            </span>
            <span className={learn.heroMetaItem}>
              <PlayCircle size={16} /> Vídeo + material descargable
            </span>
          </div>
        </div>

        <div className={learn.detailGrid}>
          {/* Columna izquierda 65% */}
          <div className={learn.detailMain}>
            <h2 className={learn.sectionHeading}>Sobre este curso</h2>
            <div
              className={learn.richText}
              dangerouslySetInnerHTML={{ __html: course.longDesc }}
            />

            <h2 className={`${learn.sectionHeading} ${learn.sectionHeadingSpaced}`}>
              Temario del curso
            </h2>
            <div className={learn.lessonAccordion}>
              {lessons.map((l, i) => {
                const done = enrolled && isCompleted(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    className={`${learn.lessonRow} ${!enrolled ? learn.lessonRowLocked : ""}`}
                    onClick={() => openLesson(l)}
                    disabled={!enrolled}
                  >
                    <span className={learn.lessonNum}>{i + 1}</span>
                    <span className={learn.lessonRowInfo}>
                      <span className={learn.lessonRowTitle}>{l.title}</span>
                      <span className={learn.lessonRowMeta}>
                        {l.videoUrl ? <PlayCircle size={13} /> : <Clock size={13} />}
                        {l.duration}
                        {l.videoUrl ? " · vídeo" : " · lectura"}
                      </span>
                    </span>
                    <span className={learn.lessonStatus}>
                      {!enrolled ? (
                        <Lock size={18} className={learn.checkLocked} />
                      ) : done ? (
                        <CheckCircle2 size={20} className={learn.checkDone} />
                      ) : (
                        <Circle size={20} className={learn.checkPending} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna derecha 35% (sticky) */}
          <aside className={learn.stickyCard}>
            {enrolled ? (
              <>
                <div className={learn.ring}>
                  <ProgressRing pct={progress.pct} />
                  <div className={learn.ringInfo}>
                    <span className={learn.ringLabel}>Tu progreso</span>
                    <span className={learn.ringSub}>
                      {progress.done} de {progress.total} lecciones
                    </span>
                  </div>
                </div>
                <div className={learn.cardStat}>
                  <Clock size={16} className={learn.cardStatIcon} />
                  {course.duration} de estudio total
                </div>
                <button
                  type="button"
                  className={learn.resumeButton}
                  onClick={goResume}
                >
                  <PlayCircle size={18} />
                  {progress.done > 0
                    ? "Continuar donde lo dejaste"
                    : "Empezar el curso"}
                </button>
              </>
            ) : (
              <>
                <h3 className={learn.sectionHeading}>Contenido del curso</h3>
                <div className={learn.cardStat}>
                  <Layers size={16} className={learn.cardStatIcon} />
                  {course.lessons} lecciones
                </div>
                <div className={learn.cardStat}>
                  <Clock size={16} className={learn.cardStatIcon} />
                  {course.duration} de contenido
                </div>
                <div className={learn.cardStat}>
                  <PlayCircle size={16} className={learn.cardStatIcon} />
                  Vídeo + material descargable
                </div>
                <button
                  type="button"
                  className={learn.resumeButton}
                  onClick={() => {
                    enroll(course.id);
                    toast.success("Curso añadido a Mis Cursos", {
                      description:
                        "Ya tienes acceso completo a todas las lecciones.",
                    });
                  }}
                >
                  <Plus size={18} />
                  Añadir a Mis Cursos
                </button>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
