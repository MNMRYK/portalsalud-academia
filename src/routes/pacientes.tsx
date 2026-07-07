import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/pacientes")({
  component: PacientesPage,
});

function PacientesPage() {
  return (
    <Placeholder
      title="Gestión de Pacientes"
      subtitle="Fichas clínicas, historiales y seguimiento de tratamientos."
      icon={Users}
      message="Aquí podrás gestionar las fichas completas de tus pacientes, sus analíticas y la evolución de cada tratamiento. Esta sección estará disponible muy pronto."
    />
  );
}
