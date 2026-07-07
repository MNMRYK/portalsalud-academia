import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/recursos")({
  component: RecursosPage,
});

function RecursosPage() {
  return (
    <Placeholder
      title="Gestor de Recursos"
      subtitle="Guías, plantillas y materiales descargables para tus pacientes."
      icon={FolderOpen}
      message="Aquí podrás organizar y compartir recursos como menús, guías y plantillas con tu equipo y tus pacientes. Esta sección estará disponible muy pronto."
    />
  );
}
