
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import DashboardService from "../services/DashboardService";

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const AthletesTrackingGraphic = () => {
  const [inscripcionesData, setInscripcionesData] = useState({
    vigentes: 0,
    vencidas: 0,
    pendientes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAthletesTracking();
  }, []);

  const fetchAthletesTracking = async () => {
    try {
      setLoading(true);
      const response = await DashboardService.getAthletesTracking();

      if (response.success && response.data) {
        setInscripcionesData({
          vigentes: response.data.vigentes || 0,
          vencidas: response.data.vencidas || 0,
          pendientes: response.data.pendientes || 0
        });
      }
    } catch (error) {
      console.error("Error al cargar datos de seguimiento:", error);
      // Mantener datos por defecto en caso de error
    } finally {
      setLoading(false);
    }
  };

  const total = inscripcionesData.vigentes + inscripcionesData.vencidas + inscripcionesData.pendientes;

  // Calcular porcentajes
  const porcentajeVigentes = total > 0 ? ((inscripcionesData.vigentes / total) * 100).toFixed(0) : 0;
  const porcentajeVencidas = total > 0 ? ((inscripcionesData.vencidas / total) * 100).toFixed(0) : 0;
  const porcentajePendientes = total > 0 ? ((inscripcionesData.pendientes / total) * 100).toFixed(0) : 0;

  // Datos para exportar - ESTADOS CORRECTOS
  const reportData = [
    { estado: "Vigentes", cantidad: inscripcionesData.vigentes, porcentaje: `${porcentajeVigentes}%` },
    { estado: "Vencidas", cantidad: inscripcionesData.vencidas, porcentaje: `${porcentajeVencidas}%` },
    { estado: "Pendientes de Pago", cantidad: inscripcionesData.pendientes, porcentaje: `${porcentajePendientes}%` },
    { estado: "Total", cantidad: total, porcentaje: "100%" },
  ];

  const reportColumns = [
    { key: "estado", label: "Estado" },
    { key: "cantidad", label: "Cantidad" },
    { key: "porcentaje", label: "Porcentaje" },
  ];

  // Configuración del gráfico - ESTADOS CORRECTOS
  const data = {
    labels: ["Vigentes", "Vencidas", "Pendientes de Pago"],
    datasets: [
      {
        data: [inscripcionesData.vigentes, inscripcionesData.vencidas, inscripcionesData.pendientes],
        backgroundColor: [
          "rgba(34, 197, 94, 0.85)",   // verde para vigentes
          "rgba(239, 68, 68, 0.85)",   // rojo para vencidas
          "rgba(251, 191, 36, 0.85)",  // amarillo para pendientes
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(251, 191, 36, 1)",
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(251, 191, 36, 1)",
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-3 sm:p-4 w-full h-[300px] sm:h-[350px] lg:h-[400px]">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 order-2 sm:order-1">
          Seguimiento Deportistas
        </h3>
        <div className="order-1 sm:order-2">
          <ReportButton
            dataProvider={async () => reportData}
            fileName="Seguimiento_Deportistas"
            columns={reportColumns}
          />
        </div>
      </div>

      {/* Gráfico centrado responsive */}
      <div className="h-[140px] sm:h-[180px] lg:h-[200px] flex justify-center items-center">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : total === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No hay datos de matrículas disponibles
          </div>
        ) : (
          <Doughnut data={data} options={options} />
        )}
      </div>

      {/* Leyenda personalizada responsive - ESTADOS CORRECTOS */}
      <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700">Vigentes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{inscripcionesData.vigentes}</span>
            <span className="text-gray-800 font-semibold">({porcentajeVigentes}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700">Vencidas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{inscripcionesData.vencidas}</span>
            <span className="text-gray-800 font-semibold">({porcentajeVencidas}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-700">Pendientes de Pago</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{inscripcionesData.pendientes}</span>
            <span className="text-gray-800 font-semibold">({porcentajePendientes}%)</span>
          </div>
        </div>

        {/* Total responsive */}
        <div className="border-t pt-1 sm:pt-2 mt-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-gray-800">Total</span>
            <span className="text-gray-800">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthletesTrackingGraphic;
