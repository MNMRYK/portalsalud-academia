import { useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Video,
  ClipboardList,
  Star,
  Clock,
  Layers,
  UserPlus,
  Pencil,
  Trash2,
  X,
  UploadCloud,
  Eye,
  Check,
  Download,
  History,
  type LucideIcon,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { CategoryDropdown } from "./academia/CategoryDropdown";
import {
  useResources,
  type Resource,
  type ResourceType,
  type ResourceAudience,
} from "../../context/ResourcesContext";
import styles from "./Recursos.module.css";

const categories = ["Todas", "PDFs", "Menús", "Vídeos"] as const;

const initialCategories = [
  "Nutrición Deportiva",
  "Détox y depuración",
  "Antiinflamatoria",
  "Salud intestinal",
  "Hábitos y mantenimiento",
];

const typeMeta: Record<ResourceType, { icon: LucideIcon; label: string; className: string }> = {
  pdf: { icon: FileText, label: "PDF", className: styles.iconPdf },
  video: { icon: Video, label: "Vídeo", className: styles.iconVideo },
  menu: { icon: ClipboardList, label: "Menú", className: styles.iconMenu },
};

const audienceLabels: Record<ResourceAudience, string> = {
  clinico: "Clínico",
  academico: "Académico",
};

const patients = [
  { id: 1, name: "Laura Giménez", note: "Fase 2 · Antiinflamatoria" },
  { id: 2, name: "Marc Puig", note: "Fase 1 · Détox hepático" },
  { id: 3, name: "Elena Torres", note: "Fase 3 · Reparación intestinal" },
  { id: 4, name: "David Serra", note: "Fase 4 · Mantenimiento" },
];

const railFilters = [
  { id: "all", label: "Todos los recursos", icon: Layers },
  { id: "recent", label: "Recursos recientes", icon: Clock },
  { id: "favorites", label: "Favoritos", icon: Star },
] as const;

const phaseColors = ["#a3bca0", "#d47f65", "#875c80", "#c9a24b"];

const versionHistory = [
  { version: "V3", date: "07 jul 2026", note: "Versión actual", current: true },
  { version: "V2", date: "18 may 2026", note: "Revisión de cantidades", current: false },
  { version: "V1", date: "02 mar 2026", note: "Documento original", current: false },
];

export function Recursos() {
  const { resources, addResource, updateResource, removeResource, toggleFavorite } =
    useResources();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("Todas");
  const [activeRail, setActiveRail] = useState<string>("all");

  // Categorías dinámicas (compartidas por el modal de subida y el sidebar)
  const [resourceCategories, setResourceCategories] =
    useState<string[]>(initialCategories);
  const addCategory = (name: string) =>
    setResourceCategories((prev) =>
      prev.includes(name) ? prev : [...prev, name],
    );
  const removeCategory = (name: string) => {
    setResourceCategories((prev) => prev.filter((c) => c !== name));
    if (activeRail === `cat:${name}`) setActiveRail("all");
  };

  const [isUploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadAudience, setUploadAudience] = useState<ResourceAudience>("clinico");
  const [uploadShared, setUploadShared] = useState(true);
  const [assignResource, setAssignResource] = useState<Resource | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [detailCategory, setDetailCategory] = useState("");
  const [detailAudience, setDetailAudience] = useState<ResourceAudience>("clinico");

  const openDetail = (resource: Resource) => {
    setDetailResource(resource);
    setDetailCategory(resource.category);
    setDetailAudience(resource.audience);
  };

  const deleteResource = (id: number) => removeResource(id);

  const matchesCategoryChip = (r: Resource) => {
    if (activeCategory === "Todas") return true;
    if (activeCategory === "PDFs") return r.type === "pdf";
    if (activeCategory === "Menús") return r.type === "menu";
    if (activeCategory === "Vídeos") return r.type === "video";
    return true;
  };

  const matchesRail = (r: Resource) => {
    if (activeRail === "recent") return r.recent;
    if (activeRail === "favorites") return r.favorite;
    if (activeRail.startsWith("cat:")) return r.category === activeRail.slice(4);
    return true;
  };

  const filtered = resources.filter(
    (r) =>
      matchesCategoryChip(r) &&
      matchesRail(r) &&
      r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const closeAssign = () => {
    setAssignResource(null);
    setSelectedPatient(null);
  };

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Biblioteca de Recursos</h1>
            <p className={styles.titleSub}>
              Gestiona las plantillas y materiales generales de la clínica.
            </p>
          </div>

          <div className={styles.headerRight}>
            <NotificationBell />
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                setUploadName("");
                setUploadCategory("");
                setUploadAudience("clinico");
                setUploadShared(true);
                setUploadOpen(true);
              }}
            >
              <Plus size={18} strokeWidth={2.5} /> Subir Recurso Maestro
            </button>
          </div>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <Search size={18} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Buscar recursos…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar recursos"
            />
          </div>

          <div className={styles.chips}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chip} ${activeCategory === cat ? styles.chipActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Library filters rail */}
          <aside className={styles.rail}>
            <div className={styles.railGroup}>
              <p className={styles.railLabel}>Biblioteca</p>
              {railFilters.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`${styles.railItem} ${activeRail === id ? styles.railItemActive : ""}`}
                  onClick={() => setActiveRail(id)}
                >
                  <Icon size={18} className={styles.railIcon} strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>

            <div className={styles.railGroup}>
              <p className={styles.railLabel}>Categorías</p>
              {resourceCategories.length === 0 && (
                <p className={styles.railEmpty}>
                  Aún no hay categorías. Créalas al subir un recurso.
                </p>
              )}
              {resourceCategories.map((category, i) => {
                const id = `cat:${category}`;
                const count = resources.filter(
                  (r) => r.category === category,
                ).length;
                return (
                  <button
                    key={category}
                    type="button"
                    className={`${styles.railItem} ${activeRail === id ? styles.railItemActive : ""}`}
                    onClick={() => setActiveRail(id)}
                  >
                    <span
                      className={styles.railDot}
                      style={{
                        backgroundColor: phaseColors[i % phaseColors.length],
                      }}
                    />
                    {category}
                    <span className={styles.railCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Resource grid */}
          <section className={styles.grid}>
            {filtered.length === 0 && (
              <p className={styles.empty}>No hay recursos que coincidan con tu búsqueda.</p>
            )}

            {filtered.map((resource) => {
              const meta = typeMeta[resource.type];
              const Icon = meta.icon;
              return (
                <article key={resource.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={`${styles.cardIcon} ${meta.className}`}>
                      <Icon size={26} strokeWidth={1.9} />
                    </span>
                    <button
                      type="button"
                      className={`${styles.favButton} ${resource.favorite ? styles.favActive : ""}`}
                      onClick={() => toggleFavorite(resource.id)}
                      aria-label={resource.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                      <Star
                        size={17}
                        strokeWidth={2}
                        fill={resource.favorite ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div>
                    <h3 className={styles.cardName}>{resource.name}</h3>
                    <div className={styles.cardMeta}>
                      <span className={styles.badge}>{resource.category}</span>
                      <span
                        className={`${styles.audienceBadge} ${resource.audience === "academico" ? styles.audienceBadgeAcademy : styles.audienceBadgeClinic}`}
                      >
                        {audienceLabels[resource.audience]}
                      </span>
                      <span>{meta.label}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.assignButton}
                      onClick={() => setAssignResource(resource)}
                    >
                      <UserPlus size={15} strokeWidth={2.2} /> Asignar
                    </button>
                    <button
                      type="button"
                      className={styles.iconAction}
                      onClick={() => openDetail(resource)}
                      aria-label="Editar recurso"
                    >
                      <Pencil size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconAction} ${styles.deleteAction}`}
                      onClick={() => deleteResource(resource.id)}
                      aria-label="Borrar recurso"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
      </main>

      {/* Modal: Subir Recurso Maestro */}
      {isUploadOpen && (
        <div className={styles.modalOverlay} onClick={() => setUploadOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Subir recurso maestro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Subir Recurso Maestro</h2>
                <p className={styles.modalSub}>
                  Añade una plantilla o material general a la biblioteca.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setUploadOpen(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.dropzone}>
                <span className={styles.dropzoneIcon}>
                  <UploadCloud size={26} strokeWidth={1.9} />
                </span>
                <span className={styles.dropzoneText}>
                  Arrastra tu archivo aquí o haz clic para explorar
                </span>
                <input type="file" className={styles.fileInputHidden} />
              </label>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Nombre del archivo</label>
                <input
                  className={styles.textInputPlain}
                  placeholder="Ej: Guía de nutrición antiinflamatoria"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Categoría</label>
                <CategoryDropdown
                  categories={resourceCategories}
                  value={uploadCategory}
                  onChange={setUploadCategory}
                  onAddCategory={addCategory}
                  onRemoveCategory={removeCategory}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Destinado a</label>
                <div className={styles.audienceRow}>
                  <button
                    type="button"
                    className={`${styles.audienceChip} ${uploadAudience === "clinico" ? styles.audienceChipActive : ""}`}
                    onClick={() => setUploadAudience("clinico")}
                  >
                    Portal Clínico
                  </button>
                  <button
                    type="button"
                    className={`${styles.audienceChip} ${uploadAudience === "academico" ? styles.audienceChipActive : ""}`}
                    onClick={() => setUploadAudience("academico")}
                  >
                    Academia
                  </button>
                </div>
              </div>

              <label className={styles.toggleRow}>
                <span className={styles.toggleIconBox}>
                  <Eye size={18} strokeWidth={2} />
                </span>
                <span className={styles.toggleContent}>
                  <span className={styles.toggleLabel}>Visible en el portal del paciente</span>
                  <span className={styles.toggleHint}>
                    ¿Hacer visible este recurso en el portal del paciente automáticamente?
                  </span>
                </span>
                <span className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={uploadShared}
                    onChange={(e) => setUploadShared(e.target.checked)}
                  />
                  <span className={styles.toggleTrack} />
                </span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setUploadOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  addResource({
                    name: uploadName.trim() || "Nuevo recurso",
                    type: "pdf",
                    category: uploadCategory || "Sin categoría",
                    audience: uploadAudience,
                    sharedWithPatient: uploadShared,
                  });
                  setUploadOpen(false);
                }}
              >
                <UploadCloud size={18} strokeWidth={2.2} /> Subir recurso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Asignar a paciente */}
      {assignResource && (
        <div className={styles.modalOverlay} onClick={closeAssign}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Asignar recurso a paciente"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Asignar a paciente</h2>
                <p className={styles.modalSub}>
                  Elige a quién enviar este recurso directamente.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeAssign}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.assignResource}>
                <span
                  className={`${styles.cardIcon} ${typeMeta[assignResource.type].className}`}
                  style={{ width: 42, height: 42 }}
                >
                  {(() => {
                    const Icon = typeMeta[assignResource.type].icon;
                    return <Icon size={20} strokeWidth={2} />;
                  })()}
                </span>
                <span className={styles.assignResourceName}>{assignResource.name}</span>
              </div>

              <div className={styles.search} style={{ width: "100%" }}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder="Buscar paciente…"
                  aria-label="Buscar paciente"
                />
              </div>

              <div className={styles.patientList}>
                {patients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.patientRow} ${selectedPatient === p.id ? styles.patientRowActive : ""}`}
                    onClick={() => setSelectedPatient(p.id)}
                  >
                    <span className={styles.patientAvatar}>
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span>
                      <span className={styles.patientName}>{p.name}</span>
                      <br />
                      <span className={styles.patientNote}>{p.note}</span>
                    </span>
                    {selectedPatient === p.id && (
                      <Check size={18} className={styles.patientCheck} strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.ghostButton} onClick={closeAssign}>
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={selectedPatient === null}
                onClick={closeAssign}
                style={selectedPatient === null ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
              >
                <UserPlus size={18} strokeWidth={2.2} /> Enviar recurso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: detalle del recurso + historial de versiones */}
      {detailResource && (
        <div className={styles.modalOverlay} onClick={() => setDetailResource(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del recurso"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{detailResource.name}</h2>
                <p className={styles.modalSub}>
                  {typeMeta[detailResource.type].label} · {detailResource.category}
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setDetailResource(null)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Nombre del recurso</label>
                <input className={styles.textInputPlain} defaultValue={detailResource.name} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Categoría</label>
                <CategoryDropdown
                  categories={resourceCategories}
                  value={detailCategory}
                  onChange={setDetailCategory}
                  onAddCategory={addCategory}
                  onRemoveCategory={removeCategory}
                />
              </div>

              <div className={styles.versionSection}>
                <div className={styles.versionTitle}>
                  <History size={16} strokeWidth={2} /> Historial de versiones
                </div>
                <div className={styles.versionTable}>
                  {versionHistory.map((v) => (
                    <div key={v.version} className={styles.versionRow}>
                      <span className={styles.versionTag}>{v.version}</span>
                      <div className={styles.versionInfo}>
                        <span className={styles.versionNote}>{v.note}</span>
                        <span className={styles.versionDate}>{v.date}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.versionDownload}
                        aria-label={`Descargar ${v.version}`}
                      >
                        <Download size={15} strokeWidth={2} /> Descargar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.ghostButton}
                onClick={() => setDetailResource(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setDetailResource(null)}
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
