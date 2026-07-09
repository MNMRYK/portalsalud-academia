import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

type Access = "any" | "portal" | "academy" | "admin";

/**
 * FASE A — Guardia de ruta.
 *
 * - Sin sesión              -> redirige a /login
 * - require="portal"  y sin hasPortalAccess  -> redirige al panel principal
 * - require="academy" y sin hasAcademyAccess -> redirige al panel principal
 * - require="admin"   y sin isAdmin          -> redirige al panel principal
 *
 * El "panel principal" es la ruta a la que enviamos a un usuario logueado
 * que no tiene permiso para la sección solicitada.
 */
export function ProtectedRoute({
  children,
  require = "any",
  fallback = "/",
}: {
  children: ReactNode;
  require?: Access;
  fallback?: string;
}) {
  const { user, isAuthenticated } = useAuth();

  // 1. No hay usuario logueado -> login.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  // 2. Falta el permiso concreto -> panel principal.
  if (require === "portal" && !user.hasPortalAccess) {
    return <Navigate to={fallback} />;
  }
  if (require === "academy" && !user.hasAcademyAccess) {
    return <Navigate to={fallback} />;
  }
  if (require === "admin" && !user.isAdmin) {
    return <Navigate to={fallback} />;
  }

  return <>{children}</>;
}
