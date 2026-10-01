import { useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Mail, Phone, BookOpen, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { useTeachers, type Teacher } from "../../context/TeachersContext";
import { useAcademy } from "../../context/AcademyContext";
import dash from "./Dashboard.module.css";
import styles from "./Profesores.module.css";

const emptyTeacher = (): Teacher => ({
  id: `t-${Date.now()}`,
  name: "",
  email: "",
  phone: "",
  specialty: "",
  bio: "",
  courseIds: [],
  status: "activo",
  joinDate: new Date().toISOString().slice(0, 10),
});

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export function Profesores() {
  const { teachers, saveTeacher, deleteTeacher, toggleStatus } = useTeachers();
  const { catalog } = useAcademy();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [toDelete, setToDelete] = useState<Teacher | null>(null);

  const courseTitle = (id: string) => catalog.find((c) => c.id === id)?.title ?? id;

  const filtered = teachers.filter((t) =>
    `${t.name} ${t.email} ${t.specialty}`.toLowerCase().includes(query.toLowerCase()),
  );

  const openNew = () => {
    setEditing(emptyTeacher());
    setIsNew(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing({ ...t });
    setIsNew(false);
    setProfile(null);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name.trim() || !/\S+@\S+\.\S+/.test(editing.email)) {
      toast.error("Indica un nombre y un email válido");
      return;
    }
    saveTeacher({ ...editing, name: editing.name.trim(), email: editing.email.trim() });
    toast.success(isNew ? "Profesor añadido" : "Profesor actualizado");
    setEditing(null);
  };

  const toggleCourse = (id: string) =>
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            courseIds: prev.courseIds.includes(id)
              ? prev.courseIds.filter((c) => c !== id)
              : [...prev.courseIds, id],
          }
        : prev,
    );

  return (
    <div className={dash.page}>
      <Sidebar />
      <main className={dash.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Profesores</h1>
            <p className={styles.sub}>Gestiona el equipo docente de la academia y sus cursos.</p>
          </div>
          <button type="button" className={styles.primaryBtn} onClick={openNew}>
            <Plus size={16} strokeWidth={2.5} /> Nuevo profesor
          </button>
        </header>

        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, email o especialidad"
            />
          </label>
          <span className={styles.count}>{filtered.length} profesores</span>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>No hay profesores que coincidan con la búsqueda.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((t) => (
              <article key={t.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.avatar}>{initials(t.name)}</span>
                  <div className={styles.cardInfo}>
                    <span className={styles.name}>{t.name}</span>
                    <span className={styles.specialty}>{t.specialty || "Sin especialidad"}</span>
                  </div>
                  <button
                    type="button"
                    className={`${styles.status} ${t.status === "activo" ? styles.statusOn : styles.statusOff}`}
                    onClick={() => toggleStatus(t.id)}
                    title="Cambiar estado"
                  >
                    {t.status === "activo" ? "Activo" : "Inactivo"}
                  </button>
                </div>
                <span className={styles.meta}>
                  <Mail size={13} /> {t.email}
                </span>
                <span className={styles.meta}>
                  <BookOpen size={13} /> {t.courseIds.length} cursos asignados
                </span>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.ghostBtn} onClick={() => setProfile(t)}>
                    <UserRound size={15} /> Ver perfil
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={`Editar ${t.name}`}
                    onClick={() => openEdit(t)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${styles.iconDanger}`}
                    aria-label={`Eliminar ${t.name}`}
                    onClick={() => setToDelete(t)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {profile && (
        <div className={styles.overlay} onClick={() => setProfile(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.close} onClick={() => setProfile(null)} aria-label="Cerrar">
              <X size={18} />
            </button>
            <div className={styles.profileHead}>
              <span className={`${styles.avatar} ${styles.avatarLg}`}>{initials(profile.name)}</span>
              <div>
                <h2 className={styles.modalTitle}>{profile.name}</h2>
                <span className={styles.specialty}>{profile.specialty}</span>
              </div>
            </div>
            <p className={styles.bio}>{profile.bio || "Sin biografía."}</p>
            <span className={styles.meta}><Mail size={13} /> {profile.email}</span>
            <span className={styles.meta}><Phone size={13} /> {profile.phone || "—"}</span>
            <span className={styles.meta}>
              Alta: {new Date(`${profile.joinDate}T00:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <h3 className={styles.sectionLabel}>Cursos que imparte</h3>
            {profile.courseIds.length ? (
              <ul className={styles.courseList}>
                {profile.courseIds.map((id) => (
                  <li key={id}>{courseTitle(id)}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.bio}>Todavía no tiene cursos asignados.</p>
            )}
            <div className={styles.modalActions}>
              <button type="button" className={styles.primaryBtn} onClick={() => openEdit(profile)}>
                <Pencil size={15} /> Editar perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.close} onClick={() => setEditing(null)} aria-label="Cerrar">
              <X size={18} />
            </button>
            <h2 className={styles.modalTitle}>{isNew ? "Nuevo profesor" : "Editar profesor"}</h2>
            <div className={styles.formRow}>
              <label className={styles.field}>
                Nombre completo
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </label>
              <label className={styles.field}>
                Especialidad
                <input value={editing.specialty} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} />
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.field}>
                Email
                <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </label>
              <label className={styles.field}>
                Teléfono
                <input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </label>
            </div>
            <label className={styles.field}>
              Biografía
              <textarea rows={3} value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
            </label>
            <span className={styles.sectionLabel}>Cursos asignados</span>
            <div className={styles.chips}>
              {catalog.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.chip} ${editing.courseIds.includes(c.id) ? styles.chipOn : ""}`}
                  onClick={() => toggleCourse(c.id)}
                >
                  {c.title}
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button type="button" className={styles.primaryBtn} onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {toDelete && (
        <div className={styles.overlay} onClick={() => setToDelete(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>¿Eliminar a {toDelete.name}?</h2>
            <p className={styles.bio}>Perderá el rol de profesor y se desvinculará de sus cursos.</p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => setToDelete(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={`${styles.primaryBtn} ${styles.dangerBtn}`}
                onClick={() => {
                  deleteTeacher(toDelete.id);
                  toast.success("Profesor eliminado");
                  setToDelete(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
