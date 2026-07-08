import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  GraduationCap,
  PauseCircle,
  RotateCcw,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAccess, type AccessRecord } from "../../context/AccessContext";
import styles from "./Ajustes.module.css";
import academia from "./Academia.module.css";

export function AcademiaStudents() {
  const { students, deactivateStudent, reactivateStudent, removeStudent } =
    useAccess();

  // Modal de baja / reactivación (confirmación simple)
  const [deactivateTarget, setDeactivateTarget] = useState<AccessRecord | null>(
    null,
  );
  const [reactivateTarget, setReactivateTarget] = useState<AccessRecord | null>(
    null,
  );

  // Modal de eliminación estricta (requiere escribir "ELIMINAR")
  const [deleteTarget, setDeleteTarget] = useState<AccessRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteConfirm("");
  };

  const confirmDeactivate = () => {
    if (deactivateTarget) deactivateStudent(deactivateTarget.id);
    setDeactivateTarget(null);
  };

  const confirmReactivate = () => {
    if (reactivateTarget) reactivateStudent(reactivateTarget.id);
    setReactivateTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget && deleteConfirm.trim() === "ELIMINAR") {
      removeStudent(deleteTarget.id);
      closeDelete();
    }
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <Link to="/academia" className={academia.backLink}>
          <ChevronLeft size={18} strokeWidth={2.2} /> Volver al Módulo Academia
        </Link>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Alumnos</h1>
            <p className={styles.titleSub}>
              Administra el acceso de los alumnos a la Academia. Los cambios se
              sincronizan con Facturación y Accesos.
            </p>
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.cardHeadRow}>
            <div>
              <h2 className={styles.cardTitle}>Alumnos inscritos</h2>
              <p className={styles.cardSub}>
                {students.length} alumno{students.length === 1 ? "" : "s"} en la
                comunidad.
              </p>
            </div>
          </div>

          <div className={styles.tableWrap}>
            {students.length === 0 ? (
              <div className={academia.studentsEmpty}>
                <span className={academia.studentsEmptyIcon}>
                  <GraduationCap size={26} strokeWidth={1.7} />
                </span>
                <p>No hay alumnos activos en la Academia.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre / Email</th>
                    <th>Fecha de alta</th>
                    <th>Cursos inscritos</th>
                    <th>Estado</th>
                    <th className={styles.thRight}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <span className={styles.logUser}>
                          <span
                            className={`${styles.logAvatar} ${styles[s.avatar]}`}
                          >
                            {s.initials}
                          </span>
                          <span className={academia.studentIdentity}>
                            <span className={academia.studentName}>{s.name}</span>
                            <span className={academia.studentEmail}>
                              {s.email}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className={styles.logTime}>{s.joinDate}</td>
                      <td className={styles.logDoc}>
                        {s.coursesEnrolled > 0 ? (
                          <span
                            className={academia.coursesCell}
                            title={s.courses.join(", ")}
                          >
                            {s.coursesEnrolled} curso
                            {s.coursesEnrolled === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <>0 cursos</>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${styles.stateBadge} ${s.academia ? "" : academia.stateInactive}`}
                        >
                          <span
                            className={`${styles.stateDot} ${s.academia ? "" : academia.stateDotInactive}`}
                          />
                          {s.academia ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className={styles.tdRight}>
                        <div className={academia.studentActions}>
                          {s.academia ? (
                            <button
                              type="button"
                              className={styles.rowAction}
                              onClick={() => setDeactivateTarget(s)}
                              aria-label={`Dar de baja a ${s.name}`}
                              title="Dar de baja (revocar acceso a Academia)"
                            >
                              <PauseCircle size={16} strokeWidth={2} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={`${styles.rowAction} ${academia.rowActionSuccess}`}
                              onClick={() => setReactivateTarget(s)}
                              aria-label={`Reactivar a ${s.name}`}
                              title="Reactivar (restaurar acceso a Academia)"
                            >
                              <RotateCcw size={16} strokeWidth={2} />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${styles.rowAction} ${academia.rowActionDanger}`}
                            onClick={() => setDeleteTarget(s)}
                            aria-label={`Eliminar a ${s.name} de la lista`}
                            title="Eliminar de la lista de alumnos"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* ── Modal: Dar de baja (confirmación simple) ── */}
      {deactivateTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDeactivateTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 id="deactivate-title" className={styles.modalTitle}>
                Revocar acceso a la Academia
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setDeactivateTarget(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>
            <div className={styles.modalBody}>
              <p className={academia.confirmText}>
                ¿Estás seguro de que quieres revocar el acceso a la academia para{" "}
                <strong>{deactivateTarget.name}</strong>? El alumno pasará a estado
                inactivo, pero podrás reactivarlo cuando quieras.
              </p>
            </div>
            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setDeactivateTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={academia.confirmButton}
                onClick={confirmDeactivate}
              >
                <PauseCircle size={16} /> Confirmar baja
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ── Modal: Reactivar (confirmación simple) ── */}
      {reactivateTarget && (
        <div
          className={styles.modalOverlay}
          onClick={() => setReactivateTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reactivate-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 id="reactivate-title" className={styles.modalTitle}>
                Restaurar acceso a la Academia
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setReactivateTarget(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>
            <div className={styles.modalBody}>
              <p className={academia.confirmText}>
                ¿Deseas restaurar el acceso a la academia para{" "}
                <strong>{reactivateTarget.name}</strong>? Volverá a estado activo
                de forma inmediata.
              </p>
            </div>
            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setReactivateTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={academia.confirmButton}
                onClick={confirmReactivate}
              >
                <RotateCcw size={16} /> Restaurar acceso
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ── Modal: Eliminar alumno (confirmación estricta) ── */}
      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={closeDelete}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-student-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2 id="delete-student-title" className={academia.modalTitleDanger}>
                ¿Eliminar alumno de la lista?
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeDelete}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>
            <div className={styles.modalBody}>
              <div className={academia.dangerBox}>
                <AlertTriangle size={20} className={academia.dangerIcon} />
                <p className={academia.dangerText}>
                  Vas a eliminar a <strong>{deleteTarget.name}</strong> de la
                  lista de alumnos y su acceso a la Academia quedará desactivado.
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className={styles.fieldGroup}>
                <label
                  className={styles.fieldLabel}
                  htmlFor="delete-student-confirm"
                >
                  Escribe <strong>ELIMINAR</strong> para confirmar
                </label>
                <input
                  id="delete-student-confirm"
                  type="text"
                  className={styles.textInput}
                  placeholder="ELIMINAR"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={closeDelete}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={academia.dangerButton}
                onClick={confirmDelete}
                disabled={deleteConfirm.trim() !== "ELIMINAR"}
              >
                <Trash2 size={16} /> Sí, eliminar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
