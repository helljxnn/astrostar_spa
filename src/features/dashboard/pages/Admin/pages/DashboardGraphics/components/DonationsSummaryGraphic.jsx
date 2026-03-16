import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { FaDollarSign, FaBox, FaHandHoldingHeart } from "react-icons/fa";
import ReportButton from "../../../../../../../shared/components/ReportButton";

ChartJS.register(ArcElement, Tooltip, Legend);

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtCompact = (n) => {
  const num = Number(n || 0);
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${fmt(num)}`;
};

const DonationsSummaryGraphic = ({ donations = [] }) => {
  const stats = useMemo(() => {
    const validas = donations.filter((d) => d.status !== "Anulada");

    const monetario = validas
      .filter((d) => d.type === "ECONOMICA" || d.type === "ALIMENTOS")
      .reduce((sum, d) => {
        const pay = (d.details || []).find((det) => det.recordType === "payment");
        return sum + (pay?.amount || 0);
      }, 0);

    const especie = validas
      .filter((d) => d.type === "ESPECIE")
      .reduce((sum, d) =>
        sum + (d.details || []).reduce((s, det) =>
          det.recordType === "item" ? s + Math.round(Number(det.quantity) || 0) : s, 0), 0);

    const total = validas.length;
    const monetariasCount = validas.filter((d) => d.type === "ECONOMICA" || d.type === "ALIMENTOS").length;
    const especieCount = validas.filter((d) => d.type === "ESPECIE").length;

    return { monetario, especie, total, monetariasCount, especieCount };
  }, [donations]);

  const chartData = {
    labels: ["En Dinero", "En Especie"],
    datasets: [{
      data: [stats.monetariasCount, stats.especieCount],
      backgroundColor: ["rgba(167,139,250,0.85)", "rgba(110,231,249,0.85)"],
      borderColor: ["rgba(167,139,250,1)", "rgba(110,231,249,1)"],
      borderWidth: 2,
      cutout: "68%",
    }],
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
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed} donaciones`,
        },
      },
    },
  };

  const reportData = [
    { tipo: "Total", cantidad: stats.total, monto: `$${fmt(stats.monetario)}`, items: stats.especie },
    { tipo: "En Dinero", cantidad: stats.monetariasCount, monto: `$${fmt(stats.monetario)}`, items: "-" },
    { tipo: "En Especie", cantidad: stats.especieCount, monto: "-", items: stats.especie },
  ];
  const reportColumns = [
    { key: "tipo", label: "Tipo" },
    { key: "cantidad", label: "Cantidad" },
    { key: "monto", label: "Monto" },
    { key: "items", label: "Items" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-5 sm:p-6 border border-gray-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Resumen de Donaciones</h3>
        <ReportButton data={reportData} fileName="Resumen_Donaciones" columns={reportColumns} />
      </div>

      {/* Total grande */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
          <FaHandHoldingHeart className="text-white text-base" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Total donaciones registradas</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
      </div>

      {/* Donut */}
      <div className="h-[180px] flex justify-center mb-5">
        {stats.total === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">Sin datos</div>
        ) : (
          <Doughnut data={chartData} options={options} />
        )}
      </div>

      {/* Detalle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <FaDollarSign className="text-purple-500 text-sm" />
            <span className="text-sm font-medium text-gray-700">En Dinero</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{stats.monetariasCount} donaciones</p>
            <p className="text-xs text-gray-500">${fmt(stats.monetario)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <FaBox className="text-cyan-500 text-sm" />
            <span className="text-sm font-medium text-gray-700">En Especie</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{stats.especieCount} donaciones</p>
            <p className="text-xs text-gray-500">{fmt(stats.especie)} unidades</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DonationsSummaryGraphic;
