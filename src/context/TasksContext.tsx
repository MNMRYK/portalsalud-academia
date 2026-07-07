import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type TaskPriority = "Baja" | "Media" | "Alta";

/** Destinatario de la tarea: la clínica (Sara) o el paciente. */
export type TaskAssignee = "clinica" | "paciente";

export interface Task {
  id: string;
  patientName: string;
  description: string;
  /** Fecha límite en formato ISO local: "yyyy-mm-dd" */
  dueDate: string;
  priority: TaskPriority;
  assignee: TaskAssignee;
  isCompleted: boolean;
}

export interface NewTaskInput {
  patientName: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  assignee: TaskAssignee;
}

/** Devuelve la fecha actual como "yyyy-mm-dd" en horario local. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const today = toISODate(new Date());
const offsetDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

const initialTasks: Task[] = [
  {
    id: "task-1",
    patientName: "Lucía Fernández",
    description: "Revisar analítica de sangre y actualizar marcadores hepáticos",
    dueDate: today,
    priority: "Alta",
    isCompleted: false,
  },
  {
    id: "task-2",
    patientName: "Marcos Iglesias",
    description: "Enviar plan nutricional de mantenimiento por email",
    dueDate: today,
    priority: "Media",
    isCompleted: false,
  },
  {
    id: "task-3",
    patientName: "Elena Martín",
    description: "Confirmar consentimiento firmado de la fase 2",
    dueDate: today,
    priority: "Baja",
    isCompleted: true,
  },
  {
    id: "task-4",
    patientName: "Javier Morán",
    description: "Preparar pauta antiinflamatoria para la próxima consulta",
    dueDate: offsetDate(1),
    priority: "Alta",
    isCompleted: false,
  },
  {
    id: "task-5",
    patientName: "Elena Martín",
    description: "Llamar para recordar la analítica de control",
    dueDate: offsetDate(2),
    priority: "Media",
    isCompleted: false,
  },
  {
    id: "task-6",
    patientName: "Lucía Fernández",
    description: "Registrar peso y adherencia de la semana anterior",
    dueDate: offsetDate(-1),
    priority: "Media",
    isCompleted: true,
  },
  {
    id: "task-7",
    patientName: "Marcos Iglesias",
    description: "Revisar diario de síntomas de la primera fase",
    dueDate: offsetDate(-2),
    priority: "Baja",
    isCompleted: false,
  },
];

interface TasksContextValue {
  tasks: Task[];
  addTask: (input: NewTaskInput) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  tasksForPatient: (patientName: string) => Task[];
  tasksForDate: (isoDate: string) => Task[];
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (input: NewTaskInput) => {
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        isCompleted: false,
        ...input,
      },
    ]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const tasksForPatient = (patientName: string) =>
    tasks.filter((t) => t.patientName === patientName);

  const tasksForDate = (isoDate: string) =>
    tasks.filter((t) => t.dueDate === isoDate);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        removeTask,
        tasksForPatient,
        tasksForDate,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return ctx;
}
