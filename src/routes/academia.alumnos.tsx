import { createFileRoute } from "@tanstack/react-router";
import { AcademiaStudents } from "@/components/dashboard/AcademiaStudents";

export const Route = createFileRoute("/academia/alumnos")({
  head: () => ({
    meta: [
      { title: "Gestión de Alumnos — Academia Nutralia" },
      {
        name: "description",
        content:
          "Administra el acceso de los alumnos a la Academia Nutralia y sincroniza sus permisos con Facturación y Accesos.",
      },
    ],
  }),
  component: AcademiaStudents,
});
