import { FlaskConical } from "lucide-react";
import { useUser, DEV_PROFILES, type DevProfile } from "../../context/UserContext";
import styles from "./DevSwitcher.module.css";

export function DevSwitcher() {
  const { isAdmin, devProfile, applyDevProfile } = useUser();

  // Solo el administrador puede ver este panel de pruebas.
  if (!isAdmin) return null;

  return (
    <div className={styles.wrap} role="region" aria-label="Conmutador de desarrollo">
      <span className={styles.badge}>
        <FlaskConical size={15} strokeWidth={2.2} />
        Modo pruebas
      </span>
      <select
        className={styles.select}
        value={devProfile}
        onChange={(e) => applyDevProfile(e.target.value as DevProfile)}
        aria-label="Cambiar rol de usuario"
      >
        {DEV_PROFILES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
