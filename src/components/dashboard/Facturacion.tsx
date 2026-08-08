import { useMemo, useState } from "react";
import {
  Wallet,
  Clock,
  HeartPulse,
  GraduationCap,
  Search,
  Download,
  Receipt,
  ExternalLink,
  CreditCard,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sidebar } from "./Sidebar";
import { NotificationBell } from "./NotificationBell";
import { useAccess } from "../../context/AccessContext";
import { useConsultations } from "../../context/ConsultationsContext";
import styles from "./Dashboard.module.css";
import s from "./Facturacion.module.css";

type Origen = "Clínica" | "Academia";
type Estado = "Pagado" | "Pendiente" | "Fallido";
type Tipo =
  | "Consulta"
  | "Seguimiento"
  | "Suscripción clínica"
  | "Suscripción academia"
  | "Curso"
  | "Recurso";

interface Transaction {
  id: string;
  /** yyyy-mm-dd */
  date: string;
  client: string;
  email: string;
  initials: string;
  role: string;
  origen: Origen;
  tipo: Tipo;
  concept: string;
  amount: number;
  /** IVA aplicado según el tipo de producto/servicio. */
  vat: number;
  estado: Estado;
}

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function fmtDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

function fmtMoney(n: number) {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/** Reglas fiscales por tipo de producto/servicio. */
function vatFor(tipo: Tipo): number {
  // Servicios sanitarios exentos de IVA (art. 20 LIVA); contenido digital al 21%.
  if (tipo === "Consulta" || tipo === "Seguimiento" || tipo === "Suscripción clínica") return 0;
  return 21;
}

/** Genera un PDF mínimo válido (sin dependencias) con el desglose fiscal. */
function buildInvoicePdf(tx: Transaction, invoiceNumber: string): Blob {
  const base = tx.vat > 0 ? tx.amount / (1 + tx.vat / 100) : tx.amount;
  const vatAmount = tx.amount - base;
  const lines = [
    "FACTURA SIMPLIFICADA",
    "",
    `Numero de factura: ${invoiceNumber}`,
    `Fecha de emision: ${fmtDate(tx.date)}`,
    "",
    "Emisor: Salud Integrativa - Plataforma Clinica y Academia",
    "NIF: B-00000000",
    "",
    `Cliente: ${tx.client}`,
    `Email: ${tx.email}`,
    "",
    `Origen del ingreso: ${tx.origen}`,
    `Concepto: ${tx.concept}`,
    `Tipo de producto/servicio: ${tx.tipo}`,
    "",
    "----------------------------------------------",
    `Base imponible: ${base.toFixed(2)} EUR`,
    tx.vat > 0
      ? `IVA (${tx.vat}%): ${vatAmount.toFixed(2)} EUR`
      : "IVA: Exento (art. 20.Uno.3 LIVA - servicios sanitarios)",
    `TOTAL: ${tx.amount.toFixed(2)} EUR`,
    "----------------------------------------------",
    "",
    `Estado del pago: ${tx.estado}`,
    "",
    "Documento generado automaticamente por el modulo",
    "de Facturacion y Finanzas.",
  ];

  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  let y = 780;
  let content = "BT\n/F1 11 Tf\n";
  for (const line of lines) {
    content += `1 0 0 1 60 ${y} Tm (${esc(line)}) Tj\n`;
    y -= 18;
  }
  content += "ET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

const COURSE_PRICES: Record<string, number> = {
  "Fundamentos de Nutrición Antiinflamatoria": 149,
  "Salud Hormonal Femenina": 179,
  "Microbiota y Digestión": 129,
  "Cocina Terapéutica en Casa": 99,
  "Gestión del Estrés y Descanso": 89,
};

export function Facturacion() {
  const { records } = useAccess();
  const { consultations } = useConsultations();

  const [tab, setTab] = useState<"transacciones" | "suscripciones">("transacciones");
  const [subTab, setSubTab] = useState<"clinica" | "academia">("clinica");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<"todos" | Estado>("todos");
  const [origen, setOrigen] = useState<"todos" | Origen>("todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<Transaction | null>(null);

  /** Unifica todos los flujos de ingreso de la plataforma. */
  const transactions = useMemo<Transaction[]>(() => {
    const byName = new Map(records.map((r) => [r.name, r]));
    const list: Transaction[] = [];

    // 1) Pagos de consultas clínicas y seguimientos
    consultations.forEach((c) => {
      const rec = byName.get(c.patientName);
      const isFollowUp = /seguimiento|revisión|control|mantenimiento/i.test(c.note);
      const tipo: Tipo = isFollowUp ? "Seguimiento" : "Consulta";
      if (c.status === "Cancelada") return;
      const amount = c.payment ? c.payment.amount : tipo === "Seguimiento" ? 65 : 90;
      list.push({
        id: `tx-cons-${c.id}`,
        date: c.date,
        client: c.patientName,
        email: rec?.email ?? `${c.patientName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
        initials: rec?.initials ?? initialsOf(c.patientName),
        role: "Paciente",
        origen: "Clínica",
        tipo,
        concept: `${tipo} clínica · ${c.phase.split(":")[0]}`,
        amount,
        vat: vatFor(tipo),
        estado: c.payment ? "Pagado" : "Pendiente",
      });
    });

    // 2/3) Suscripciones recurrentes clínicas y de academia
    records.forEach((r, idx) => {
      const day = 3 + ((idx * 5) % 22);
      const subDate = `2026-07-${String(day).padStart(2, "0")}`;
      const role = r.portal && r.academia ? "Paciente · Alumno" : r.academia ? "Alumno" : "Paciente";
      if (r.portal) {
        list.push({
          id: `tx-subc-${r.id}`,
          date: subDate,
          client: r.name,
          email: r.email,
          initials: r.initials,
          role,
          origen: "Clínica",
          tipo: "Suscripción clínica",
          concept: "Plan de Salud Integrativa · Mensual",
          amount: 49,
          vat: vatFor("Suscripción clínica"),
          estado: idx === 2 ? "Fallido" : "Pagado",
        });
      }
      if (r.academia) {
        list.push({
          id: `tx-suba-${r.id}`,
          date: subDate,
          client: r.name,
          email: r.email,
          initials: r.initials,
          role,
          origen: "Academia",
          tipo: "Suscripción academia",
          concept: "Membresía Academia · Mensual",
          amount: 29,
          vat: vatFor("Suscripción academia"),
          estado: "Pagado",
        });
      }

      // 4) Compras de cursos individuales
      r.courses.forEach((course, i) => {
        const cday = 2 + ((idx * 3 + i * 7) % 26);
        list.push({
          id: `tx-course-${r.id}-${i}`,
          date: `2026-0${((idx + i) % 5) + 2}-${String(cday).padStart(2, "0")}`,
          client: r.name,
          email: r.email,
          initials: r.initials,
          role,
          origen: "Academia",
          tipo: "Curso",
          concept: `Curso · ${course}`,
          amount: COURSE_PRICES[course] ?? 119,
          vat: vatFor("Curso"),
          estado: i === 2 ? "Pendiente" : "Pagado",
        });
      });

      // 5) Descargas de recursos adicionales
      if (r.academia && r.coursesEnrolled > 1) {
        list.push({
          id: `tx-res-${r.id}`,
          date: `2026-06-${String(6 + ((idx * 4) % 20)).padStart(2, "0")}`,
          client: r.name,
          email: r.email,
          initials: r.initials,
          role,
          origen: "Academia",
          tipo: "Recurso",
          concept: "Pack de recursos descargables · Menús y guías",
          amount: 19,
          vat: vatFor("Recurso"),
          estado: "Pagado",
        });
      }
    });

    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [records, consultations]);

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        if (query && !t.client.toLowerCase().includes(query.trim().toLowerCase())) return false;
        if (estado !== "todos" && t.estado !== estado) return false;
        if (origen !== "todos" && t.origen !== origen) return false;
        if (from && t.date < from) return false;
        if (to && t.date > to) return false;
        return true;
      }),
    [transactions, query, estado, origen, from, to],
  );

  const currentMonth = "2026-07";
  const summary = useMemo(() => {
    const monthIncome = transactions
      .filter((t) => t.estado === "Pagado" && t.date.startsWith(currentMonth))
      .reduce((acc, t) => acc + t.amount, 0);
    const pending = transactions
      .filter((t) => t.estado === "Pendiente" || t.estado === "Fallido")
      .reduce((acc, t) => acc + t.amount, 0);
    const pendingCount = transactions.filter(
      (t) => t.estado === "Pendiente" || t.estado === "Fallido",
    ).length;
    return {
      monthIncome,
      pending,
      pendingCount,
      clinical: records.filter((r) => r.portal).length,
      academy: records.filter((r) => r.academia).length,
    };
  }, [transactions, records]);

  const filteredTotal = filtered
    .filter((t) => t.estado === "Pagado")
    .reduce((acc, t) => acc + t.amount, 0);

  const downloadInvoice = (tx: Transaction) => {
    const num = `F-${tx.date.replace(/-/g, "")}-${tx.id.slice(-4).toUpperCase()}`;
    const blob = buildInvoicePdf(tx, num);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${num}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Factura ${num} generada`, {
      description: `${tx.client} · ${fmtMoney(tx.amount)} · IVA ${tx.vat > 0 ? `${tx.vat}%` : "exento"}`,
    });
  };

  const resetFilters = () => {
    setQuery("");
    setEstado("todos");
    setOrigen("todos");
    setFrom("");
    setTo("");
  };

  const clinicalSubs = records.filter((r) => r.portal);
  const academySubs = records.filter((r) => r.academia);

  return (
    <div className={styles.page}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingHi}>Facturación y Finanzas</h1>
            <p className={styles.greetingSub}>
              Todos los ingresos de la clínica y la academia, unificados por cliente.
            </p>
          </div>
          <div className={styles.headerRight}>
            <NotificationBell />
          </div>
        </header>

        <div className={s.tabs}>
          <button
            type="button"
            className={`${s.tab} ${tab === "transacciones" ? s.tabActive : ""}`}
            onClick={() => setTab("transacciones")}
          >
            Transacciones
          </button>
          <button
            type="button"
            className={`${s.tab} ${tab === "suscripciones" ? s.tabActive : ""}`}
            onClick={() => setTab("suscripciones")}
          >
            Suscripciones y membresías
          </button>
        </div>

        <section className={s.cards}>
          <article className={s.summary}>
            <div className={s.summaryTop}>
              <span className={s.summaryLabel}>Ingresos totales</span>
              <span className={s.summaryIcon}>
                <Wallet size={18} />
              </span>
            </div>
            <span className={s.summaryValue}>{fmtMoney(summary.monthIncome)}</span>
            <span className={s.summaryHint}>Mes actual · julio 2026</span>
          </article>

          <article className={s.summary}>
            <div className={s.summaryTop}>
              <span className={s.summaryLabel}>Pagos pendientes</span>
              <span className={`${s.summaryIcon} ${s.summaryIconSand}`}>
                <Clock size={18} />
              </span>
            </div>
            <span className={s.summaryValue}>{fmtMoney(summary.pending)}</span>
            <span className={s.summaryHint}>{summary.pendingCount} transacciones por cobrar</span>
          </article>

          <article className={s.summary}>
            <div className={s.summaryTop}>
              <span className={s.summaryLabel}>Suscripciones clínicas</span>
              <span className={`${s.summaryIcon} ${s.summaryIconSage}`}>
                <HeartPulse size={18} />
              </span>
            </div>
            <span className={s.summaryValue}>{summary.clinical}</span>
            <span className={s.summaryHint}>Planes de salud activos</span>
          </article>

          <article className={s.summary}>
            <div className={s.summaryTop}>
              <span className={s.summaryLabel}>Suscripciones academia</span>
              <span className={`${s.summaryIcon} ${s.summaryIconPlum}`}>
                <GraduationCap size={18} />
              </span>
            </div>
            <span className={s.summaryValue}>{summary.academy}</span>
            <span className={s.summaryHint}>Membresías activas de alumnos</span>
          </article>
        </section>

        {tab === "transacciones" ? (
          <section className={s.card}>
            <div className={s.cardHeader}>
              <div>
                <h2 className={s.cardTitle}>
                  <Receipt size={19} strokeWidth={2.2} />
                  Transacciones
                </h2>
                <p className={s.cardSub}>
                  Consultas, seguimientos, suscripciones, cursos y recursos descargables.
                </p>
              </div>
            </div>

            <div className={s.filters}>
              <div className={s.searchBox}>
                <Search size={17} className={s.searchIcon} />
                <input
                  className={s.searchInput}
                  placeholder="Buscar por nombre de cliente…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <select
                className={s.select}
                value={estado}
                onChange={(e) => setEstado(e.target.value as typeof estado)}
                aria-label="Estado del pago"
              >
                <option value="todos">Todos los estados</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Fallido">Fallido</option>
              </select>
              <select
                className={s.select}
                value={origen}
                onChange={(e) => setOrigen(e.target.value as typeof origen)}
                aria-label="Origen del ingreso"
              >
                <option value="todos">Todos los orígenes</option>
                <option value="Clínica">Clínica</option>
                <option value="Academia">Academia</option>
              </select>
              <div className={s.dateGroup}>
                <input
                  type="date"
                  className={s.dateInput}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  aria-label="Fecha desde"
                />
                <span className={s.dateSep}>→</span>
                <input
                  type="date"
                  className={s.dateInput}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  aria-label="Fecha hasta"
                />
              </div>
              <button type="button" className={s.clearBtn} onClick={resetFilters}>
                Limpiar filtros
              </button>
            </div>

            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Origen</th>
                    <th>Concepto</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td className={s.dateCell}>{fmtDate(t.date)}</td>
                      <td>
                        <div className={s.clientCell}>
                          <span className={s.avatar}>{t.initials}</span>
                          <span>
                            <Link to="/pacientes" className={s.clientLink}>
                              {t.client}
                            </Link>
                            <span className={s.clientRole}>{t.role}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${s.badge} ${
                            t.origen === "Clínica" ? s.badgeClinica : s.badgeAcademia
                          }`}
                        >
                          {t.origen === "Clínica" ? (
                            <HeartPulse size={13} />
                          ) : (
                            <GraduationCap size={13} />
                          )}
                          {t.origen}
                        </span>
                      </td>
                      <td>
                        <span className={s.concept}>{t.concept}</span>
                        <span className={s.conceptType}>
                          {t.tipo} · IVA {t.vat > 0 ? `${t.vat}%` : "exento"}
                        </span>
                      </td>
                      <td className={s.amount}>{fmtMoney(t.amount)}</td>
                      <td>
                        <span
                          className={`${s.badge} ${
                            t.estado === "Pagado"
                              ? s.badgePagado
                              : t.estado === "Pendiente"
                                ? s.badgePendiente
                                : s.badgeFallido
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                      <td>
                        <div className={s.actions}>
                          <button
                            type="button"
                            className={s.iconBtn}
                            title="Ver detalle"
                            aria-label={`Ver detalle de ${t.concept}`}
                            onClick={() => setDetail(t)}
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            type="button"
                            className={`${s.iconBtn} ${s.iconBtnPrimary}`}
                            title="Descargar factura en PDF"
                            aria-label={`Descargar factura de ${t.client}`}
                            onClick={() => downloadInvoice(t)}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <p className={s.empty}>No hay transacciones que coincidan con los filtros.</p>
              )}
            </div>

            <div className={s.tableFoot}>
              <span>
                Mostrando {filtered.length} de {transactions.length} transacciones
              </span>
              <span className={s.footTotal}>Total cobrado: {fmtMoney(filteredTotal)}</span>
            </div>
          </section>
        ) : (
          <section className={s.card}>
            <div className={s.cardHeader}>
              <div>
                <h2 className={s.cardTitle}>
                  <CreditCard size={19} strokeWidth={2.2} />
                  Suscripciones y membresías
                </h2>
                <p className={s.cardSub}>
                  Estado de los planes recurrentes de pacientes y alumnos.
                </p>
              </div>
              <div className={s.tabs} style={{ margin: 0, border: "none" }}>
                <button
                  type="button"
                  className={`${s.tab} ${subTab === "clinica" ? s.tabActive : ""}`}
                  onClick={() => setSubTab("clinica")}
                >
                  Planes de salud
                </button>
                <button
                  type="button"
                  className={`${s.tab} ${subTab === "academia" ? s.tabActive : ""}`}
                  onClick={() => setSubTab("academia")}
                >
                  Membresía academia
                </button>
              </div>
            </div>

            <div className={s.subSection}>
              <h3 className={s.subSectionTitle}>
                {subTab === "clinica" ? <HeartPulse size={17} /> : <GraduationCap size={17} />}
                {subTab === "clinica"
                  ? "Pacientes con plan de salud activo"
                  : "Alumnos con membresía activa"}
              </h3>
              <p className={s.subSectionSub}>
                {subTab === "clinica"
                  ? `${clinicalSubs.length} suscripciones · 49,00 € / mes`
                  : `${academySubs.length} membresías · 29,00 € / mes`}
              </p>

              <div className={s.subGrid}>
                {(subTab === "clinica" ? clinicalSubs : academySubs).map((r) => (
                  <article key={r.id} className={s.subCard}>
                    <div className={s.subTop}>
                      <span className={s.avatar}>{r.initials}</span>
                      <span>
                        <span className={s.subName}>{r.name}</span>
                        <br />
                        <span className={s.subEmail}>{r.email}</span>
                      </span>
                    </div>
                    <div className={s.subDivider} />
                    <div className={s.subRow}>
                      <span>Plan</span>
                      <strong>
                        {subTab === "clinica" ? "Salud Integrativa" : "Academia Premium"}
                      </strong>
                    </div>
                    <div className={s.subRow}>
                      <span>Importe</span>
                      <strong>{subTab === "clinica" ? "49,00 €/mes" : "29,00 €/mes"}</strong>
                    </div>
                    <div className={s.subRow}>
                      <span>Alta</span>
                      <strong>{r.joinDate}</strong>
                    </div>
                    <div className={s.subRow}>
                      <span>Último pago</span>
                      <strong>{r.payment}</strong>
                    </div>
                    {subTab === "academia" && (
                      <div className={s.subRow}>
                        <span>Cursos inscritos</span>
                        <strong>{r.coursesEnrolled}</strong>
                      </div>
                    )}
                    <div className={s.subRow}>
                      <span>Estado</span>
                      <span className={`${s.badge} ${s.badgePagado}`}>Activa</span>
                    </div>
                  </article>
                ))}
              </div>

              {(subTab === "clinica" ? clinicalSubs : academySubs).length === 0 && (
                <p className={s.empty}>No hay suscripciones activas en este bloque.</p>
              )}
            </div>
          </section>
        )}
      </main>

      {detail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(45,38,48,0.45)",
            display: "grid",
            placeItems: "center",
            padding: 20,
            zIndex: 60,
          }}
          onClick={() => setDetail(null)}
        >
          <div
            className={s.card}
            style={{ maxWidth: 460, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>
                <Receipt size={18} /> Detalle de transacción
              </h2>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => setDetail(null)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            <div className={s.subRow}>
              <span>Cliente</span>
              <strong>{detail.client}</strong>
            </div>
            <div className={s.subRow}>
              <span>Fecha</span>
              <strong>{fmtDate(detail.date)}</strong>
            </div>
            <div className={s.subRow}>
              <span>Origen</span>
              <strong>{detail.origen}</strong>
            </div>
            <div className={s.subRow}>
              <span>Concepto</span>
              <strong>{detail.concept}</strong>
            </div>
            <div className={s.subRow}>
              <span>Base imponible</span>
              <strong>
                {fmtMoney(detail.vat > 0 ? detail.amount / (1 + detail.vat / 100) : detail.amount)}
              </strong>
            </div>
            <div className={s.subRow}>
              <span>IVA</span>
              <strong>{detail.vat > 0 ? `${detail.vat}%` : "Exento"}</strong>
            </div>
            <div className={s.subRow}>
              <span>Total</span>
              <strong>{fmtMoney(detail.amount)}</strong>
            </div>
            <div className={s.subDivider} style={{ margin: "14px 0" }} />
            <button
              type="button"
              className={s.clearBtn}
              style={{ width: "100%" }}
              onClick={() => downloadInvoice(detail)}
            >
              Descargar factura en PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
