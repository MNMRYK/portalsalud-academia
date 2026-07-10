import { createFileRoute } from "@tanstack/react-router";
import { FormBuilder } from "@/components/dashboard/FormBuilder";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/formularios")({
  head: () => ({
    meta: [
      { title: "Crear Formulario — Nutralia" },
      {
        name: "description",
        content:
          "Crea plantillas de formularios de seguimiento dinámicos y asígnalas a tus pacientes de nutrición integrativa.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <FormBuilder />
    </AdminOnly>
  ),
});
