import { createFileRoute } from "@tanstack/react-router";
import { PortalSuscripciones } from "@/components/dashboard/Portal";

export const Route = createFileRoute("/portal/suscripciones")({
  component: PortalSuscripciones,
});
