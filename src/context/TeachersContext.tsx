import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type TeacherStatus = "activo" | "inactivo";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
  /** IDs de cursos de la academia que imparte. */
  courseIds: string[];
  status: TeacherStatus;
  joinDate: string;
}

const initialTeachers: Teacher[] = [
  {
    id: "t1",
    name: "Laura García",
    email: "laura.garcia@clinica.com",
    phone: "+34 600 123 456",
    specialty: "Nutrición clínica integrativa",
    bio: "Dietista-nutricionista con 12 años de experiencia en inflamación crónica y salud digestiva.",
    courseIds: ["c1", "c3"],
    status: "activo",
    joinDate: "2024-01-10",
  },
  {
    id: "t2",
    name: "Irene Navarro",
    email: "irene.navarro@clinica.com",
    phone: "+34 611 456 789",
    specialty: "Endocrinología y salud hormonal",
    bio: "Especialista en salud hormonal femenina, ciclo menstrual y menopausia.",
    courseIds: ["c2"],
    status: "activo",
    joinDate: "2025-03-02",
  },
  {
    id: "t3",
    name: "Sergio Llorente",
    email: "sergio.llorente@clinica.com",
    phone: "+34 622 987 321",
    specialty: "Cocina terapéutica",
    bio: "Chef y técnico en dietética. Diseña menús adaptados a planes de tratamiento.",
    courseIds: ["c4"],
    status: "inactivo",
    joinDate: "2025-09-15",
  },
];

interface TeachersContextValue {
  teachers: Teacher[];
  saveTeacher: (t: Teacher) => void;
  deleteTeacher: (id: string) => void;
  toggleStatus: (id: string) => void;
}

const TeachersContext = createContext<TeachersContextValue | null>(null);

export function TeachersProvider({ children }: { children: ReactNode }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);

  const value = useMemo<TeachersContextValue>(
    () => ({
      teachers,
      saveTeacher: (t) =>
        setTeachers((prev) =>
          prev.some((x) => x.id === t.id)
            ? prev.map((x) => (x.id === t.id ? t : x))
            : [...prev, t],
        ),
      deleteTeacher: (id) => setTeachers((prev) => prev.filter((x) => x.id !== id)),
      toggleStatus: (id) =>
        setTeachers((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, status: x.status === "activo" ? "inactivo" : "activo" } : x,
          ),
        ),
    }),
    [teachers],
  );

  return <TeachersContext.Provider value={value}>{children}</TeachersContext.Provider>;
}

export function useTeachers() {
  const ctx = useContext(TeachersContext);
  if (!ctx) throw new Error("useTeachers must be used within a TeachersProvider");
  return ctx;
}
