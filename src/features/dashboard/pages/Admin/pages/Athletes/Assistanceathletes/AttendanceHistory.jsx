import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import AthleteAttendanceHistoryModal from "./components/AthleteAttendanceHistoryModal";
import DateRangePickerCalendar from "./components/DateRangePickerCalendar";
import assistanceathletesService from "./services/AssistanceathletesService";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import { showWarningAlert } from "../../../../../../../shared/utils/alerts.js";

const DEFAULT_ROWS_PER_PAGE = 10;
const ALL_CATEGORIES = "Todas";
const todayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatInputValue = (value) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

const parseInputToISO = (input) => {
  if (!input || input.length !== 10) return "";
  const parts = input.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export default function AssistanceHistory() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(() => todayISO());
  const [endDate, setEndDate] = useState(() => todayISO());
  const [startDateInput, setStartDateInput] = useState(() => formatDate(todayISO()));
  const [endDateInput, setEndDateInput] = useState(() => formatDate(todayISO()));
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [categories, setCategories] = useState([ALL_CATEGORIES]);

  // Hook para obtener datos completos de reporte
  const { getReportData } = useReportDataWithService(assistanceathletesService.getAllForReport);

  const [historyRows, setHistoryRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_ROWS_PER_PAGE,
    total: 0,
    pages: 0,
  });
  const [range, setRange] = useState(() => ({
    startDate: todayISO(),
    endDate: todayISO(),
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailHistory, setDetailHistory] = useState([]);
  const [detailAthlete, setDetailAthlete] = useState(null);

  // Función para obtener datos completos del reporte con filtros aplicados
  const getCompleteReportData = async () => {
    return await getReportData(
      { 
        startDate: range.startDate || startDate,
        endDate: range.endDate || endDate,
        search: searchTerm,
        categoria: categoryFilter !== ALL_CATEGORIES ? categoryFilter : undefined
      },
      (data) => data.map((item) => ({
        documento: item.documento,
        nombre: item.nombre,
        categoria: item.categoria || "Sin categoría",
        present: item.present,
        absent: item.absent,
        total: item.total,
        percentDisplay: `${item.percent}%`,
      }))
    );
  };

  const rangeLabel = useMemo(() => {
    const rangeStart = range.startDate || startDate;
    const rangeEnd = range.endDate || endDate;

    if (!rangeStart && !rangeEnd) return "Últimos 30 días";
    if (rangeStart && rangeEnd && rangeStart === rangeEnd) {
      return `Día: ${formatDate(rangeStart)}`;
    }
    if (rangeStart && rangeEnd) {
      return `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`;
    }
    if (rangeStart) return `Desde ${formatDate(rangeStart)}`;
    return `Hasta ${formatDate(rangeEnd)}`;
  }, [range, startDate, endDate]);

  const reportFileName = useMemo(
    () => `Historial_Asistencia_${rangeLabel.replace(/\s+/g, "_")}`,
    [rangeLabel]
  );

  const reportColumns = useMemo(
    () => [
      { header: "Documento", accessor: "documento" },
      { header: "Nombre", accessor: "nombre" },
      { header: "Categoría", accessor: "categoria" },
      { header: "Presentes", accessor: "present" },
      { header: "Ausentes", accessor: "absent" },
      { header: "Total", accessor: "total" },
      { header: "% Asistencia", accessor: "percentDisplay" },
    ],
    []
  );

  const reportData = useMemo(
    () =>
      historyRows.map((item) => ({
        documento: item.documento,
        nombre: item.nombre,
        categoria: item.categoria || "Sin categoría",
        present: item.present,
        absent: item.absent,
        total: item.total,
        percentDisplay: `${item.percent}%`,
      })),
    [historyRows]
  );

  const fetchSummary = async (page = 1, override = {}) => {
    setLoading(true);
    setError("");

    try {
      const effectiveStartDate =
        override.startDate !== undefined ? override.startDate : startDate;
      const effectiveEndDate =
        override.endDate !== undefined ? override.endDate : endDate;
      const effectiveSearch =
        override.search !== undefined ? override.search : searchTerm;
      const effectiveCategory =
        override.category !== undefined ? override.category : categoryFilter;

      const params = {
        page,
        limit: pagination.limit,
      };
      if (effectiveStartDate) params.startDate = effectiveStartDate;
      if (effectiveEndDate) params.endDate = effectiveEndDate;
      if (effectiveSearch.trim()) params.search = effectiveSearch.trim();
      if (effectiveCategory && effectiveCategory !== ALL_CATEGORIES) {
        params.categoria = effectiveCategory;
      }

      const response = await assistanceathletesService.getHistorySummary(params);

      if (response && response.success) {
        const rows = response.data || [];
        setHistoryRows(rows);
        setPagination(
          response.pagination || {
            page,
            limit: pagination.limit,
            total: 0,
            pages: 0,
          }
        );
        setRange(
          response.range || {
            startDate: effectiveStartDate || "",
            endDate: effectiveEndDate || "",
          }
        );
        if (rows.length === 0) {
          showWarningAlert(
            "Sin asistencia",
            "No hay registros de asistencia en el rango seleccionado."
          );
        }
      } else {
        setHistoryRows([]);
        setPagination((prev) => ({ ...prev, page, total: 0, pages: 0 }));
        setRange({
          startDate: effectiveStartDate || "",
          endDate: effectiveEndDate || "",
        });
        setError(response?.message || "No se pudo cargar el historial.");
      }
    } catch (errorCaught) {
setHistoryRows([]);
      setPagination((prev) => ({ ...prev, page, total: 0, pages: 0 }));
      setRange({
        startDate: override.startDate !== undefined ? override.startDate : startDate,
        endDate: override.endDate !== undefined ? override.endDate : endDate,
      });
      setError("No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(1);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await assistanceathletesService.getSportsCategories({
          page: 1,
          limit: 100,
        });
        if (response && response.success) {
          const names = (response.data || [])
            .map((cat) => cat.name || cat.nombre)
            .filter(Boolean);
          const unique = Array.from(new Set(names)).sort((a, b) =>
            a.localeCompare(b)
          );
          setCategories([ALL_CATEGORIES, ...unique]);
        }
      } catch (errorCaught) {
}
    };

    loadCategories();
  }, []);

  const handleConsult = () => {
    const parsedStart = parseInputToISO(startDateInput);
    const parsedEnd = parseInputToISO(endDateInput);

    if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
      setError("La fecha inicial no puede ser mayor a la fecha final.");
      return;
    }

    setError("");
    setStartDate(parsedStart);
    setEndDate(parsedEnd);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSummary(1, {
      startDate: parsedStart,
      endDate: parsedEnd,
      search: searchTerm,
      category: categoryFilter,
    });
  };

  const handleReset = () => {
    const today = todayISO();
    setStartDate(today);
    setEndDate(today);
    setStartDateInput(formatDate(today));
    setEndDateInput(formatDate(today));
    setSearchTerm("");
    setCategoryFilter(ALL_CATEGORIES);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchSummary(1, {
      startDate: today,
      endDate: today,
      search: "",
      category: ALL_CATEGORIES,
    });
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchSummary(page);
  };

  const handleViewDetail = async (row) => {
    if (!row?.athleteId) return;
    setDetailAthlete(row);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const params = {};
      if (range.startDate) params.startDate = range.startDate;
      if (range.endDate) params.endDate = range.endDate;

      const response = await assistanceathletesService.getAthleteHistory(
        row.athleteId,
        params
      );

      if (response && response.success) {
        setDetailHistory(response.data || []);
      } else {
        setDetailHistory([]);
      }
    } catch (errorCaught) {
setDetailHistory([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = pagination.pages || 0;
  const totalRows = pagination.total || 0;
  const startIndex = (pagination.page - 1) * pagination.limit;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-montserrat">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Historial de Asistencia
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Consulta por rango de fechas y revisa el resumen por deportista.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <ReportButton
            dataProvider={getCompleteReportData}
            fileName={reportFileName}
            columns={reportColumns}
          />
          <button
            onClick={() => navigate("/dashboard/athletes-assistance")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:bg-primary-blue transition-colors whitespace-nowrap"
          >
            Volver a Asistencia
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-[160px_160px_1fr_180px_auto] gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Desde</label>
            <input
              type="text"
              value={startDateInput}
              onChange={(e) => {
                setStartDateInput(formatInputValue(e.target.value));
                if (error) setError("");
              }}
              placeholder="dd/mm/aaaa"
              inputMode="numeric"
              maxLength={10}
              title="Formato: dd/mm/aaaa"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Hasta</label>
            <input
              type="text"
              value={endDateInput}
              onChange={(e) => {
                setEndDateInput(formatInputValue(e.target.value));
                if (error) setError("");
              }}
              placeholder="dd/mm/aaaa"
              inputMode="numeric"
              maxLength={10}
              title="Formato: dd/mm/aaaa"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>

          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, documento o categoría..."
            className="w-full"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
            <button
              onClick={handleConsult}
              className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-white rounded-lg shadow hover:bg-primary-blue transition-colors whitespace-nowrap"
            >
              Consultar
            </button>
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

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
        <span>
          <span className="font-semibold text-gray-800">{totalRows}</span> deportistas
        </span>
        <span>
          Rango consultado: <span className="font-semibold text-gray-800">{rangeLabel}</span>
        </span>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-8">Cargando historial...</div>
      ) : historyRows.length === 0 ? (
        <div className="text-center text-gray-500 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay registros de asistencia en el rango seleccionado.
        </div>
      ) : (
        <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="text-white uppercase tracking-wide bg-gradient-to-r from-primary-purple to-primary-blue text-xs">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-center">Presentes</th>
                  <th className="px-4 py-3 text-center">Ausentes</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">% Asistencia</th>
                  <th className="px-4 py-3 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {historyRows.map((item, idx) => (
                  <tr
                    key={`${item.athleteId}-${idx}`}
                    className="hover:bg-gray-50/50 transition"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {startIndex + idx + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.documento}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-3">
                      {item.categoria || "Sin categoría"}
                    </td>
                    <td className="px-4 py-3 text-center">{item.present}</td>
                    <td className="px-4 py-3 text-center">{item.absent}</td>
                    <td className="px-4 py-3 text-center">{item.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {item.percent}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="p-2 rounded-full bg-primary-purple/10 text-primary-purple hover:bg-primary-blue hover:text-white transition-colors"
                        title="Ver detalle"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRows={totalRows}
            rowsPerPage={pagination.limit}
            startIndex={startIndex}
          />
        </div>
      )}

      <AthleteAttendanceHistoryModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        athleteName={detailAthlete?.nombre || ""}
        history={detailHistory}
        loading={detailLoading}
        rangeLabel={rangeLabel}
      />
    </div>
  );
}



