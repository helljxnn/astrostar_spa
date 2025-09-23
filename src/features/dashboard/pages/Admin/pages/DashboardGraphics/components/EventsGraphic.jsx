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

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EventsGraphic = () => {
  // Datos del gráfico
  const dashboardData = [
    { trimestre: "Trim 1", año2023: 21, año2024: 13, año2025: 18 },
    { trimestre: "Trim 2", año2023: 22, año2024: 12, año2025: 10 },
    { trimestre: "Trim 3", año2023: 24, año2024: 23, año2025: 15 },
    { trimestre: "Trim 4", año2023: 23, año2024: 7, año2025: 5 },
  ];

  // Columnas para exportar con ReportButton
  const reportColumns = [
    { key: "trimestre", label: "Trimestre" },
    { key: "año2023", label: "2023" },
    { key: "año2024", label: "2024" },
    { key: "año2025", label: "2025" },
  ];

  // Configuración para Chart.js
  const data = {
    labels: dashboardData.map((item) => item.trimestre),
    datasets: [
      {
        label: "2023",
        data: dashboardData.map((item) => item.año2023),
        backgroundColor: "rgba(110, 231, 249, 0.8)", // celeste
        borderRadius: 10,
        hoverBackgroundColor: "rgba(110, 231, 249, 1)",
      },
      {
        label: "2024",
        data: dashboardData.map((item) => item.año2024),
        backgroundColor: "rgba(167, 139, 250, 0.8)", // morado
        borderRadius: 10,
        hoverBackgroundColor: "rgba(167, 139, 250, 1)",
      },
      {
        label: "2025",
        data: dashboardData.map((item) => item.año2025),
        backgroundColor: "rgba(244, 114, 182, 0.8)", // rosado
        borderRadius: 10,
        hoverBackgroundColor: "rgba(244, 114, 182, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // permite ajustar el tamaño
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
          color: "#6B7280",
        },
      },
      title: {
        display: true,
        text: "Eventos Realizados",
        font: { size: 18, weight: "bold" },
        color: "#1F2937",
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
        ticks: { stepSize: 5 },
        grid: { drawBorder: false, color: "rgba(0,0,0,0.05)" },
      },
      x: {
        grid: { drawBorder: false, display: false },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full md:w-[500px] h-[350px]">
      {/* Botón de Reporte */}
      <div className="flex justify-between items-center mb-3">
        <ReportButton
          data={dashboardData}
          fileName="Reporte_Eventos"
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

export default EventsGraphic;
