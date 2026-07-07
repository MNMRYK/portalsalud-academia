import { createFileRoute } from "@tanstack/react-router";
import { PortalDashboard } from "@/components/dashboard/Portal";

export const Route = createFileRoute("/portal/")({
  head: () => ({
    meta: [
      { title: "Mi Portal — Nutralia" },
      {
        name: "description",
        content:
          "Tu espacio de salud en Nutralia: próximas citas, tareas y recursos personalizados.",
      },
    ],
  }),
  component: PortalDashboard,
});
