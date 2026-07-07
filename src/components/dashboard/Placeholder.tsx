import { Search, Bell, type LucideIcon } from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Dashboard.module.css";
import placeholder from "./Placeholder.module.css";

interface PlaceholderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  message: string;
}

export function Placeholder({ title, subtitle, icon: Icon, message }: PlaceholderProps) {
  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>{title}</h1>
            <p className={styles.greetingSub}>{subtitle}</p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.search}>
              <Search size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar…"
                aria-label="Buscador global"
              />
            </div>
            <button type="button" className={styles.iconButton} aria-label="Notificaciones">
              <Bell size={19} />
            </button>
          </div>
        </header>

        <div className={placeholder.wrap}>
          <span className={placeholder.icon}>
            <Icon size={28} strokeWidth={1.8} />
          </span>
          <span className={placeholder.title}>Próximamente</span>
          <p className={placeholder.text}>{message}</p>
        </div>
      </main>
    </div>
  );
}
