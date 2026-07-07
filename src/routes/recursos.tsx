import { createFileRoute } from "@tanstack/react-router";
import { Recursos } from "@/components/dashboard/Recursos";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/recursos")({
  head: () => ({
    meta: [
      { title: "Gestor de Recursos — Nutralia" },
      {
        name: "description",
        content:
          "Biblioteca maestra de la clínica: gestiona guías, plantillas, menús y vídeos y asígnalos a tus pacientes.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Recursos />
    </AdminOnly>
  ),
});

