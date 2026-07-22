import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface LessonResource {
  id: string;
  name: string;
  type: "pdf";
  size: string;
}

export interface AcademyLesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  /** URL del vídeo (opcional). Sin vídeo → modo lectura. */
  videoUrl?: string;
  /** Tiempo de lectura estimado cuando no hay vídeo. */
  readingTime?: string;
  /** Contenido HTML procedente del editor de texto enriquecido. */
  content: string;
  resources: LessonResource[];
}

export interface AcademyCourse {
  id: string;
  title: string;
  desc: string;
  /** Extracto motivacional para el hero de la vista detalle. */
  excerpt: string;
  /** Descripción larga (HTML del editor enriquecido). */
  longDesc: string;
  tag: string;
  lessons: number;
  duration: string;
  price: string;
  /** clase CSS de portada (coverTerracota, coverPlum, …) */
  coverClass: string;
  completedLessons: number;
}

export interface LiveClass {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  status: "upcoming" | "live" | "recorded";
}

const cover = {
  terracota: "coverTerracota",
  plum: "coverPlum",
  sage: "coverSage",
  lilac: "coverLilac",
};

/** Landing externa de pago (simulada). */
export const CHECKOUT_URL = "https://nutralia.es/checkout";

const catalog: AcademyCourse[] = [
  {
    id: "c1",
    title: "Fundamentos de Nutrición Antiinflamatoria",
    desc: "Bases científicas y protocolos para reducir la inflamación crónica.",
    excerpt:
      "Domina las bases de la alimentación antiinflamatoria y transforma la salud desde el plato.",
    longDesc:
      "<p>Este curso te acompaña paso a paso por los <strong>fundamentos científicos</strong> de la inflamación crónica de bajo grado y cómo revertirla con la alimentación.</p><h3>Qué aprenderás</h3><ul><li>Identificar alimentos proinflamatorios y sus alternativas.</li><li>Diseñar platos antiinflamatorios equilibrados.</li><li>Integrar hábitos sostenibles en el día a día.</li></ul><p>Al terminar, tendrás un <em>método claro</em> para aplicar en tu vida o con tus pacientes.</p>",
    tag: "Nutrición",
    lessons: 5,
    duration: "4h 30m",
    price: "129",
    coverClass: cover.terracota,
    completedLessons: 5,
  },
  {
    id: "c2",
    title: "Salud Hormonal Femenina",
    desc: "Acompañamiento nutricional en cada etapa del ciclo y la menopausia.",
    excerpt:
      "Aprende a acompañar cada etapa hormonal con estrategias nutricionales precisas.",
    longDesc:
      "<p>Un recorrido completo por la <strong>salud hormonal femenina</strong>, desde el ciclo menstrual hasta la menopausia, con enfoque nutricional integrativo.</p><h3>Contenido destacado</h3><ul><li>Nutrición adaptada a cada fase del ciclo.</li><li>Estrategias para el síndrome premenstrual.</li><li>Alimentación en la perimenopausia y menopausia.</li></ul>",
    tag: "Hormonal",
    lessons: 5,
    duration: "6h 10m",
    price: "149",
    coverClass: cover.plum,
    completedLessons: 2,
  },
  {
    id: "c3",
    title: "Microbiota y Digestión",
    desc: "Estrategias para restaurar el equilibrio intestinal.",
    excerpt:
      "Restaura el equilibrio intestinal y descubre el poder de una microbiota sana.",
    longDesc:
      "<p>Explora el fascinante mundo de la <strong>microbiota intestinal</strong> y su impacto en la salud global, la inmunidad y el estado de ánimo.</p><h3>En este curso</h3><ul><li>El eje intestino-cerebro explicado con claridad.</li><li>Protocolos de reparación intestinal.</li><li>Alimentos prebióticos y probióticos clave.</li></ul>",
    tag: "Digestivo",
    lessons: 5,
    duration: "3h 45m",
    price: "119",
    coverClass: cover.sage,
    completedLessons: 1,
  },
  {
    id: "c4",
    title: "Cocina Terapéutica en Casa",
    desc: "Recetas y menús prácticos alineados con cada plan de tratamiento.",
    excerpt:
      "Convierte tu cocina en tu mejor farmacia con recetas terapéuticas y prácticas.",
    longDesc:
      "<p>Recetas y técnicas de <strong>cocina terapéutica</strong> pensadas para acompañar cualquier plan de tratamiento nutricional.</p><h3>Aprenderás a</h3><ul><li>Planificar menús semanales antiinflamatorios.</li><li>Aplicar técnicas de batch cooking saludable.</li><li>Adaptar recetas a distintas necesidades clínicas.</li></ul>",
    tag: "Cocina",
    lessons: 5,
    duration: "5h 20m",
    price: "99",
    coverClass: cover.lilac,
    completedLessons: 0,
  },
  {
    id: "c5",
    title: "Gestión del Estrés y Descanso",
    desc: "Herramientas para mejorar el sueño y regular el sistema nervioso.",
    excerpt:
      "Regula tu sistema nervioso y recupera un descanso profundo y reparador.",
    longDesc:
      "<p>Herramientas prácticas para <strong>gestionar el estrés</strong>, mejorar la calidad del sueño y regular el sistema nervioso a través de la nutrición y el estilo de vida.</p><h3>Incluye</h3><ul><li>Nutrientes clave para el descanso.</li><li>Rutinas de higiene del sueño.</li><li>Técnicas de regulación del cortisol.</li></ul>",
    tag: "Bienestar",
    lessons: 5,
    duration: "2h 50m",
    price: "89",
    coverClass: cover.plum,
    completedLessons: 0,
  },
];

