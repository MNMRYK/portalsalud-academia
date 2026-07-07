import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface AcademyCourse {
  id: string;
  title: string;
  desc: string;
  tag: string;
  lessons: number;
  duration: string;
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

const catalog: AcademyCourse[] = [
  {
    id: "c1",
    title: "Fundamentos de Nutrición Antiinflamatoria",
    desc: "Bases científicas y protocolos para reducir la inflamación crónica.",
    tag: "Nutrición",
    lessons: 18,
    duration: "4h 30m",
    coverClass: cover.terracota,
    completedLessons: 18,
  },
  {
    id: "c2",
    title: "Salud Hormonal Femenina",
    desc: "Acompañamiento nutricional en cada etapa del ciclo y la menopausia.",
    tag: "Hormonal",
    lessons: 22,
    duration: "6h 10m",
    coverClass: cover.plum,
    completedLessons: 9,
  },
  {
    id: "c3",
    title: "Microbiota y Digestión",
    desc: "Estrategias para restaurar el equilibrio intestinal.",
    tag: "Digestivo",
    lessons: 15,
    duration: "3h 45m",
    coverClass: cover.sage,
    completedLessons: 4,
  },
  {
    id: "c4",
    title: "Cocina Terapéutica en Casa",
    desc: "Recetas y menús prácticos alineados con cada plan de tratamiento.",
    tag: "Cocina",
    lessons: 26,
    duration: "5h 20m",
    coverClass: cover.lilac,
    completedLessons: 0,
  },
  {
    id: "c5",
    title: "Gestión del Estrés y Descanso",
    desc: "Herramientas para mejorar el sueño y regular el sistema nervioso.",
    tag: "Bienestar",
    lessons: 12,
    duration: "2h 50m",
    coverClass: cover.plum,
    completedLessons: 0,
  },
];

const liveClasses: LiveClass[] = [
  {
    id: "lv1",
    title: "Taller en directo: Menús antiinflamatorios de verano",
    host: "Sara Ruiz",
    date: "2026-07-15",
    time: "18:00",
    status: "upcoming",
  },
  {
    id: "lv2",
    title: "Q&A: Salud hormonal y alimentación",
    host: "Sara Ruiz",
    date: "2026-07-22",
    time: "19:30",
    status: "upcoming",
  },
  {
    id: "lv3",
    title: "Masterclass: Microbiota para principiantes",
    host: "Sara Ruiz",
    date: "2026-06-28",
    time: "18:00",
    status: "recorded",
  },
];

interface AcademyContextValue {
  catalog: AcademyCourse[];
  liveClasses: LiveClass[];
  /** ids en orden de inscripción */
  enrolledIds: string[];
  isEnrolled: (id: string) => boolean;
  enroll: (id: string) => void;
  enrolledCourses: () => AcademyCourse[];
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

export function AcademyProvider({ children }: { children: ReactNode }) {
  // Orden de inscripción inicial de la alumna.
  const [enrolledIds, setEnrolledIds] = useState<string[]>(["c1", "c2", "c3"]);

  const isEnrolled = (id: string) => enrolledIds.includes(id);

  const enroll = (id: string) =>
    setEnrolledIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  const enrolledCourses = () =>
    enrolledIds
      .map((id) => catalog.find((c) => c.id === id))
      .filter((c): c is AcademyCourse => Boolean(c));

  return (
    <AcademyContext.Provider
      value={{
        catalog,
        liveClasses,
        enrolledIds,
        isEnrolled,
        enroll,
        enrolledCourses,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
}

export function useAcademy() {
  const ctx = useContext(AcademyContext);
  if (!ctx) {
    throw new Error("useAcademy must be used within an AcademyProvider");
  }
  return ctx;
}
