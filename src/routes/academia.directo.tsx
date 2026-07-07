import { createFileRoute } from "@tanstack/react-router";
import { Academia } from "@/components/dashboard/Academia";

export const Route = createFileRoute("/academia/directo")({
  component: () => <Academia studentSection="directo" />,
});
