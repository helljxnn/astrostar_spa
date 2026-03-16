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
import eventsService from "../../Events/services/eventsService";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const EventsGraphic = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);

  // Colores para los años
  const yearColors = [
    { bg: "rgba(110, 231, 249, 0.8)", hover: "rgba(110, 231, 249, 1)" }, // celeste
    { bg: "rgba(167, 139, 250, 0.8)", hover: "rgba(167, 139, 250, 1)" }, // morado
    { bg: "rgba(244, 114, 182, 0.8)", hover: "rgba(244, 114, 182, 1)" }, // rosado
  ];

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      setLoading(true);
      const response = await eventsService.getByQuarter();

      if (response.success && response.data) {
        setDashboardData(response.data);

        // Extraer los años dinámicamente de los datos
        if (response.data.length > 0) {
          const yearKeys = Object.keys(response.data[0])
            .filter((key) => key.startsWith("año"))
            .map((key) => key.replace("año", ""));
          setYears(yearKeys);
        }
      }
    } catch (error) {
      console.error("Error al cargar datos de eventos:", error);
      // Mantener datos vacíos en caso de error
      setDashboardData([
        { trimestre: "Trim 1" },
        { trimestre: "Trim 2" },
        { trimestre: "Trim 3" },
        { trimestre: "Trim 4" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Columnas para exportar con ReportButton (dinámicas según los años)
  const reportColumns = [
    { key: "trimestre", label: "Trimestre" },
    ...years.map((year) => ({ key: `año${year}`, label: year })),
  ];

  // Configuración para Chart.js
  const data = {
    labels: dashboardData.map((item) => item.trimestre),
    datasets: years.map((year, index) => ({
      label: year,
      data: dashboardData.map((item) => item[`año${year}`] || 0),
      backgroundColor: yearColors[index % yearColors.length].bg,
      borderRadius: 10,
      hoverBackgroundColor: yearColors[index % yearColors.length].hover,
    })),
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
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
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 order-2 sm:order-1">
          Eventos Realizados
        </h3>
        <div className="order-1 sm:order-2">
          <ReportButton
            dataProvider={async () => dashboardData}
            fileName="Reporte_Eventos"
            columns={reportColumns}
          />
        </div>
      </div>

      {/* Gráfico responsive */}
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

export default EventsGraphic;

