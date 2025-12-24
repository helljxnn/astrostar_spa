import React, { useState } from "react";
import {
  FaFileExport,
  FaFilePdf,
  FaFileExcel,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleGenerateReport = (format = "pdf") => {
    const reportData = {
      events: events,
      format: format,
      dateRange: {
        start: new Date(
          selectedMonth.getFullYear(),
          selectedMonth.getMonth(),
          1
        ),
        end: new Date(
          selectedMonth.getFullYear(),
          selectedMonth.getMonth() + 1,
          0
        ),
      },
      customFields: customFields,
      entityName: entityName,
    };

    if (onGenerateReport) {
      onGenerateReport(reportData);
    } else {
      // Lógica por defecto de generación de reportes
      console.log(`Generando reporte ${format} de ${entityName}:`, reportData);

      // Aquí se implementaría la lógica de generación por defecto
      const processedData = events.map((event) => ({
        titulo: event.title || event.name,
        fecha: event.date || event.start,
        hora: event.time || event.startTime,
        ubicacion: event.location,
        estado: event.status,
        tipo: event.type,
        descripcion: event.description,
        ...customFields.reduce((acc, field) => {
          acc[field.label] = event[field.key] || "";
          return acc;
        }, {}),
      }));

      console.table(processedData);
    }

    setIsOpen(false);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));

    if (onDateRangeChange) {
      const newRange = {
        start: new Date(parseInt(year), parseInt(month) - 1, 1),
        end: new Date(parseInt(year), parseInt(month), 0),
      };
      onDateRangeChange(newRange);
    }
  };

  const getCurrentMonthValue = () => {
    const year = selectedMonth.getFullYear();
    const month = (selectedMonth.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botón principal */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-[#B595FF] hover:text-[#B595FF] transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FaFileExport className="text-sm text-[#4285F4]" />
        <span>{title}</span>
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
                  <h4 className="text-sm font-medium text-gray-700">Mes</h4>
                  <div className="relative">
                    <input
                      type="month"
                      value={getCurrentMonthValue()}
                      onChange={handleMonthChange}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B595FF] focus:border-transparent appearance-none bg-white"
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
                {reportTypes.includes("pdf") && (
                  <motion.button
                    onClick={() => handleGenerateReport("pdf")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <FaFilePdf className="text-red-600 text-sm" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Exportar a PDF
                    </span>
                  </motion.button>
                )}

                {reportTypes.includes("excel") && (
                  <motion.button
                    onClick={() => handleGenerateReport("excel")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaFileExcel className="text-green-600 text-sm" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Exportar a Excel
                    </span>
                  </motion.button>
                )}
              </div>

              {/* Información adicional */}
              {events.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                  <p>
                    Se exportarán{" "}
                    <span className="font-medium">{events.length}</span>{" "}
                    {entityName} del mes seleccionado
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
