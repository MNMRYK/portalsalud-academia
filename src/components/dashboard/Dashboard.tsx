import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Plus,
  BookOpen,
  UserPlus,
  Video,
  ArrowRight,
  LineChart,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { AddPatientModal } from "./AddPatientModal";
import styles from "./Dashboard.module.css";

const quickActions = [
  {
    id: "leccion",
    title: "Añadir Lección a la Academia",
    desc: "Sube un nuevo vídeo o material formativo a tus cursos.",
    icon: BookOpen,
    iconClass: styles.iconTerracota,
  },
  {
    id: "paciente",
    title: "Nueva Ficha de Paciente",
    desc: "Registra un paciente y comienza su historial clínico.",
    icon: UserPlus,
    iconClass: styles.iconPlum,
  },
  {
    id: "clase",
    title: "Crear Clase en Directo",
    desc: "Programa una sesión en vivo para tu comunidad.",
    icon: Video,
    iconClass: styles.iconSage,
  },
];

const patients = [
  {
    name: "Lucía Fernández",
    meta: "Última visita hace 3 días",
    initials: "LF",
    avClass: styles.avPlum,
    status: "Fase 2: Reducción de inflamación",
    statusClass: styles.statusPlum,
  },
  {
    name: "Marcos Iglesias",
    meta: "Última visita hace 1 semana",
    initials: "MI",
    avClass: styles.avSage,
    status: "Fase 3: Mantenimiento",
    statusClass: styles.statusSage,
  },
  {
    name: "Elena Torres",
    meta: "Última visita ayer",
    initials: "ET",
    avClass: styles.avTerracota,
    status: "Fase 1: Evaluación inicial",
    statusClass: styles.statusTerracota,
  },
  {
    name: "Javier Morán",
    meta: "Última visita hace 2 días",
    initials: "JM",
    avClass: styles.avLilac,
    status: "Seguimiento: Ajuste de pauta",
    statusClass: styles.statusLilac,
  },
];

export function Dashboard() {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Hola, Sara</h1>
            <p className={styles.greetingSub}>
              Este es el resumen de tu clínica de salud integrativa hoy.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.search}>
              <Search size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar pacientes, lecciones, recursos…"
                aria-label="Buscador global"
              />
            </div>
            <NotificationBell />
          </div>
        </header>

        <h2 className={styles.sectionTitle}>Acciones rápidas</h2>
        <section className={styles.quickGrid}>
          {quickActions.map(({ id, title, desc, icon: Icon, iconClass }) => (
            <button
              key={title}
              type="button"
              className={styles.quickCard}
              onClick={
                id === "paciente"
                  ? () => setIsPatientModalOpen(true)
                  : undefined
              }
            >
              <span className={`${styles.quickIcon} ${iconClass}`}>
                <Icon size={22} strokeWidth={2} />
              </span>
              <span className={styles.quickCardTitle}>{title}</span>
              <span className={styles.quickCardDesc}>{desc}</span>
              <span className={styles.quickCardLink}>
                <Plus size={15} strokeWidth={2.5} /> Empezar
              </span>
            </button>
          ))}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.sectionTitle}>Evolución reciente</h2>
            <button type="button" className={styles.linkButton}>
              Ver todos los pacientes
            </button>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Estado del tratamiento</th>
                <th className={styles.actionCell}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.name}>
                  <td>
                    <div className={styles.patientCell}>
                      <span className={`${styles.patientAvatar} ${p.avClass}`}>
                        {p.initials}
                      </span>
                      <span>
                        <span className={styles.patientName}>{p.name}</span>
                        <br />
                        <span className={styles.patientMeta}>{p.meta}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${p.statusClass}`}>
                      <span className={styles.dot} />
                      {p.status}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <button type="button" className={styles.secondaryButton}>
                      <LineChart size={15} />
                      Historial / Analíticas
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      <AddPatientModal
        open={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </div>
  );
}
