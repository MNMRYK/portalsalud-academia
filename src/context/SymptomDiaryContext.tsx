import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

/** Entrada del diario de síntomas registrada por el propio paciente. */
export interface SymptomEntry {
  id: string;
  patientName: string;
  /** Fecha en formato ISO local "yyyy-mm-dd". */
  date: string;
  /** Intensidad del síntoma en escala 1-5. */
  intensity: number;
  notes: string;
}

export interface NewSymptomEntry {
  patientName: string;
  date: string;
  intensity: number;
  notes: string;
}

interface SymptomDiaryContextValue {
  entries: SymptomEntry[];
  addEntry: (input: NewSymptomEntry) => void;
  entriesForPatient: (patientName: string) => SymptomEntry[];
}

const SymptomDiaryContext = createContext<SymptomDiaryContextValue | null>(null);

export function SymptomDiaryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);

  const addEntry = (input: NewSymptomEntry) => {
    setEntries((prev) => [
      {
        id: `sym-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...input,
      },
      ...prev,
    ]);
  };

  const entriesForPatient = (patientName: string) =>
    entries
      .filter((e) => e.patientName === patientName)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <SymptomDiaryContext.Provider
      value={{ entries, addEntry, entriesForPatient }}
    >
      {children}
    </SymptomDiaryContext.Provider>
  );
}

export function useSymptomDiary() {
  const ctx = useContext(SymptomDiaryContext);
  if (!ctx) {
    throw new Error(
      "useSymptomDiary must be used within a SymptomDiaryProvider",
    );
  }
  return ctx;
}

/** Mapea la intensidad 1-5 a una etiqueta legible. */
export function intensityLabel(intensity: number): string {
  if (intensity <= 1) return "Muy baja";
  if (intensity === 2) return "Baja";
  if (intensity === 3) return "Media";
  if (intensity === 4) return "Alta";
  return "Muy alta";
}
