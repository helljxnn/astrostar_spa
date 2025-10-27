import { useState, useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import ReportButton from "../../../../../../../shared/components/ReportButton";

ChartJS.register(ArcElement, Tooltip, Legend);

const HealthServicesYearGraphic = () => {
  const years = [2023, 2024, 2025];
  const [selectedYear, setSelectedYear] = useState(2024);

  const annualData = {
    2023: { nutricion: 280, fisioterapia: 210, psicologia: 190 },
    2024: { nutricion: 152, fisioterapia: 90, psicologia: 89 },
    2025: { nutricion: 180, fisioterapia: 100, psicologia: 95 },
  };

  const dataYear = annualData[selectedYear];
  const previousYear = annualData[selectedYear - 1];
  
  const total = Object.values(dataYear).reduce((a, b) => a + b, 0);

  const porcentajes = useMemo(
    () => ({
      nutricion: ((dataYear.nutricion / total) * 100).toFixed(1),
      fisioterapia: ((dataYear.fisioterapia / total) * 100).toFixed(1),
      psicologia: ((dataYear.psicologia / total) * 100).toFixed(1),
    }),
    [dataYear, total]
  );

  const variaciones = useMemo(() => {
    if (!previousYear) return null;
    return Object.keys(dataYear).reduce((acc, key) => {
      const prev = previousYear[key];
      const current = dataYear[key];
      const diff = prev ? ((current - prev) / prev) * 100 : 0;
      acc[key] = diff.toFixed(1);
      return acc;
    }, {});
  }, [dataYear, previousYear]);

  const data = {
    labels: ["Nutrición", "Fisioterapia", "Psicología"],
    datasets: [
      {
        data: [dataYear.nutricion, dataYear.fisioterapia, dataYear.psicologia],
        backgroundColor: [
          "rgba(110, 231, 249, 0.85)",
          "rgba(167, 139, 250, 0.85)",
          "rgba(244, 114, 182, 0.85)",
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
        backgroundColor: "rgba(31, 41, 55, 0.95)",
        titleColor: "#fff",
        bodyColor: "#E5E7EB",
        borderColor: "rgba(110, 231, 249, 0.3)",
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => context[0].label,
          label: (context) => {
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return [
              `Cantidad: ${value}`,
              `Porcentaje: ${percentage}%`
            ];
          },
          footer: () => `Total ${selectedYear}: ${total} servicios`
        }
      },
    },
  };

  const ranking = Object.entries(dataYear)
    .sort((a, b) => b[1] - a[1])
    .map(([service, value]) => ({
      service,
      value,
      porcentaje: porcentajes[service],
      variacion: variaciones ? variaciones[service] : null,
    }));

  const reportData = [
    {
      servicio: "TOTAL GENERAL",
      cantidad: total,
      porcentaje: "100%",
      variacion: 'N/A'
    },
    ...ranking.map((r) => ({
      servicio: r.service,
      cantidad: r.value,
      porcentaje: `${r.porcentaje}%`,
      variacion: r.variacion ? `${r.variacion}%` : 'N/A',
    }))
  ];

  const reportColumns = [
    { key: "servicio", label: "Servicio" },
    { key: "cantidad", label: "Cantidad" },
    { key: "porcentaje", label: "Porcentaje" },
    { key: "variacion", label: "Variación" },
  ];

  const getTrendIcon = (variacion) => {
    if (!variacion) return <Minus className="w-3 h-3 text-gray-400" />;
    const val = parseFloat(variacion);
    if (val > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (val < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getTrendColor = (variacion) => {
    if (!variacion) return "text-gray-600";
    const val = parseFloat(variacion);
    if (val > 0) return "text-green-600 font-semibold";
    if (val < 0) return "text-red-600 font-semibold";
    return "text-gray-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-white to-gray-50 shadow-md rounded-2xl p-5 sm:p-6 w-full h-[520px] flex flex-col"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-cyan-600" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">
              Servicios de Salud (Anual)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
            <span className="font-semibold text-blue-800">Total:</span>
            <span className="font-bold text-blue-700">{total.toLocaleString()} servicios</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {selectedYear}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border border-gray-300 bg-white rounded-xl px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-cyan-400"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ReportButton
            data={reportData}
            fileName={`Servicios_Salud_${selectedYear}`}
            columns={reportColumns}
          />
        </div>
      </div>

      <div className="h-[300px] mb-4 flex-shrink-0">
        <Doughnut data={data} options={options} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-gray-100 rounded-xl p-4 flex-1 min-h-0"
      >
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></span>
          Ranking de Servicios Más Demandados
        </h4>
        <div className="overflow-y-auto max-h-full space-y-2">
          {ranking.map((r, index) => (
            <motion.div
              key={r.service}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-sm text-gray-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800 capitalize">
                      {r.service}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {variaciones && (
                        <div className={`flex items-center gap-1 ${getTrendColor(r.variacion)}`}>
                          {getTrendIcon(r.variacion)}
                          <span className="text-xs">
                            {r.variacion > 0 ? '+' : ''}{r.variacion}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">{r.value}</div>
                  <div className="text-xs text-gray-500">{r.porcentaje}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HealthServicesYearGraphic;