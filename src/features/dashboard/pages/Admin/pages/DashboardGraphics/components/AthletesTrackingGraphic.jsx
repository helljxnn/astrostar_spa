
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ReportButton from "../../../../../../../shared/components/ReportButton";

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const AthletesTrackingGraphic = () => {
  // Datos de ejemplo - puedes conectar esto con tus datos reales
  const inscripcionesData = {
    vigentes: 65,
    suspendidas: 175,
    vencidas: 84,
  };

  const total = inscripcionesData.vigentes + inscripcionesData.suspendidas + inscripcionesData.vencidas;

  // Calcular porcentajes
  const porcentajeVigentes = ((inscripcionesData.vigentes / total) * 100).toFixed(0);
  const porcentajeSuspendidas = ((inscripcionesData.suspendidas / total) * 100).toFixed(0);
  const porcentajeVencidas = ((inscripcionesData.vencidas / total) * 100).toFixed(0);

  // Datos para exportar
  const reportData = [
    { estado: "Vigentes", cantidad: inscripcionesData.vigentes, porcentaje: `${porcentajeVigentes}%` },
    { estado: "Suspendidas", cantidad: inscripcionesData.suspendidas, porcentaje: `${porcentajeSuspendidas}%` },
    { estado: "Vencidas", cantidad: inscripcionesData.vencidas, porcentaje: `${porcentajeVencidas}%` },
    { estado: "Total", cantidad: total, porcentaje: "100%" },
  ];

  const reportColumns = [
    { key: "estado", label: "Estado" },
    { key: "cantidad", label: "Cantidad" },
    { key: "porcentaje", label: "Porcentaje" },
  ];

  // Configuración del gráfico
  const data = {
    labels: ["Suspendidas", "Vigentes", "Vencidas"],
    datasets: [
      {
        data: [inscripcionesData.suspendidas, inscripcionesData.vigentes, inscripcionesData.vencidas],
        backgroundColor: [
          "rgba(167, 139, 250, 0.85)", // morado
          "rgba(110, 231, 249, 0.85)", // celeste
          "rgba(251, 191, 36, 0.85)",  // amarillo
        ],
        borderColor: [
          "rgba(167, 139, 250, 1)",
          "rgba(110, 231, 249, 1)",
          "rgba(251, 191, 36, 1)",
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(167, 139, 250, 1)",
          "rgba(110, 231, 249, 1)",
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
            const percentage = ((value / total) * 100).toFixed(1);
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
            data={reportData}
            fileName="Seguimiento_Deportistas"
            columns={reportColumns}
          />
        </div>
      </div>

      {/* Gráfico centrado responsive */}
      <div className="h-[140px] sm:h-[180px] lg:h-[200px] flex justify-center items-center">
        <Doughnut data={data} options={options} />
      </div>

      {/* Leyenda personalizada responsive */}
      <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-400"></div>
            <span className="text-gray-700">Suspendidas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{inscripcionesData.suspendidas}</span>
            <span className="text-gray-800 font-semibold">({porcentajeSuspendidas}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-300"></div>
            <span className="text-gray-700">Vigentes</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{inscripcionesData.vigentes}</span>
            <span className="text-gray-800 font-semibold">({porcentajeVigentes}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-700">Vencidas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{inscripcionesData.vencidas}</span>
            <span className="text-gray-800 font-semibold">({porcentajeVencidas}%)</span>
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
