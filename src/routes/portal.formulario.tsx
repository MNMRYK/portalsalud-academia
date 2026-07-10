import { createFileRoute } from "@tanstack/react-router";
import { PatientFormView } from "@/components/dashboard/PatientFormView";

export const Route = createFileRoute("/portal/formulario")({
  head: () => ({
    meta: [
      { title: "Formulario de seguimiento — Nutralia" },
      {
        name: "description",
        content:
          "Responde el formulario de seguimiento que tu especialista te ha enviado.",
      },
    ],
  }),
  component: PatientFormView,
});
