import { createFileRoute } from "@tanstack/react-router";
import { ActivateAccountView } from "@/components/auth/ActivateAccountView";

export const Route = createFileRoute("/activar-cuenta")({
  head: () => ({
    meta: [
      { title: "Activar cuenta · Sara Santos" },
      {
        name: "description",
        content: "Crea tu contraseña y activa tu acceso al portal de salud.",
      },
    ],
  }),
  component: ActivateAccountView,
});
