import { useState } from "react";
import {
  Users,
  ShieldCheck,
  Receipt,
  Upload,
  FileText,
  Plus,
  X,
  MoreVertical,
  Eye,
  Check,
  AlertTriangle,
  Download,
  FolderOpen,
  History,
  Pencil,
  Send,
  Trash2,
  Building2,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import {
  useLegalTemplates,
  templateCategories,
  type TemplateCategory,
} from "../../context/LegalTemplatesContext";
import styles from "./Ajustes.module.css";

type TabId = "general" | "facturacion" | "equipo" | "seguridad";

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: FileText },
  { id: "facturacion", label: "Facturación y Accesos", icon: Receipt },
  { id: "equipo", label: "Equipo", icon: Users },
  { id: "seguridad", label: "Seguridad y Auditoría", icon: ShieldCheck },
];


const billing = [
  { name: "Laura García", initials: "LG", av: styles.avSage, portal: true, academia: true, payment: "01 jul 2026 · 65 €" },
  { name: "Marc Puig", initials: "MP", av: styles.avPlum, portal: true, academia: false, payment: "28 jun 2026 · 65 €" },
  { name: "Elena Soler", initials: "ES", av: styles.avTerracota, portal: false, academia: false, payment: "15 jun 2026 · 90 €" },
  { name: "David Roca", initials: "DR", av: styles.avPlum, portal: true, academia: true, payment: "02 jul 2026 · 120 €" },
  { name: "Nuria Vidal", initials: "NV", av: styles.avSage, portal: false, academia: true, payment: "20 jun 2026 · 65 €" },
];

const invoicesByPatient: Record<string, { date: string; concept: string; amount: string }[]> = {
  "Laura García": [
    { date: "01 jul 2026", concept: "Cuota mensual · Portal + Academia", amount: "65 €" },
    { date: "01 jun 2026", concept: "Cuota mensual · Portal + Academia", amount: "65 €" },
    { date: "01 may 2026", concept: "Consulta inicial + plan personalizado", amount: "120 €" },
  ],
  "Marc Puig": [
    { date: "28 jun 2026", concept: "Cuota mensual · Portal Salud", amount: "65 €" },
    { date: "28 may 2026", concept: "Cuota mensual · Portal Salud", amount: "65 €" },
  ],
  "Elena Soler": [
    { date: "15 jun 2026", concept: "Consulta de seguimiento", amount: "90 €" },
    { date: "15 may 2026", concept: "Consulta inicial", amount: "90 €" },
  ],
  "David Roca": [
    { date: "02 jul 2026", concept: "Programa trimestral completo", amount: "120 €" },
    { date: "02 abr 2026", concept: "Programa trimestral completo", amount: "120 €" },
  ],
  "Nuria Vidal": [
    { date: "20 jun 2026", concept: "Cuota mensual · Academia", amount: "65 €" },
    { date: "20 may 2026", concept: "Cuota mensual · Academia", amount: "65 €" },
  ],
};

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
  { user: "Sara Ruiz", initials: "SR", av: styles.avPlum, action: "Actualizó plantilla legal", doc: "RGPD.pdf", time: "05 jul 2026 · 08:30" },
  { user: "Elena Martín", initials: "EM", av: styles.avSage, action: "Generó documento legal", doc: "Consentimiento_MarcP.pdf", time: "05 jul 2026 · 11:12" },
  { user: "Carlos Vidal", initials: "CV", av: styles.avTerracota, action: "Registró un pago", doc: "David Roca · 120 €", time: "02 jul 2026 · 16:20" },
];

const roleOptions = ["Admin", "Nutricionista", "Administrativo"];

