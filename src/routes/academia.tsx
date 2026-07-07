import { createFileRoute } from "@tanstack/react-router";
import { Academia } from "@/components/dashboard/Academia";

export const Route = createFileRoute("/academia")({
  component: AcademiaPage,
});

function AcademiaPage() {
  return <Academia />;
}
