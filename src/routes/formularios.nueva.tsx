import { createFileRoute } from "@tanstack/react-router";
import { FormBuilder } from "@/components/dashboard/FormBuilder";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/formularios/nueva")({
  head: () => ({
    meta: [
      { title: "Nueva Plantilla — Nutralia" },
      {
        name: "description",
        content:
          "Crea una nueva plantilla de formulario de seguimiento para pacientes de nutrición integrativa.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <FormBuilder />
    </AdminOnly>
  ),
});
