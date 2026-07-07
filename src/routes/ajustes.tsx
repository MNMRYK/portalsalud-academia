import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { Placeholder } from "@/components/dashboard/Placeholder";

export const Route = createFileRoute("/ajustes")({
  component: AjustesPage,
});

function AjustesPage() {
  return (
    <Placeholder
      title="Ajustes y Roles"
      subtitle="Configuración de la clínica, equipo y permisos de acceso."
      icon={Settings}
      message="Aquí podrás gestionar los datos de tu clínica, invitar a tu equipo y definir los roles y permisos de cada usuario. Esta sección estará disponible muy pronto."
    />
  );
}
