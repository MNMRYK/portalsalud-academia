import { createContext, useContext, useState, type ReactNode } from "react";

/** Documento generado (p. ej. por el Asistente IA) guardado en la ficha. */
export interface PatientDocument {
  id: string;
  patientName: string;
  name: string;
  content: string;
  date: string; // yyyy-mm-dd
}

/** Registro de texto en "Datos y Evolución" (p. ej. interpretación de analítica). */
export interface EvolutionNote {
  id: string;
  patientName: string;
  title: string;
  content: string;
  date: string; // yyyy-mm-dd
}

interface Ctx {
  addDocument: (d: Omit<PatientDocument, "id">) => void;
  removeDocument: (id: string) => void;
  documentsForPatient: (name: string) => PatientDocument[];
  addEvolutionNote: (n: Omit<EvolutionNote, "id">) => void;
  removeEvolutionNote: (id: string) => void;
  notesForPatient: (name: string) => EvolutionNote[];
}

const PatientRecordsContext = createContext<Ctx | null>(null);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function PatientRecordsProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<PatientDocument[]>([]);
  const [notes, setNotes] = useState<EvolutionNote[]>([]);
  return (
    <PatientRecordsContext.Provider
      value={{
        addDocument: (d) => setDocs((p) => [{ ...d, id: `doc-${uid()}` }, ...p]),
        removeDocument: (id) => setDocs((p) => p.filter((d) => d.id !== id)),
        documentsForPatient: (n) => docs.filter((d) => d.patientName === n),
        addEvolutionNote: (x) => setNotes((p) => [{ ...x, id: `note-${uid()}` }, ...p]),
        removeEvolutionNote: (id) => setNotes((p) => p.filter((x) => x.id !== id)),
        notesForPatient: (n) => notes.filter((x) => x.patientName === n),
      }}
    >
      {children}
    </PatientRecordsContext.Provider>
  );
}

export function usePatientRecords() {
  const ctx = useContext(PatientRecordsContext);
  if (!ctx) throw new Error("usePatientRecords must be used within PatientRecordsProvider");
  return ctx;
}

/** Descarga un documento de texto. */
export function downloadTextDocument(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
