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
            <button type="button" className={styles.primaryButton}>
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
              <div>
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
                <h3 className={styles.panelTitle}>Resumen clínico</h3>
                <p className={styles.panelSub}>
                  Datos generales y evolución del tratamiento.
                </p>

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
                <h3 className={styles.panelTitle}>Diario clínico y síntomas</h3>
                <p className={styles.panelSub}>
                  Últimos registros del paciente ordenados por fecha.
                </p>
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
    </div>
  );
}
