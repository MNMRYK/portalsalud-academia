import { useState } from "react";
import {
  Search,
  Plus,
  Activity,
  ClipboardList,
  FolderLock,
  FileText,
  Upload,
  Download,
  Folder,
  X,
  Info,
  Shield,
  GraduationCap,
  Mail,
  User,
  Pencil,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import styles from "./Pacientes.module.css";

type TabId = "datos" | "diario" | "documentos";

const patientList = [
  { name: "Elena Martín", meta: "Fase 2 · Activo", initials: "EM", avClass: styles.avPlum },
  { name: "Lucía Fernández", meta: "Fase 1 · Activo", initials: "LF", avClass: styles.avTerracota },
  { name: "Marcos Iglesias", meta: "Mantenimiento", initials: "MI", avClass: styles.avSage },
  { name: "Javier Morán", meta: "Seguimiento", initials: "JM", avClass: styles.avLilac },
];

const treatmentPhases = [
  "Fase 1: Détox hepático",
  "Fase 2: Reducción de inflamación",
  "Fase 3: Reparación intestinal",
  "Fase 4: Mantenimiento y hábitos",
];

const weightData = [
  { label: "Mar", value: 78, height: 92 },
  { label: "Abr", value: 76, height: 80 },
  { label: "May", value: 74, height: 66 },
  { label: "Jun", value: 72.5, height: 54 },
  { label: "Jul", value: 71, height: 44 },
];

const diaryEntries = [
  {
    date: "5 Jul 2026",
    energy: { label: "Alta", cls: styles.levelSage },
    inflammation: { label: "Baja", cls: styles.levelSage },
    note: "Buena adherencia a la pauta. Duerme mejor.",
  },
  {
    date: "28 Jun 2026",
    energy: { label: "Media", cls: styles.levelPlum },
    inflammation: { label: "Media", cls: styles.levelPlum },
    note: "Hinchazón abdominal tras comidas fuera de casa.",
  },
  {
    date: "21 Jun 2026",
    energy: { label: "Baja", cls: styles.levelTerracota },
    inflammation: { label: "Alta", cls: styles.levelTerracota },
    note: "Semana estresante. Retención de líquidos.",
  },
];

const documents = {
  Dietas: [
    { name: "Plan nutricional - Fase 2.pdf", meta: "PDF · 1.2 MB · 5 Jul 2026" },
    { name: "Pauta antiinflamatoria.pdf", meta: "PDF · 840 KB · 20 Jun 2026" },
  ],
  "Listas de la compra": [
    { name: "Lista semanal - Julio.pdf", meta: "PDF · 320 KB · 5 Jul 2026" },
  ],
};

export function Pacientes() {
  const [activeTab, setActiveTab] = useState<TabId>("datos");
  const [phase, setPhase] = useState(treatmentPhases[1]);
  const [selected, setSelected] = useState(patientList[0].name);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portalEnabled, setPortalEnabled] = useState(true);
  const [academyEnabled, setAcademyEnabled] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isMetricOpen, setIsMetricOpen] = useState(false);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const tabs: { id: TabId; label: string; icon: typeof Activity }[] = [
    { id: "datos", label: "Datos y Evolución", icon: Activity },
    { id: "diario", label: "Diario Clínico", icon: ClipboardList },
    { id: "documentos", label: "Documentos", icon: FolderLock },
  ];

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Pacientes</h1>
            <p className={styles.titleSub}>
              CRM clínico: fichas, evolución y documentación de tus pacientes.
            </p>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.search}>
              <Search size={18} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Buscar por nombre o DNI…"
                aria-label="Buscar pacientes"
              />
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} strokeWidth={2.5} /> Nuevo Paciente
            </button>
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={styles.rail}>
            <span className={styles.railTitle}>Pacientes</span>
            {patientList.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`${styles.railItem} ${
                  selected === p.name ? styles.railItemActive : ""
                }`}
                onClick={() => setSelected(p.name)}
              >
                <span className={`${styles.railAvatar} ${p.avClass}`}>{p.initials}</span>
                <span>
                  <span className={styles.railName}>{p.name}</span>
                  <br />
                  <span className={styles.railMeta}>{p.meta}</span>
                </span>
              </button>
            ))}
          </aside>

          <section className={styles.file}>
            <div className={styles.fileHeader}>
              <span className={`${styles.fileAvatar} ${styles.avPlum}`}>EM</span>
              <div className={styles.fileHeaderInfo}>
                <h2 className={styles.fileName}>Elena Martín</h2>
                <div className={styles.fileFacts}>
                  <div className={styles.fileFact}>
                    <span className={styles.fileFactLabel}>Edad</span>
                    <span className={styles.fileFactValue}>42 años</span>
                  </div>
                  <div className={styles.fileFact}>
                    <span className={styles.fileFactLabel}>Objetivo principal</span>
                    <span className={styles.fileFactValue}>Reducir inflamación</span>
                  </div>
                  <div className={styles.fileFact}>
                    <span className={styles.fileFactLabel}>DNI</span>
                    <span className={styles.fileFactValue}>12.345.678-A</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={styles.outlineButton}
                onClick={() => setIsProfileOpen(true)}
              >
                <Pencil size={16} /> Editar datos
              </button>
            </div>

            <nav className={styles.tabs}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </nav>

            {activeTab === "datos" && (
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <div>
                    <h3 className={styles.panelTitle}>Resumen clínico</h3>
                    <p className={styles.panelSub}>
                      Datos generales y evolución del tratamiento.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.outlineButton}
                    onClick={() => setIsMetricOpen(true)}
                  >
                    <Plus size={16} strokeWidth={2.5} /> Añadir Métrica
                  </button>
                </div>

                <div className={styles.summaryGrid}>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Peso actual</span>
                    <div className={styles.summaryValue}>71 kg</div>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Objetivo</span>
                    <div className={styles.summaryValue}>68 kg</div>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Adherencia</span>
                    <div className={styles.summaryValue}>86%</div>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="phase">
                    Fase actual del tratamiento
                  </label>
                  <select
                    id="phase"
                    className={styles.select}
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                  >
                    {treatmentPhases.map((ph) => (
                      <option key={ph} value={ph}>
                        {ph}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.chart}>
                  <div className={styles.chartHead}>
                    <span className={styles.chartMetric}>Evolución de peso</span>
                    <span className={styles.chartDelta}>-7 kg en 5 meses</span>
                  </div>
                  <div className={styles.bars}>
                    {weightData.map((d) => (
                      <div key={d.label} className={styles.barCol}>
                        <span className={styles.barValue}>{d.value}</span>
                        <div className={styles.bar} style={{ height: `${d.height}%` }} />
                        <span className={styles.barLabel}>{d.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "diario" && (
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <div>
                    <h3 className={styles.panelTitle}>Diario clínico y síntomas</h3>
                    <p className={styles.panelSub}>
                      Últimos registros del paciente ordenados por fecha.
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => setIsEntryOpen(true)}
                  >
                    <Plus size={18} strokeWidth={2.5} /> Nueva Entrada
                  </button>
                </div>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Nivel de energía</th>
                      <th>Inflamación</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diaryEntries.map((e) => (
                      <tr key={e.date}>
                        <td className={styles.dateCell}>{e.date}</td>
                        <td>
                          <span className={`${styles.level} ${e.energy.cls}`}>
                            {e.energy.label}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.level} ${e.inflammation.cls}`}>
                            {e.inflammation.label}
                          </span>
                        </td>
                        <td className={styles.noteCell}>{e.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "documentos" && (
              <div className={styles.panel}>
                <div className={styles.docHead}>
                  <div>
                    <h3 className={styles.panelTitle}>Gestor de documentos seguros</h3>
                    <p className={styles.panelSub}>
                      Archivos privados del paciente organizados por carpeta.
                    </p>
                  </div>
                  <button type="button" className={styles.secondaryButton}>
                    <Upload size={16} /> Subir documento
                  </button>
                </div>

                {Object.entries(documents).map(([folder, files]) => (
                  <div key={folder} className={styles.folder}>
                    <div className={styles.folderTitle}>
                      <Folder size={18} className={styles.folderIcon} />
                      {folder}
                    </div>
                    <div className={styles.docList}>
                      {files.map((f) => (
                        <div key={f.name} className={styles.docItem}>
                          <span className={styles.docIcon}>
                            <FileText size={20} />
                          </span>
                          <div className={styles.docInfo}>
                            <div className={styles.docName}>{f.name}</div>
                            <div className={styles.docMeta}>{f.meta}</div>
                          </div>
                          <button
                            type="button"
                            className={styles.docAction}
                            aria-label={`Descargar ${f.name}`}
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <h2 id="modal-title" className={styles.modalTitle}>
                  Dar de alta nuevo paciente
                </h2>
                <p className={styles.modalSub}>
                  Invita a tu paciente a completar su ficha médica.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsModalOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.helpBox}>
                <Info size={18} className={styles.helpIcon} />
                <p className={styles.helpText}>
                  Solo necesitas lo básico. El sistema enviará un email
                  automático al paciente para que complete su ficha médica y
                  cree su contraseña de acceso.
                </p>
              </div>

              <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="patient-name">
                    Nombre completo
                  </label>
                  <div className={styles.inputWrap}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      id="patient-name"
                      type="text"
                      className={styles.textInput}
                      placeholder="Ej: María López García"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="patient-email">
                    Correo electrónico
                  </label>
                  <div className={styles.inputWrap}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      id="patient-email"
                      type="email"
                      className={styles.textInput}
                      placeholder="maria@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles.permissionsBox}>
                <h3 className={styles.permissionsTitle}>Permisos y Accesos</h3>

                <label className={styles.toggleRow}>
                  <span className={styles.toggleIconBox}>
                    <Shield size={18} />
                  </span>
                  <span className={styles.toggleContent}>
                    <span className={styles.toggleLabel}>
                      Activar Portal de Salud
                    </span>
                    <span className={styles.toggleHint}>
                      Da acceso al área clínica, documentos seguros y evolución.
                    </span>
                  </span>
                  <span className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={portalEnabled}
                      onChange={(e) => setPortalEnabled(e.target.checked)}
                    />
                    <span className={styles.toggleTrack} aria-hidden="true" />
                  </span>
                </label>

                <label className={styles.toggleRow}>
                  <span className={styles.toggleIconBox}>
                    <GraduationCap size={18} />
                  </span>
                  <span className={styles.toggleContent}>
                    <span className={styles.toggleLabel}>Activar Academia</span>
                    <span className={styles.toggleHint}>
                      Si se mantiene inactivo, el paciente verá la Academia
                      bloqueada con un candado (Upsell automático). Si la
                      compra online, se desbloqueará sola.
                    </span>
                  </span>
                  <span className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={academyEnabled}
                      onChange={(e) => setAcademyEnabled(e.target.checked)}
                    />
                    <span className={styles.toggleTrack} aria-hidden="true" />
                  </span>
                </label>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                <Mail size={18} strokeWidth={2.5} /> Enviar Invitación
              </button>
            </footer>
          </div>
        </div>
      )}

      {isMetricOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsMetricOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="metric-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="metric-title" className={styles.modalTitle}>
                  Nuevo registro de evolución
                </h2>
                <p className={styles.modalSub}>
                  Registra una nueva métrica para el seguimiento del paciente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsMetricOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-date">
                    Fecha
                  </label>
                  <input
                    id="metric-date"
                    type="date"
                    className={styles.textInputPlain}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-phase">
                    Fase del tratamiento
                  </label>
                  <select
                    id="metric-phase"
                    className={styles.selectPlain}
                    defaultValue={treatmentPhases[1]}
                  >
                    {treatmentPhases.map((ph) => (
                      <option key={ph} value={ph}>
                        {ph}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-weight">
                    Peso actual (kg)
                  </label>
                  <input
                    id="metric-weight"
                    type="number"
                    step="0.1"
                    className={styles.textInputPlain}
                    placeholder="Ej: 71.5"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="metric-adherence">
                    Adherencia al plan (%)
                  </label>
                  <input
                    id="metric-adherence"
                    type="number"
                    min="0"
                    max="100"
                    className={styles.textInputPlain}
                    placeholder="Ej: 86"
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsMetricOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Guardar registro
              </button>
            </footer>
          </div>
        </div>
      )}

      {isEntryOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsEntryOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="entry-title" className={styles.modalTitle}>
                  Registrar síntoma
                </h2>
                <p className={styles.modalSub}>
                  Añade una nueva entrada al diario clínico del paciente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsEntryOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="entry-energy">
                    Nivel de Energía
                  </label>
                  <select id="entry-energy" className={styles.select} defaultValue="Media">
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="entry-inflammation">
                    Inflamación
                  </label>
                  <select
                    id="entry-inflammation"
                    className={styles.select}
                    defaultValue="Media"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="entry-notes">
                    Notas adicionales
                  </label>
                  <textarea
                    id="entry-notes"
                    className={styles.textarea}
                    rows={4}
                    placeholder="Describe síntomas, adherencia u observaciones relevantes…"
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsEntryOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Guardar
              </button>
            </footer>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsProfileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <div>
                <h2 id="profile-title" className={styles.modalTitle}>
                  Editar Perfil Clínico
                </h2>
                <p className={styles.modalSub}>
                  Actualiza los datos básicos y estáticos del paciente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setIsProfileOpen(false)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-name">
                    Nombre completo
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    className={styles.textInputPlain}
                    defaultValue="Elena Martín"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-age">
                    Edad
                  </label>
                  <input
                    id="profile-age"
                    type="number"
                    min="0"
                    className={styles.textInputPlain}
                    defaultValue={42}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-sex">
                    Sexo
                  </label>
                  <select
                    id="profile-sex"
                    className={styles.selectPlain}
                    defaultValue="Mujer"
                  >
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-dni">
                    DNI
                  </label>
                  <input
                    id="profile-dni"
                    type="text"
                    className={styles.textInputPlain}
                    defaultValue="12.345.678-A"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-goal">
                    Objetivo principal
                  </label>
                  <input
                    id="profile-goal"
                    type="text"
                    className={styles.textInputPlain}
                    defaultValue="Reducir inflamación"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="profile-target-weight">
                    Peso objetivo (kg)
                  </label>
                  <input
                    id="profile-target-weight"
                    type="number"
                    step="0.1"
                    className={styles.textInputPlain}
                    defaultValue={68}
                  />
                </div>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setIsProfileOpen(false)}
              >
                Cancelar
              </button>
              <button type="button" className={styles.primaryButton}>
                Guardar cambios
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