/** Genera un bloque de contenido HTML de relleno para las lecciones. */
function lessonBody(intro: string): string {
  return `<p>${intro}</p><h3>Puntos clave</h3><ul><li>Concepto fundamental explicado con ejemplos reales.</li><li>Aplicación práctica paso a paso.</li><li>Errores comunes y cómo evitarlos.</li></ul><p>Recuerda que el objetivo es que puedas <strong>aplicar</strong> lo aprendido de forma sencilla y sostenible en tu día a día.</p>`;
}

const sampleResources: LessonResource[] = [
  { id: "r1", name: "Guía descargable de la lección", type: "pdf", size: "1.2 MB" },
  { id: "r2", name: "Plantilla de práctica", type: "pdf", size: "480 KB" },
];

const lessonsByCourse: Record<string, AcademyLesson[]> = {
  c1: [
    {
      id: "c1-l1",
      courseId: "c1",
      title: "¿Qué es la inflamación crónica?",
      duration: "12 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "La inflamación crónica de bajo grado es la raíz silenciosa de muchas enfermedades modernas.",
      ),
      resources: sampleResources,
    },
    {
      id: "c1-l2",
      courseId: "c1",
      title: "Alimentos proinflamatorios a evitar",
      duration: "18 min",
      readingTime: "8 min de lectura",
      content: lessonBody(
        "Identificar los alimentos que promueven la inflamación es el primer paso hacia una dieta reparadora.",
      ),
      resources: [sampleResources[0]],
    },
    {
      id: "c1-l3",
      courseId: "c1",
      title: "Diseño de un plato antiinflamatorio",
      duration: "22 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "Un plato antiinflamatorio equilibra color, fibra, grasas saludables y proteína de calidad.",
      ),
      resources: sampleResources,
    },
    {
      id: "c1-l4",
      courseId: "c1",
      title: "Especias y alimentos funcionales",
      duration: "15 min",
      readingTime: "6 min de lectura",
      content: lessonBody(
        "Cúrcuma, jengibre y otros aliados funcionales potencian el efecto antiinflamatorio.",
      ),
      resources: [],
    },
    {
      id: "c1-l5",
      courseId: "c1",
      title: "Plan de acción de 21 días",
      duration: "20 min",
      readingTime: "10 min de lectura",
      content: lessonBody(
        "Consolida todo lo aprendido con un plan práctico de tres semanas.",
      ),
      resources: sampleResources,
    },
  ],
  c2: [
    {
      id: "c2-l1",
      courseId: "c2",
      title: "El ciclo menstrual y la nutrición",
      duration: "16 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "Cada fase del ciclo tiene necesidades nutricionales específicas que conviene respetar.",
      ),
      resources: sampleResources,
    },
    {
      id: "c2-l2",
      courseId: "c2",
      title: "Síndrome premenstrual: enfoque nutricional",
      duration: "19 min",
      readingTime: "7 min de lectura",
      content: lessonBody(
        "La alimentación puede aliviar de forma notable los síntomas del SPM.",
      ),
      resources: [sampleResources[0]],
    },
    {
      id: "c2-l3",
      courseId: "c2",
      title: "Perimenopausia: cambios y estrategias",
      duration: "20 min",
      readingTime: "9 min de lectura",
      content: lessonBody(
        "La transición hacia la menopausia requiere ajustes nutricionales conscientes.",
      ),
      resources: [],
    },
    {
      id: "c2-l4",
      courseId: "c2",
      title: "Menopausia y salud ósea",
      duration: "17 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "El cuidado de la masa ósea es prioritario en esta etapa vital.",
      ),
      resources: sampleResources,
    },
    {
      id: "c2-l5",
      courseId: "c2",
      title: "Rutinas y hábitos hormonales",
      duration: "14 min",
      readingTime: "6 min de lectura",
      content: lessonBody(
        "Pequeños hábitos diarios marcan una gran diferencia en el equilibrio hormonal.",
      ),
      resources: [],
    },
  ],
  c3: [
    {
      id: "c3-l1",
      courseId: "c3",
      title: "Eje intestino-cerebro",
      duration: "14 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "El intestino y el cerebro se comunican constantemente a través del nervio vago.",
      ),
      resources: sampleResources,
    },
    {
      id: "c3-l2",
      courseId: "c3",
      title: "Alimentos prebióticos clave",
      duration: "16 min",
      readingTime: "7 min de lectura",
      content: lessonBody(
        "Los prebióticos alimentan a las bacterias beneficiosas de tu microbiota.",
      ),
      resources: [sampleResources[0]],
    },
    {
      id: "c3-l3",
      courseId: "c3",
      title: "Probióticos y fermentados",
      duration: "18 min",
      readingTime: "8 min de lectura",
      content: lessonBody(
        "Los alimentos fermentados aportan diversidad microbiana de forma natural.",
      ),
      resources: [],
    },
    {
      id: "c3-l4",
      courseId: "c3",
      title: "Protocolo de reparación intestinal",
      duration: "21 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "Un protocolo estructurado ayuda a restaurar la barrera intestinal.",
      ),
      resources: sampleResources,
    },
    {
      id: "c3-l5",
      courseId: "c3",
      title: "Mantenimiento a largo plazo",
      duration: "13 min",
      readingTime: "5 min de lectura",
      content: lessonBody(
        "Mantener una microbiota sana es un compromiso diario y agradecido.",
      ),
      resources: [],
    },
  ],
  c4: [
    {
      id: "c4-l1",
      courseId: "c4",
      title: "Tu cocina terapéutica: primeros pasos",
      duration: "15 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "Organiza tu despensa y utensilios para cocinar con propósito.",
      ),
      resources: sampleResources,
    },
    {
      id: "c4-l2",
      courseId: "c4",
      title: "Batch cooking saludable",
      duration: "22 min",
      readingTime: "9 min de lectura",
      content: lessonBody(
        "Cocina una vez y come saludable toda la semana con el batch cooking.",
      ),
      resources: [sampleResources[0]],
    },
    {
      id: "c4-l3",
      courseId: "c4",
      title: "Recetas antiinflamatorias base",
      duration: "24 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "Un recetario base que podrás adaptar a mil combinaciones.",
      ),
      resources: sampleResources,
    },
    {
      id: "c4-l4",
      courseId: "c4",
      title: "Menús adaptados por objetivo",
      duration: "18 min",
      readingTime: "8 min de lectura",
      content: lessonBody(
        "Adapta los menús a cada necesidad clínica sin complicarte.",
      ),
      resources: [],
    },
    {
      id: "c4-l5",
      courseId: "c4",
      title: "Postres y snacks conscientes",
      duration: "16 min",
      readingTime: "6 min de lectura",
      content: lessonBody(
        "Disfrutar también es parte de una alimentación saludable.",
      ),
      resources: [sampleResources[1]],
    },
  ],
  c5: [
    {
      id: "c5-l1",
      courseId: "c5",
      title: "Estrés y sistema nervioso",
      duration: "13 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "Entender la respuesta de estrés es el primer paso para regularla.",
      ),
      resources: sampleResources,
    },
    {
      id: "c5-l2",
      courseId: "c5",
      title: "Nutrientes para el descanso",
      duration: "15 min",
      readingTime: "6 min de lectura",
      content: lessonBody(
        "Magnesio, triptófano y otros nutrientes favorecen un sueño profundo.",
      ),
      resources: [sampleResources[0]],
    },
    {
      id: "c5-l3",
      courseId: "c5",
      title: "Higiene del sueño",
      duration: "14 min",
      readingTime: "5 min de lectura",
      content: lessonBody(
        "Rutinas sencillas para preparar tu cuerpo y mente para dormir.",
      ),
      resources: [],
    },
    {
      id: "c5-l4",
      courseId: "c5",
      title: "Regulación del cortisol",
      duration: "17 min",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      content: lessonBody(
        "Aprende a mantener el cortisol en equilibrio a lo largo del día.",
      ),
      resources: sampleResources,
    },
    {
      id: "c5-l5",
      courseId: "c5",
      title: "Plan de descanso integral",
      duration: "12 min",
      readingTime: "5 min de lectura",
      content: lessonBody(
        "Integra todo en una rutina personalizada de descanso y bienestar.",
      ),
      resources: [],
    },
  ],
};

