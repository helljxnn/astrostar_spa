import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReportButton from "../../../../../../../shared/components/ReportButton";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HealthServicesGraphic = ({ healthData, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [selectedService, setSelectedService] = useState("Todos");

  // Usar datos reales o datos por defecto
  const baseData = healthData?.monthly || [
    { mes: "Enero", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Febrero", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Marzo", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Abril", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Mayo", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Junio", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Julio", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Agosto", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Septiembre", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Octubre", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Noviembre", nutricion: 0, fisioterapia: 0, psicologia: 0 },
    { mes: "Diciembre", nutricion: 0, fisioterapia: 0, psicologia: 0 }
  ];

  const filteredData = useMemo(() => {
    let data = [...baseData];
    if (selectedMonth !== "Todos") {
      data = data.filter((item) => item.mes === selectedMonth);
    }
    if (selectedService !== "Todos") {
      data = data.map((item) => ({
        mes: item.mes,
        [selectedService.toLowerCase()]: item[selectedService.toLowerCase()],
      }));
    }
    return data;
  }, [baseData, selectedMonth, selectedService]);

  const reportColumns = [
    { key: "mes", label: "Mes" },
    { key: "nutricion", label: "Nutrición" },
    { key: "fisioterapia", label: "Fisioterapia" },
    { key: "psicologia", label: "Psicología" },
  ];

  const datasets = [];
  if (selectedService === "Todos" || selectedService === "Nutricion") {
    datasets.push({
      label: "Nutrición",
      data: filteredData.map((i) => i.nutricion || 0),
      backgroundColor: "rgba(110, 231, 249, 0.75)",
      borderRadius: 10,
    });
  }
  if (selectedService === "Todos" || selectedService === "Fisioterapia") {
    datasets.push({
      label: "Fisioterapia",
      data: filteredData.map((i) => i.fisioterapia || 0),
      backgroundColor: "rgba(167, 139, 250, 0.75)",
      borderRadius: 10,
    });
  }
  if (selectedService === "Todos" || selectedService === "Psicologia") {
    datasets.push({
      label: "Psicología",
      data: filteredData.map((i) => i.psicologia || 0),
      backgroundColor: "rgba(244, 114, 182, 0.75)",
      borderRadius: 10,
    });
  }

  const data = { labels: filteredData.map((i) => i.mes), datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, color: "#374151", padding: 12, font: { size: 13 } },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        cornerRadius: 8,
        padding: 10,
      },
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
          {baseData.map((item) => (
            <option key={item.mes} value={item.mes}>
              {item.mes}
            </option>
          ))}
        </select>

        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="border border-gray-300 bg-white rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-cyan-400"
        >
          <option value="Todos">Todos los servicios</option>
          <option value="Nutricion">Nutrición</option>
          <option value="Fisioterapia">Fisioterapia</option>
          <option value="Psicologia">Psicología</option>
        </select>
      </div>

      <div className="h-[400px] flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>

      <div className="h-0"></div>
    </motion.div>
  );
};

export default HealthServicesGraphic;