import { createFileRoute } from "@tanstack/react-router";
import { Ajustes } from "@/components/dashboard/Ajustes";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/ajustes")({
  head: () => ({
    meta: [
      { title: "Ajustes y Roles — Nutralia" },
      {
        name: "description",
        content:
          "Panel de control de la clínica: identidad legal, equipo y roles, auditoría de actividad y estado de la suscripción.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Ajustes />
    </AdminOnly>
  ),
});
