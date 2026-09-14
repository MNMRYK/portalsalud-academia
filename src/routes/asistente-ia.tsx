import { createFileRoute } from "@tanstack/react-router";
import { AsistenteIA } from "@/components/dashboard/AsistenteIA";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/asistente-ia")({
  head: () => ({
    meta: [
      { title: "Asistente IA — Copiloto para Nutricionistas" },
      {
        name: "description",
        content:
          "Copiloto de IA para nutricionistas: genera dietas, interpreta analíticas y analiza el progreso de pacientes.",
      },
      { property: "og:title", content: "Asistente IA — Copiloto para Nutricionistas" },
      {
        property: "og:description",
        content:
          "Copiloto de IA para nutricionistas: genera dietas, interpreta analíticas y analiza el progreso de pacientes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AdminOnly>
      <AsistenteIA />
    </AdminOnly>
  ),
});
