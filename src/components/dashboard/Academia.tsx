import { useState } from "react";
import { useLocation, Link } from "@tanstack/react-router";
import {
  Search,
  Bell,
  Plus,
  GraduationCap,
  Video,
  Clock,
  Users,
  PlayCircle,
  BookOpen,
  Layers,
  Pencil,
  Trash2,
  ChevronLeft,
  UploadCloud,
  FileText,
  CalendarIcon,
  Save,
  CheckCircle2,
  ArrowRight,
  Trophy,
  MessagesSquare,
  ShieldCheck,
  Stethoscope,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CategoryDropdown } from "./academia/CategoryDropdown";
import { RichTextEditor } from "./academia/RichTextEditor";
import { useUser } from "../../context/UserContext";
import {
  useAcademy,
  type AcademyLesson,
  type LessonResource,
} from "../../context/AcademyContext";
import { AcademiaStudent, type StudentSection } from "./AcademiaStudent";
import styles from "./Dashboard.module.css";
import academia from "./Academia.module.css";

type View =
  | "home"
  | "courseForm"
  | "lessonForm"
  | "liveClassForm"
  | "courseDetail";

interface Course {
  id: string;
  title: string;
  desc: string;
  tag: string;
  lessons: number;
  duration: string;
  progress: number;
  coverClass: string;
  published: boolean;
}

type Lesson = AcademyLesson;

const stats = [
  { value: "12", label: "Cursos publicados", icon: Layers, iconClass: styles.iconPlum },
  { value: "148", label: "Lecciones totales", icon: PlayCircle, iconClass: styles.iconTerracota },
  { value: "326", label: "Alumnos activos", icon: Users, iconClass: styles.iconSage },
  { value: "3", label: "Clases en directo", icon: Video, iconClass: styles.iconPlum },
];

const coverClasses = [
  academia.coverTerracota,
  academia.coverPlum,
  academia.coverSage,
  academia.coverLilac,
];

const initialCourses: Course[] = [
  {
    id: "c1",
    title: "Fundamentos de Nutrición Antiinflamatoria",
    desc: "Bases científicas y protocolos para reducir la inflamación crónica.",
    tag: "Nutrición",
    lessons: 18,
    duration: "4h 30m",
    progress: 100,
    coverClass: academia.coverTerracota,
    published: true,
  },
  {
    id: "c2",
    title: "Salud Hormonal Femenina",
    desc: "Acompañamiento nutricional en cada etapa del ciclo y la menopausia.",
    tag: "Hormonal",
    lessons: 22,
    duration: "6h 10m",
    progress: 64,
    coverClass: academia.coverPlum,
    published: true,
  },
  {
    id: "c3",
    title: "Microbiota y Digestión",
    desc: "Estrategias para restaurar el equilibrio intestinal de tus pacientes.",
    tag: "Digestivo",
    lessons: 15,
    duration: "3h 45m",
    progress: 30,
    coverClass: academia.coverSage,
    published: true,
  },
  {
    id: "c4",
    title: "Cocina Terapéutica en Casa",
    desc: "Recetas y menús prácticos alineados con cada plan de tratamiento.",
    tag: "Cocina",
    lessons: 26,
    duration: "5h 20m",
    progress: 12,
    coverClass: academia.coverLilac,
    published: false,
  },
];





