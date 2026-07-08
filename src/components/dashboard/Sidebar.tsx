import { useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FolderOpen,
  Settings,
  Leaf,
  LogOut,
  Home,
  ClipboardList,
  FolderHeart,
  BookOpen,
  Compass,
  Video,
  Library,
  CreditCard,
  UserRound,
  Lock,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useUser } from "../../context/UserContext";
import { UpsellModal, type UpsellVariant } from "./UpsellModal";
import { SupportModal } from "./SupportModal";
import styles from "./Sidebar.module.css";

const adminNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/academia", label: "Módulo Academia", icon: GraduationCap },
  { to: "/pacientes", label: "Gestión de Pacientes", icon: Users },
  { to: "/recursos", label: "Gestor de Recursos", icon: FolderOpen },
  { to: "/ajustes", label: "Ajustes y Roles", icon: Settings },
] as const;

interface PatientLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

const clinicalLinks: PatientLink[] = [
  { to: "/portal", label: "Mi Dashboard", icon: Home },
  { to: "/portal/plan", label: "Plan de Acción", icon: ClipboardList },
  { to: "/portal/recursos-clinicos", label: "Recursos Clínicos", icon: FolderHeart },
];

const academyLinks: PatientLink[] = [
  { to: "/academia", label: "Mis Cursos", icon: BookOpen },
  { to: "/academia/explorar", label: "Explorar Cursos", icon: Compass },
  { to: "/academia/directo", label: "Clases en Directo", icon: Video },
  { to: "/academia/recursos", label: "Recursos Académicos", icon: Library },
];

const settingsLinks: PatientLink[] = [
  { to: "/portal/suscripciones", label: "Mis Suscripciones y Pagos", icon: CreditCard },
  { to: "/portal/perfil", label: "Mi Perfil", icon: UserRound },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean } = {}) {
  const { isAdmin, hasClinicalAccess, hasAcademyAccess, logout } = useUser();
  const [upsell, setUpsell] = useState<UpsellVariant | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
      >
        <div className={styles.brand}>
          <div className={styles.logoMark}>
            <Leaf size={22} strokeWidth={2.2} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>Nutralia</span>
            <span className={styles.brandTag}>Salud Integrativa</span>
          </div>
        </div>

        <div className={styles.navScroll}>
        {isAdmin ? (
          <>
            <span className={styles.navGroupLabel}>Espacio de trabajo</span>
            <nav className={styles.nav}>
              {adminNav.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={styles.navItem}
                  activeProps={{
                    className: `${styles.navItem} ${styles.navItemActive}`,
                  }}
                  activeOptions={{ exact: to === "/" }}
                >
                  <Icon size={19} className={styles.navIcon} strokeWidth={2} />
                  {label}
                </Link>
              ))}
            </nav>
          </>
        ) : (
          <nav className={styles.nav}>
            {/* Bloque: Portal Clínico */}
            <span className={styles.navGroupLabel}>Portal Clínico</span>
            {hasClinicalAccess ? (
              clinicalLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={styles.navItem}
                  activeProps={{
                    className: `${styles.navItem} ${styles.navItemActive}`,
                  }}
                  activeOptions={{ exact: to === "/portal" }}
                >
                  <Icon size={19} className={styles.navIcon} strokeWidth={2} />
                  {label}
                </Link>
              ))
            ) : (
              <button
                type="button"
                className={`${styles.navItem} ${styles.navItemLocked}`}
                onClick={() => setUpsell("clinical")}
              >
                <Lock size={18} className={styles.navIcon} strokeWidth={2} />
                Portal de Salud
                <span className={styles.lockPill}>Bloqueado</span>
              </button>
            )}

            {/* Bloque: Academia */}
            <span className={styles.navGroupLabel}>Academia</span>
            {hasAcademyAccess ? (
              academyLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={styles.navItem}
                  activeProps={{
                    className: `${styles.navItem} ${styles.navItemActive}`,
                  }}
                  activeOptions={{ exact: to === "/academia" }}
                >
                  <Icon size={19} className={styles.navIcon} strokeWidth={2} />
                  {label}
                </Link>
              ))
            ) : (
              <button
                type="button"
                className={`${styles.navItem} ${styles.navItemLocked}`}
                onClick={() => setUpsell("academy")}
              >
                <Lock size={18} className={styles.navIcon} strokeWidth={2} />
                Academia
                <span className={styles.lockPill}>Bloqueado</span>
              </button>
            )}

            {/* Bloque: Ajustes */}
            <span className={styles.navGroupLabel}>Ajustes</span>
            {settingsLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={styles.navItem}
                activeProps={{
                  className: `${styles.navItem} ${styles.navItemActive}`,
                }}
              >
                <Icon size={19} className={styles.navIcon} strokeWidth={2} />
                {label}
              </Link>
            ))}
            <button
              type="button"
              className={styles.navItem}
              onClick={() => setSupportOpen(true)}
            >
              <HelpCircle size={19} className={styles.navIcon} strokeWidth={2} />
              Ayuda y Soporte
            </button>
          </nav>
        )}
        </div>



        <div className={styles.footer}>
          <div className={styles.profile}>
            <div className={styles.avatar}>{isAdmin ? "SR" : "EM"}</div>
            <div className={styles.profileText}>
              <span className={styles.profileName}>
                {isAdmin ? "Sara Ruiz" : "Elena Martín"}
              </span>
              <span className={styles.profileRole}>
                {isAdmin ? "Administradora" : "Paciente"}
              </span>
            </div>
            <button
              type="button"
              className={styles.profileLogout}
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={17} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </aside>

      <UpsellModal variant={upsell} onClose={() => setUpsell(null)} />
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
