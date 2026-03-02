import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ReportButton from "../../../../../../../shared/components/ReportButton";

ChartJS.register(ArcElement, Tooltip, Legend);

const TopDonorsGraphic = () => {
  // Datos de ejemplo - conectar con tu API real
  const donorsData = [
    { nombre: "Empresa ABC", monto: 85000 },
    { nombre: "Fundación XYZ", monto: 62000 },
    { nombre: "Donante Anónimo", monto: 48000 },
    { nombre: "Corporación 123", monto: 35000 },
    { nombre: "Otros", monto: 89000 },
  ];

  const total = donorsData.reduce((sum, item) => sum + item.monto, 0);

  const reportData = donorsData.map((donor) => ({
    ...donor,
    porcentaje: `${((donor.monto / total) * 100).toFixed(1)}%`,
  }));

  const reportColumns = [
    { key: "nombre", label: "Donante" },
    { key: "monto", label: "Monto" },
    { key: "porcentaje", label: "Porcentaje" },
  ];

  const data = {
    labels: donorsData.map((item) => item.nombre),
    datasets: [
      {
        data: donorsData.map((item) => item.monto),
        backgroundColor: [
          "rgba(16, 185, 129, 0.85)",
          "rgba(59, 130, 246, 0.85)",
          "rgba(249, 115, 22, 0.85)",
          "rgba(168, 85, 247, 0.85)",
          "rgba(236, 72, 153, 0.85)",
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
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
            const formattedValue = new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(value);
            return `${label}: ${formattedValue} (${percentage}%)`;
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

  const colors = [
    "bg-green-500",
    "bg-blue-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  return (
    <div className="bg-white shadow-md rounded-xl p-3 sm:p-4 w-full h-[300px] sm:h-[350px] lg:h-[450px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 order-2 sm:order-1">
          Top Donantes
        </h3>
        <div className="order-1 sm:order-2">
          <ReportButton
            data={reportData}
            fileName="Top_Donantes"
            columns={reportColumns}
          />
        </div>
      </div>

      <div className="h-[140px] sm:h-[160px] lg:h-[180px] flex justify-center items-center">
        <Doughnut data={data} options={options} />
      </div>

      <div className="space-y-2 mt-3 max-h-[120px] overflow-y-auto">
        {donorsData.map((donor, index) => {
          const percentage = ((donor.monto / total) * 100).toFixed(1);
          return (
            <div
              key={index}
              className="flex items-center justify-between text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${colors[index]}`}
                ></div>
                <span className="text-gray-700 truncate">{donor.nombre}</span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-gray-600 text-xs">
                  ${(donor.monto / 1000).toFixed(0)}K
                </span>
                <span className="text-gray-800 font-semibold">
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopDonorsGraphic;
