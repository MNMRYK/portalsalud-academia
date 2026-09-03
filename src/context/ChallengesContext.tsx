import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface ChallengeStep {
  id: string;
  label: string;
}

export interface Challenge {
  id: string;
  title: string;
  desc: string;
  category: string;
  durationDays: number;
  active: boolean;
  steps: ChallengeStep[];
}

export type ChallengeDraft = Omit<Challenge, "id">;

interface ChallengesContextValue {
  challenges: Challenge[];
  /** Retos visibles para el alumno (solo activos). */
  activeChallenges: Challenge[];
  completedSteps: Record<string, string[]>;
  toggleStep: (challengeId: string, stepId: string) => void;
  resetChallenge: (challengeId: string) => void;
  progressOf: (challengeId: string) => { done: number; total: number; pct: number };
  addChallenge: (draft: ChallengeDraft) => void;
  updateChallenge: (id: string, draft: ChallengeDraft) => void;
  removeChallenge: (id: string) => void;
}

const ChallengesContext = createContext<ChallengesContextValue | null>(null);

const initialChallenges: Challenge[] = [
  {
    id: "c1",
    title: "Reto 7 días sin azúcares añadidos",
    desc: "Una semana para reeducar el paladar y reducir los picos de glucosa.",
    category: "Alimentación",
    durationDays: 7,
    active: true,
    steps: [
      { id: "c1s1", label: "Vaciar la despensa de ultraprocesados" },
      { id: "c1s2", label: "Planificar 3 desayunos sin azúcar" },
      { id: "c1s3", label: "Registrar 5 días seguidos en el diario" },
      { id: "c1s4", label: "Compartir tu experiencia en la comunidad" },
    ],
  },
  {
    id: "c2",
    title: "Reto hidratación consciente",
    desc: "Diez días para instaurar el hábito de beber agua de forma sostenida.",
    category: "Hábitos",
    durationDays: 10,
    active: true,
    steps: [
      { id: "c2s1", label: "Calcular tu objetivo diario de agua" },
      { id: "c2s2", label: "Preparar tu botella y recordatorios" },
      { id: "c2s3", label: "Completar 10 días de registro" },
    ],
  },
  {
    id: "c3",
    title: "Reto movimiento diario",
    desc: "21 días sumando movimiento suave a tu rutina.",
    category: "Actividad física",
    durationDays: 21,
    active: false,
    steps: [
      { id: "c3s1", label: "Elegir tu franja horaria fija" },
      { id: "c3s2", label: "Caminar 30 min durante 7 días" },
      { id: "c3s3", label: "Añadir 2 sesiones de fuerza" },
    ],
  },
];

export function ChallengesProvider({ children }: { children: ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [completedSteps, setCompletedSteps] = useState<Record<string, string[]>>({
    c1: ["c1s1", "c1s2"],
    c2: ["c2s1"],
  });

  const value = useMemo<ChallengesContextValue>(() => {
    const progressOf = (challengeId: string) => {
      const challenge = challenges.find((c) => c.id === challengeId);
      const total = challenge?.steps.length ?? 0;
      const done = (completedSteps[challengeId] ?? []).filter((sid) =>
        challenge?.steps.some((s) => s.id === sid),
      ).length;
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    };

    return {
      challenges,
      activeChallenges: challenges.filter((c) => c.active),
      completedSteps,
      progressOf,
      toggleStep: (challengeId, stepId) =>
        setCompletedSteps((prev) => {
          const current = prev[challengeId] ?? [];
          return {
            ...prev,
            [challengeId]: current.includes(stepId)
              ? current.filter((id) => id !== stepId)
              : [...current, stepId],
          };
        }),
      resetChallenge: (challengeId) =>
        setCompletedSteps((prev) => ({ ...prev, [challengeId]: [] })),
      addChallenge: (draft) =>
        setChallenges((prev) => [
          ...prev,
          { ...draft, id: `c${Date.now().toString(36)}` },
        ]),
      updateChallenge: (id, draft) =>
        setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, ...draft } : c))),
      removeChallenge: (id) => setChallenges((prev) => prev.filter((c) => c.id !== id)),
    };
  }, [challenges, completedSteps]);

  return (
    <ChallengesContext.Provider value={value}>{children}</ChallengesContext.Provider>
  );
}

export function useChallenges() {
  const ctx = useContext(ChallengesContext);
  if (!ctx) {
    throw new Error("useChallenges must be used within a ChallengesProvider");
  }
  return ctx;
}
