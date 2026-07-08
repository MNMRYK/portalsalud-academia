import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";

/** Claves de avatar que coinciden con las clases de Ajustes.module.css. */
export type AvatarKey = "avSage" | "avPlum" | "avTerracota";

/**
 * Registro maestro y centralizado de un usuario/paciente.
 * Es la única fuente de verdad tanto para "Facturación y Accesos"
 * (Ajustes) como para "Gestión de Alumnos" (Academia).
 */
export interface AccessRecord {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar: AvatarKey;
  /** Acceso al Portal de Salud clínico. */
  portal: boolean;
  /** Acceso a la Academia (equivale a hasAcademyAccess del usuario). */
  academia: boolean;
  payment: string;
  /** Fecha de alta como alumno/paciente. */
  joinDate: string;
  coursesEnrolled: number;
  /** Nombres exactos de los cursos inscritos (para el tooltip). */
  courses: string[];
  /** Si aparece en la tabla de "Gestión de Alumnos". */
  inAcademyList: boolean;
}

const initialRecords: AccessRecord[] = [
  {
    id: "u1",
    name: "Laura García",
    email: "laura.garcia@email.com",
    initials: "LG",
    avatar: "avSage",
    portal: true,
    academia: true,
    payment: "01 jul 2026 · 65 €",
    joinDate: "12 ene 2026",
    coursesEnrolled: 3,
    courses: [
      "Fundamentos de Nutrición Antiinflamatoria",
      "Salud Hormonal Femenina",
      "Microbiota y Digestión",
    ],
    inAcademyList: true,
  },
  {
    id: "u2",
    name: "Marc Puig",
    email: "marc.puig@email.com",
    initials: "MP",
    avatar: "avPlum",
    portal: true,
    academia: false,
    payment: "28 jun 2026 · 65 €",
    joinDate: "05 mar 2026",
    coursesEnrolled: 0,
    courses: [],
    inAcademyList: false,
  },
  {
    id: "u3",
    name: "Elena Soler",
    email: "elena.soler@email.com",
    initials: "ES",
    avatar: "avTerracota",
    portal: false,
    academia: false,
    payment: "15 jun 2026 · 90 €",
    joinDate: "22 abr 2026",
    coursesEnrolled: 0,
    courses: [],
    inAcademyList: false,
  },
  {
    id: "u4",
    name: "David Roca",
    email: "david.roca@email.com",
    initials: "DR",
    avatar: "avPlum",
    portal: true,
    academia: true,
    payment: "02 jul 2026 · 120 €",
    joinDate: "03 feb 2026",
    coursesEnrolled: 2,
    courses: ["Cocina Terapéutica en Casa", "Gestión del Estrés y Descanso"],
    inAcademyList: true,
  },
  {
    id: "u5",
    name: "Nuria Vidal",
    email: "nuria.vidal@email.com",
    initials: "NV",
    avatar: "avSage",
    portal: true,
    academia: true,
    payment: "20 jun 2026 · 65 €",
    joinDate: "20 nov 2025",
    coursesEnrolled: 4,
    courses: [
      "Fundamentos de Nutrición Antiinflamatoria",
      "Salud Hormonal Femenina",
      "Microbiota y Digestión",
      "Cocina Terapéutica en Casa",
    ],
    inAcademyList: true,
  },
];

interface AccessContextValue {
  records: AccessRecord[];
  /** Alumnos visibles en la tabla de Gestión de Alumnos. */
  students: AccessRecord[];
  toggleAccess: (id: string, key: "portal" | "academia") => void;
  /** "Dar de baja": el alumno pasa a Inactivo (academia = false) pero sigue en la lista. */
  deactivateStudent: (id: string) => void;
  /** "Eliminar": sale de la tabla de alumnos pero el usuario sigue existiendo con academia = false. */
  removeStudent: (id: string) => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AccessRecord[]>(initialRecords);

  const toggleAccess = (id: string, key: "portal" | "academia") =>
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: !r[key] } : r)),
    );

  const deactivateStudent = (id: string) =>
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, academia: false } : r)),
    );

  const removeStudent = (id: string) =>
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, academia: false, inAcademyList: false } : r,
      ),
    );

  const value = useMemo<AccessContextValue>(
    () => ({
      records,
      students: records.filter((r) => r.inAcademyList),
      toggleAccess,
      deactivateStudent,
      removeStudent,
    }),
    [records],
  );

  return (
    <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) {
    throw new Error("useAccess must be used within an AccessProvider");
  }
  return ctx;
}
