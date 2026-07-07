import { createFileRoute } from "@tanstack/react-router";
import { Pacientes } from "@/components/dashboard/Pacientes";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/pacientes")({
  head: () => ({
    meta: [
      { title: "Gestión de Pacientes — Nutralia" },
      {
        name: "description",
        content:
          "CRM clínico para nutrición integrativa: fichas de pacientes, evolución, diario clínico y documentos seguros.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Pacientes />
    </AdminOnly>
  ),
});
