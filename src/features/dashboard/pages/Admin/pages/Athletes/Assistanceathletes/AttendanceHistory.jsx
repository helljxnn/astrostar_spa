import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function AssistanceHistory() {
  const navigate = useNavigate();
  /* ----------------------------- Estados ----------------------------- */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [historyData, setHistoryData] = useState({ dates: [], athletes: [] });
  const [filteredData, setFilteredData] = useState({ dates: [], athletes: [] });

  /* ------------------------- Cargar Datos --------------------------- */
  useEffect(() => {
    const allKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("attendance_")
    );

    if (allKeys.length === 0) {
      const mockDates = [
        "2024-05-12",
        "2024-05-13",
        "2024-05-14",
        "2024-05-15",
        "2024-05-16",
        "2024-05-17",
      ];

      const mockAthletes = [
        {
          documento: "123456789",
          nombre: "Valeria Barrientos",
          categoria: "Sub 15",
          asistencias: {
            "2024-05-12": true,
            "2024-05-13": true,
            "2024-05-14": false,
            "2024-05-15": true,
            "2024-05-16": false,
            "2024-05-17": true,
          },
        },
        {
          documento: "987654321",
          nombre: "Anita Santos",
          categoria: "Juvenil",
          asistencias: {
            "2024-05-12": true,
            "2024-05-13": false,
            "2024-05-14": true,
            "2024-05-15": true,
            "2024-05-16": false,
            "2024-05-17": false,
          },
        },
        {
          documento: "654321789",
          nombre: "Karen Bedoya",
          categoria: "Sub 25",
          asistencias: {
            "2024-05-12": false,
            "2024-05-13": true,
            "2024-05-14": false,
            "2024-05-15": false,
            "2024-05-16": true,
            "2024-05-17": true,
          },
        },
        {
          documento: "874563912",
          nombre: "Yudy Alvarez",
          categoria: "Juvenil",
          asistencias: {
            "2024-05-12": false,
            "2024-05-13": true,
            "2024-05-14": true,
            "2024-05-15": true,
            "2024-05-16": false,
            "2024-05-17": true,
          },
        },
      ];

      setHistoryData({ dates: mockDates, athletes: mockAthletes });
      setFilteredData({ dates: mockDates, athletes: mockAthletes });
      return;
    }

    // Si hay datos en localStorage
    const athletesMap = new Map();
    const dates = [];

    allKeys.forEach((key) => {
      const date = key.replace("attendance_", "");
      dates.push(date);
      const data = JSON.parse(localStorage.getItem(key)) || [];

      data.forEach((a) => {
        if (!athletesMap.has(a.documento)) {
          athletesMap.set(a.documento, {
            documento: a.documento,
            nombre: a.nombre,
            categoria: a.categoria,
            asistencias: {},
          });
        }
        const athlete = athletesMap.get(a.documento);
        athlete.asistencias[date] = a.asistencia;
      });
    });

    const athletesArray = Array.from(athletesMap.values());
    const sortedDates = [...new Set(dates)].sort();

    setHistoryData({ dates: sortedDates, athletes: athletesArray });
    setFilteredData({ dates: sortedDates, athletes: athletesArray });
  }, []);

  /* ---------------------- Función Consultar ------------------------- */
  const handleConsult = () => {
    if (!startDate || !endDate) return;

    const { dates, athletes } = historyData;
    const filteredDates = dates.filter((d) => d >= startDate && d <= endDate);

    const filteredAthletes = athletes.map((a) => {
      const asistenciasFiltradas = {};
      filteredDates.forEach((d) => {
        asistenciasFiltradas[d] = a.asistencias[d];
      });
      return { ...a, asistencias: asistenciasFiltradas };
    });

    setFilteredData({ dates: filteredDates, athletes: filteredAthletes });
  };

  /* ---------------------- Cálculo de % ------------------------------ */
  const calcularPorcentaje = (asistencias) => {
    const total = Object.keys(asistencias).length;
    if (total === 0) return 0;
    const presentes = Object.values(asistencias).filter(Boolean).length;
    return Math.round((presentes / total) * 100);
  };

  const getColor = (porcentaje) => {
    if (porcentaje >= 80) return "bg-green-500 text-white";
    if (porcentaje >= 50) return "bg-yellow-400 text-gray-800";
    return "bg-red-500 text-white";
  };

  const getAsistenciaIcon = (valor) =>
    valor ? (
      <FaCheck className="text-green-600 text-lg mx-auto" />
    ) : (
      <FaTimes className="text-red-500 text-lg mx-auto" />
    );

  /* ---------------------- Config Reporte ---------------------------- */
  const reportColumns = [
    { header: "Documento", accessor: "documento" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Categoría", accessor: "categoria" },
    ...filteredData.dates.map((date) => ({
      header: date,
      accessor: `asistencias.${date}`,
      transform: (v) => (v ? "✔" : "✘"),
    })),
    {
      header: "Asistencia %",
      accessor: "asistencias",
      transform: (v) => `${calcularPorcentaje(v)}%`,
    },
  ];

  /* ---------------------- Renderizado ------------------------------- */
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-['Questrial']">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 text-center sm:text-left">
            Historial de Asistencia Deportiva
          </h1>
          <p className="text-sm text-gray-500 mt-1 text-center sm:text-left">
            Consulta por rango de fechas y exporta el reporte.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/athletes-assistance")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
        >
          Volver a Asistencia
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[160px_160px_auto_auto_1fr] gap-3 items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 bg-white"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 bg-white"
          />

          <button
            onClick={handleConsult}
            className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
          >
            Consultar
          </button>

          <ReportButton
            data={filteredData.athletes}
            columns={reportColumns}
            fileName={`Historial_Asistencia_${startDate}_a_${endDate}`}
            buttonClassName="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
            iconClassName="text-white"
          />
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Tabla */}
      {filteredData.athletes.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No hay registros de asistencia.
        </p>
      ) : (
        <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-sm md:text-base text-center">
              <thead className="text-white uppercase tracking-wide bg-gradient-to-r from-primary-purple to-primary-blue">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                {filteredData.dates.map((d, i) => (
                  <th key={i} className="px-4 py-3">
                    {d}
                  </th>
                ))}
                <th className="px-4 py-3">Asistencia</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredData.athletes.map((a, idx) => {
                const porcentaje = calcularPorcentaje(a.asistencias);
                return (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">{a.documento}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {a.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.categoria}</td>

                    {filteredData.dates.map((d, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {getAsistenciaIcon(a.asistencias[d])}
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-lg font-semibold ${getColor(
                          porcentaje
                        )}`}
                      >
                        {porcentaje}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
