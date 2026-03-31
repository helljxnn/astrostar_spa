import React, { useState } from "react";
import {
  FaFileExport,
  FaFilePdf,
  FaFileExcel,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateFallbackPDF,
  generateFallbackExcel,
} from "../../../utils/fallbackReports";
import { toast } from "../../../utils/toast";

const CalendarReportGenerator = ({
  events = [],
  onGenerateReport,
  className = "",
  title = "Reportes",
  entityName = "eventos", // "eventos", "clases", "horarios", etc.
  showDateFilter = true,
  dateRange = null, // { start: Date, end: Date }
  onDateRangeChange,
  reportTypes = ["pdf", "excel"], // Tipos de reporte disponibles
  customFields = [], // Campos personalizados para el reporte
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);

  const resolveEventDate = (event = {}) => {
    const rawDate =
      event.date ||
      event.start ||
      event.classDate ||
      event.fecha ||
      event.scheduleDate ||
      null;

    if (!rawDate) return null;
    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const getEventsForSelectedPeriod = () => {
    if (!Array.isArray(events) || events.length === 0) return [];
    if (!showDateFilter) return events;

    const hasCustomRange =
      dateRange?.start &&
      dateRange?.end &&
      !Number.isNaN(new Date(dateRange.start).getTime()) &&
      !Number.isNaN(new Date(dateRange.end).getTime());

    const startOfMonth = hasCustomRange
      ? new Date(dateRange.start)
      : new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = hasCustomRange
      ? new Date(dateRange.end)
      : new Date(
          selectedMonth.getFullYear(),
          selectedMonth.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

    return events.filter((event) => {
      const eventDate = resolveEventDate(event);
      if (!eventDate) return false;
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  };

  /**
   * Manejar generación de reportes
   */
  const handleGenerateReport = async (format = "pdf") => {
    try {
      setIsGenerating(true);
      const reportEvents = getEventsForSelectedPeriod();

      // Validar que hay eventos para exportar
      if (!Array.isArray(reportEvents) || reportEvents.length === 0) {
        toast.error("No hay datos para exportar");
        setIsGenerating(false);
        return;
      }

      // Configurar opciones
      const options = {
        title: `${title} - ${formatMonthYear(selectedMonth)}`,
        fileName: `${entityName}_${formatMonthYear(selectedMonth).replace(
          " ",
          "_",
        )}.${format === "pdf" ? "pdf" : "xlsx"}`,
        entityName: entityName,
        customFields: customFields,
      };

      if (onGenerateReport) {
        // Usar handler personalizado
        const reportConfig = {
          events: reportEvents,
          format: format,
          entityName: entityName,
          dateRange: {
            start: new Date(
              selectedMonth.getFullYear(),
              selectedMonth.getMonth(),
              1,
            ),
            end: new Date(
              selectedMonth.getFullYear(),
              selectedMonth.getMonth() + 1,
              0,
            ),
          },
          customFields: customFields,
          title: options.title,
        };
        await onGenerateReport(reportConfig);
      } else {
        // Usar generador de emergencia
        if (format === "pdf") {
          await generateFallbackPDF(reportEvents, options);
        } else {
          await generateFallbackExcel(reportEvents, options);
        }
      }

      // Mostrar alerta de éxito que se cierra automáticamente
      toast.success("Reporte generado exitosamente", { duration: 2000 });

      // Cerrar el panel después de la descarga
      setIsOpen(false);
    } catch (error) {
      console.error("Error generando reporte:", error);
      toast.error(`Error al generar reporte: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Formatear mes y año para mostrar
   */
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  /**
   * Manejar cambio de mes
   */
  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split("-");
    const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    setSelectedMonth(newDate);

    if (onDateRangeChange) {
      const newRange = {
        start: new Date(parseInt(year), parseInt(month) - 1, 1),
        end: new Date(parseInt(year), parseInt(month), 0),
      };
      onDateRangeChange(newRange);
    }
  };

  /**
   * Obtener valor del mes actual para el input
   */
  const getCurrentMonthValue = () => {
    const year = selectedMonth.getFullYear();
    const month = (selectedMonth.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  /**
   * Contar eventos en el mes seleccionado
   */
  const getEventsInSelectedMonth = () => {
    if (!events || events.length === 0) return 0;

    const startOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0,
    );

    return events.filter((event) => {
      const eventDate = new Date(event.date || event.start || event.classDate);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    }).length;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGenerating}
        className={`flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-[#B595FF] hover:text-[#B595FF] transition-all duration-300 ${
          isGenerating ? "opacity-50 cursor-not-allowed" : ""
        }`}
        whileHover={!isGenerating ? { scale: 1.02 } : {}}
        whileTap={!isGenerating ? { scale: 0.98 } : {}}
      >
        <FaFileExport className="text-sm text-[#4285F4]" />
        <span>{isGenerating ? "Generando..." : title}</span>
        <FaChevronDown
          className={`text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      {/* Panel de reportes */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-6 z-50"
          >
            <div className="space-y-6">
              {/* Selector de mes */}
              {showDateFilter && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Período del reporte
                  </h4>
                  <div className="relative">
                    <input
                      type="month"
                      value={getCurrentMonthValue()}
                      onChange={handleMonthChange}
                      disabled={isGenerating}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B595FF] focus:border-transparent appearance-none bg-white disabled:opacity-50"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatMonthYear(selectedMonth)}
                  </p>
                </div>
              )}

              {/* Botones de exportación */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Formato de exportación
                </h4>

                {reportTypes.includes("pdf") && (
                  <motion.button
                    onClick={() => handleGenerateReport("pdf")}
                    disabled={isGenerating}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isGenerating ? { scale: 1.01 } : {}}
                    whileTap={!isGenerating ? { scale: 0.99 } : {}}
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaFilePdf className="text-red-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium block">
                        Exportar a PDF
                      </span>
                      <span className="text-xs text-gray-500">
                        Documento con formato de lista
                      </span>
                    </div>
                  </motion.button>
                )}

                {reportTypes.includes("excel") && (
                  <motion.button
                    onClick={() => handleGenerateReport("excel")}
                    disabled={isGenerating}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isGenerating ? { scale: 1.01 } : {}}
                    whileTap={!isGenerating ? { scale: 0.99 } : {}}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaFileExcel className="text-green-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium block">
                        Exportar a Excel
                      </span>
                      <span className="text-xs text-gray-500">
                        Hoja de cálculo editable
                      </span>
                    </div>
                  </motion.button>
                )}
              </div>

              {/* Información adicional */}
              {events.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">
                        {getEventsInSelectedMonth()}
                      </span>{" "}
                      {entityName} en el mes seleccionado
                    </p>
                    <p>
                      <span className="font-medium">{events.length}</span>{" "}
                      {entityName} en total
                    </p>
                    {customFields.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        Incluye {customFields.length} campo(s) personalizado(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mensaje si no hay eventos */}
              {(!events || events.length === 0) && (
                <div className="text-xs text-gray-500 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-yellow-700">
                    No hay {entityName} disponibles para exportar
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default CalendarReportGenerator;
