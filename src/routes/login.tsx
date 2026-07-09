import { createFileRoute } from "@tanstack/react-router";
import { LoginView } from "@/components/auth/LoginView";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión · Sara Santos" },
      {
        name: "description",
        content: "Accede a tu portal de salud integrativa.",
      },
    ],
  }),
  component: LoginView,
});
