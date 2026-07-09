import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";

/**
 * FASE A — Autenticación (aislada para exportar).
 *
 * Estado global de autenticación con un usuario simulado (mock).
 * No depende de ningún backend: la sesión se persiste en localStorage
 * para poder recorrer el flujo completo de login/registro/recuperación.
 */

export interface AuthUser {
  name: string;
  email: string;
  isAdmin: boolean;
  hasAcademyAccess: boolean;
  hasPortalAccess: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Simula el inicio de sesión validando email/contraseña (mock). */
  login: (email: string, password: string) => Promise<AuthUser>;
  /** Simula el registro y deja al usuario logueado. */
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthUser>;
  /** Simula el envío del correo de recuperación. */
  recoverPassword: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "auth-mock-user";

/**
 * Directorio de usuarios simulado. En producción esto lo resolvería el
 * backend; aquí sirve para probar los distintos niveles de acceso.
 * Contraseña para todos: "123456".
 */
const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    name: "Sara Santos",
    email: "admin@salud.com",
    password: "123456",
    isAdmin: true,
    hasAcademyAccess: true,
    hasPortalAccess: true,
  },
  {
    name: "Elena Martín",
    email: "paciente@salud.com",
    password: "123456",
    isAdmin: false,
    hasAcademyAccess: false,
    hasPortalAccess: true,
  },
  {
    name: "Marc Puig",
    email: "alumno@salud.com",
    password: "123456",
    isAdmin: false,
    hasAcademyAccess: true,
    hasPortalAccess: false,
  },
];

function stripPassword(u: AuthUser & { password: string }): AuthUser {
  const { password: _pw, ...rest } = u;
  return rest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Rehidratamos la sesión tras el montaje (evita desajustes SSR/cliente).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as AuthUser);
    } catch {
      /* noop */
    }
  }, []);

  const persist = (next: AuthUser | null) => {
    setUser(next);
    if (typeof window === "undefined") return;
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    // Simulamos latencia de red.
    await new Promise((r) => setTimeout(r, 400));
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!found || found.password !== password) {
      throw new Error("Email o contraseña incorrectos.");
    }
    const clean = stripPassword(found);
    persist(clean);
    return clean;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    await new Promise((r) => setTimeout(r, 400));
    if (MOCK_USERS.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
      throw new Error("Ya existe una cuenta con este email.");
    }
    // Usuario nuevo: acceso al portal por defecto, sin academia ni admin.
    const clean: AuthUser = {
      name: data.name.trim(),
      email: data.email.trim(),
      isAdmin: false,
      hasAcademyAccess: false,
      hasPortalAccess: true,
    };
    persist(clean);
    return clean;
  };

  const recoverPassword = async (_email: string) => {
    await new Promise((r) => setTimeout(r, 500));
    // Mock: en producción dispararía el email de recuperación.
  };

  const logout = () => persist(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      recoverPassword,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
