import { createFileRoute } from "@tanstack/react-router";
import { AcademiaComunidad } from "@/components/dashboard/AcademiaComunidad";

export const Route = createFileRoute("/academia/comunidad")({
  head: () => ({
    meta: [
      { title: "Comunidad y Foro — Academia Nutralia" },
      {
        name: "description",
        content: "Participa en el foro de la comunidad de la Academia Nutralia.",
      },
      { property: "og:title", content: "Comunidad y Foro — Academia Nutralia" },
      {
        property: "og:description",
        content: "Participa en el foro de la comunidad de la Academia Nutralia.",
      },
    ],
  }),
  component: AcademiaComunidad,
});
