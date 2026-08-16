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
  FileSpreadsheet,
  FileMinus,
  Undo2,
  Mail,
  TrendingDown,
  Repeat,
  PiggyBank,
  Wallet2,
  Plus,
  Trash2,
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
type Estado = "Pagado" | "Pendiente" | "Fallido" | "Reembolsado";
type Tipo =
  | "Consulta"
  | "Seguimiento"
  | "Suscripción clínica"
  | "Suscripción academia"
  | "Curso"
  | "Recurso"
  | "Rectificativa";

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
  /** Número de serie para facturas rectificativas (REC-2026-00X). */
  serie?: string;
  /** Id de la factura original rectificada. */
  rectifies?: string;
}

type ExpenseCategory =
  | "Alquiler"
  | "Cuota autónomos"
  | "Software"
  | "Formación"
  | "Suministros"
  | "Marketing"
  | "Otros";

interface Expense {
  id: string;
  concept: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Alquiler",
  "Cuota autónomos",
  "Software",
  "Formación",
  "Suministros",
  "Marketing",
  "Otros",
];

const initialExpenses: Expense[] = [
  { id: "exp-1", concept: "Alquiler de consulta", date: "2026-07-01", amount: 450, category: "Alquiler" },
  { id: "exp-2", concept: "Cuota de autónomos julio", date: "2026-07-05", amount: 294, category: "Cuota autónomos" },
  { id: "exp-3", concept: "Software de gestión de pacientes", date: "2026-07-03", amount: 39, category: "Software" },
  { id: "exp-4", concept: "Campaña de captación en redes", date: "2026-07-08", amount: 120, category: "Marketing" },
];

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

function invoiceNumberOf(tx: Transaction) {
  return tx.serie ?? `F-${tx.date.replace(/-/g, "")}-${tx.id.slice(-4).toUpperCase()}`;
}

function baseOf(tx: Transaction) {
  return tx.vat > 0 ? tx.amount / (1 + tx.vat / 100) : tx.amount;
}

