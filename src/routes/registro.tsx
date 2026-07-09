import { createFileRoute } from "@tanstack/react-router";
import { RegisterView } from "@/components/auth/RegisterView";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta · Sara Santos" },
      {
        name: "description",
        content: "Regístrate en el portal de salud integrativa.",
      },
    ],
  }),
  component: RegisterView,
});
