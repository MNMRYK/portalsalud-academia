import { createFileRoute } from "@tanstack/react-router";
import { Facturacion } from "@/components/dashboard/Facturacion";
import { AdminOnly } from "@/components/dashboard/AdminOnly";

export const Route = createFileRoute("/facturacion")({
  head: () => ({
    meta: [
      { title: "Facturación y Finanzas — Panel de administración" },
      {
        name: "description",
        content:
          "Módulo centralizado de facturación: ingresos de consultas clínicas, suscripciones, cursos y recursos, con facturas en PDF y desglose de impuestos.",
      },
      { property: "og:title", content: "Facturación y Finanzas — Panel de administración" },
      {
        property: "og:description",
        content:
          "Ingresos unificados de clínica y academia con filtros avanzados, facturación automática y panel de suscripciones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Facturacion />
    </AdminOnly>
  ),
});