const liveClasses: LiveClass[] = [
  {
    id: "lv1",
    title: "Taller en directo: Menús antiinflamatorios de verano",
    host: "Laura García",
    date: "2026-07-15",
    time: "18:00",
    status: "upcoming",
  },
  {
    id: "lv2",
    title: "Q&A: Salud hormonal y alimentación",
    host: "Laura García",
    date: "2026-07-22",
    time: "19:30",
    status: "upcoming",
  },
  {
    id: "lv3",
    title: "Masterclass: Microbiota para principiantes",
    host: "Laura García",
    date: "2026-06-28",
    time: "18:00",
    status: "recorded",
  },
];

/** IDs de lecciones ya completadas al iniciar (simula progreso previo). */
const initialCompleted: string[] = [
  // c1 completo
  "c1-l1",
  "c1-l2",
  "c1-l3",
  "c1-l4",
  "c1-l5",
  // c2: 2 de 5
  "c2-l1",
  "c2-l2",
  // c3: 1 de 5
  "c3-l1",
];

export interface CourseProgress {
  done: number;
  total: number;
  pct: number;
}

interface AcademyContextValue {
  catalog: AcademyCourse[];
  liveClasses: LiveClass[];
  /** ids en orden de inscripción */
  enrolledIds: string[];
  isEnrolled: (id: string) => boolean;
  enroll: (id: string) => void;
  enrolledCourses: () => AcademyCourse[];
  /** cursos NO inscritos (escaparate) */
  availableCourses: () => AcademyCourse[];
  getCourse: (id: string) => AcademyCourse | undefined;
  lessonsOf: (courseId: string) => AcademyLesson[];
  getLesson: (lessonId: string) => AcademyLesson | undefined;
  isCompleted: (lessonId: string) => boolean;
  completeLesson: (lessonId: string) => void;
  progressOf: (courseId: string) => CourseProgress;
  /** Reinicia el progreso del curso (lecciones a 0). */
  resetCourse: (courseId: string) => void;
  nextLessonId: (courseId: string, lessonId: string) => string | null;
  prevLessonId: (courseId: string, lessonId: string) => string | null;
  resumeLessonId: (courseId: string) => string;
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

export function AcademyProvider({ children }: { children: ReactNode }) {
  // Orden de inscripción inicial de la alumna.
  const [enrolledIds, setEnrolledIds] = useState<string[]>(["c1", "c2", "c3"]);
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(initialCompleted),
  );

