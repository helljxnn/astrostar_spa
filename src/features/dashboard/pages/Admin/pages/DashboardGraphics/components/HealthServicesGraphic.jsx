import React from "react";
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
import ReportButton from "../../../../../../../shared/components/ReportButton";

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HealthServicesGraphic = () => {
  // Datos de ejemplo (puedes reemplazarlos con datos reales)
  const servicesData = [
    { mes: "Enero", nutricion: 20, fisioterapia: 12, psicologia: 15 },
    { mes: "Febrero", nutricion: 22, fisioterapia: 10, psicologia: 14 },
    { mes: "Marzo", nutricion: 25, fisioterapia: 20, psicologia: 18 },
    { mes: "Abril", nutricion: 23, fisioterapia: 7, psicologia: 13 },
    { mes: "Junio", nutricion: 17, fisioterapia: 9, psicologia: 14 },
    { mes: "Julio", nutricion: 20, fisioterapia: 13, psicologia: 15 },
    { mes: "Agosto", nutricion: 19, fisioterapia: 14, psicologia: 14 },
  ];

  // Configuración para el reporte Excel
  const reportColumns = [
    { key: "mes", label: "Mes" },
    { key: "nutricion", label: "Nutrición" },
    { key: "fisioterapia", label: "Fisioterapia" },
    { key: "psicologia", label: "Psicología" },
  ];

  // Configuración del gráfico
  const data = {
    labels: servicesData.map((item) => item.mes),
    datasets: [
      {
        label: "Nutrición",
        data: servicesData.map((item) => item.nutricion),
        backgroundColor: "rgba(110, 231, 249, 0.8)", // celeste pastel
        borderRadius: 10,
        hoverBackgroundColor: "rgba(110, 231, 249, 1)",
      },
      {
        label: "Fisioterapia",
        data: servicesData.map((item) => item.fisioterapia),
        backgroundColor: "rgba(167, 139, 250, 0.8)", // morado pastel
        borderRadius: 10,
        hoverBackgroundColor: "rgba(167, 139, 250, 1)",
      },
      {
        label: "Psicología",
        data: servicesData.map((item) => item.psicologia),
        backgroundColor: "rgba(244, 114, 182, 0.8)", // rosado pastel
        borderRadius: 10,
        hoverBackgroundColor: "rgba(244, 114, 182, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
          color: "#6B7280",
          font: { size: 13 },
        },
      },
      title: {
        display: true,
        text: "Servicios de Salud",
        align: "center",
        color: "#1F2937",
        font: { size: 18, weight: "bold" },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5, color: "#6B7280" },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { color: "#6B7280" },
        grid: { display: false },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full md:w-[500px] h-[350px]">
      {/* Header con botón y título */}
      <div className="flex justify-between items-center mb-3">
        <ReportButton
          data={servicesData}
          fileName="Servicios_Salud"
          columns={reportColumns}
        />
      </div>

      {/* Gráfico */}
      <div className="h-[280px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default HealthServicesGraphic;
