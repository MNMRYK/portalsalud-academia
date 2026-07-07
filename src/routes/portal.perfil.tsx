import { createFileRoute } from "@tanstack/react-router";
import { PortalPerfil } from "@/components/dashboard/Portal";

export const Route = createFileRoute("/portal/perfil")({
  component: PortalPerfil,
});
