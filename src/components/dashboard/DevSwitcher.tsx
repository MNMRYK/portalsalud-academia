import { useState } from "react";
import { FlaskConical, Eye, EyeOff } from "lucide-react";
import { useUser, DEV_PROFILES, type DevProfile } from "../../context/UserContext";
import styles from "./DevSwitcher.module.css";

export function DevSwitcher() {
  const { isAdmin, devProfile, applyDevProfile } = useUser();
  const [isHidden, setIsHidden] = useState(false);

  // Solo el administrador puede ver este panel de pruebas.
  if (!isAdmin) return null;

  if (isHidden) {
    return (
      <button
        type="button"
        className={styles.minimized}
        onClick={() => setIsHidden(false)}
        aria-label="Mostrar conmutador de desarrollo"
        title="Modo pruebas"
      >
        <FlaskConical size={16} strokeWidth={2.2} />
      </button>
    );
  }

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
      <button
        type="button"
        className={styles.hideBtn}
        onClick={() => setIsHidden(true)}
        aria-label="Ocultar conmutador de desarrollo"
        title="Ocultar"
      >
        <EyeOff size={15} strokeWidth={2.2} />
      </button>
    </div>
  );
}