/** Genera un PDF mínimo válido (sin dependencias) con el desglose fiscal. */
function buildInvoicePdf(tx: Transaction, invoiceNumber: string): Blob {
  const base = baseOf(tx);
  const vatAmount = tx.amount - base;
  const isRect = tx.tipo === "Rectificativa";
  const lines = [
    isRect ? "FACTURA RECTIFICATIVA (ABONO)" : "FACTURA SIMPLIFICADA",
    "",
    `Numero de factura: ${invoiceNumber}`,
    `Fecha de emision: ${fmtDate(tx.date)}`,
    ...(isRect && tx.rectifies ? [`Rectifica a la factura: ${tx.rectifies}`] : []),
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const COURSE_PRICES: Record<string, number> = {
  "Fundamentos de Nutrición Antiinflamatoria": 149,
  "Salud Hormonal Femenina": 179,
  "Microbiota y Digestión": 129,
  "Cocina Terapéutica en Casa": 99,
  "Gestión del Estrés y Descanso": 89,
};

const QUARTERS: Record<string, [string, string]> = {
  T1: ["01", "03"],
  T2: ["04", "06"],
  T3: ["07", "09"],
  T4: ["10", "12"],
};

export function Facturacion() {
  const { records } = useAccess();
  const { consultations } = useConsultations();

  const [tab, setTab] = useState<"transacciones" | "gastos" | "suscripciones">("transacciones");
  const [subTab, setSubTab] = useState<"clinica" | "academia">("clinica");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<"todos" | Estado>("todos");
  const [origen, setOrigen] = useState<"todos" | Origen>("todos");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [quarter, setQuarter] = useState<keyof typeof QUARTERS>("T3");

  /** Cambios de estado aplicados sobre las transacciones base. */
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Estado>>({});
  /** Facturas rectificativas y abonos generados. */
  const [credits, setCredits] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [rectifyTarget, setRectifyTarget] = useState<Transaction | null>(null);
  const [rectifyReason, setRectifyReason] = useState("");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    concept: "",
    date: "2026-07-01",
    amount: "",
    category: "Alquiler" as ExpenseCategory,
  });

  /** Unifica todos los flujos de ingreso de la plataforma. */
  const baseTransactions = useMemo<Transaction[]>(() => {
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
          estado: idx === 4 ? "Fallido" : "Pagado",
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

    return list;
  }, [records, consultations]);

  const transactions = useMemo<Transaction[]>(
    () =>
      [...baseTransactions.map((t) => ({ ...t, estado: statusOverrides[t.id] ?? t.estado })), ...credits].sort(
        (a, b) => (a.date < b.date ? 1 : -1),
      ),
    [baseTransactions, statusOverrides, credits],
  );

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
    const monthExpenses = expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((acc, e) => acc + e.amount, 0);
    const pending = transactions
      .filter((t) => t.estado === "Pendiente" || t.estado === "Fallido")
      .reduce((acc, t) => acc + t.amount, 0);
    const pendingCount = transactions.filter(
      (t) => t.estado === "Pendiente" || t.estado === "Fallido",
    ).length;
    const failedCount = transactions.filter((t) => t.estado === "Fallido").length;

    const academyActive = records.filter((r) => r.academia).length;
    const clinicalActive = records.filter((r) => r.portal).length;
    const churnedAcademy = records.filter((r) => r.inAcademyList && !r.academia).length;
    const mrr = academyActive * 29 + clinicalActive * 49;
    const mrrAcademy = academyActive * 29;
    const churn =
      academyActive + churnedAcademy > 0
        ? (churnedAcademy / (academyActive + churnedAcademy)) * 100
        : 0;

    return {
      monthIncome,
      monthExpenses,
      net: monthIncome - monthExpenses,
      pending,
      pendingCount,
      failedCount,
      clinical: clinicalActive,
      academy: academyActive,
      mrr,
      mrrAcademy,
      churn,
      churnedAcademy,
    };
  }, [transactions, expenses, records]);

  const showSubMetrics = tab === "suscripciones" || origen === "Academia";

  const filteredTotal = filtered
    .filter((t) => t.estado === "Pagado")
    .reduce((acc, t) => acc + t.amount, 0);

  const downloadInvoice = (tx: Transaction) => {
    const num = invoiceNumberOf(tx);
    downloadBlob(buildInvoicePdf(tx, num), `${num}.pdf`);
    toast.success(`Factura ${num} generada`, {
      description: `${tx.client} · ${fmtMoney(tx.amount)} · IVA ${tx.vat > 0 ? `${tx.vat}%` : "exento"}`,
    });
  };

  const resendInvoice = (tx: Transaction) => {
    toast.success("Factura reenviada por email", {
      description: `${invoiceNumberOf(tx)} enviada a ${tx.email}`,
    });
  };

  const confirmRefund = () => {
    if (!refundTarget) return;
    const value = Number(refundAmount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0 || value > refundTarget.amount) {
      toast.error("Introduce un importe válido para el reembolso");
      return;
    }
    const total = Math.abs(value - refundTarget.amount) < 0.005;
    setStatusOverrides((prev) => ({ ...prev, [refundTarget.id]: total ? "Reembolsado" : prev[refundTarget.id] ?? "Pagado" }));
    setCredits((prev) => [
      {
        ...refundTarget,
        id: `rec-${refundTarget.id}-${prev.length + 1}`,
        serie: `REC-2026-${String(prev.length + 1).padStart(3, "0")}`,
        rectifies: invoiceNumberOf(refundTarget),
        tipo: "Rectificativa",
        concept: `Reembolso ${total ? "total" : "parcial"} · ${refundTarget.concept}`,
        amount: -value,
        estado: "Reembolsado",
      },
      ...prev,
    ]);
    toast.success(`Reembolso ${total ? "total" : "parcial"} emitido`, {
      description: `${fmtMoney(value)} devueltos a ${refundTarget.client}`,
    });
    setRefundTarget(null);
    setRefundAmount("");
  };

  const confirmRectify = () => {
    if (!rectifyTarget) return;
    const serie = `REC-2026-${String(credits.length + 1).padStart(3, "0")}`;
    const credit: Transaction = {
      ...rectifyTarget,
      id: `rec-${rectifyTarget.id}-${credits.length + 1}`,
      serie,
      rectifies: invoiceNumberOf(rectifyTarget),
      tipo: "Rectificativa",
      concept: `Rectificativa de ${invoiceNumberOf(rectifyTarget)}${rectifyReason ? ` · ${rectifyReason}` : ""}`,
      amount: -rectifyTarget.amount,
      estado: "Reembolsado",
    };
    setCredits((prev) => [credit, ...prev]);
    downloadBlob(buildInvoicePdf(credit, serie), `${serie}.pdf`);
    toast.success(`Factura rectificativa ${serie} emitida`, {
      description: `Abono de ${fmtMoney(Math.abs(credit.amount))} para ${credit.client}`,
    });
    setRectifyTarget(null);
    setRectifyReason("");
  };

  const exportQuarter = () => {
    const [startM, endM] = QUARTERS[quarter];
    const rows = transactions.filter((t) => {
      const m = t.date.slice(5, 7);
      return t.date.startsWith("2026") && m >= startM && m <= endM && t.estado !== "Pendiente";
    });
    if (rows.length === 0) {
      toast.error(`No hay operaciones registradas en ${quarter} 2026`);
      return;
    }
    const header = [
      "Fecha",
      "Nº factura",
      "Cliente",
      "Email",
      "Origen",
      "Tipo",
      "Concepto",
      "Base exenta IVA (sanitario)",
      "Base sujeta 21%",
      "Cuota IVA 21%",
      "Total",
      "Estado",
    ];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const num = (n: number) => n.toFixed(2).replace(".", ",");
    let exempt = 0;
    let taxed = 0;
    let vatSum = 0;
    let total = 0;
    const lines = rows.map((t) => {
      const base = baseOf(t);
      const isExempt = t.vat === 0;
      const vatAmount = t.amount - base;
      if (isExempt) exempt += base;
      else {
        taxed += base;
        vatSum += vatAmount;
      }
      total += t.amount;
      return [
        t.date,
        invoiceNumberOf(t),
        t.client,
        t.email,
        t.origen,
        t.tipo,
        t.concept,
        num(isExempt ? base : 0),
        num(isExempt ? 0 : base),
        num(isExempt ? 0 : vatAmount),
        num(t.amount),
        t.estado,
      ]
        .map((v) => esc(String(v)))
        .join(";");
    });
    const totals = [
      "",
      "",
      "TOTALES",
      "",
      "",
      "",
      `Resumen ${quarter} 2026`,
      num(exempt),
      num(taxed),
      num(vatSum),
      num(total),
      "",
    ]
      .map((v) => esc(v))
      .join(";");
    const quarterExpenses = expenses.filter((e) => {
      const m = e.date.slice(5, 7);
      return e.date.startsWith("2026") && m >= startM && m <= endM;
    });
    const expenseLines = quarterExpenses.map((e) =>
      ["", "", "GASTO", "", "", e.category, e.concept, "", "", "", num(-e.amount), "Gasto"]
        .map((v) => esc(String(v)))
        .join(";"),
    );
    const csv =
      "\uFEFF" +
      [header.map(esc).join(";"), ...lines, totals, ...expenseLines].join("\r\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `gestoria-${quarter}-2026.csv`);
    toast.success(`Trimestre ${quarter} exportado`, {
      description: `Base exenta ${fmtMoney(exempt)} · Base 21% ${fmtMoney(taxed)} · IVA ${fmtMoney(vatSum)}`,
    });
  };

  const addExpense = () => {
    const value = Number(expenseForm.amount.replace(",", "."));
    if (!expenseForm.concept.trim() || !Number.isFinite(value) || value <= 0) {
      toast.error("Indica un concepto y un importe válido");
      return;
    }
    setExpenses((prev) => [
      {
        id: `exp-${Date.now()}`,
        concept: expenseForm.concept.trim(),
        date: expenseForm.date,
        amount: value,
        category: expenseForm.category,
      },
      ...prev,
    ]);
    toast.success("Gasto registrado", { description: `${expenseForm.concept} · ${fmtMoney(value)}` });
    setExpenseForm({ concept: "", date: "2026-07-01", amount: "", category: "Alquiler" });
    setExpenseOpen(false);
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

  const failedSubIds = new Set(
    transactions.filter((t) => t.estado === "Fallido").map((t) => t.client),
  );
  const pendingSubIds = new Set(
    transactions.filter((t) => t.estado === "Pendiente").map((t) => t.client),
  );

  const badgeFor = (e: Estado) =>
    e === "Pagado"
      ? s.badgePagado
      : e === "Pendiente"
        ? s.badgePendiente
        : e === "Fallido"
          ? s.badgeFallido
          : s.badgeReembolsado;

  const sortedExpenses = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

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
            className={`${s.tab} ${tab === "gastos" ? s.tabActive : ""}`}
            onClick={() => setTab("gastos")}
          >
            Gastos y rentabilidad
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
              <span className={s.summaryLabel}>Ingresos brutos</span>
              <span className={s.summaryIcon}>
                <Wallet size={18} />
              </span>
            </div>
            <span className={s.summaryValue}>{fmtMoney(summary.monthIncome)}</span>
            <span className={s.summaryHint}>Mes actual · julio 2026</span>
          </article>

          <article className={s.summary}>
            <div className={s.summaryTop}>
              <span className={s.summaryLabel}>Gastos del mes</span>
              <span className={`${s.summaryIcon} ${s.summaryIconSand}`}>
                <Wallet2 size={18} />
              </span>
            </div>
            <span className={s.summaryValue}>{fmtMoney(summary.monthExpenses)}</span>
            <span className={s.summaryHint}>{expenses.length} gastos registrados</span>
          </article>

          <article className={s.summary}>
            <div className={s.summaryTop}>
              <span className={s.summaryLabel}>Beneficio neto</span>
              <span className={`${s.summaryIcon} ${s.summaryIconSage}`}>
                <PiggyBank size={18} />
              </span>
            </div>
            <span className={`${s.summaryValue} ${summary.net < 0 ? s.negative : ""}`}>
              {fmtMoney(summary.net)}
            </span>
            <span className={s.summaryHint}>Ingresos menos gastos · julio 2026</span>
          </article>

          {showSubMetrics ? (
            <>
              <article className={s.summary}>
                <div className={s.summaryTop}>
                  <span className={s.summaryLabel}>MRR</span>
                  <span className={`${s.summaryIcon} ${s.summaryIconPlum}`}>
                    <Repeat size={18} />
                  </span>
                </div>
                <span className={s.summaryValue}>{fmtMoney(summary.mrr)}</span>
                <span className={s.summaryHint}>
                  Academia {fmtMoney(summary.mrrAcademy)} · Clínica{" "}
                  {fmtMoney(summary.mrr - summary.mrrAcademy)}
                </span>
              </article>

              <article className={s.summary}>
                <div className={s.summaryTop}>
                  <span className={s.summaryLabel}>Churn rate</span>
                  <span className={`${s.summaryIcon} ${s.summaryIconTerracota}`}>
                    <TrendingDown size={18} />
                  </span>
                </div>
                <span className={s.summaryValue}>
                  {summary.churn.toFixed(1).replace(".", ",")} %
                </span>
                <span className={s.summaryHint}>
                  {summary.churnedAcademy} bajas de {summary.academy + summary.churnedAcademy}{" "}
                  membresías
                </span>
              </article>
            </>
          ) : (
            <article className={s.summary}>
              <div className={s.summaryTop}>
                <span className={s.summaryLabel}>Pagos pendientes</span>
                <span className={`${s.summaryIcon} ${s.summaryIconTerracota}`}>
                  <Clock size={18} />
                </span>
              </div>
              <span className={s.summaryValue}>{fmtMoney(summary.pending)}</span>
              <span className={s.summaryHint}>
                {summary.pendingCount} por cobrar · {summary.failedCount} fallidos
              </span>
            </article>
          )}
        </section>

        {tab === "transacciones" && (
          <section className={s.card}>
            <div className={s.cardHeader}>
              <div>
                <h2 className={s.cardTitle}>
                  <Receipt size={19} strokeWidth={2.2} />
                  Transacciones
                </h2>
                <p className={s.cardSub}>
                  Consultas, seguimientos, suscripciones, cursos, recursos y rectificativas.
                </p>
              </div>
              <div className={s.toolbar}>
                <select
                  className={s.select}
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value as keyof typeof QUARTERS)}
                  aria-label="Trimestre fiscal"
                >
                  <option value="T1">T1 2026 (ene–mar)</option>
                  <option value="T2">T2 2026 (abr–jun)</option>
                  <option value="T3">T3 2026 (jul–sep)</option>
                  <option value="T4">T4 2026 (oct–dic)</option>
                </select>
                <button type="button" className={s.btnPrimary} onClick={exportQuarter}>
                  <FileSpreadsheet size={16} />
                  Exportar trimestre a CSV
                </button>
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
                <option value="Pendiente">Pago pendiente</option>
                <option value="Fallido">Pago fallido</option>
                <option value="Reembolsado">Reembolsado</option>
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
                          {invoiceNumberOf(t)} · IVA {t.vat > 0 ? `${t.vat}%` : "exento"}
                        </span>
                      </td>
                      <td className={`${s.amount} ${t.amount < 0 ? s.negative : ""}`}>
                        {fmtMoney(t.amount)}
                      </td>
                      <td>
                        <span className={`${s.badge} ${badgeFor(t.estado)}`}>
                          {t.estado === "Pendiente"
                            ? "Pago pendiente"
                            : t.estado === "Fallido"
                              ? "Pago fallido"
                              : t.estado}
                        </span>
                        {t.tipo === "Rectificativa" && (
                          <span className={s.conceptType}>Rectifica {t.rectifies}</span>
                        )}
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
                            className={s.iconBtn}
                            title="Reenviar factura por email"
                            aria-label={`Reenviar factura a ${t.email}`}
                            onClick={() => resendInvoice(t)}
                          >
                            <Mail size={16} />
                          </button>
                          {t.tipo !== "Rectificativa" && (
                            <>
                              <button
                                type="button"
                                className={s.iconBtn}
                                title="Emitir factura rectificativa (abono)"
                                aria-label={`Emitir rectificativa de ${invoiceNumberOf(t)}`}
                                onClick={() => {
                                  setRectifyTarget(t);
                                  setRectifyReason("");
                                }}
                              >
                                <FileMinus size={16} />
                              </button>
                              {t.estado === "Pagado" && (
                                <button
                                  type="button"
                                  className={s.iconBtn}
                                  title="Emitir reembolso"
                                  aria-label={`Emitir reembolso a ${t.client}`}
                                  onClick={() => {
                                    setRefundTarget(t);
                                    setRefundAmount(t.amount.toFixed(2));
                                  }}
                                >
                                  <Undo2 size={16} />
                                </button>
                              )}
                            </>
                          )}
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
        )}

        {tab === "gastos" && (
          <section className={s.card}>
            <div className={s.expenseHead}>
              <div>
                <h2 className={s.cardTitle}>
                  <Wallet2 size={19} strokeWidth={2.2} />
                  Gastos y rentabilidad
                </h2>
                <p className={s.cardSub}>
                  Alquiler, cuota de autónomos, software y demás gastos deducibles.
                </p>
              </div>
              <button type="button" className={s.btnPrimary} onClick={() => setExpenseOpen(true)}>
                <Plus size={16} />
                Registrar gasto
              </button>
            </div>

            <div className={s.tableWrap}>
              <table className={s.table} style={{ minWidth: 620 }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Categoría</th>
                    <th>Importe</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExpenses.map((e) => (
                    <tr key={e.id}>
                      <td className={s.dateCell}>{fmtDate(e.date)}</td>
                      <td>{e.concept}</td>
                      <td>
                        <span className={s.catBadge}>{e.category}</span>
                      </td>
                      <td className={`${s.amount} ${s.negative}`}>-{fmtMoney(e.amount)}</td>
                      <td>
                        <div className={s.actions}>
                          <button
                            type="button"
                            className={s.iconBtn}
                            title="Eliminar gasto"
                            aria-label={`Eliminar gasto ${e.concept}`}
                            onClick={() => {
                              setExpenses((prev) => prev.filter((x) => x.id !== e.id));
                              toast.success("Gasto eliminado");
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expenses.length === 0 && (
                <p className={s.empty}>Todavía no has registrado ningún gasto.</p>
              )}
            </div>

            <div className={s.tableFoot}>
              <span>{expenses.length} gastos registrados</span>
              <span className={s.footTotal}>
                Total gastos: {fmtMoney(totalExpenses)} · Beneficio neto del mes:{" "}
                {fmtMoney(summary.net)}
              </span>
            </div>
          </section>
        )}

        {tab === "suscripciones" && (
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
                  : `${academySubs.length} membresías · 29,00 € / mes · MRR ${fmtMoney(summary.mrrAcademy)}`}
              </p>

              <div className={s.subGrid}>
                {(subTab === "clinica" ? clinicalSubs : academySubs).map((r) => {
                  const failed = failedSubIds.has(r.name);
                  const pending = !failed && pendingSubIds.has(r.name);
                  return (
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
                        <span>Estado del cobro</span>
                        <span
                          className={`${s.badge} ${
                            failed ? s.badgeFallido : pending ? s.badgePendiente : s.badgePagado
                          }`}
                        >
                          {failed ? "Pago fallido" : pending ? "Pago pendiente" : "Al corriente"}
                        </span>
                      </div>
                      {(failed || pending) && (
                        <button
                          type="button"
                          className={s.btnGhost}
                          onClick={() =>
                            toast.success("Recordatorio de cobro enviado", {
                              description: `Aviso enviado a ${r.email}`,
                            })
                          }
                        >
                          <Mail size={15} />
                          Reclamar el cobro
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>

              {(subTab === "clinica" ? clinicalSubs : academySubs).length === 0 && (
                <p className={s.empty}>No hay suscripciones activas en este bloque.</p>
              )}
            </div>
          </section>
        )}
      </main>

      {detail && (
        <div className={s.overlay} onClick={() => setDetail(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
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
              <span>Nº de factura</span>
              <strong>{invoiceNumberOf(detail)}</strong>
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
              <strong>{fmtMoney(baseOf(detail))}</strong>
            </div>
            <div className={s.subRow}>
              <span>IVA</span>
              <strong>{detail.vat > 0 ? `${detail.vat}%` : "Exento (art. 20 LIVA)"}</strong>
            </div>
            <div className={s.subRow}>
              <span>Total</span>
              <strong>{fmtMoney(detail.amount)}</strong>
            </div>
            <div className={s.modalActions}>
              <button type="button" className={s.btnGhost} onClick={() => resendInvoice(detail)}>
                <Mail size={15} />
                Reenviar por email
              </button>
              <button type="button" className={s.btnPrimary} onClick={() => downloadInvoice(detail)}>
                <Download size={15} />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {rectifyTarget && (
        <div className={s.overlay} onClick={() => setRectifyTarget(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>
                <FileMinus size={18} /> Factura rectificativa
              </h2>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => setRectifyTarget(null)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            <p className={s.helper}>
              Se emitirá un abono en negativo con serie propia, rectificando la factura{" "}
              <strong>{invoiceNumberOf(rectifyTarget)}</strong> de {rectifyTarget.client}.
            </p>
            <div className={s.formGrid} style={{ marginTop: 14 }}>
              <div className={`${s.field} ${s.fieldWide}`}>
                <label className={s.label} htmlFor="rect-reason">
                  Motivo de la rectificación
                </label>
                <input
                  id="rect-reason"
                  className={s.input}
                  placeholder="Error en el importe, anulación del servicio…"
                  value={rectifyReason}
                  onChange={(e) => setRectifyReason(e.target.value)}
                />
              </div>
            </div>
            <div className={s.subRow} style={{ marginTop: 14 }}>
              <span>Importe del abono</span>
              <strong className={s.negative}>{fmtMoney(-rectifyTarget.amount)}</strong>
            </div>
            <div className={s.subRow}>
              <span>Serie</span>
              <strong>REC-2026-{String(credits.length + 1).padStart(3, "0")}</strong>
            </div>
            <div className={s.modalActions}>
              <button type="button" className={s.btnGhost} onClick={() => setRectifyTarget(null)}>
                Cancelar
              </button>
              <button type="button" className={s.btnPrimary} onClick={confirmRectify}>
                Emitir rectificativa
              </button>
            </div>
          </div>
        </div>
      )}

      {refundTarget && (
        <div className={s.overlay} onClick={() => setRefundTarget(null)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>
                <Undo2 size={18} /> Emitir reembolso
              </h2>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => setRefundTarget(null)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            <p className={s.helper}>
              {refundTarget.client} · {refundTarget.concept} ·{" "}
              <strong>{fmtMoney(refundTarget.amount)}</strong>
            </p>
            <div className={s.formGrid} style={{ marginTop: 14 }}>
              <div className={s.field}>
                <label className={s.label} htmlFor="refund-amount">
                  Importe a devolver (€)
                </label>
                <input
                  id="refund-amount"
                  className={s.input}
                  inputMode="decimal"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>
              <div className={s.field}>
                <span className={s.label}>Tipo</span>
                <button
                  type="button"
                  className={s.btnGhost}
                  onClick={() => setRefundAmount(refundTarget.amount.toFixed(2))}
                >
                  Reembolso total
                </button>
              </div>
            </div>
            <p className={s.helper} style={{ marginTop: 12 }}>
              Se generará automáticamente la factura rectificativa correspondiente.
            </p>
            <div className={s.modalActions}>
              <button type="button" className={s.btnGhost} onClick={() => setRefundTarget(null)}>
                Cancelar
              </button>
              <button type="button" className={s.btnPrimary} onClick={confirmRefund}>
                Confirmar reembolso
              </button>
            </div>
          </div>
        </div>
      )}

      {expenseOpen && (
        <div className={s.overlay} onClick={() => setExpenseOpen(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>
                <Wallet2 size={18} /> Registrar gasto
              </h2>
              <button
                type="button"
                className={s.iconBtn}
                onClick={() => setExpenseOpen(false)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            <div className={s.formGrid}>
              <div className={`${s.field} ${s.fieldWide}`}>
                <label className={s.label} htmlFor="exp-concept">
                  Concepto
                </label>
                <input
                  id="exp-concept"
                  className={s.input}
                  placeholder="Alquiler de consulta, cuota de autónomos…"
                  value={expenseForm.concept}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, concept: e.target.value }))}
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="exp-date">
                  Fecha
                </label>
                <input
                  id="exp-date"
                  type="date"
                  className={s.input}
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className={s.field}>
                <label className={s.label} htmlFor="exp-amount">
                  Importe (€)
                </label>
                <input
                  id="exp-amount"
                  className={s.input}
                  inputMode="decimal"
                  placeholder="0,00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className={`${s.field} ${s.fieldWide}`}>
                <label className={s.label} htmlFor="exp-cat">
                  Categoría
                </label>
                <select
                  id="exp-cat"
                  className={s.input}
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))
                  }
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={s.modalActions}>
              <button type="button" className={s.btnGhost} onClick={() => setExpenseOpen(false)}>
                Cancelar
              </button>
              <button type="button" className={s.btnPrimary} onClick={addExpense}>
                Guardar gasto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
