import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import SearchInput from "../../../../../../../shared/components/SearchInput";

export default function AssistanceHistory() {
  const navigate = useNavigate();
  /* ----------------------------- Estados ----------------------------- */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
            observaciones: {},
          });
        }
        const athlete = athletesMap.get(a.documento);
        athlete.asistencias[date] = a.asistencia;
        if (a.observacion) {
          athlete.observaciones[date] = a.observacion;
        }
      });
    });

    const athletesArray = Array.from(athletesMap.values());
    const sortedDates = [...new Set(dates)].sort();

    setHistoryData({ dates: sortedDates, athletes: athletesArray });
    setFilteredData({ dates: sortedDates, athletes: athletesArray });
  }, []);

  const applyDateFilter = (start, end) => {
    const { dates, athletes } = historyData;
    const filteredDates = dates.filter(
      (d) => (!start || d >= start) && (!end || d <= end)
    );

    const filteredAthletes = athletes.map((a) => {
      const asistenciasFiltradas = {};
      const observacionesFiltradas = {};
      filteredDates.forEach((d) => {
        if (Object.prototype.hasOwnProperty.call(a.asistencias, d)) {
          asistenciasFiltradas[d] = a.asistencias[d];
        }
        if (
          a.observaciones &&
          Object.prototype.hasOwnProperty.call(a.observaciones, d)
        ) {
          observacionesFiltradas[d] = a.observaciones[d];
        }
      });
      return {
        ...a,
        asistencias: asistenciasFiltradas,
        observaciones: observacionesFiltradas,
      };
    });

    setFilteredData({ dates: filteredDates, athletes: filteredAthletes });
  };

  /* ---------------------- Filtros ------------------------------ */
  const handleConsult = () => {
    applyDateFilter(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setFilteredData(historyData);
  };

  const formatDate = (value) => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const buildRecords = (data) => {
    const rows = [];
    data.athletes.forEach((athlete) => {
      data.dates.forEach((date) => {
        const asistencia = athlete.asistencias?.[date];
        if (typeof asistencia !== "boolean") return;
        const fechaFormateada = formatDate(date);
        const asistenciaLabel = asistencia ? "Presente" : "Ausente";
        rows.push({
          fecha: date,
          fechaFormateada,
          documento: athlete.documento,
          nombre: athlete.nombre,
          categoria: athlete.categoria,
          asistencia,
          asistenciaLabel,
          observacion: athlete.observaciones?.[date] || "",
        });
      });
    });
    return rows.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return (a.nombre || "").localeCompare(b.nombre || "");
      }
      return a.fecha < b.fecha ? 1 : -1;
    });
  };

  const orderedRecords = useMemo(
    () => buildRecords(filteredData),
    [filteredData]
  );

  const visibleRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orderedRecords;
    return orderedRecords.filter((record) => {
      return (
        (record.nombre || "").toLowerCase().includes(term) ||
        (record.documento || "").toLowerCase().includes(term) ||
        (record.categoria || "").toLowerCase().includes(term)
      );
    });
  }, [orderedRecords, searchTerm]);

  const summary = useMemo(() => {
    const totalRecords = visibleRecords.length;
    const present = visibleRecords.filter((r) => r.asistencia).length;
    const absent = totalRecords - present;
    const percent = totalRecords ? Math.round((present / totalRecords) * 100) : 0;
    const athleteCount = new Set(visibleRecords.map((r) => r.documento)).size;
    return {
      totalRecords,
      present,
      absent,
      percent,
      athleteCount,
      dateCount: filteredData.dates.length,
    };
  }, [visibleRecords, filteredData.dates.length]);

  /* ---------------------- Config Reporte ---------------------------- */
  const reportColumns = [
    { header: "Fecha", accessor: "fechaFormateada" },
    { header: "Documento", accessor: "documento" },
    { header: "Nombre", accessor: "nombre" },
    { header: "Categoría", accessor: "categoria" },
    { header: "Asistencia", accessor: "asistenciaLabel" },
    { header: "Observación", accessor: "observacion" },
  ];

  const reportFileName =
    startDate || endDate
      ? `Historial_Asistencia_${startDate || "inicio"}_a_${endDate || "fin"}`
      : "Historial_Asistencia";

  /* ---------------------- Renderizado ------------------------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-questrial">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Historial de Asistencia
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
        <div className="grid grid-cols-1 lg:grid-cols-[160px_160px_1fr_auto] gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>

          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, documento o categoria..."
            className="w-full"
          />

          <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
            <button
              onClick={handleConsult}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
            >
              Consultar
            </button>
            <ReportButton
              data={visibleRecords}
              columns={reportColumns}
              fileName={reportFileName}
            />
            {(startDate || endDate || searchTerm) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Deportistas</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.athleteCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Fechas</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.dateCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Registros</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalRecords}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Asistencia</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">
              {summary.percent}%
            </p>
            <p className="text-xs text-gray-500">
              {summary.present} presentes / {summary.absent} ausentes
            </p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {visibleRecords.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">
          No hay registros de asistencia.
        </p>
      ) : (
        <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="text-white uppercase tracking-wide bg-gradient-to-r from-primary-purple to-primary-blue text-xs">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-center">Asistencia</th>
                  <th className="px-4 py-3">Observación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {visibleRecords.map((item, idx) => (
                  <tr
                    key={`${item.documento}-${item.fecha}-${idx}`}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.fechaFormateada || formatDate(item.fecha)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.documento}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-3">{item.categoria || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.asistencia
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.asistencia ? "Presente" : "Ausente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.observacion || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
