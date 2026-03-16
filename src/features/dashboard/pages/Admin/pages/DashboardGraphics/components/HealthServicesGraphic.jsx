import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReportButton from "../../../../../../../shared/components/ReportButton";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const normalizeSpecialty = (val = "") =>
  String(val).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const HealthServicesGraphic = ({ appointments = [], loading = false }) => {
  const [selectedMonth, setSelectedMonth] = useState("Todos");

  // Detectar qué especialidades hay en las citas recibidas (ya filtradas desde el padre)
  const activeSpecialties = useMemo(() => {
    const set = new Set();
    appointments.forEach((a) => {
      const sp = normalizeSpecialty(a.specialty || "");
      if (sp) set.add(sp);
    });
    return Array.from(set);
  }, [appointments]);

  // Construir datos mensuales desde las citas ya filtradas
  const monthlyData = useMemo(() => {
    const map = {};
    MONTH_NAMES.forEach((mes) => {
      map[mes] = { mes };
      activeSpecialties.forEach((sp) => { map[mes][sp] = 0; });
    });

    appointments.forEach((a) => {
      const date = new Date(a.appointmentDate || a.start || a.createdAt);
      if (isNaN(date.getTime())) return;
      const mes = MONTH_NAMES[date.getMonth()];
      const sp = normalizeSpecialty(a.specialty || "");
      if (sp && map[mes]) map[mes][sp] = (map[mes][sp] || 0) + 1;
    });

    return Object.values(map);
  }, [appointments, activeSpecialties]);

  const filteredData = useMemo(() => {
    if (selectedMonth === "Todos") return monthlyData;
    return monthlyData.filter((d) => d.mes === selectedMonth);
  }, [monthlyData, selectedMonth]);

  const reportColumns = [
    { key: "mes", label: "Mes" },
    ...activeSpecialties.map((sp) => ({ key: sp, label: sp.charAt(0).toUpperCase() + sp.slice(1) })),
  ];

  const COLORS = [
    "rgba(110, 231, 249, 0.75)",
    "rgba(167, 139, 250, 0.75)",
    "rgba(244, 114, 182, 0.75)",
    "rgba(52, 211, 153, 0.75)",
    "rgba(251, 191, 36, 0.75)",
  ];

  const datasets = activeSpecialties.map((sp, i) => ({
    label: sp.charAt(0).toUpperCase() + sp.slice(1),
    data: filteredData.map((d) => d[sp] || 0),
    backgroundColor: COLORS[i % COLORS.length],
    borderRadius: 10,
  }));

  const chartData = { labels: filteredData.map((i) => i.mes), datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, color: "#374151", padding: 12, font: { size: 13 } } },
      tooltip: { backgroundColor: "#1F2937", titleColor: "#fff", bodyColor: "#E5E7EB", cornerRadius: 8, padding: 10 },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#6B7280" }, grid: { color: "rgba(0,0,0,0.05)" } },
      x: { ticks: { color: "#6B7280" }, grid: { display: false } },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-white to-gray-50 shadow-md rounded-2xl p-5 sm:p-6 w-full h-[520px]"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">
          Servicios de Salud (Mensual)
        </h3>
        <ReportButton dataProvider={async () => filteredData} fileName="Servicios_Salud" columns={reportColumns} />
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 bg-white rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-cyan-400"
        >
          <option value="Todos">Todos los meses</option>
          {MONTH_NAMES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="h-[380px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
          </div>
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </motion.div>
  );
};

export default HealthServicesGraphic;