export function Ajustes() {
  const { templates, addTemplate, removeTemplate, toggleRequired, markUploaded } =
    useLegalTemplates();
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [isTemplateOpen, setTemplateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    category: TemplateCategory;
    format: string;
    required: boolean;
    fileName: string;
  }>({
    name: "",
    category: templateCategories[0],
    format: "PDF",
    required: false,
    fileName: "",
  });
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [invoicePatient, setInvoicePatient] = useState<string | null>(null);
  const [historyUser, setHistoryUser] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<(typeof team)[number] | null>(null);
  const [access, setAccess] = useState(() =>
    billing.map((b) => ({ portal: b.portal, academia: b.academia }))
  );
  const [identity, setIdentity] = useState({
    legalName: "Nutralia Centro de Nutrición S.L.",
    taxId: "B-12345678",
    address: "Calle de la Salud 42, 28001 Madrid",
  });

  const toggleAccess = (index: number, key: "portal" | "academia") => {
    setAccess((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: !row[key] } : row))
    );
  };

  const openUserHistory = (user: string) => {
    setOpenMenu(null);
    setHistoryUser(user);
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Panel de control · Nutralia</h1>
            <p className={styles.titleSub}>
              Plantillas legales, facturación, equipo y seguridad de la clínica.
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
                <section className={styles["settings-section"]}>
                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>Identidad de la Clínica</h2>
                    <p className={styles.cardSub}>
                      Datos corporativos y visuales que aparecerán en documentos y comunicaciones
                      oficiales.
                    </p>
                  </div>

                  <div className={styles["identity-grid"]}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Nombre legal</label>
                      <input
                        type="text"
                        className={styles.textInput}
                        value={identity.legalName}
                        onChange={(e) =>
                          setIdentity((prev) => ({ ...prev, legalName: e.target.value }))
                        }
                      />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>NIF / CIF</label>
                      <input
                        type="text"
                        className={styles.textInput}
                        value={identity.taxId}
                        onChange={(e) =>
                          setIdentity((prev) => ({ ...prev, taxId: e.target.value }))
                        }
                      />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fieldSpan2}`}>
                      <label className={styles.fieldLabel}>Dirección fiscal</label>
                      <input
                        type="text"
                        className={styles.textInput}
                        value={identity.address}
                        onChange={(e) =>
                          setIdentity((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Logo</label>
                      <div className={styles.logoRow}>
                        <div className={styles.logoPreview}>
                          <Building2 size={28} strokeWidth={1.8} />
                        </div>
                        <label className={styles.uploadButton}>
                          <Upload size={16} strokeWidth={2} /> Subir logo
                          <input type="file" accept="image/*" hidden />
                        </label>
                      </div>
                      <p className={styles.hint}>
                        Formatos recomendados: PNG o SVG con fondo transparente.
                      </p>
                    </div>

                  </div>

                  <div className={styles.saveRow}>
                    <button type="button" className={styles.primaryButton}>
                      Guardar datos corporativos
                    </button>
                  </div>
                </section>

                <section className={styles["settings-section"]}>
                  <div className={styles.cardHead}>
                    <h2 className={styles.cardTitle}>Gestión de Plantillas Legales Maestras</h2>
                    <p className={styles.cardSub}>
                      El sistema generará los documentos personalizados automáticamente. Usa las
                      etiquetas <span className={styles.tag}>[NOMBRE]</span>,{" "}
                      <span className={styles.tag}>[DNI]</span> y{" "}
                      <span className={styles.tag}>[FECHA]</span> en tus archivos para que el
                      sistema los rellene con los datos del paciente.
                    </p>
                  </div>

                  <div className={styles.docList}>
                    {legalTemplates.map((doc) => (
                      <div
                        key={doc.name}
                        className={`${styles.docRow} ${styles["document-card"]}`}
                      >
                        <span className={styles.docIcon}>
                          <FileText size={20} strokeWidth={1.9} />
                        </span>
                        <div className={styles.docInfo}>
                          <div className={styles.docName}>{doc.name}</div>
                          <div className={styles.docMeta}>{doc.format}</div>
                        </div>

                        <span
                          className={`${styles.legalStatus} ${doc.uploaded ? styles.legalOk : styles.legalMissing}`}
                        >
                          {doc.uploaded ? (
                            <>
                              <Check size={15} strokeWidth={2.6} /> Plantilla vigente
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={15} strokeWidth={2.4} /> Plantilla no cargada
                            </>
                          )}
                        </span>

                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.previewButton}
                            onClick={() => setPreviewDoc(doc.name)}
                          >
                            <Eye size={15} strokeWidth={2} /> Vista previa
                          </button>
                          <label className={styles.uploadSmall}>
                            <Upload size={14} strokeWidth={2} /> Cargar Plantilla (.docx o .pdf)
                            <input type="file" accept=".docx,application/pdf" hidden />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === "facturacion" && (
              <section className={styles.card}>
                <div className={styles.cardHeadRow}>
                  <div>
                    <h2 className={styles.cardTitle}>Estado de servicios por paciente</h2>
                    <p className={styles.cardSub}>
                      Controla los accesos y el estado de pago de cada paciente.
                    </p>
                  </div>
                  <button type="button" className={styles.primaryButton}>
                    <Download size={17} strokeWidth={2.2} /> Exportar reporte financiero
                  </button>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Acceso Portal Salud</th>
                        <th>Acceso Academia</th>
                        <th>Último pago recibido</th>
                        <th className={styles.thRight}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.map((p, i) => (
                        <tr key={p.name}>
                          <td>
                            <span className={styles.logUser}>
                              <span className={`${styles.logAvatar} ${p.av}`}>{p.initials}</span>
                              {p.name}
                            </span>
                          </td>
                          <td>
                            <label className={styles.toggleSwitch}>
                              <input
                                type="checkbox"
                                checked={access[i].portal}
                                onChange={() => toggleAccess(i, "portal")}
                              />
                              <span className={styles.toggleTrack} />
                            </label>
                          </td>
                          <td>
                            <label className={styles.toggleSwitch}>
                              <input
                                type="checkbox"
                                checked={access[i].academia}
                                onChange={() => toggleAccess(i, "academia")}
                              />
                              <span className={styles.toggleTrack} />
                            </label>
                          </td>
                          <td className={styles.logDoc}>{p.payment}</td>
                          <td className={styles.tdRight}>
                            <button
                              type="button"
                              className={styles.previewButton}
                              onClick={() => setInvoicePatient(p.name)}
                            >
                              <FolderOpen size={15} strokeWidth={2} /> Ver facturas
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
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
                      <div className={styles.menuAnchor}>
                        <button
                          type="button"
                          className={styles.rowAction}
                          aria-label="Opciones"
                          aria-haspopup="menu"
                          aria-expanded={openMenu === m.email}
                          onClick={() =>
                            setOpenMenu((cur) => (cur === m.email ? null : m.email))
                          }
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenu === m.email && (
                          <>
                            <div
                              className={styles.menuBackdrop}
                              onClick={() => setOpenMenu(null)}
                            />
                            <div className={styles.dropdownMenu} role="menu">
                              <button
                                type="button"
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setEditMember(m);
                                }}
                              >
                                <Pencil size={15} strokeWidth={2} /> Editar rol
                              </button>
                              <button
                                type="button"
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={() => openUserHistory(m.name)}
                              >
                                <History size={15} strokeWidth={2} /> Ver actividad reciente
                              </button>
                              {m.pending && (
                                <button
                                  type="button"
                                  className={styles.menuItem}
                                  role="menuitem"
                                  onClick={() => setOpenMenu(null)}
                                >
                                  <Send size={15} strokeWidth={2} /> Reenviar invitación
                                </button>
                              )}
                              <div className={styles.menuDivider} />
                              <button
                                type="button"
                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                role="menuitem"
                                onClick={() => setOpenMenu(null)}
                              >
                                <Trash2 size={15} strokeWidth={2} /> Revocar acceso
                              </button>
                            </div>
                          </>
                        )}
                      </div>
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
                        <th className={styles.thRight}>Acciones</th>
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
                          <td className={styles.tdRight}>
                            <button
                              type="button"
                              className={styles.previewButton}
                              onClick={() => setHistoryUser(log.user)}
                            >
                              <History size={15} strokeWidth={2} /> Ver actividad del miembro
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  {roleOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
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

      {/* Legal template preview modal */}
      {previewDoc && (
        <div className={styles.modalOverlay} onClick={() => setPreviewDoc(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Vista previa de plantilla"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Vista previa</h2>
                <p className={styles.modalSub}>{previewDoc}</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setPreviewDoc(null)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.previewSheet}>
                <p className={styles.previewLine}>
                  Por la presente, D./Dña. <span className={styles.tag}>[NOMBRE]</span>, con DNI{" "}
                  <span className={styles.tag}>[DNI]</span>, declara haber sido informado/a de las
                  condiciones del servicio.
                </p>
                <p className={styles.previewLine}>
                  En Barcelona, a <span className={styles.tag}>[FECHA]</span>.
                </p>
                <p className={styles.previewLine}>Firma del paciente: ____________________</p>
              </div>
              <p className={styles.hint}>
                Las etiquetas se sustituirán automáticamente con los datos reales del paciente al
                generar el documento.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setPreviewDoc(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing history modal */}
      {invoicePatient && (
        <div className={styles.modalOverlay} onClick={() => setInvoicePatient(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Historial de facturación"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Historial de facturación</h2>
                <p className={styles.modalSub}>{invoicePatient}</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setInvoicePatient(null)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBodyScroll}>
              <div className={styles.invoiceList}>
                {(invoicesByPatient[invoicePatient] ?? []).map((inv, i) => (
                  <div key={i} className={styles.invoiceRow}>
                    <span className={styles.invoiceIcon}>
                      <Receipt size={18} strokeWidth={1.9} />
                    </span>
                    <div className={styles.invoiceInfo}>
                      <div className={styles.invoiceConcept}>{inv.concept}</div>
                      <div className={styles.invoiceDate}>{inv.date}</div>
                    </div>
                    <span className={styles.invoiceAmount}>{inv.amount}</span>
                    <button type="button" className={styles.previewButton}>
                      <Download size={14} strokeWidth={2} /> Descargar PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setInvoicePatient(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User activity history modal */}
      {historyUser && (
        <div className={styles.modalOverlay} onClick={() => setHistoryUser(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Historial del usuario"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Historial del usuario</h2>
                <p className={styles.modalSub}>{historyUser}</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setHistoryUser(null)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBodyScroll}>
              {(() => {
                const userLogs = logs.filter((l) => l.user === historyUser);
                if (userLogs.length === 0) {
                  return <p className={styles.emptyState}>Sin actividad registrada.</p>;
                }
                return (
                  <div className={styles.timeline}>
                    {userLogs.map((log, i) => (
                      <div key={i} className={styles.timelineRow}>
                        <span className={styles.timelineDot} />
                        <div className={styles.timelineBody}>
                          <div className={styles.timelineAction}>{log.action}</div>
                          <div className={styles.timelineMeta}>
                            <span className={styles.logDoc}>{log.doc}</span>
                            <span className={styles.timelineTime}>{log.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setHistoryUser(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit role modal */}
      {editMember && (
        <div className={styles.modalOverlay} onClick={() => setEditMember(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Editar rol"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Editar rol</h2>
                <p className={styles.modalSub}>{editMember.name}</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setEditMember(null)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Rol del miembro</label>
                <select className={styles.selectPlain} defaultValue={editMember.role}>
                  {roleOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setEditMember(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setEditMember(null)}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
