import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ReportButton from "../../../../../../../shared/components/ReportButton";

ChartJS.register(ArcElement, Tooltip, Legend);

const TopDonorsGraphic = ({ donations = [] }) => {
  // Procesar donaciones reales para obtener top donantes
  const processTopDonors = () => {
    const donorTotals = {};

    donations.forEach((donation) => {
      if (donation.status === "Anulada" || !donation.donorSponsorId) return;

      const donorId = donation.donorSponsorId;
      const donorName = 
        donation.donorSponsor?.nombre ||
        donation.donorSponsor?.name ||
        donation.donor?.nombre ||
        donation.donor?.name ||
        `Donante #${donorId}`;

      if (!donorTotals[donorId]) {
        donorTotals[donorId] = { nombre: donorName, monto: 0 };
      }

      const details = donation.details || [];
      
      if (donation.type === "ECONOMICA" || donation.type === "ALIMENTOS") {
        const payment = details.find((d) => d.recordType === "payment");
        donorTotals[donorId].monto += payment?.amount || 0;
      } else if (donation.type === "ESPECIE") {
        const itemsValue = details.reduce((sum, d) => {
          if (d.recordType === "item") {
            // Usar el amount si existe, sino usar quantity sin multiplicar
            return sum + (d.amount || d.quantity || 0);
          }
          return sum;
        }, 0);
        donorTotals[donorId].monto += itemsValue;
      }
    });

    // Ordenar por monto y tomar top 4
    const sortedDonors = Object.values(donorTotals)
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 4);

    // Calcular "Otros"
    const topTotal = sortedDonors.reduce((sum, d) => sum + d.monto, 0);
    const grandTotal = Object.values(donorTotals).reduce((sum, d) => sum + d.monto, 0);
    const othersTotal = grandTotal - topTotal;

    if (othersTotal > 0) {
      sortedDonors.push({ nombre: "Otros", monto: othersTotal });
    }

    return sortedDonors.length > 0 ? sortedDonors : [
      { nombre: "Sin donaciones", monto: 1 }
    ];
  };

  const donorsData = processTopDonors();

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