export function Academia({ studentSection }: { studentSection?: StudentSection } = {}) {
  const { isAdmin } = useUser();
  const initialView = (useLocation().state as { view?: View })?.view;
  const [view, setView] = useState<View>(initialView ?? "home");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const { lessonsOf, deleteLesson: removeLesson } = useAcademy();
  const [categories, setCategories] = useState<string[]>([
    "Nutrición",
    "Hormonal",
    "Digestivo",
    "Cocina",
    "Avanzado",
    "Habilidades",
  ]);

  // Estado de edición / selección
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonDefaultCourseId, setLessonDefaultCourseId] = useState<string>("");

  const goHome = () => {
    setView("home");
    setEditingCourse(null);
    setSelectedCourse(null);
    setEditingLesson(null);
    setLessonDefaultCourseId("");
  };

  const openCourseForm = (course: Course | null) => {
    setEditingCourse(course);
    setView("courseForm");
  };

  const openCourseDetail = (course: Course) => {
    setSelectedCourse(course);
    setView("courseDetail");
  };

  const openLessonForm = (lesson: Lesson | null, defaultCourseId = "") => {
    setEditingLesson(lesson);
    setLessonDefaultCourseId(defaultCourseId);
    setView("lessonForm");
  };

  const backToDetail = () => {
    setEditingLesson(null);
    setLessonDefaultCourseId("");
    setView(selectedCourse ? "courseDetail" : "home");
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const deleteLesson = (id: string) => {
    removeLesson(id);
    toast.success("Lección eliminada");
  };

  // Vista de alumno (paciente): reutiliza el diseño de la academia en modo lectura.
  if (!isAdmin) {
    return <AcademiaStudent section={studentSection} />;
  }

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        {view === "home" && (
          <HomeView
            courses={courses}
            categories={categories}
            onAddLesson={() => openLessonForm(null)}
            onCreateCourse={() => openCourseForm(null)}
            onCreateLive={() => setView("liveClassForm")}
            onEditCourse={openCourseForm}
            onDeleteCourse={deleteCourse}
            onOpenCourse={openCourseDetail}
          />
        )}

        {view === "courseForm" && (
          <CourseFormView
            course={editingCourse}
            categories={categories}
            onAddCategory={(name) => setCategories((p) => [...p, name])}
            onRemoveCategory={(name) =>
              setCategories((p) => p.filter((c) => c !== name))
            }
            onBack={goHome}
          />
        )}

        {view === "lessonForm" && (
          <LessonFormView
            courses={courses}
            lesson={editingLesson}
            defaultCourseId={lessonDefaultCourseId}
            categories={categories}
            onAddCategory={(name) => setCategories((p) => [...p, name])}
            onRemoveCategory={(name) =>
              setCategories((p) => p.filter((c) => c !== name))
            }
            onBack={backToDetail}
          />
        )}

        {view === "liveClassForm" && (
          <LiveClassFormView
            courses={courses}
            defaultCourseId={selectedCourse?.id}
            onBack={selectedCourse ? backToDetail : goHome}
          />
        )}

        {view === "courseDetail" && selectedCourse && (
          <CourseDetailView
            course={selectedCourse}
            lessons={lessonsOf(selectedCourse.id)}
            onBack={goHome}
            onAddLive={() => setView("liveClassForm")}
            onAddLesson={() => openLessonForm(null, selectedCourse.id)}
            onEditLesson={(lesson) => openLessonForm(lesson)}
            onDeleteLesson={deleteLesson}
          />
        )}
      </main>
    </div>
  );
}


/* ============================================================
   Vista Principal (home)
   ============================================================ */
