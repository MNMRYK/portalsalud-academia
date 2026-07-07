import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type ResourceType = "pdf" | "video" | "menu";
export type ResourceAudience = "clinico" | "academico";

export interface Resource {
  id: number;
  name: string;
  type: ResourceType;
  category: string;
  phase: string;
  /** Público al que va dirigido el recurso. */
  audience: ResourceAudience;
  /** Si es visible en el portal del paciente/alumno. */
  sharedWithPatient: boolean;
  favorite: boolean;
  recent: boolean;
}

export const treatmentPhases = [
  "Fase 1: Détox hepático",
  "Fase 2: Reducción de inflamación",
  "Fase 3: Reparación intestinal",
  "Fase 4: Mantenimiento y hábitos",
];

const initialResources: Resource[] = [
  {
    id: 1,
    name: "Guía de nutrición antiinflamatoria",
    type: "pdf",
    category: "Antiinflamatoria",
    phase: treatmentPhases[1],
    audience: "clinico",
    sharedWithPatient: true,
    favorite: true,
    recent: true,
  },
  {
    id: 2,
    name: "Menú semanal détox de primavera",
    type: "menu",
    category: "Détox y depuración",
    phase: treatmentPhases[0],
    audience: "clinico",
    sharedWithPatient: true,
    favorite: false,
    recent: true,
  },
  {
    id: 3,
    name: "Vídeo: batch cooking saludable",
    type: "video",
    category: "Hábitos y mantenimiento",
    phase: treatmentPhases[3],
    audience: "academico",
    sharedWithPatient: true,
    favorite: true,
    recent: false,
  },
  {
    id: 4,
    name: "Lista de la compra intestinal",
    type: "pdf",
    category: "Salud intestinal",
    phase: treatmentPhases[2],
    audience: "clinico",
    sharedWithPatient: true,
    favorite: false,
    recent: true,
  },
  {
    id: 5,
    name: "Plantilla de menú deportivo",
    type: "menu",
    category: "Nutrición Deportiva",
    phase: treatmentPhases[3],
    audience: "academico",
    sharedWithPatient: false,
    favorite: false,
    recent: false,
  },
  {
    id: 6,
    name: "Vídeo: respiración y digestión",
    type: "video",
    category: "Salud intestinal",
    phase: treatmentPhases[2],
    audience: "academico",
    sharedWithPatient: true,
    favorite: false,
    recent: true,
  },
];

export interface NewResourceInput {
  name: string;
  type: ResourceType;
  category: string;
  audience: ResourceAudience;
  sharedWithPatient: boolean;
}

interface ResourcesContextValue {
  resources: Resource[];
  addResource: (input: NewResourceInput) => void;
  updateResource: (id: number, patch: Partial<Resource>) => void;
  removeResource: (id: number) => void;
  toggleFavorite: (id: number) => void;
  patientResources: (audience: ResourceAudience) => Resource[];
}

const ResourcesContext = createContext<ResourcesContextValue | null>(null);

export function ResourcesProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>(initialResources);

  const addResource = (input: NewResourceInput) => {
    setResources((prev) => [
      {
        id: Date.now(),
        phase: treatmentPhases[0],
        favorite: false,
        recent: true,
        ...input,
      },
      ...prev,
    ]);
  };

  const updateResource = (id: number, patch: Partial<Resource>) =>
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );

  const removeResource = (id: number) =>
    setResources((prev) => prev.filter((r) => r.id !== id));

  const toggleFavorite = (id: number) =>
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)),
    );

  const patientResources = (audience: ResourceAudience) =>
    resources.filter((r) => r.sharedWithPatient && r.audience === audience);

  return (
    <ResourcesContext.Provider
      value={{
        resources,
        addResource,
        updateResource,
        removeResource,
        toggleFavorite,
        patientResources,
      }}
    >
      {children}
    </ResourcesContext.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourcesContext);
  if (!ctx) {
    throw new Error("useResources must be used within a ResourcesProvider");
  }
  return ctx;
}
