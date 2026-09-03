import { createFileRoute } from "@tanstack/react-router";
import { AcademiaModeracion } from "@/components/dashboard/AcademiaModeracion";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/academia/moderacion")({
  head: () => ({
    meta: [
      { title: "Moderación — Academia Nutralia" },
      {
        name: "description",
        content: "Revisa y gestiona el contenido reportado de la comunidad.",
      },
      { property: "og:title", content: "Moderación — Academia Nutralia" },
      {
        property: "og:description",
        content: "Revisa y gestiona el contenido reportado de la comunidad.",
      },
    ],
  }),
  component: () => (
    <AdminOnly>
      <AcademiaModeracion />
    </AdminOnly>
  ),
});
