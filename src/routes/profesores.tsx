import { createFileRoute } from "@tanstack/react-router";
import { Profesores } from "@/components/dashboard/Profesores";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/profesores")({
  head: () => ({
    meta: [
      { title: "Profesores — Gestión del equipo docente" },
      { name: "description", content: "Alta, edición, baja y perfil de los profesores de la academia." },
      { property: "og:title", content: "Profesores — Gestión del equipo docente" },
      { property: "og:description", content: "Alta, edición, baja y perfil de los profesores de la academia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Profesores />
    </AdminOnly>
  ),
});
