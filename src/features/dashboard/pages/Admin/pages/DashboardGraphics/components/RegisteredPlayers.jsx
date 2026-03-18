import React, { useState, useEffect } from "react";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import DashboardService from "../services/DashboardService";

// Función para generar datos de pagos mensuales basado en datos reales
const generatePaymentsData = (paymentsData) => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const currentMonth = new Date().getMonth();
  const data = [];

  // Procesar pagos por mes
  const paymentsByMonth = {};

  // Inicializar meses
  for (let i = 0; i <= currentMonth; i++) {
    paymentsByMonth[i] = {
      mes: months[i],
      aprobados: 0,
      pendientes: 0,
      rechazados: 0,
      total: 0,
    };
  }

  // Procesar datos reales de pagos
  if (paymentsData && Array.isArray(paymentsData)) {
    paymentsData.forEach((payment, index) => {
      // Intentar múltiples campos de fecha
      const paymentDate = new Date(
        payment.createdAt ||
          payment.fechaCreacion ||
          payment.date ||
          payment.created_at ||
          payment.fecha ||
          payment.updatedAt,
      );

      // Verificar que la fecha sea válida
      if (isNaN(paymentDate.getTime())) {
        console.warn("⚠️ Fecha inválida en pago:", payment);
        return;
      }

      const monthIndex = paymentDate.getMonth();
      const year = paymentDate.getFullYear();
      const currentYear = new Date().getFullYear();

      // Solo procesar pagos del año actual
      if (year === currentYear && paymentsByMonth[monthIndex]) {
        // Intentar múltiples campos de estado
        const status = (
          payment.status ||
          payment.estado ||
          payment.state ||
          payment.paymentStatus ||
          ""
        ).toLowerCase();

        paymentsByMonth[monthIndex].total++;

        if (
          status.includes("aprobado") ||
          status.includes("approved") ||
          status.includes("completado") ||
          status.includes("completed")
        ) {
          paymentsByMonth[monthIndex].aprobados++;
        } else if (
          status.includes("pendiente") ||
          status.includes("pending") ||
          status.includes("en_proceso")
        ) {
          paymentsByMonth[monthIndex].pendientes++;
        } else if (
          status.includes("rechazado") ||
          status.includes("rejected") ||
          status.includes("cancelado") ||
          status.includes("cancelled")
        ) {
          paymentsByMonth[monthIndex].rechazados++;
        } else {
          // Si no reconocemos el estado, contar como pendiente
          console.warn(
            "⚠️ Estado no reconocido:",
            status,
            "contando como pendiente",
          );
          paymentsByMonth[monthIndex].pendientes++;
        }
      }
    });
  } else {
    console.warn("⚠️ paymentsData no es un array válido:", paymentsData);
  }

  // Convertir a array
  for (let i = 0; i <= currentMonth; i++) {
    data.push(paymentsByMonth[i]);
  }

  return data;
};

