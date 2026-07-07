import { createFileRoute } from "@tanstack/react-router";
import { PortalRecursosClinicos } from "@/components/dashboard/Portal";

export const Route = createFileRoute("/portal/recursos-clinicos")({
  component: PortalRecursosClinicos,
});
