import { useMemo, useState } from "react";
import {
  Search,
  FileText,
  Video,
  ClipboardList,
  Layers,
  Download,
  type LucideIcon,
} from "lucide-react";
import {
  useResources,
  type Resource,
  type ResourceType,
  type ResourceAudience,
} from "../../context/ResourcesContext";
import styles from "./Recursos.module.css";

const chipCategories = ["Todas", "PDFs", "Menús", "Vídeos"] as const;

const typeMeta: Record<
  ResourceType,
  { icon: LucideIcon; label: string; className: string }
> = {
  pdf: { icon: FileText, label: "PDF", className: styles.iconPdf },
  video: { icon: Video, label: "Vídeo", className: styles.iconVideo },
  menu: { icon: ClipboardList, label: "Menú", className: styles.iconMenu },
};

const audienceLabels: Record<ResourceAudience, string> = {
  clinico: "Clínico",
  academico: "Académico",
};

const dotColors = ["#a3bca0", "#d47f65", "#875c80", "#c9a24b"];

/**
 * Biblioteca de recursos en modo paciente (solo lectura). Reutiliza el mismo
 * diseño de filtrado (buscador + sidebar de categorías) que la Biblioteca de
 * Recursos del Admin, pero solo permite buscar, filtrar y descargar.
 */
export function PatientResourceLibrary({
  audience,
}: {
  audience: ResourceAudience;
}) {
  const { patientResources } = useResources();
  const base = patientResources(audience);

  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] =
    useState<(typeof chipCategories)[number]>("Todas");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(base.map((r) => r.category))),
    [base],
  );

  const matchesChip = (r: Resource) => {
    if (activeChip === "Todas") return true;
    if (activeChip === "PDFs") return r.type === "pdf";
    if (activeChip === "Menús") return r.type === "menu";
    if (activeChip === "Vídeos") return r.type === "video";
    return true;
  };

  const filtered = base.filter(
    (r) =>
      matchesChip(r) &&
      (activeCategory === "all" || r.category === activeCategory) &&
      r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
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
          {chipCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.chip} ${activeChip === cat ? styles.chipActive : ""}`}
              onClick={() => setActiveChip(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.rail}>
          <div className={styles.railGroup}>
            <p className={styles.railLabel}>Categorías</p>
            <button
              type="button"
              className={`${styles.railItem} ${activeCategory === "all" ? styles.railItemActive : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              <Layers size={18} className={styles.railIcon} strokeWidth={2} />
              Todos los recursos
            </button>
            {categories.length === 0 && (
              <p className={styles.railEmpty}>Aún no hay categorías disponibles.</p>
            )}
            {categories.map((category, i) => {
              const count = base.filter((r) => r.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  className={`${styles.railItem} ${activeCategory === category ? styles.railItemActive : ""}`}
                  onClick={() => setActiveCategory(category)}
                >
                  <span
                    className={styles.railDot}
                    style={{ backgroundColor: dotColors[i % dotColors.length] }}
                  />
                  {category}
                  <span className={styles.railCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className={styles.grid}>
          {filtered.length === 0 && (
            <p className={styles.empty}>
              No hay recursos que coincidan con tu búsqueda.
            </p>
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
                  <button type="button" className={styles.cardDownloadBtn}>
                    <Download size={15} strokeWidth={2.2} /> Descargar {meta.label}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
}
