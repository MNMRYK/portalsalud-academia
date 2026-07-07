import { useState } from "react";
import {
  Bell,
  X,
  FileUp,
  GraduationCap,
  CalendarCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import styles from "./NotificationBell.module.css";

interface Activity {
  id: number;
  icon: LucideIcon;
  tone: "terracota" | "plum" | "sage";
  text: string;
  time: string;
  unread: boolean;
}

const activities: Activity[] = [
  {
    id: 1,
    icon: FileUp,
    tone: "terracota",
    text: "Elena Martín ha subido un archivo a su ficha.",
    time: "Hace 8 min",
    unread: true,
  },
  {
    id: 2,
    icon: GraduationCap,
    tone: "plum",
    text: "Marcos ha completado el Módulo 1 de la Academia.",
    time: "Hace 1 h",
    unread: true,
  },
  {
    id: 3,
    icon: CalendarCheck,
    tone: "sage",
    text: "Lucía Fernández ha confirmado su cita del jueves.",
    time: "Hace 3 h",
    unread: false,
  },
  {
    id: 4,
    icon: UserPlus,
    tone: "plum",
    text: "Javier Morán ha aceptado su invitación al portal.",
    time: "Ayer",
    unread: false,
  },
];

const toneClass: Record<Activity["tone"], string> = {
  terracota: styles.iconTerracota,
  plum: styles.iconPlum,
  sage: styles.iconSage,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = activities.filter((a) => a.unread).length;

  return (
    <>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setOpen(true)}
        aria-label="Bandeja de actividad"
      >
        <Bell size={19} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <aside
            className={styles.drawer}
            role="dialog"
            aria-label="Bandeja de actividad"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drawerHead}>
              <div>
                <h2 className={styles.drawerTitle}>Bandeja de Actividad</h2>
                <p className={styles.drawerSub}>Alertas automáticas de tu clínica</p>
              </div>
              <button
                type="button"
                className={styles.drawerClose}
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.list}>
              {activities.map(({ id, icon: Icon, tone, text, time, unread }) => (
                <div
                  key={id}
                  className={`${styles.item} ${unread ? styles.itemUnread : ""}`}
                >
                  <span className={`${styles.itemIcon} ${toneClass[tone]}`}>
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <div className={styles.itemBody}>
                    <p className={styles.itemText}>{text}</p>
                    <span className={styles.itemTime}>{time}</span>
                  </div>
                  {unread && <span className={styles.unreadDot} />}
                </div>
              ))}
            </div>

            <button type="button" className={styles.markAll}>
              Marcar todo como leído
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
