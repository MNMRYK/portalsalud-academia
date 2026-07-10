import { createFileRoute } from "@tanstack/react-router";
import { FormDashboard } from "@/components/dashboard/FormDashboard";

export const Route = createFileRoute("/formularios/")({
  head: () => ({
    meta: [
      { title: "Gestión de Formularios — Nutralia" },
      {
        name: "description",
        content:
          "Administra las plantillas de formularios de seguimiento de nutrición integrativa.",
      },
    ],
  }),
  component: FormDashboard,
});
