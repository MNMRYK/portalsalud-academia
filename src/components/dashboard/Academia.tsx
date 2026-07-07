import { useState } from "react";
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
  X,
} from "lucide-react";
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

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
}

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

const initialLessons: Lesson[] = [
  { id: "l1", courseId: "c1", title: "¿Qué es la inflamación crónica?", duration: "12 min" },
  { id: "l2", courseId: "c1", title: "Alimentos proinflamatorios a evitar", duration: "18 min" },
  { id: "l3", courseId: "c1", title: "Diseño de un plato antiinflamatorio", duration: "22 min" },
  { id: "l4", courseId: "c2", title: "El ciclo menstrual y la nutrición", duration: "16 min" },
  { id: "l5", courseId: "c2", title: "Menopausia: cambios y estrategias", duration: "20 min" },
  { id: "l6", courseId: "c3", title: "Eje intestino-cerebro", duration: "14 min" },
];



export function Academia() {
  const [view, setView] = useState<View>("home");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [lessons] = useState<Lesson[]>(initialLessons);
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

  const goHome = () => {
    setView("home");
    setEditingCourse(null);
    setSelectedCourse(null);
  };

  const openCourseForm = (course: Course | null) => {
    setEditingCourse(course);
    setView("courseForm");
  };

  const openCourseDetail = (course: Course) => {
    setSelectedCourse(course);
    setView("courseDetail");
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        {view === "home" && (
          <HomeView
            courses={courses}
            onAddLesson={() => setView("lessonForm")}
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
          <LessonFormView courses={courses} onBack={goHome} />
        )}

        {view === "liveClassForm" && <LiveClassFormView onBack={goHome} />}

        {view === "courseDetail" && selectedCourse && (
          <CourseDetailView
            course={selectedCourse}
            lessons={lessons.filter((l) => l.courseId === selectedCourse.id)}
            onBack={goHome}
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
  onAddLesson,
  onCreateCourse,
  onCreateLive,
  onEditCourse,
  onDeleteCourse,
  onOpenCourse,
}: {
  courses: Course[];
  onAddLesson: () => void;
  onCreateCourse: () => void;
  onCreateLive: () => void;
  onEditCourse: (c: Course) => void;
  onDeleteCourse: (id: string) => void;
  onOpenCourse: (c: Course) => void;
}) {
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
              <div className={academia.progressWrap}>
                <div className={academia.progressBar}>
                  <div
                    className={academia.progressFill}
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <span className={academia.progressLabel}>
                  {c.published ? `${c.progress}% publicado` : "Borrador · sin publicar"}
                </span>
              </div>
            </div>

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
  onBack,
}: {
  courses: Course[];
  onBack: () => void;
}) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []).map((f) => f.name);
    setFiles((prev) => [...prev, ...list]);
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };


  return (
    <>
      <ViewHeader
        onBack={onBack}
        title="Añadir Lección"
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
            ID o URL del vídeo (Bunny.net)
          </label>
          <input
            className={academia.formInput}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Ej. 76979871 o https://iframe.mediadelivery.net/…"
          />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Etiquetas / Categorías</label>
          <input
            className={academia.tagInput}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Escribe una etiqueta y pulsa Enter"
          />
          {tags.length > 0 && (
            <div className={academia.chipList}>
              {tags.map((tag) => (
                <span key={tag} className={academia.chip}>
                  {tag}
                  <button
                    type="button"
                    className={academia.chipRemove}
                    aria-label={`Quitar ${tag}`}
                    onClick={() =>
                      setTags((prev) => prev.filter((t) => t !== tag))
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>


        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Contenido de la lección</label>
          <RichTextEditor />
        </div>

        <div className={academia.formGroup}>
          <label className={academia.formLabel}>Material adjunto (PDFs)</label>
          {files.length > 0 && (
            <div className={academia.attachList}>
              {files.map((name, i) => (
                <div key={`${name}-${i}`} className={academia.attachItem}>
                  <span className={academia.attachName}>
                    <FileText size={16} /> {name}
                  </span>
                  <button
                    type="button"
                    className={academia.attachRemove}
                    aria-label={`Quitar ${name}`}
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
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
          <button type="button" className={academia.primaryButton} onClick={onBack}>
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
function LiveClassFormView({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [agenda, setAgenda] = useState("");
  const [notify, setNotify] = useState(true);

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

        <div className={academia.toggleRow}>
          <div className={academia.toggleText}>
            <span className={academia.toggleTitle}>Notificar a alumnos por email</span>
            <span className={academia.toggleDesc}>
              Se enviará un recordatorio automático con el enlace de la sala.
            </span>
          </div>
          <Switch checked={notify} onCheckedChange={setNotify} />
        </div>

        <div className={academia.formActions}>
          <button type="button" className={academia.ghostButton} onClick={onBack}>
            Cancelar
          </button>
          <button type="button" className={academia.primaryButton} onClick={onBack}>
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
}: {
  course: Course;
  lessons: Lesson[];
  onBack: () => void;
}) {
  return (
    <>
      <ViewHeader
        onBack={onBack}
        title={course.title}
        sub="Vista previa · modo alumno"
      />

      <div className={`${academia.detailCover} ${course.coverClass}`}>
        <span className={academia.detailCoverTitle}>{course.title}</span>
      </div>

      <h2 className={styles.sectionTitle}>Lecciones publicadas</h2>

      {lessons.length > 0 ? (
        <div className={academia.lessonList}>
          {lessons.map((l, i) => (
            <div key={l.id} className={academia.lessonItem}>
              <span className={academia.lessonIndex}>{i + 1}</span>
              <div className={academia.lessonInfo}>
                <span className={academia.lessonTitle}>{l.title}</span>
                <span className={academia.lessonMeta}>
                  <Clock size={13} /> {l.duration}
                </span>
              </div>
              <CheckCircle2 size={18} color="#a3bca0" />
            </div>
          ))}
        </div>
      ) : (
        <div className={academia.emptyState}>
          Este curso todavía no tiene lecciones publicadas.
        </div>
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
