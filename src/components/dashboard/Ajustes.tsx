import { useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Upload,
  FileText,
  Plus,
  X,
  MoreVertical,
  HardDrive,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import styles from "./Ajustes.module.css";

type TabId = "general" | "equipo" | "seguridad" | "suscripcion";

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "equipo", label: "Equipo", icon: Users },
  { id: "seguridad", label: "Seguridad y Auditoría", icon: ShieldCheck },
  { id: "suscripcion", label: "Suscripción y Estado", icon: CreditCard },
];

const legalDocs = [
  { name: "Política de Protección de Datos (RGPD)", meta: "PDF · actualizado 12 mar 2026", uploaded: true },
  { name: "Consentimiento Informado", meta: "Pendiente de subida", uploaded: false },
];

const team = [
  { name: "Sara Ruiz", email: "sara@nutralia.es", role: "Admin", initials: "SR", av: styles.avPlum, state: "Activo", pending: false },
  { name: "Elena Martín", email: "elena@nutralia.es", role: "Nutricionista", initials: "EM", av: styles.avSage, state: "Activo", pending: false },
  { name: "Carlos Vidal", email: "carlos@nutralia.es", role: "Administrativo", initials: "CV", av: styles.avTerracota, state: "Activo", pending: false },
  { name: "Nuria Sanz", email: "nuria@nutralia.es", role: "Nutricionista", initials: "NS", av: styles.avPlum, state: "Invitación enviada", pending: true },
];

const logs = [
  { user: "Elena Martín", initials: "EM", av: styles.avSage, action: "Subió un documento", doc: "Dieta_LauraG.pdf", time: "07 jul 2026 · 10:24" },
  { user: "Sara Ruiz", initials: "SR", av: styles.avPlum, action: "Editó ficha clínica", doc: "Marc Puig", time: "07 jul 2026 · 09:58" },
  { user: "Carlos Vidal", initials: "CV", av: styles.avTerracota, action: "Invitó a un miembro", doc: "nuria@nutralia.es", time: "06 jul 2026 · 17:41" },
  { user: "Elena Martín", initials: "EM", av: styles.avSage, action: "Eliminó un recurso", doc: "Menú_v1.pdf", time: "06 jul 2026 · 12:03" },
  { user: "Sara Ruiz", initials: "SR", av: styles.avPlum, action: "Actualizó datos legales", doc: "RGPD.pdf", time: "05 jul 2026 · 08:30" },
];

