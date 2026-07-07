import { createFileRoute } from "@tanstack/react-router";
import { PortalPlan } from "@/components/dashboard/Portal";

export const Route = createFileRoute("/portal/plan")({
  component: PortalPlan,
});
