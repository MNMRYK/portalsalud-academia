import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Plus,
  Calendar,
  Users,
  FileText,
  Pencil,
  Trash2,
  Send,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { AssignFormModal } from "./AssignFormModal";
import styles from "./Formularios.module.css";

interface Template {
  id: string;
  title: string;
  updatedAt: string;
  assignedCount: number;
  questionCount: number;
}

const initialTemplates: Template[] = [
  {
    id: "tpl-1",
    title: "Seguimiento Mensual Fase 2",
    updatedAt: "10/07/2026",
    assignedCount: 14,
    questionCount: 12,
  },
  {
    id: "tpl-2",
    title: "Cuestionario de Hábitos Inicial",
    updatedAt: "05/07/2026",
    assignedCount: 8,
    questionCount: 22,
  },
  {
    id: "tpl-3",
    title: "Evaluación de Síntomas y Bienestar",
    updatedAt: "28/06/2026",
    assignedCount: 0,
    questionCount: 18,
  },
];

export function FormDashboard() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [assignTemplate, setAssignTemplate] = useState<Template | null>(null);

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              <h1 className={styles.title}>Gestión de Formularios</h1>
              <p className={styles.titleSub}>
                Crea, edita y asigna plantillas de seguimiento a tus pacientes.
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <Link to="/formularios/nueva" className={styles.newTemplateButton}>
              <Plus size={18} strokeWidth={2.5} />
              Nueva Plantilla
            </Link>
            <NotificationBell />
          </div>
        </header>

        <section className={styles.templateGrid}>
          {templates.map((template) => (
            <article key={template.id} className={styles.templateCard}>
              <div className={styles.templateCardHeader}>
                <div className={styles.templateIcon}>
                  <FileText size={22} strokeWidth={2} />
                </div>
                <div className={styles.templateMeta}>
                  <h2 className={styles.templateTitle}>{template.title}</h2>
                  <span className={styles.templateDate}>
                    <Calendar size={13} />
                    Actualizado el {template.updatedAt}
                  </span>
                </div>
              </div>

              <div className={styles.templateStats}>
                <span className={styles.templateStat}>
                  <Users size={14} />
                  Asignado a {template.assignedCount} paciente
                  {template.assignedCount === 1 ? "" : "s"}
                </span>
                <span className={styles.templateStat}>
                  <FileText size={14} />
                  {template.questionCount} preguntas
                </span>
              </div>

              <div className={styles.templateActions}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setAssignTemplate(template)}
                  aria-label="Asignar"
                  title="Asignar"
                >
                  <Send size={16} />
                </button>
                <Link
                  to="/formularios/nueva"
                  className={styles.actionButton}
                  aria-label="Editar plantilla"
                  title="Editar plantilla"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  type="button"
                  className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                  onClick={() => handleDelete(template.id)}
                  aria-label="Eliminar"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}

          {templates.length === 0 && (
            <div className={styles.emptyState}>
              <FileText size={40} strokeWidth={1.5} />
              <p className={styles.emptyStateTitle}>
                No hay plantillas creadas
              </p>
              <p className={styles.emptyStateText}>
                Crea tu primera plantilla para empezar a recoger seguimientos.
              </p>
              <Link to="/formularios/nueva" className={styles.primaryButton}>
                <Plus size={18} />
                Crear plantilla
              </Link>
            </div>
          )}
        </section>
      </main>

      <AssignFormModal
        open={assignTemplate !== null}
        formTitle={assignTemplate?.title ?? ""}
        onClose={() => setAssignTemplate(null)}
      />
    </div>
  );
}
