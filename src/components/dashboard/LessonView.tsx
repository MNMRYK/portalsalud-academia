import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  FolderHeart,
  BookOpen,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAcademy } from "../../context/AcademyContext";
import learn from "./AcademiaLearn.module.css";

export function LessonView({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const {
    getCourse,
    lessonsOf,
    getLesson,
    isCompleted,
    completeLesson,
    progressOf,
    nextLessonId,
    prevLessonId,
  } = useAcademy();
  const navigate = useNavigate();

  const course = getCourse(courseId);
  const lessons = lessonsOf(courseId);
  const lesson = getLesson(lessonId);

  if (!course || !lesson) {
    return (
      <div style={{ padding: 40 }}>
        <Link to="/academia" className={learn.backLink}>
          <ChevronLeft size={17} /> Volver a la academia
        </Link>
      </div>
    );
  }


  const progress = progressOf(courseId);
  const prevId = prevLessonId(courseId, lessonId);
  const nextId = nextLessonId(courseId, lessonId);
  const done = isCompleted(lessonId);

  const goToLesson = (id: string) =>
    navigate({
      to: "/academia/leccion/$courseId/$lessonId",
      params: { courseId, lessonId: id },
    });

  const handleComplete = () => {
    completeLesson(lessonId);
    if (nextId) {
      goToLesson(nextId);
    } else {
      navigate({
        to: "/academia/curso/$courseId",
        params: { courseId },
      });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f7f3ee" }}>
      <Sidebar collapsed />

      <main className={learn.learnMain}>
        <Link
          to="/academia/curso/$courseId"
          params={{ courseId }}
          className={learn.backLink}
        >
          <ChevronLeft size={17} /> Volver al curso
        </Link>

        <div className={learn.learnGrid}>
          {/* Columna izquierda 70% — zona de aprendizaje */}
          <div className={learn.learnLeft}>
            {lesson.videoUrl ? (
              <>
                <div className={learn.videoWrap}>
                  <video
                    className={learn.videoEl}
                    src={lesson.videoUrl}
                    controls
                    poster=""
                  />
                </div>
                <p className={learn.lessonEyebrow}>{course.title}</p>
                <h1 className={learn.lessonHeading}>{lesson.title}</h1>
              </>
            ) : (
              <>
                <p className={learn.lessonEyebrow}>{course.title}</p>
                <h1 className={learn.lessonHeading}>{lesson.title}</h1>
                <div className={learn.readingBanner}>
                  <BookOpen size={16} />
                  {lesson.readingTime ?? "Lección de lectura"}
                </div>
              </>
            )}

            <div
              className={learn.lessonRichText}
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />

            {lesson.resources.length > 0 && (
              <div className={learn.resourcesBox}>
                <h3 className={learn.resourcesTitle}>
                  <FolderHeart size={18} /> Material de apoyo
                </h3>
                <div className={learn.resourceGrid}>
                  {lesson.resources.map((r) => (
                    <div key={r.id} className={learn.resourceCard}>
                      <span className={learn.resourceIcon}>
                        <FileText size={20} />
                      </span>
                      <div className={learn.resourceInfo}>
                        <span className={learn.resourceName}>{r.name}</span>
                        <span className={learn.resourceSize}>
                          PDF · {r.size}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={learn.resourceDownload}
                        aria-label={`Descargar ${r.name}`}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha 30% — índice */}
          <aside className={learn.indexPanel}>
            <h3 className={learn.indexTitle}>Contenido del curso</h3>
            {lessons.map((l) => {
              const lDone = isCompleted(l.id);
              const active = l.id === lessonId;
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`${learn.indexItem} ${active ? learn.indexItemActive : ""}`}
                  onClick={() => goToLesson(l.id)}
                >
                  <span className={learn.indexIcon}>
                    {lDone ? (
                      <CheckCircle2 size={19} className={learn.checkDone} />
                    ) : (
                      <Circle size={19} className={learn.checkPending} />
                    )}
                  </span>
                  <span className={learn.indexItemBody}>
                    <span className={learn.indexItemTitle}>{l.title}</span>
                    <span className={learn.indexItemMeta}>
                      <Clock size={11} style={{ verticalAlign: "-1px" }} />{" "}
                      {l.duration}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>
        </div>
      </main>

      {/* Pie de navegación fijo */}
      <div className={learn.footerBar}>
        <button
          type="button"
          className={learn.footerPrev}
          disabled={!prevId}
          onClick={() => prevId && goToLesson(prevId)}
        >
          <ChevronLeft size={17} /> Anterior lección
        </button>

        <div className={learn.footerProgress}>
          <span className={learn.footerProgressLabel}>
            {progress.done} de {progress.total} lecciones completadas ·{" "}
            {progress.pct}%
          </span>
          <div className={learn.footerProgressTrack}>
            <div
              className={learn.footerProgressFill}
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          className={`${learn.footerNext} ${done ? learn.footerNextDone : ""}`}
          onClick={handleComplete}
        >
          {done ? (
            <>
              <CheckCircle2 size={17} />
              {nextId ? "Siguiente lección" : "Curso completado"}
            </>
          ) : (
            <>
              Marcar como completada y Continuar <ChevronRight size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