function HomeView({
  courses,
  categories,
  onAddLesson,
  onCreateCourse,
  onCreateLive,
  onEditCourse,
  onDeleteCourse,
  onOpenCourse,
}: {
  courses: Course[];
  categories: string[];
  onAddLesson: () => void;
  onCreateCourse: () => void;
  onCreateLive: () => void;
  onEditCourse: (c: Course) => void;
  onDeleteCourse: (id: string) => void;
  onOpenCourse: (c: Course) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredCourses = courses.filter((c) => {
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && c.published) ||
      (statusFilter === "draft" && !c.published);
    const matchCategory = categoryFilter === "all" || c.tag === categoryFilter;
    return matchStatus && matchCategory;
  });

  return (
    <>
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
        {stats.map(({ value, label, icon: Icon, iconClass }) => {
          const isStudents = label === "Alumnos activos";
          return (
            <div
              key={label}
              className={`${academia.statCard} ${isStudents ? academia.statCardLinkable : ""}`}
            >
              <span className={`${academia.statIcon} ${iconClass}`}>
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className={academia.statValue}>{value}</span>
              <span className={academia.statLabel}>{label}</span>
              {isStudents && (
                <Link to="/academia/alumnos" className={academia.statLink}>
                  Ver todos <ArrowRight size={13} strokeWidth={2.5} />
                </Link>
              )}
            </div>
          );
        })}
      </section>

      <h2 className={styles.sectionTitle}>Acciones rápidas</h2>
      <section className={styles.quickGrid}>
        <button type="button" className={styles.quickCard} onClick={onAddLesson}>
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
        <button type="button" className={styles.quickCard} onClick={onCreateCourse}>
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
        <button type="button" className={styles.quickCard} onClick={onCreateLive}>
          <span className={`${styles.quickIcon} ${styles.iconSage}`}>
            <Video size={22} strokeWidth={2} />
          </span>
          <span className={styles.quickCardTitle}>
            Programar Clase en Directo / Taller
          </span>
          <span className={styles.quickCardDesc}>
            Programa una sesión en vivo o un taller práctico y notifica a tus alumnos.
          </span>
          <span className={styles.quickCardLink}>
            <Plus size={15} strokeWidth={2.5} /> Empezar
          </span>
        </button>
        <button
          type="button"
          className={styles.quickCard}
          onClick={() =>
            toast.info("Creación de retos", {
              description: "Pronto podrás diseñar retos con objetivos y duración.",
            })
          }
        >
          <span className={`${styles.quickIcon} ${styles.iconTerracota}`}>
            <Trophy size={22} strokeWidth={2} />
          </span>
          <span className={styles.quickCardTitle}>Crear Reto</span>
          <span className={styles.quickCardDesc}>
            Diseña desafíos por etapas con objetivos claros para motivar a tus alumnos.
          </span>
          <span className={styles.quickCardLink}>
            <Plus size={15} strokeWidth={2.5} /> Empezar
          </span>
        </button>
        <button
          type="button"
          className={styles.quickCard}
          onClick={() =>
            toast.info("Moderación de comunidad", {
              description: "3 reportes pendientes de revisión en el foro.",
            })
          }
        >
          <span className={`${styles.quickIcon} ${styles.iconPlum}`}>
            <MessagesSquare size={22} strokeWidth={2} />
          </span>
          <span className={styles.quickCardTitle}>Moderación de Comunidad</span>
          <span className={styles.quickCardDesc}>
            Revisa reportes, modera debates y mantén el foro en buen ambiente.
          </span>
          <span className={styles.quickCardLink}>
            <ArrowRight size={15} strokeWidth={2.5} /> Revisar
          </span>
        </button>
      </section>

      <h2 className={styles.sectionTitle}>Ajustes y Roles</h2>
      <section className={academia.rolesPanel}>
        <div className={academia.roleCard}>
          <span className={academia.roleName}>
            <ShieldCheck size={16} strokeWidth={2.2} /> Administrador
          </span>
          <span className={academia.roleDesc}>
            Control total: cursos, alumnos, facturación, roles y moderación.
          </span>
          <Link to="/ajustes" className={academia.hubLink}>
            Gestionar roles <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
        <div className={academia.roleCard}>
          <span className={academia.roleName}>
            <Stethoscope size={16} strokeWidth={2.2} /> Nutricionista
          </span>
          <span className={academia.roleDesc}>
            Acceso clínico a pacientes, planes y consultas; lectura de la academia.
          </span>
        </div>
        <div className={academia.roleCard}>
          <span className={academia.roleName}>
            <GraduationCap size={16} strokeWidth={2.2} /> Profesor
          </span>
          <span className={academia.roleDesc}>
            Crea y publica contenidos, imparte clases en directo y talleres.
          </span>
        </div>
      </section>


      <div className={styles.panelHead}>
        <h2 className={styles.sectionTitle}>Cursos de la academia</h2>
        <div className={academia.sectionFilters}>
          <select
            className={academia.filterSelect}
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "published" | "draft")
            }
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
          <select
            className={academia.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="all">Todas</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className={academia.courseGrid}>
        {filteredCourses.map((c) => (
          <article
            key={c.id}
            className={academia.courseCard}
            onClick={() => onOpenCourse(c)}
          >
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
              <div className={academia.courseFooter}>
                <div className={academia.progressBar}>
                  <div
                    className={academia.progressFill}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <div className={academia.courseFooterRow}>
                  <span className={academia.progressLabel}>
                    {c.published
                      ? `${c.progress}% publicado`
                      : "Borrador · sin publicar"}
                  </span>
                  <div className={academia.cardActions}>
                    <button
                      type="button"
                      className={academia.cardActionBtn}
                      aria-label={`Editar ${c.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCourse(c);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className={`${academia.cardActionBtn} ${academia.cardActionDanger}`}
                      aria-label={`Eliminar ${c.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCourse(c.id);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

    </>
  );
}

/* ============================================================
   Vista: Crear / Editar Curso
   ============================================================ */
function CourseFormView({
  course,
  categories,
  onAddCategory,
  onRemoveCategory,
  onBack,
}: {
  course: Course | null;
  categories: string[];
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [desc, setDesc] = useState(course?.desc ?? "");
  const [category, setCategory] = useState(course?.tag ?? "");
  const [published, setPublished] = useState(course?.published ?? false);
  const [cover, setCover] = useState<string | null>(null);

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCover(URL.createObjectURL(file));
  };

  return (
    <>
      <ViewHeader
        onBack={onBack}
        title={course ? "Editar Curso" : "Crear Curso"}
        sub="Define los datos generales del itinerario formativo."
      />

      <div className={academia.formCard}>
        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Título del curso</label>
          <input
            className={academia.formInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Fundamentos de Nutrición Antiinflamatoria"
          />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Descripción corta</label>
          <textarea
            className={academia.formTextarea}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Un resumen atractivo de lo que aprenderán tus alumnos."
          />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Categoría</label>
          <CategoryDropdown
            categories={categories}
            value={category}
            onChange={setCategory}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
          />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Imagen de portada</label>
          {cover ? (
            <img src={cover} alt="Portada del curso" className={academia.coverPreview} />
          ) : null}
          <label className={academia.coverUpload}>
            <UploadCloud size={26} />
            <span>Arrastra o haz clic para subir una imagen</span>
            <span className={academia.coverUploadHint}>PNG o JPG · máx. 2MB</span>
            <input type="file" accept="image/*" hidden onChange={handleCover} />
          </label>
        </div>

        <div className={academia.toggleRow}>
          <div className={academia.toggleText}>
            <span className={academia.toggleTitle}>
              {published ? "Publicado" : "Borrador"}
            </span>
            <span className={academia.toggleDesc}>
              {published
                ? "El curso es visible para tus alumnos."
                : "Solo tú puedes ver este curso mientras lo preparas."}
            </span>
          </div>
          <Switch checked={published} onCheckedChange={setPublished} />
        </div>

        <div className={academia.formActions}>
          <button type="button" className={academia.ghostButton} onClick={onBack}>
            Cancelar
          </button>
          <button type="button" className={academia.primaryButton} onClick={onBack}>
            <Save size={16} /> Guardar Curso
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Vista: Añadir / Editar Lección
   ============================================================ */
function LessonFormView({
  courses,
  lesson,
  defaultCourseId,
  categories,
  onAddCategory,
  onRemoveCategory,
  onBack,
}: {
  courses: Course[];
  lesson: Lesson | null;
  defaultCourseId?: string;
  categories: string[];
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
  onBack: () => void;
}) {
  const [courseId, setCourseId] = useState(
    lesson?.courseId ?? defaultCourseId ?? courses[0]?.id ?? "",
  );
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [duration, setDuration] = useState(lesson?.duration ?? "");
  const { saveLesson } = useAcademy();
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [readingTime, setReadingTime] = useState(lesson?.readingTime ?? "");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [files, setFiles] = useState<LessonResource[]>(lesson?.resources ?? []);
  const [category, setCategory] = useState("");

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list: LessonResource[] = Array.from(e.target.files ?? []).map((f) => ({
      id: `r-${Date.now()}-${f.name}`,
      name: f.name.replace(/\.pdf$/i, ""),
      type: "pdf",
      size:
        f.size > 1024 * 1024
          ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
          : `${Math.max(1, Math.round(f.size / 1024))} KB`,
    }));
    setFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  const handleSave = () => {
    if (!title.trim() || !courseId) {
      toast.error("Indica el curso y el título de la lección");
      return;
    }
    saveLesson({
      id: lesson?.id ?? `${courseId}-l${Date.now()}`,
      courseId,
      title: title.trim(),
      duration: duration.trim() || "10 min",
      videoUrl: videoUrl.trim() || undefined,
      readingTime: videoUrl.trim() ? undefined : readingTime.trim() || undefined,
      content: content || "<p></p>",
      resources: files,
    });
    toast.success(lesson ? "Lección actualizada" : "Lección creada", {
      description: "Los alumnos ya ven el contenido en el curso.",
    });
    onBack();
  };




  return (
    <>
      <ViewHeader
        onBack={onBack}
        title={lesson ? "Editar Lección" : "Añadir Lección"}
        sub="Crea el contenido de una lección para uno de tus cursos."
      />


      <div className={academia.formCard}>
        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Curso al que pertenece</label>
          <select
            className={academia.formSelect}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className={academia.formRow}>
          <div className={academia.formGroup}>
            <label className={academia.formLabel}>Título de la lección</label>
            <input
              className={academia.formInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. ¿Qué es la inflamación crónica?"
            />
          </div>
          <div className={academia.formGroup}>
            <label className={academia.formLabel}>Duración</label>
            <input
              className={academia.formInput}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ej. 12 min"
            />
          </div>
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>
            URL del vídeo (MP4, Bunny.net…) · déjalo vacío para lección de lectura
          </label>
          <input
            className={academia.formInput}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://…/video.mp4"
          />
        </div>

        {!videoUrl.trim() && (
          <div className={academia.formGroup}>
            <label className={academia.formLabel}>Tiempo de lectura</label>
            <input
              className={academia.formInput}
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
              placeholder="Ej. Lectura de 8 min"
            />
          </div>
        )}

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Etiquetas / Categorías</label>
          <CategoryDropdown
            categories={categories}
            value={category}
            onChange={setCategory}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
          />
        </div>



        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Contenido de la lección</label>
          <RichTextEditor initialHtml={lesson?.content ?? ""} onChange={setContent} />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Material adjunto (PDFs)</label>
          {files.length > 0 && (
            <div className={academia.attachList}>
              {files.map((f) => (
                <div key={f.id} className={academia.attachItem}>
                  <span className={academia.attachName}>
                    <FileText size={16} /> {f.name} · {f.size}
                  </span>
                  <button
                    type="button"
                    className={academia.attachRemove}
                    aria-label={`Quitar ${f.name}`}
                    onClick={() =>
                      setFiles((prev) => prev.filter((x) => x.id !== f.id))
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className={academia.coverUpload}>
            <UploadCloud size={26} />
            <span>Subir material adjunto</span>
            <span className={academia.coverUploadHint}>PDF · varios archivos permitidos</span>
            <input type="file" accept="application/pdf" multiple hidden onChange={handleFiles} />
          </label>
        </div>

        <div className={academia.formActions}>
          <button type="button" className={academia.ghostButton} onClick={onBack}>
            Cancelar
          </button>
          <button type="button" className={academia.primaryButton} onClick={handleSave}>
            <Save size={16} /> Guardar Lección
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Vista: Crear Clase en Directo
   ============================================================ */
const mockPatients = [
  "Laura Giménez",
  "Marcos Ruiz",
  "Ana Belén Torres",
  "Javier Molina",
  "Carla Sanz",
  "Pablo Herrera",
  "Nuria Castaño",
];

function LiveClassFormView({
  courses,
  defaultCourseId,
  onBack,
}: {
  courses: Course[];
  defaultCourseId?: string;
  onBack: () => void;
}) {
  const { addLiveClass } = useAcademy();
  const [courseId, setCourseId] = useState(defaultCourseId ?? "");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [agenda, setAgenda] = useState("");
  const [notifyMode, setNotifyMode] = useState<"all" | "advanced">("all");

  // Destinatarios avanzados
  const [recipients, setRecipients] = useState<string[]>([]);
  const [patientPick, setPatientPick] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const addRecipient = (value: string) => {
    const clean = value.trim();
    if (clean && !recipients.includes(clean)) {
      setRecipients((prev) => [...prev, clean]);
    }
  };

  const addPatient = (name: string) => {
    if (!name) return;
    addRecipient(name);
    setPatientPick("");
  };

  const addEmail = () => {
    addRecipient(emailInput);
    setEmailInput("");
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const availablePatients = mockPatients.filter((p) => !recipients.includes(p));

  const handleSchedule = () => {
    if (!title.trim() || !date || !time) {
      toast.error("Completa título, fecha y hora del directo");
      return;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    addLiveClass({
      id: `lv-${Date.now()}`,
      title: title.trim(),
      host: "Laura García",
      date: `${y}-${m}-${d}`,
      time,
      status: "upcoming",
      courseId: courseId || undefined,
      roomUrl: roomUrl.trim() || undefined,
      agenda: agenda.trim() || undefined,
    });
    toast.success("Clase en directo programada");
    onBack();
  };


  return (
    <>
      <ViewHeader
        onBack={onBack}
        title="Crear Clase en Directo"
        sub="Programa una sesión en vivo con tus alumnos."
      />

      <div className={academia.formCard}>
        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Título de la clase</label>
          <input
            className={academia.formInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Sesión de dudas: menús antiinflamatorios"
          />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Curso vinculado</label>
          <select
            className={academia.formSelect}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Clase general (sin curso)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className={academia.formRow}>
          <div className={academia.formGroup}>
            <label className={academia.formLabel}>Fecha</label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className={academia.formInput} style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <CalendarIcon size={16} />
                  {date
                    ? date.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Selecciona una fecha"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className={academia.formGroup}>
            <label className={academia.formLabel}>Hora</label>
            <input
              type="time"
              className={academia.formInput}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>URL de la sala (Zoom / Meet)</label>
          <input
            className={academia.formInput}
            value={roomUrl}
            onChange={(e) => setRoomUrl(e.target.value)}
            placeholder="https://meet.google.com/…"
          />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Temario / Descripción corta</label>
          <textarea
            className={academia.formTextarea}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="Puntos que se tratarán en la sesión."
          />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Notificaciones</label>
          <div className={academia.notifyOptions}>
            <label
              className={`${academia.radioOption} ${
                notifyMode === "all" ? academia.radioOptionActive : ""
              }`}
            >
              <input
                type="radio"
                name="notifyMode"
                className={academia.radioInput}
                checked={notifyMode === "all"}
                onChange={() => setNotifyMode("all")}
              />
              <span className={academia.radioText}>
                <span className={academia.radioTitle}>
                  Notificar a todos los alumnos
                </span>
                <span className={academia.radioDesc}>
                  Se enviará un recordatorio automático con el enlace de la sala.
                </span>
              </span>
            </label>

            <label
              className={`${academia.radioOption} ${
                notifyMode === "advanced" ? academia.radioOptionActive : ""
              }`}
            >
              <input
                type="radio"
                name="notifyMode"
                className={academia.radioInput}
                checked={notifyMode === "advanced"}
                onChange={() => setNotifyMode("advanced")}
              />
              <span className={academia.radioText}>
                <span className={academia.radioTitle}>
                  Selección avanzada (Elegir alumnos)
                </span>
                <span className={academia.radioDesc}>
                  Elige pacientes concretos o añade correos externos.
                </span>
              </span>
            </label>
          </div>
        </div>

        {notifyMode === "advanced" && (
          <div className={academia.advancedPanel}>
            <div className={academia.formGroup}>
              <label className={academia.formLabel}>Buscar pacientes</label>
              <select
                className={academia.formSelect}
                value={patientPick}
                onChange={(e) => addPatient(e.target.value)}
              >
                <option value="">Selecciona un paciente…</option>
                {availablePatients.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className={academia.formGroup}>
              <label className={academia.formLabel}>Añadir correo externo</label>
              <div className={academia.inlineAddRow}>
                <input
                  className={academia.tagInput}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="nombre@correo.com"
                  type="email"
                />
                <button
                  type="button"
                  className={academia.inlineAddBtn}
                  onClick={addEmail}
                >
                  <Plus size={15} /> Añadir
                </button>
              </div>
            </div>

            {recipients.length > 0 && (
              <div className={academia.formGroup}>
                <label className={academia.formLabel}>
                  Destinatarios ({recipients.length})
                </label>
                <div className={academia.chipList}>
                  {recipients.map((r) => (
                    <span key={r} className={academia.chip}>
                      {r}
                      <button
                        type="button"
                        className={academia.chipRemove}
                        aria-label={`Quitar ${r}`}
                        onClick={() =>
                          setRecipients((prev) => prev.filter((x) => x !== r))
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        <div className={academia.formActions}>
          <button type="button" className={academia.ghostButton} onClick={onBack}>
            Cancelar
          </button>
          <button type="button" className={academia.primaryButton} onClick={handleSchedule}>
            <Video size={16} /> Programar Clase
          </button>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   Vista: Detalle de Curso (modo alumno)
   ============================================================ */
function CourseDetailView({
  course,
  lessons,
  onBack,
  onAddLive,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
}: {
  course: Course;
  lessons: Lesson[];
  onBack: () => void;
  onAddLive: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
}) {
  const { liveClassesOf, deleteLiveClass } = useAcademy();
  const lives = liveClassesOf(course.id);
  return (
    <>
      <ViewHeader onBack={onBack} title={course.title} />

      <div className={`${academia.detailCover} ${course.coverClass}`}>
        <span className={academia.detailCoverTitle}>{course.title}</span>
      </div>

      <div className={academia.lessonListHeader}>
        <h2 className={styles.sectionTitle}>Lecciones publicadas</h2>
        <button
          type="button"
          className={academia.secondaryButton}
          onClick={onAddLesson}
        >
          <Plus size={15} strokeWidth={2.5} /> Añadir lección
        </button>
      </div>

      {lessons.length > 0 ? (
        <div className={academia.lessonList}>
          {lessons.map((l, i) => (
            <div key={l.id} className={academia.lessonItem}>
              <span className={academia.lessonIndex}>{i + 1}</span>
              <div className={academia.lessonInfo}>
                <span className={academia.lessonTitle}>{l.title}</span>
                <span className={academia.lessonMeta}>
                  <Clock size={13} /> {l.duration}
                  <span className={academia.contentBadge}>
                    {l.videoUrl ? (
                      <>
                        <PlayCircle size={12} /> Vídeo
                      </>
                    ) : (
                      <>
                        <BookOpen size={12} /> Lectura
                      </>
                    )}
                  </span>
                  {l.resources.length > 0 && (
                    <span className={academia.contentBadge}>
                      <FileText size={12} /> {l.resources.length} PDF
                    </span>
                  )}
                </span>
              </div>
              <div className={academia.lessonActions}>
                <CheckCircle2 size={18} color="#a3bca0" />
                <button
                  type="button"
                  className={academia.cardActionBtn}
                  aria-label={`Editar ${l.title}`}
                  onClick={() => onEditLesson(l)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className={`${academia.cardActionBtn} ${academia.cardActionDanger}`}
                  aria-label={`Eliminar ${l.title}`}
                  onClick={() => onDeleteLesson(l.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={academia.emptyState}>
          Este curso todavía no tiene lecciones publicadas.
        </div>
      )}

      <div className={academia.lessonListHeader}>
        <h2 className={styles.sectionTitle}>Directos programados</h2>
        <button type="button" className={academia.secondaryButton} onClick={onAddLive}>
          <Video size={15} strokeWidth={2.5} /> Programar directo
        </button>
      </div>
      {lives.length > 0 ? (
        <div className={academia.lessonList}>
          {lives.map((lc) => (
            <div key={lc.id} className={academia.lessonItem}>
              <span className={academia.lessonIndex}>
                <Video size={15} />
              </span>
              <div className={academia.lessonInfo}>
                <span className={academia.lessonTitle}>{lc.title}</span>
                <span className={academia.lessonMeta}>
                  <CalendarIcon size={13} />{" "}
                  {new Date(`${lc.date}T00:00:00`).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {lc.time}
                  <span className={academia.contentBadge}>
                    {lc.status === "recorded" ? "Grabado" : "Próximo"}
                  </span>
                </span>
              </div>
              <div className={academia.lessonActions}>
                <button
                  type="button"
                  className={`${academia.cardActionBtn} ${academia.cardActionDanger}`}
                  aria-label={`Eliminar ${lc.title}`}
                  onClick={() => deleteLiveClass(lc.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={academia.emptyState}>No hay directos programados para este curso.</div>
      )}
    </>

  );
}

/* ============================================================
   Cabecera reutilizable de las vistas internas
   ============================================================ */
function ViewHeader({
  onBack,
  title,
  sub,
}: {
  onBack: () => void;
  title: string;
  sub?: string;
}) {
  return (
    <div className={academia.viewHeader}>
      <button type="button" className={academia.backButton} onClick={onBack}>
        <ChevronLeft size={17} /> Volver
      </button>
      <div className={academia.viewTitleWrap}>
        <span className={academia.viewTitle}>{title}</span>
        {sub && <span className={academia.viewSub}>{sub}</span>}
      </div>
    </div>
  );
}
