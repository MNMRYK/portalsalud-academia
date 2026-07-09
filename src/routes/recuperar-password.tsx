import { createFileRoute } from "@tanstack/react-router";
import { RecoverPasswordView } from "@/components/auth/RecoverPasswordView";

export const Route = createFileRoute("/recuperar-password")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña · Sara Santos" },
      {
        name: "description",
        content: "Restablece la contraseña de tu portal de salud.",
      },
    ],
  }),
  component: RecoverPasswordView,
});
