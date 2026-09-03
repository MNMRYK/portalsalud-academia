import { createFileRoute } from "@tanstack/react-router";
import { AcademiaTalleres } from "@/components/dashboard/AcademiaTalleres";

export const Route = createFileRoute("/academia/talleres")({
  head: () => ({
    meta: [
      { title: "Talleres Prácticos — Academia Nutralia" },
      {
        name: "description",
        content: "Consulta y reserva tus próximos talleres prácticos de bienestar.",
      },
      { property: "og:title", content: "Talleres Prácticos — Academia Nutralia" },
      {
        property: "og:description",
        content: "Consulta y reserva tus próximos talleres prácticos de bienestar.",
      },
    ],
  }),
  component: AcademiaTalleres,
});
