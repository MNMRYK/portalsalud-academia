import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type TemplateCategory =
  | "Consentimiento"
  | "Protección de datos"
  | "Contrato"
  | "Autorización"
  | "Otros";

export interface LegalTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  format: string;
  uploaded: boolean;
  required: boolean;
}

export const templateCategories: TemplateCategory[] = [
  "Consentimiento",
  "Protección de datos",
  "Contrato",
  "Autorización",
  "Otros",
];

export interface NewTemplateInput {
  name: string;
  category: TemplateCategory;
  format: string;
  required: boolean;
  uploaded: boolean;
}

interface LegalTemplatesContextValue {
  templates: LegalTemplate[];
  addTemplate: (input: NewTemplateInput) => void;
  removeTemplate: (id: string) => void;
  toggleRequired: (id: string) => void;
  markUploaded: (id: string) => void;
}

const initialTemplates: LegalTemplate[] = [
  {
    id: "consentimiento",
    name: "Consentimiento Informado",
    category: "Consentimiento",
    format: "Word (.docx)",
    uploaded: true,
    required: true,
  },
  {
    id: "rgpd",
    name: "Política de Protección de Datos (RGPD)",
    category: "Protección de datos",
    format: "PDF",
    uploaded: true,
    required: true,
  },
  {
    id: "contrato",
    name: "Contrato de Servicios Nutricionales",
    category: "Contrato",
    format: "Word (.docx)",
    uploaded: false,
    required: false,
  },
  {
    id: "menores",
    name: "Autorización de Uso de Datos de Menores",
    category: "Autorización",
    format: "PDF",
    uploaded: false,
    required: false,
  },
];

const LegalTemplatesContext = createContext<LegalTemplatesContextValue | null>(
  null
);

export function LegalTemplatesProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<LegalTemplate[]>(initialTemplates);

  const addTemplate = (input: NewTemplateInput) => {
    setTemplates((prev) => [
      ...prev,
      {
        id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ...input,
      },
    ]);
  };

  const removeTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleRequired = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, required: !t.required } : t))
    );
  };

  const markUploaded = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, uploaded: true } : t))
    );
  };

  return (
    <LegalTemplatesContext.Provider
      value={{ templates, addTemplate, removeTemplate, toggleRequired, markUploaded }}
    >
      {children}
    </LegalTemplatesContext.Provider>
  );
}

export function useLegalTemplates() {
  const ctx = useContext(LegalTemplatesContext);
  if (!ctx) {
    throw new Error(
      "useLegalTemplates must be used within a LegalTemplatesProvider"
    );
  }
  return ctx;
}
