import React, { useState } from 'react';
import ReportButton from "../../../../../../../shared/components/ReportButton";

const RegisteredPlayers = () => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Datos completos hasta octubre 2025
  const data = [
    { mes: 'Enero', infantil: 87, preJuvenil: 77, juvenil: 38 },
    { mes: 'Febrero', infantil: 95, preJuvenil: 70, juvenil: 55 },
    { mes: 'Marzo', infantil: 50, preJuvenil: 76, juvenil: 27 },
    { mes: 'Abril', infantil: 65, preJuvenil: 72, juvenil: 35 },
    { mes: 'Mayo', infantil: 78, preJuvenil: 75, juvenil: 42 },
    { mes: 'Junio', infantil: 82, preJuvenil: 78, juvenil: 48 },
    { mes: 'Julio', infantil: 90, preJuvenil: 80, juvenil: 52 },
    { mes: 'Agosto', infantil: 88, preJuvenil: 77, juvenil: 45 },
    { mes: 'Septiembre', infantil: 92, preJuvenil: 79, juvenil: 50 },
    { mes: 'Octubre', infantil: 85, preJuvenil: 81, juvenil: 47 }
  ];

  // Configuración para el reporte Excel
  const reportColumns = [
    { key: "mes", label: "Mes" },
    { key: "infantil", label: "Categoría Infantil" },
    { key: "preJuvenil", label: "Categoría Pre-Juvenil" },
    { key: "juvenil", label: "Categoría Juvenil" },
  ];

  const getYPosition = (value) => {
    return 100 - value;
  };

  // Calcular el ancho dinámico basado en la cantidad de meses
  const chartWidth = Math.max(800, data.length * 80);
  const spacing = chartWidth / (data.length + 1);

  // Abreviaturas para los meses en el gráfico
  const monthAbbr = {
    'Enero': 'Ene',
    'Febrero': 'Feb',
    'Marzo': 'Mar',
    'Abril': 'Abr',
    'Mayo': 'May',
    'Junio': 'Jun',
    'Julio': 'Jul',
    'Agosto': 'Ago',
    'Septiembre': 'Sep',
    'Octubre': 'Oct'
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 col-span-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 order-2 sm:order-1">
          Jugadoras Activas
        </h2>
        <div className="order-1 sm:order-2">
          <ReportButton
            data={data}
            fileName="Jugadoras_Activas"
            columns={reportColumns}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div className="relative" style={{ minWidth: `${chartWidth}px`, height: '350px' }}>
          <svg width="100%" height="320" viewBox={`0 0 ${chartWidth} 320`} preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            <defs>
              <pattern id="grid-players" width={spacing} height="50" patternUnits="userSpaceOnUse">
                <path d={`M ${spacing} 0 L 0 0 0 50`} fill="none" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3"/>
              </pattern>
            </defs>
            <rect width={chartWidth} height="270" fill="url(#grid-players)" y="20"/>

            {/* Y axis labels */}
            <text x="15" y="30" fontSize="11" fill="#6b7280">100</text>
            <text x="20" y="80" fontSize="11" fill="#6b7280">80</text>
            <text x="20" y="130" fontSize="11" fill="#6b7280">60</text>
            <text x="20" y="180" fontSize="11" fill="#6b7280">40</text>
            <text x="20" y="230" fontSize="11" fill="#6b7280">20</text>
            <text x="25" y="280" fontSize="11" fill="#6b7280">0</text>

            {/* Lines */}
            <polyline
              points={data.map((item, index) => {
                const x = 60 + (index * spacing);
                const y = (getYPosition(item.infantil) * 2.5) + 20;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
            />
            <polyline
              points={data.map((item, index) => {
                const x = 60 + (index * spacing);
                const y = (getYPosition(item.preJuvenil) * 2.5) + 20;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2.5"
            />
            <polyline
              points={data.map((item, index) => {
                const x = 60 + (index * spacing);
                const y = (getYPosition(item.juvenil) * 2.5) + 20;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />

            {/* Dots */}
            {data.map((item, index) => {
              const x = 60 + (index * spacing);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={(getYPosition(item.infantil) * 2.5) + 20}
                    r="5"
                    fill="#8b5cf6"
                    style={{ 
                      cursor: 'pointer',
                      filter: hoveredPoint?.index === index && hoveredPoint?.type === 'infantil' ? 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.8))' : 'none' 
                    }}
                    onMouseEnter={() => setHoveredPoint({ index, type: 'infantil', value: item.infantil, mes: item.mes, x })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <circle
                    cx={x}
                    cy={(getYPosition(item.preJuvenil) * 2.5) + 20}
                    r="5"
                    fill="#ec4899"
                    style={{ 
                      cursor: 'pointer',
                      filter: hoveredPoint?.index === index && hoveredPoint?.type === 'preJuvenil' ? 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.8))' : 'none' 
                    }}
                    onMouseEnter={() => setHoveredPoint({ index, type: 'preJuvenil', value: item.preJuvenil, mes: item.mes, x })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <circle
                    cx={x}
                    cy={(getYPosition(item.juvenil) * 2.5) + 20}
                    r="5"
                    fill="#06b6d4"
                    style={{ 
                      cursor: 'pointer',
                      filter: hoveredPoint?.index === index && hoveredPoint?.type === 'juvenil' ? 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))' : 'none' 
                    }}
                    onMouseEnter={() => setHoveredPoint({ index, type: 'juvenil', value: item.juvenil, mes: item.mes, x })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}

            {/* X axis labels */}
            {data.map((item, index) => (
              <text
                key={index}
                x={60 + (index * spacing)}
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
                top: '10px',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                zIndex: 50
              }}
            >
              <div className="font-bold mb-1 text-gray-800">{hoveredPoint.mes}</div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: hoveredPoint.type === 'infantil' ? '#8b5cf6' : 
                                   hoveredPoint.type === 'preJuvenil' ? '#ec4899' : '#06b6d4'
                  }}
                ></div>
                <span className="text-gray-600">
                  {hoveredPoint.type === 'infantil' && 'Categoría Infantil'}
                  {hoveredPoint.type === 'preJuvenil' && 'Categoría Pre-Juvenil'}
                  {hoveredPoint.type === 'juvenil' && 'Categoría Juvenil'}
                  : <span className="font-semibold text-gray-800">{hoveredPoint.value}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span className="text-gray-700 font-medium">Categoría Infantil</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-pink-500"></div>
          <span className="text-gray-700 font-medium">Categoría Pre-Juvenil</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
          <span className="text-gray-700 font-medium">Categoría Juvenil</span>
        </div>
      </div>

      {/* Legend Pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-6">
        <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
          Categoría Infantil
        </div>
        <div className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-sm font-medium">
          Categoría Pre-Juvenil
        </div>
        <div className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-xs sm:text-sm font-medium">
          Categoría Juvenil
        </div>
      </div>
    </div>
  );
};

export default RegisteredPlayers;