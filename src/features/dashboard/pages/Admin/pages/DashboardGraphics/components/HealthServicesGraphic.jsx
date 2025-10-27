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

const HealthServicesGraphic = () => {
  const baseData = [
    { mes: "Enero", nutricion: 20, fisioterapia: 12, psicologia: 15 },
    { mes: "Febrero", nutricion: 22, fisioterapia: 10, psicologia: 14 },
    { mes: "Marzo", nutricion: 25, fisioterapia: 20, psicologia: 18 },
    { mes: "Abril", nutricion: 23, fisioterapia: 7, psicologia: 13 },
    { mes: "Mayo", nutricion: 18, fisioterapia: 12, psicologia: 10 },
    { mes: "Junio", nutricion: 17, fisioterapia: 9, psicologia: 14 },
    { mes: "Julio", nutricion: 20, fisioterapia: 13, psicologia: 15 },
    { mes: "Agosto", nutricion: 19, fisioterapia: 14, psicologia: 14 },
    { mes: "Septiembre", nutricion: 21, fisioterapia: 15, psicologia: 13 },
    { mes: "Octubre", nutricion: 23, fisioterapia: 17, psicologia: 16 },
    { mes: "Noviembre", nutricion: 26, fisioterapia: 19, psicologia: 18 },
    { mes: "Diciembre", nutricion: 28, fisioterapia: 22, psicologia: 20 },
  ];

  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [selectedService, setSelectedService] = useState("Todos");

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
  }, [selectedMonth, selectedService]);

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
        <ReportButton data={filteredData} fileName="Servicios_Salud" columns={reportColumns} />
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
        <Bar data={data} options={options} />
      </div>

      <div className="h-0"></div>
    </motion.div>
  );
};

export default HealthServicesGraphic;