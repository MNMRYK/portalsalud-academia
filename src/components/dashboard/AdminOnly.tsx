import { Navigate } from "@tanstack/react-router";
import { useUser } from "../../context/UserContext";

/**
 * Envuelve vistas de administración. Si el usuario activo es un paciente,
 * lo redirige a su portal para que nunca acceda a herramientas de gestión.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useUser();
  if (!isAdmin) {
    return <Navigate to="/portal" />;
  }
  return <>{children}</>;
}
