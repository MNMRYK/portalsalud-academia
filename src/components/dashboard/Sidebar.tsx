import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FolderOpen,
  Settings,
  Leaf,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import styles from "./Sidebar.module.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/academia", label: "Módulo Academia", icon: GraduationCap },
  { to: "/pacientes", label: "Gestión de Pacientes", icon: Users },
  { to: "/recursos", label: "Gestor de Recursos", icon: FolderOpen },
  { to: "/ajustes", label: "Ajustes y Roles", icon: Settings },
] as const;

export function Sidebar() {
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
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={styles.navItem}
            activeProps={{ className: `${styles.navItem} ${styles.navItemActive}` }}
            activeOptions={{ exact: to === "/" }}
          >
            <Icon size={19} className={styles.navIcon} strokeWidth={2} />
            {label}
          </Link>
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
