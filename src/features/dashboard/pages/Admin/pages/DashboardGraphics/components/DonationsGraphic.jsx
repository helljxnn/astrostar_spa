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

const DonationsGraphic = ({ donations = [] }) => {
  const [loading] = useState(false);

  // Procesar donaciones reales por mes
  const processDonationsByMonth = () => {
    const monthlyData = {};
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    // Inicializar últimos 6 meses
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        mes: monthNames[date.getMonth()],
        monetarias: 0,
        materiales: 0,
        servicios: 0,
      };
    }

    // Procesar donaciones
    donations.forEach((donation) => {
      if (donation.status === "Anulada") return;
      
      const date = new Date(donation.donationAt || donation.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[key]) return;

      const details = donation.details || [];
      
      if (donation.type === "ECONOMICA" || donation.type === "ALIMENTOS") {
        const payment = details.find((d) => d.recordType === "payment");
        monthlyData[key].monetarias += payment?.amount || 0;
      } else if (donation.type === "ESPECIE") {
        const itemsValue = details.reduce((sum, d) => {
          if (d.recordType === "item") {
            return sum + (d.amount || d.quantity || 0);
          }
          return sum;
        }, 0);
        monthlyData[key].materiales += itemsValue;
      }
    });

    return Object.values(monthlyData);
  };

  const donationsData = processDonationsByMonth();

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
            dataProvider={async () => donationsData}
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

