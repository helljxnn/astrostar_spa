import { useState, useEffect } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const DonationsGraphic = () => {
  const [loading] = useState(false);

  // Datos de ejemplo - conectar con tu API real
  const donationsData = [
    { mes: "Ene", monetarias: 45000, materiales: 12000, servicios: 8000 },
    { mes: "Feb", monetarias: 52000, materiales: 15000, servicios: 9500 },
    { mes: "Mar", monetarias: 48000, materiales: 13500, servicios: 7800 },
    { mes: "Abr", monetarias: 61000, materiales: 18000, servicios: 11000 },
    { mes: "May", monetarias: 55000, materiales: 16000, servicios: 9800 },
    { mes: "Jun", monetarias: 58000, materiales: 17500, servicios: 10500 },
  ];

  const reportColumns = [
    { key: "mes", label: "Mes" },
    { key: "monetarias", label: "Donaciones Monetarias" },
    { key: "materiales", label: "Donaciones en Materiales" },
    { key: "servicios", label: "Donaciones en Servicios" },
  ];

  const data = {
    labels: donationsData.map((item) => item.mes),
    datasets: [
      {
        label: "Monetarias",
        data: donationsData.map((item) => item.monetarias),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderRadius: 10,
        hoverBackgroundColor: "rgba(16, 185, 129, 1)",
      },
      {
        label: "Materiales",
        data: donationsData.map((item) => item.materiales),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 10,
        hoverBackgroundColor: "rgba(59, 130, 246, 1)",
      },
      {
        label: "Servicios",
        data: donationsData.map((item) => item.servicios),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        borderRadius: 10,
        hoverBackgroundColor: "rgba(249, 115, 22, 1)",
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
          padding: 10,
          color: "#6B7280",
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + (value / 1000).toFixed(0) + "K";
          },
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
        },
        grid: { drawBorder: false, color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 640 ? 10 : 12,
          },
        },
        grid: { drawBorder: false, display: false },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-3 sm:p-4 w-full h-[300px] sm:h-[350px] lg:h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 order-2 sm:order-1">
          Donaciones por Tipo
        </h3>
        <div className="order-1 sm:order-2">
          <ReportButton
            data={donationsData}
            fileName="Reporte_Donaciones"
            columns={reportColumns}
          />
        </div>
      </div>

      <div className="h-[220px] sm:h-[260px] lg:h-[320px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default DonationsGraphic;
