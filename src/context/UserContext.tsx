import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";

export type UserRole = "admin" | "patient";

/** Perfiles disponibles en el Dev Switcher. */
export type DevProfile =
  | "admin"
  | "patient-full"
  | "patient-clinical"
  | "patient-academy";

export const DEV_PROFILES: { id: DevProfile; label: string }[] = [
  { id: "admin", label: "Administrador" },
  { id: "patient-full", label: "Paciente: Clínica + Academia" },
  { id: "patient-clinical", label: "Paciente: Solo Clínica" },
  { id: "patient-academy", label: "Paciente: Solo Academia" },
];

interface UserContextValue {
  role: UserRole;
  isAdmin: boolean;
  hasClinicalAccess: boolean;
  hasAcademyAccess: boolean;
  devProfile: DevProfile;
  /** Nombre del paciente activo (para el portal). */
  patientName: string;
  setRole: (role: UserRole) => void;
  setAccess: (clinical: boolean, academy: boolean) => void;
  setClinicalAccess: (value: boolean) => void;
  setAcademyAccess: (value: boolean) => void;
  applyDevProfile: (profile: DevProfile) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

/** Paciente por defecto que se usa al testear el portal. */
const DEFAULT_PATIENT = "Elena Martín";

function accessForProfile(profile: DevProfile) {
  switch (profile) {
    case "admin":
      return { role: "admin" as UserRole, clinical: true, academy: true };
    case "patient-full":
      return { role: "patient" as UserRole, clinical: true, academy: true };
    case "patient-clinical":
      return { role: "patient" as UserRole, clinical: true, academy: false };
    case "patient-academy":
      return { role: "patient" as UserRole, clinical: false, academy: true };
    default:
      return { role: "admin" as UserRole, clinical: true, academy: true };
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin");
  const [hasClinicalAccess, setClinicalAccess] = useState(true);
  const [hasAcademyAccess, setAcademyAccess] = useState(true);
  const [devProfile, setDevProfile] = useState<DevProfile>("admin");

  const applyDevProfile = (profile: DevProfile) => {
    const { role: r, clinical, academy } = accessForProfile(profile);
    setDevProfile(profile);
    setRole(r);
    setClinicalAccess(clinical);
    setAcademyAccess(academy);
  };

  const setAccess = (clinical: boolean, academy: boolean) => {
    setClinicalAccess(clinical);
    setAcademyAccess(academy);
  };

  const logout = () => {
    applyDevProfile("admin");
  };

  const value = useMemo<UserContextValue>(
    () => ({
      role,
      isAdmin: role === "admin",
      hasClinicalAccess,
      hasAcademyAccess,
      devProfile,
      patientName: DEFAULT_PATIENT,
      setRole,
      setAccess,
      setClinicalAccess,
      setAcademyAccess,
      applyDevProfile,
      logout,
    }),
    [role, hasClinicalAccess, hasAcademyAccess, devProfile],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
