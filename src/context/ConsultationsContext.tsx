import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ConsultationStatus = "Pendiente" | "Completada" | "Cancelada";
export type PaymentMethod = "Metálico" | "Tarjeta" | "Transferencia";

export interface ConsultationPayment {
  amount: number;
  method: PaymentMethod;
}

export interface Consultation {
  id: string;
  patientName: string;
  note: string;
  /** Fecha en formato ISO local: "yyyy-mm-dd" */
  date: string;
  time: string;
  phase: string;
  status: ConsultationStatus;
  payment: ConsultationPayment | null;
}

export interface NewConsultationInput {
  patientName: string;
  note: string;
  date: string;
  time: string;
  phase: string;
  status: ConsultationStatus;
  payment: ConsultationPayment | null;
}

/** Factura derivada de una consulta con pago, para el módulo de contabilidad. */
export interface DerivedInvoice {
  date: string;
  concept: string;
  amount: string;
  method: PaymentMethod;
}

const initialConsultations: Consultation[] = [
  {
    id: "cons-seed-1",
    patientName: "Elena Martín",
    note: "Revisión de fase 2. Reducción visible de inflamación y mejor descanso.",
    date: "2026-07-05",
    time: "12:00",
    phase: "Fase 2: Reducción de inflamación",
    status: "Completada",
    payment: { amount: 65, method: "Tarjeta" },
  },
  {
    id: "cons-seed-2",
    patientName: "Elena Martín",
    note: "Ajuste de pauta antiinflamatoria y refuerzo de hidratación.",
    date: "2026-06-20",
    time: "10:30",
    phase: "Fase 2: Reducción de inflamación",
    status: "Completada",
    payment: null,
  },
  {
    id: "cons-seed-3",
    patientName: "Elena Martín",
    note: "Analítica de control programada para valorar marcadores hepáticos.",
    date: "2026-07-12",
    time: "12:00",
    phase: "Fase 2: Reducción de inflamación",
    status: "Pendiente",
    payment: null,
  },
  {
    id: "cons-seed-4",
    patientName: "Lucía Fernández",
    note: "Primera consulta. Valoración inicial y objetivos del tratamiento.",
    date: "2026-07-01",
    time: "11:00",
    phase: "Fase 1: Détox hepático",
    status: "Completada",
    payment: { amount: 90, method: "Transferencia" },
  },
  {
    id: "cons-seed-5",
    patientName: "Marcos Iglesias",
    note: "Consulta de mantenimiento. Buen estado general, se mantiene la pauta.",
    date: "2026-06-28",
    time: "09:15",
    phase: "Fase 4: Mantenimiento y hábitos",
    status: "Completada",
    payment: { amount: 65, method: "Metálico" },
  },
  {
    id: "cons-seed-6",
    patientName: "Javier Morán",
    note: "Seguimiento y ajuste de la pauta antiinflamatoria.",
    date: "2026-07-03",
    time: "16:45",
    phase: "Fase 3: Reparación intestinal",
    status: "Pendiente",
    payment: null,
  },
];

const monthShort = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatInvoiceDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${monthShort[m - 1]} ${y}`;
}

interface ConsultationsContextValue {
  consultations: Consultation[];
  addConsultation: (input: NewConsultationInput) => void;
  updateConsultation: (id: string, patch: Partial<Consultation>) => void;
  consultationsForPatient: (patientName: string) => Consultation[];
  invoicesForPatient: (patientName: string) => DerivedInvoice[];
  patientsWithPayments: () => string[];
  lastPaymentFor: (patientName: string) => string | null;
}

const ConsultationsContext = createContext<ConsultationsContextValue | null>(
  null,
);

export function ConsultationsProvider({ children }: { children: ReactNode }) {
  const [consultations, setConsultations] =
    useState<Consultation[]>(initialConsultations);

  const addConsultation = (input: NewConsultationInput) => {
    setConsultations((prev) => [
      {
        id: `cons-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...input,
      },
      ...prev,
    ]);
  };

  const updateConsultation = (id: string, patch: Partial<Consultation>) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const consultationsForPatient = (patientName: string) =>
    consultations
      .filter((c) => c.patientName === patientName)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

  const invoicesForPatient = (patientName: string): DerivedInvoice[] =>
    consultations
      .filter((c) => c.patientName === patientName && c.payment)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((c) => ({
        date: formatInvoiceDate(c.date),
        concept: `Consulta clínica · ${c.phase.split(":")[0]}`,
        amount: `${c.payment!.amount} €`,
        method: c.payment!.method,
      }));

  const patientsWithPayments = () =>
    Array.from(
      new Set(
        consultations.filter((c) => c.payment).map((c) => c.patientName),
      ),
    );

  const lastPaymentFor = (patientName: string): string | null => {
    const paid = consultations
      .filter((c) => c.patientName === patientName && c.payment)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    if (paid.length === 0) return null;
    const c = paid[0];
    return `${formatInvoiceDate(c.date)} · ${c.payment!.amount} €`;
  };

  return (
    <ConsultationsContext.Provider
      value={{
        consultations,
        addConsultation,
        updateConsultation,
        consultationsForPatient,
        invoicesForPatient,
        patientsWithPayments,
        lastPaymentFor,
      }}
    >
      {children}
    </ConsultationsContext.Provider>
  );
}

export function useConsultations() {
  const ctx = useContext(ConsultationsContext);
  if (!ctx) {
    throw new Error(
      "useConsultations must be used within a ConsultationsProvider",
    );
  }
  return ctx;
}