export function Ajustes() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [primaryColor, setPrimaryColor] = useState("#d47f65");
  const [secondaryColor, setSecondaryColor] = useState("#875c80");
  const [isInviteOpen, setInviteOpen] = useState(false);

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Ajustes y Roles</h1>
            <p className={styles.titleSub}>
              Panel de control central de la clínica: identidad, equipo y seguridad.
            </p>
          </div>
          <NotificationBell />
        </header>

        <div className={styles.layout}>
          {/* Vertical tabs */}
          <nav className={styles.tabs}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={18} className={styles.tabIcon} strokeWidth={2} />
                {label}
              </button>
            ))}
          </nav>

          <div className={styles.content}>
            {activeTab === "general" && (
              <>
                <section className={styles.card}>
                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>Identidad de la clínica</h2>
                    <p className={styles.cardSub}>
                      Datos legales, logotipo y colores de marca.
                    </p>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Nombre legal</label>
                      <input className={styles.textInput} defaultValue="Nutralia Salud Integrativa S.L." />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>NIF / CIF</label>
                      <input className={styles.textInput} defaultValue="B-12345678" />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fieldSpan2}`}>
                      <label className={styles.fieldLabel}>Dirección</label>
                      <input
                        className={styles.textInput}
                        defaultValue="Carrer de la Salut, 24 · 08012 Barcelona"
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Logotipo</label>
                      <div className={styles.logoRow}>
                        <span className={styles.logoPreview}>
                          <Building2 size={26} strokeWidth={1.9} />
                        </span>
                        <div>
                          <label className={styles.uploadButton}>
                            <Upload size={16} strokeWidth={2} /> Subir logo
                            <input type="file" accept="image/*" hidden />
                          </label>
                          <p className={styles.hint}>PNG o SVG · máx. 2MB</p>
                        </div>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Colores de marca</label>
                      <div className={styles.colorRow}>
                        <span className={styles.colorSwatch} style={{ backgroundColor: primaryColor }}>
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            aria-label="Color primario"
                          />
                        </span>
                        <span className={styles.colorValue}>{primaryColor}</span>
                        <span className={styles.colorSwatch} style={{ backgroundColor: secondaryColor }}>
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            aria-label="Color secundario"
                          />
                        </span>
                        <span className={styles.colorValue}>{secondaryColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>Documentación legal</h2>
                    <p className={styles.cardSub}>
                      Sube los documentos que tus pacientes deben conocer y aceptar.
                    </p>
                  </div>

                  <div className={styles.docList}>
                    {legalDocs.map((doc) => (
                      <div key={doc.name} className={styles.docRow}>
                        <span className={styles.docIcon}>
                          <FileText size={20} strokeWidth={1.9} />
                        </span>
                        <div className={styles.docInfo}>
                          <div className={styles.docName}>{doc.name}</div>
                          <div className={styles.docMeta}>{doc.meta}</div>
                        </div>
                        <span
                          className={`${styles.docStatus} ${doc.uploaded ? styles.statusUploaded : styles.statusPending}`}
                        >
                          {doc.uploaded ? "Subido" : "Pendiente"}
                        </span>
                        <label className={styles.uploadSmall}>
                          <Upload size={14} strokeWidth={2} /> Subir PDF
                          <input type="file" accept="application/pdf" hidden />
                        </label>
                      </div>
                    ))}
                  </div>

                  <label className={styles.toggleRow}>
                    <div className={styles.toggleContent}>
                      <div className={styles.toggleLabel}>Obligar a aceptar en primer acceso</div>
                      <div className={styles.toggleHint}>
                        El paciente deberá aceptar estos documentos antes de entrar a su portal.
                      </div>
                    </div>
                    <span className={styles.toggleSwitch}>
                      <input type="checkbox" defaultChecked />
                      <span className={styles.toggleTrack} />
                    </span>
                  </label>

                  <div className={styles.saveRow}>
                    <button type="button" className={styles.primaryButton}>
                      Guardar cambios
                    </button>
                  </div>
                </section>
              </>
            )}

            {activeTab === "equipo" && (
              <section className={styles.card}>
                <div className={styles.cardHeadRow}>
                  <div>
                    <h2 className={styles.cardTitle}>Equipo de la clínica</h2>
                    <p className={styles.cardSub}>Gestiona los miembros y sus roles de acceso.</p>
                  </div>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setInviteOpen(true)}
                  >
                    <Plus size={18} strokeWidth={2.5} /> Invitar nuevo miembro
                  </button>
                </div>

                <div className={styles.teamList}>
                  {team.map((m) => (
                    <div key={m.email} className={styles.teamRow}>
                      <span className={`${styles.teamAvatar} ${m.av}`}>{m.initials}</span>
                      <div className={styles.teamInfo}>
                        <div className={styles.teamName}>{m.name}</div>
                        <div className={styles.teamEmail}>{m.email}</div>
                      </div>
                      <span
                        className={`${styles.roleBadge} ${m.role === "Admin" ? styles.roleAdmin : ""}`}
                      >
                        {m.role}
                      </span>
                      <span className={`${styles.stateBadge} ${m.pending ? styles.statePending : ""}`}>
                        <span className={styles.stateDot} />
                        {m.state}
                      </span>
                      <button type="button" className={styles.rowAction} aria-label="Opciones">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "seguridad" && (
              <section className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>Registro de auditoría</h2>
                  <p className={styles.cardSub}>
                    Historial de acciones realizadas por el equipo.
                  </p>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Acción</th>
                        <th>Documento afectado</th>
                        <th>Fecha / Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => (
                        <tr key={i}>
                          <td>
                            <span className={styles.logUser}>
                              <span className={`${styles.logAvatar} ${log.av}`}>{log.initials}</span>
                              {log.user}
                            </span>
                          </td>
                          <td className={styles.logAction}>{log.action}</td>
                          <td className={styles.logDoc}>{log.doc}</td>
                          <td className={styles.logTime}>{log.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === "suscripcion" && (
              <section className={styles.card}>
                <div className={styles.planHead}>
                  <h2 className={styles.planName}>
                    Plan Clínica Pro
                    <span className={styles.planBadge}>Activo</span>
                  </h2>
                  <button type="button" className={styles.primaryButton}>
                    <CreditCard size={18} strokeWidth={2} /> Gestionar plan
                  </button>
                </div>

                <div className={styles.metricGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>
                      <HardDrive size={13} strokeWidth={2} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                      Almacenamiento
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: "64%" }} />
                    </div>
                    <div className={styles.progressMeta}>32 GB de 50 GB utilizados</div>
                  </div>

                  <div className={styles.metricCard}>
                    <div className={styles.metricLabel}>
                      <UserCheck size={13} strokeWidth={2} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                      Pacientes activos
                    </div>
                    <div>
                      <span className={styles.metricValue}>148</span>
                      <span className={styles.metricUnit}>/ 200 incluidos</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: "74%" }} />
                    </div>
                    <div className={styles.progressMeta}>74% de tu cupo de pacientes</div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Invite modal */}
      {isInviteOpen && (
        <div className={styles.modalOverlay} onClick={() => setInviteOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Invitar nuevo miembro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Invitar nuevo miembro</h2>
                <p className={styles.modalSub}>
                  Enviaremos un correo con acceso al panel de la clínica.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setInviteOpen(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Correo electrónico</label>
                <input className={styles.textInput} type="email" placeholder="nombre@nutralia.es" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Rol</label>
                <select className={styles.selectPlain} defaultValue="Nutricionista">
                  <option>Admin</option>
                  <option>Nutricionista</option>
                  <option>Administrativo</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setInviteOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setInviteOpen(false)}
              >
                Enviar invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