  const value = useMemo<AcademyContextValue>(() => {
    const isEnrolled = (id: string) => enrolledIds.includes(id);

    const enroll = (id: string) =>
      setEnrolledIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

    const getCourse = (id: string) => catalog.find((c) => c.id === id);

    const lessonsOf = (courseId: string) => lessonsByCourse[courseId] ?? [];

    const getLesson = (lessonId: string) =>
      Object.values(lessonsByCourse)
        .flat()
        .find((l) => l.id === lessonId);

    const isCompleted = (lessonId: string) => completed.has(lessonId);

    const completeLesson = (lessonId: string) =>
      setCompleted((prev) => {
        const next = new Set(prev);
        next.add(lessonId);
        return next;
      });

    const progressOf = (courseId: string): CourseProgress => {
      const list = lessonsOf(courseId);
      const total = list.length;
      const done = list.filter((l) => completed.has(l.id)).length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      return { done, total, pct };
    };

    const resetCourse = (courseId: string) =>
      setCompleted((prev) => {
        const next = new Set(prev);
        for (const l of lessonsOf(courseId)) next.delete(l.id);
        return next;
      });

    const withProgress = (c: AcademyCourse): AcademyCourse => ({
      ...c,
      completedLessons: progressOf(c.id).done,
    });

    const enrolledCourses = () =>
      enrolledIds
        .map((id) => getCourse(id))
        .filter((c): c is AcademyCourse => Boolean(c))
        .map(withProgress);

    const availableCourses = () =>
      catalog.filter((c) => !enrolledIds.includes(c.id));

    const nextLessonId = (courseId: string, lessonId: string) => {
      const list = lessonsOf(courseId);
      const idx = list.findIndex((l) => l.id === lessonId);
      return idx >= 0 && idx < list.length - 1 ? list[idx + 1].id : null;
    };

    const prevLessonId = (courseId: string, lessonId: string) => {
      const list = lessonsOf(courseId);
      const idx = list.findIndex((l) => l.id === lessonId);
      return idx > 0 ? list[idx - 1].id : null;
    };

    const resumeLessonId = (courseId: string) => {
      const list = lessonsOf(courseId);
      const firstPending = list.find((l) => !completed.has(l.id));
      return (firstPending ?? list[0])?.id ?? "";
    };

    return {
      catalog,
      liveClasses,
      enrolledIds,
      isEnrolled,
      enroll,
      enrolledCourses,
      availableCourses,
      getCourse,
      lessonsOf,
      getLesson,
      isCompleted,
      completeLesson,
      progressOf,
      resetCourse,
      nextLessonId,
      prevLessonId,
      resumeLessonId,
    };
  }, [enrolledIds, completed]);

  return (
    <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>
  );
}

export function useAcademy() {
  const ctx = useContext(AcademyContext);
  if (!ctx) {
    throw new Error("useAcademy must be used within an AcademyProvider");
  }
  return ctx;
}