const PaymentsGraphic = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);

      // Usar el nuevo método del DashboardService
      const response = await DashboardService.getPaymentsDashboardData();

      if (response.success && response.data && response.data.payments) {
        const generatedData = generatePaymentsData(response.data.payments);
        setData(generatedData);
      } else {
        console.warn("⚠️ No se pudieron obtener datos de pagos:", response);
        setData([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar datos de pagos:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Configuración para el reporte Excel
  const reportColumns = [
    { key: "mes", label: "Mes" },
    { key: "aprobados", label: "Pagos Aprobados" },
    { key: "pendientes", label: "Pagos Pendientes" },
    { key: "rechazados", label: "Pagos Rechazados" },
    { key: "total", label: "Total Pagos" },
  ];

  const getYPosition = (value, maxValue) => {
    if (maxValue === 0) return 100;
    return 100 - (value / maxValue) * 100;
  };

  // Calcular el valor máximo para escalar la gráfica
  const maxValue = Math.max(
    ...data.map((item) =>
      Math.max(item.aprobados, item.pendientes, item.rechazados, item.total),
    ),
  );

  // Calcular el ancho dinámico basado en la cantidad de meses
  const chartWidth = Math.max(800, data.length * 80);
  const spacing = chartWidth / (data.length + 1);

  // Abreviaturas para los meses en el gráfico
  const monthAbbr = {
    Enero: "Ene",
    Febrero: "Feb",
    Marzo: "Mar",
    Abril: "Abr",
    Mayo: "May",
    Junio: "Jun",
    Julio: "Jul",
    Agosto: "Ago",
    Septiembre: "Sep",
    Octubre: "Oct",
    Noviembre: "Nov",
    Diciembre: "Dic",
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 col-span-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 order-2 sm:order-1">
          Gestión de Pagos Mensuales
        </h2>
        <div className="order-1 sm:order-2">
          <ReportButton
            dataProvider={async () => data}
            fileName="Pagos_Mensuales"
            columns={reportColumns}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-[350px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[350px] text-gray-500">
            No hay datos de pagos disponibles
          </div>
        ) : (
          <div
            className="relative"
            style={{ minWidth: `${chartWidth}px`, height: "350px" }}
          >
            <svg
              width="100%"
              height="320"
              viewBox={`0 0 ${chartWidth} 320`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              <defs>
                <pattern
                  id="grid-payments"
                  width={spacing}
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${spacing} 0 L 0 0 0 50`}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                </pattern>
              </defs>
              <rect
                width={chartWidth}
                height="270"
                fill="url(#grid-payments)"
                y="20"
              />

              {/* Y axis labels */}
              <text x="15" y="30" fontSize="11" fill="#6b7280">
                {maxValue}
              </text>
              <text x="15" y="80" fontSize="11" fill="#6b7280">
                {Math.round(maxValue * 0.8)}
              </text>
              <text x="15" y="130" fontSize="11" fill="#6b7280">
                {Math.round(maxValue * 0.6)}
              </text>
              <text x="15" y="180" fontSize="11" fill="#6b7280">
                {Math.round(maxValue * 0.4)}
              </text>
              <text x="15" y="230" fontSize="11" fill="#6b7280">
                {Math.round(maxValue * 0.2)}
              </text>
              <text x="25" y="280" fontSize="11" fill="#6b7280">
                0
              </text>

              {/* Lines */}
              <polyline
                points={data
                  .map((item, index) => {
                    const x = 60 + index * spacing;
                    const y = getYPosition(item.aprobados, maxValue) * 2.5 + 20;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              <polyline
                points={data
                  .map((item, index) => {
                    const x = 60 + index * spacing;
                    const y =
                      getYPosition(item.pendientes, maxValue) * 2.5 + 20;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
              <polyline
                points={data
                  .map((item, index) => {
                    const x = 60 + index * spacing;
                    const y =
                      getYPosition(item.rechazados, maxValue) * 2.5 + 20;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
              />

              {/* Dots */}
              {data.map((item, index) => {
                const x = 60 + index * spacing;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={getYPosition(item.aprobados, maxValue) * 2.5 + 20}
                      r="5"
                      fill="#10b981"
                      style={{
                        cursor: "pointer",
                        filter:
                          hoveredPoint?.index === index &&
                          hoveredPoint?.type === "aprobados"
                            ? "drop-shadow(0 0 4px rgba(16, 185, 129, 0.8))"
                            : "none",
                      }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          index,
                          type: "aprobados",
                          value: item.aprobados,
                          mes: item.mes,
                          x,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <circle
                      cx={x}
                      cy={getYPosition(item.pendientes, maxValue) * 2.5 + 20}
                      r="5"
                      fill="#f59e0b"
                      style={{
                        cursor: "pointer",
                        filter:
                          hoveredPoint?.index === index &&
                          hoveredPoint?.type === "pendientes"
                            ? "drop-shadow(0 0 4px rgba(245, 158, 11, 0.8))"
                            : "none",
                      }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          index,
                          type: "pendientes",
                          value: item.pendientes,
                          mes: item.mes,
                          x,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <circle
                      cx={x}
                      cy={getYPosition(item.rechazados, maxValue) * 2.5 + 20}
                      r="5"
                      fill="#ef4444"
                      style={{
                        cursor: "pointer",
                        filter:
                          hoveredPoint?.index === index &&
                          hoveredPoint?.type === "rechazados"
                            ? "drop-shadow(0 0 4px rgba(239, 68, 68, 0.8))"
                            : "none",
                      }}
                      onMouseEnter={() =>
                        setHoveredPoint({
                          index,
                          type: "rechazados",
                          value: item.rechazados,
                          mes: item.mes,
                          x,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}

              {/* X axis labels */}
              {data.map((item, index) => (
                <text
                  key={index}
                  x={60 + index * spacing}
                  y="300"
                  fontSize="12"
                  fill="#6b7280"
                  textAnchor="middle"
                  fontWeight="500"
                >
                  {monthAbbr[item.mes]}
                </text>
              ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute bg-white border border-gray-200 rounded-lg shadow-xl p-3 text-sm"
                style={{
                  left: `${hoveredPoint.x}px`,
                  top: "10px",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                  zIndex: 50,
                }}
              >
                <div className="font-bold mb-1 text-gray-800">
                  {hoveredPoint.mes}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        hoveredPoint.type === "aprobados"
                          ? "#10b981"
                          : hoveredPoint.type === "pendientes"
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  ></div>
                  <span className="text-gray-600">
                    {hoveredPoint.type === "aprobados" && "Pagos Aprobados"}
                    {hoveredPoint.type === "pendientes" && "Pagos Pendientes"}
                    {hoveredPoint.type === "rechazados" && "Pagos Rechazados"}:{" "}
                    <span className="font-semibold text-gray-800">
                      {hoveredPoint.value}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-700 font-medium">Pagos Aprobados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-gray-700 font-medium">Pagos Pendientes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-gray-700 font-medium">Pagos Rechazados</span>
        </div>
      </div>

      {/* Legend Pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-6">
        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
          Pagos Aprobados
        </div>
        <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs sm:text-sm font-medium">
          Pagos Pendientes
        </div>
        <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-medium">
          Pagos Rechazados
        </div>
      </div>
    </div>
  );
};

export default PaymentsGraphic;
