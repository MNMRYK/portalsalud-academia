import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { NotebookPen, Activity, Save } from "lucide-react";
import { toast } from "sonner";
import s from "./Calendario.module.css";

const LINE_COLORS = ["#7c9070", "#a76d8e", "#c9825b", "#6b8fb0", "#b0985c"];

interface MetricRecord {
  category: string;
  metricName: string;
  value: number;
  /** yyyy-mm-dd */
  date: string;
}

/** Mock clínico usado durante la videoconsulta. */
export const consultationMetrics: MetricRecord[] = [
  { category: "Salud Digestiva", metricName: "Calidad heces", value: 2, date: "2026-03-15" },
  { category: "Salud Digestiva", metricName: "Calidad heces", value: 3, date: "2026-04-15" },
  { category: "Salud Digestiva", metricName: "Calidad heces", value: 4, date: "2026-05-15" },
  { category: "Salud Digestiva", metricName: "Calidad heces", value: 4, date: "2026-06-15" },
  { category: "Salud Digestiva", metricName: "Hinchazón", value: 4, date: "2026-03-15" },
  { category: "Salud Digestiva", metricName: "Hinchazón", value: 3, date: "2026-04-15" },
  { category: "Salud Digestiva", metricName: "Hinchazón", value: 2, date: "2026-05-15" },
  { category: "Salud Digestiva", metricName: "Hinchazón", value: 1, date: "2026-06-15" },
  { category: "Energía y Descanso", metricName: "Nivel de energía", value: 2, date: "2026-03-15" },
  { category: "Energía y Descanso", metricName: "Nivel de energía", value: 3, date: "2026-04-15" },
  { category: "Energía y Descanso", metricName: "Nivel de energía", value: 4, date: "2026-05-15" },
  { category: "Energía y Descanso", metricName: "Nivel de energía", value: 5, date: "2026-06-15" },
  { category: "Energía y Descanso", metricName: "Calidad del sueño", value: 3, date: "2026-03-15" },
  { category: "Energía y Descanso", metricName: "Calidad del sueño", value: 3, date: "2026-04-15" },
  { category: "Energía y Descanso", metricName: "Calidad del sueño", value: 4, date: "2026-05-15" },
  { category: "Energía y Descanso", metricName: "Calidad del sueño", value: 5, date: "2026-06-15" },
];

const formatShortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

function buildCategorySeries(records: MetricRecord[]) {
  const metricNames = Array.from(new Set(records.map((r) => r.metricName)));
  const dates = Array.from(new Set(records.map((r) => r.date))).sort();
  const data = dates.map((date) => {
    const point: Record<string, string | number> = { date: formatShortDate(date) };
    metricNames.forEach((name) => {
      const rec = records.find((r) => r.date === date && r.metricName === name);
      if (rec) point[name] = rec.value;
    });
    return point;
  });
  return { metricNames, data };
}

function CategoryChart({
  category,
  records,
}: {
  category: string;
  records: MetricRecord[];
}) {
  const { metricNames, data } = buildCategorySeries(records);
  return (
    <div className={s.wsChartCard}>
      <h4 className={s.wsChartTitle}>{category}</h4>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ top: 6, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece7df" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#8a8178" }}
            axisLine={{ stroke: "#e0dace" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8a8178" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ece7df",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          {metricNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3.5, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 5.5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConsultaWorkspace({ patient }: { patient: string }) {
  const [notes, setNotes] = useState("");
  const categories = Array.from(
    new Set(consultationMetrics.map((m) => m.category)),
  );

  return (
    <aside className={s.workspace}>
      <div className={s.wsBlock}>
        <div className={s.wsBlockHead}>
          <span className={s.wsBlockTitle}>
            <NotebookPen size={15} /> Notas de sesión
          </span>
          <span className={s.wsPrivate}>Privado · no visible para el paciente</span>
        </div>
        <textarea
          className={s.wsTextarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Apuntes en directo sobre ${patient}…`}
        />
        <button
          type="button"
          className={s.wsSaveBtn}
          onClick={() =>
            toast.success("Notas guardadas en la ficha clínica", {
              description: `Sesión con ${patient} · visibles solo para ti.`,
            })
          }
        >
          <Save size={14} /> Guardar en la ficha
        </button>
      </div>

      <div className={s.wsBlock}>
        <div className={s.wsBlockHead}>
          <span className={s.wsBlockTitle}>
            <Activity size={15} /> Resumen clínico del paciente
          </span>
        </div>
        <div className={s.wsCharts}>
          {categories.map((c) => (
            <CategoryChart
              key={c}
              category={c}
              records={consultationMetrics.filter((m) => m.category === c)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
