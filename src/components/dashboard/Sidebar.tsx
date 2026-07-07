import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FolderOpen,
  Settings,
  Leaf,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "academia", label: "Módulo Academia", icon: GraduationCap },
  { id: "pacientes", label: "Gestión de Pacientes", icon: Users },
  { id: "recursos", label: "Gestor de Recursos", icon: FolderOpen },
  { id: "ajustes", label: "Ajustes y Roles", icon: Settings },
];

export function Sidebar() {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>
          <Leaf size={22} strokeWidth={2.2} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Nutralia</span>
          <span className={styles.brandTag}>Salud Integrativa</span>
        </div>
      </div>

      <span className={styles.navGroupLabel}>Espacio de trabajo</span>
      <nav className={styles.nav}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={`${styles.navItem} ${active === id ? styles.navItemActive : ""}`}
          >
            <Icon size={19} className={styles.navIcon} strokeWidth={2} />
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.profile}>
        <div className={styles.avatar}>SR</div>
        <div className={styles.profileText}>
          <span className={styles.profileName}>Sara Ruiz</span>
          <span className={styles.profileRole}>Administradora</span>
        </div>
      </div>
    </aside>
  );
}
