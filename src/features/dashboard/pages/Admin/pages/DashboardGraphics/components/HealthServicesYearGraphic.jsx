import { useState } from "react";
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

const HealthServicesYearGraphic = () => {
  // Años disponibles
  const years = [2023, 2024, 2025];
  const [selectedYear, setSelectedYear] = useState(2024);

  // Datos anuales de ejemplo
  const annualData = {
    2023: { nutricion: 280, fisioterapia: 210, psicologia: 190 },
    2024: { nutricion: 152, fisioterapia: 90, psicologia: 89 },
    2025: { nutricion: 180, fisioterapia: 100, psicologia: 95 },
  };

  const dataYear = annualData[selectedYear];
  const total =
    dataYear.nutricion + dataYear.fisioterapia + dataYear.psicologia;

  // Calcular porcentajes
  const pctNutricion = ((dataYear.nutricion / total) * 100).toFixed(1);
  const pctFisio = ((dataYear.fisioterapia / total) * 100).toFixed(1);
  const pctPsico = ((dataYear.psicologia / total) * 100).toFixed(1);

  // Datos para reporte
  const reportData = [
    { servicio: "Nutrición", cantidad: dataYear.nutricion, porcentaje: `${pctNutricion}%` },
    { servicio: "Fisioterapia", cantidad: dataYear.fisioterapia, porcentaje: `${pctFisio}%` },
    { servicio: "Psicología", cantidad: dataYear.psicologia, porcentaje: `${pctPsico}%` },
    { servicio: "Total", cantidad: total, porcentaje: "100%" },
  ];

  const reportColumns = [
    { key: "servicio", label: "Servicio" },
    { key: "cantidad", label: "Cantidad" },
    { key: "porcentaje", label: "Porcentaje" },
  ];

  // Configurar colores del gráfico
  const data = {
    labels: ["Nutrición", "Fisioterapia", "Psicología"],
    datasets: [
      {
        data: [dataYear.nutricion, dataYear.fisioterapia, dataYear.psicologia],
        backgroundColor: [
          "rgba(110, 231, 249, 0.85)", // celeste
          "rgba(167, 139, 250, 0.85)", // morado
          "rgba(244, 114, 182, 0.85)", // rosado
        ],
        borderColor: [
          "rgba(110, 231, 249, 1)",
          "rgba(167, 139, 250, 1)",
          "rgba(244, 114, 182, 1)",
        ],
        borderWidth: 2,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-3 sm:p-4 w-full h-[300px] sm:h-[350px] lg:h-[400px] flex flex-col">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 order-2 sm:order-1">
          Servicios de Salud Anuales
        </h3>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          {/* Selector de año responsive */}
          <select
            className="border border-gray-300 text-gray-700 rounded-md px-2 py-1 text-xs sm:text-sm focus:ring focus:ring-cyan-300"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Botón de reporte */}
          <ReportButton
            data={reportData}
            fileName={`Servicios_Salud_${selectedYear}`}
            columns={reportColumns}
          />
        </div>
      </div>

      {/* Gráfico centrado responsive */}
      <div className="h-[120px] sm:h-[160px] lg:h-[180px] flex justify-center items-center flex-shrink-0">
        <Doughnut data={data} options={options} />
      </div>

      {/* Leyenda personalizada responsive */}
      <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-3 flex-1">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-300"></div>
            <span className="text-gray-800">Nutrición</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{dataYear.nutricion}</span>
            <span className="text-gray-800 font-semibold">({pctNutricion}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-400"></div>
            <span className="text-gray-800">Fisioterapia</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{dataYear.fisioterapia}</span>
            <span className="text-gray-800 font-semibold">({pctFisio}%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-pink-400"></div>
            <span className="text-gray-800">Psicología</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-xs sm:text-sm">{dataYear.psicologia}</span>
            <span className="text-gray-800 font-semibold">({pctPsico}%)</span>
          </div>
        </div>

        <div className="pt-1 sm:pt-2 border-t border-gray-200 mt-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
            <span className="text-gray-800">Total de servicios</span>
            <span className="text-gray-800">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthServicesYearGraphic;
