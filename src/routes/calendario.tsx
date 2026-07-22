import { createFileRoute } from "@tanstack/react-router";
import { Calendario } from "@/components/dashboard/Calendario";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/calendario")({
  head: () => ({
    meta: [
      { title: "Calendario de Citas — Videoconsulta E2EE" },
      {
        name: "description",
        content:
          "Agenda automática de consultas clínicas con videoconsulta cifrada de extremo a extremo (E2EE), recordatorios y confirmaciones automáticas.",
      },
      { property: "og:title", content: "Calendario de Citas — Videoconsulta E2EE" },
      {
        property: "og:description",
        content:
          "Agenda automática y videoconsultas seguras cifradas de extremo a extremo.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Calendario />
    </AdminOnly>
  ),
});
