import { Link } from "@tanstack/react-router";
import { ChevronLeft, GraduationCap, PauseCircle, Trash2 } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useAccess } from "../../context/AccessContext";
import styles from "./Ajustes.module.css";
import academia from "./Academia.module.css";

export function AcademiaStudents() {
  const { students, deactivateStudent, removeStudent } = useAccess();

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
                        {s.coursesEnrolled} curso
                        {s.coursesEnrolled === 1 ? "" : "s"}
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
                          <button
                            type="button"
                            className={styles.rowAction}
                            onClick={() => deactivateStudent(s.id)}
                            disabled={!s.academia}
                            aria-label={`Dar de baja a ${s.name}`}
                            title={
                              s.academia
                                ? "Dar de baja (desactivar acceso a Academia)"
                                : "Alumno ya inactivo"
                            }
                          >
                            <PauseCircle size={16} strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.rowAction} ${academia.rowActionDanger}`}
                            onClick={() => removeStudent(s.id)}
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
    </div>
  );
}
