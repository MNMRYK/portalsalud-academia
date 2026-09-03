import { createFileRoute } from "@tanstack/react-router";
import { AcademiaRetos } from "@/components/dashboard/AcademiaRetos";

export const Route = createFileRoute("/academia/retos")({
  head: () => ({
    meta: [
      { title: "Retos del alumno — Academia Nutralia" },
      {
        name: "description",
        content: "Completa tus retos de bienestar y sigue tu progreso paso a paso.",
      },
      { property: "og:title", content: "Retos del alumno — Academia Nutralia" },
      {
        property: "og:description",
        content: "Completa tus retos de bienestar y sigue tu progreso paso a paso.",
      },
    ],
  }),
  component: AcademiaRetos,
});
