import { createFileRoute } from "@tanstack/react-router";
import { AcademiaRetosAdmin } from "@/components/dashboard/AcademiaRetosAdmin";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/academia/retos/gestion")({
  head: () => ({
    meta: [
      { title: "Gestión de Retos — Academia Nutralia" },
      {
        name: "description",
        content: "Administra, publica y organiza los retos de la Academia Nutralia.",
      },
      { property: "og:title", content: "Gestión de Retos — Academia Nutralia" },
      {
        property: "og:description",
        content: "Administra, publica y organiza los retos de la Academia Nutralia.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <AcademiaRetosAdmin />
    </AdminOnly>
  ),
});
