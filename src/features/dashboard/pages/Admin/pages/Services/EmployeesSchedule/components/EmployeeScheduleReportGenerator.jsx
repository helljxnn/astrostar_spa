import React, { useState, useMemo } from "react";
import { IoMdDownload } from "react-icons/io";
import { FiFileText } from "react-icons/fi";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts";

const EmployeeScheduleReportGenerator = ({
  data = [],
  fileName = "Reporte_Horarios_Empleados",
  columns,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const toggleDropdown = () => setOpen((prev) => !prev);

  const reportColumns = columns || [
    { key: "empleado", label: "Empleado" },
    { key: "cargo", label: "Cargo" },
    { key: "fecha", label: "Fecha" },
    { key: "horaInicio", label: "Hora Inicio" },
    { key: "horaFin", label: "Hora Fin" },
    { key: "estado", label: "Estado" },
  ];

  const stats = useMemo(() => {
    const base = { total: data.length, programado: 0, completado: 0, cancelado: 0 };
    data.forEach((item) => {
      const estado = (item.estado || "").toLowerCase();
      if (estado.includes("cancel")) base.cancelado += 1;
      else if (estado.includes("complet")) base.completado += 1;
      else base.programado += 1;
    });
    return base;
  }, [data]);

  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleString("es", { month: "long", year: "numeric" });
  }, [selectedMonth]);

  const generatePDF = () => {
    setOpen(false);

    try {
      const calendarElement = document.querySelector(".rbc-calendar");

      if (!calendarElement) {
        showErrorAlert("Error", "No se encontro el calendario de horarios.");
        return;
      }

      const [year, month] = selectedMonth.split("-").map((n) => parseInt(n, 10));
      const selectedDate = new Date(year, month - 1);
      const monthName = selectedDate.toLocaleString("es", { month: "long" });
      const selectedYear = selectedDate.getFullYear();

      const elementsToHide = document.querySelectorAll(
        ".event-action-buttons, .rbc-event button, .rbc-event svg"
      );
      const originalStyles = [];

      elementsToHide.forEach((el) => {
        originalStyles.push({
          el,
          display: el.style.display,
          visibility: el.style.visibility,
        });
        el.style.display = "none";
        el.style.visibility = "hidden";
      });

      const restoreStyles = () => {
        originalStyles.forEach((item) => {
          item.el.style.display = item.display;
          item.el.style.visibility = item.visibility;
        });
      };

      html2canvas(calendarElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })
        .then((canvas) => {
          restoreStyles();

          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const imgWidth = 280;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          const doc = new jsPDF("landscape", "mm", "a4");
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(
            `Calendario de Horarios - ${monthName} ${selectedYear}`,
            pageWidth / 2,
            15,
            { align: "center" }
          );

          doc.addImage(imgData, "JPEG", (pageWidth - imgWidth) / 2, 20, imgWidth, imgHeight);

          doc.setFontSize(10);
          doc.text(
            `Generado el: ${new Date().toLocaleString("es-ES")}`,
            pageWidth - 15,
            pageHeight - 10,
            { align: "right" }
          );

          doc.save(`${fileName}_${monthName}_${selectedYear}.pdf`);
        })
        .catch((error) => {
          console.error("Error al capturar calendario:", error);
          showErrorAlert("Error", `No se pudo generar el PDF: ${error.message}`);
          restoreStyles();
        });
    } catch (error) {
      console.error("Error general al generar PDF:", error);
      showErrorAlert("Error", `Error al generar PDF: ${error.message}`);
    }
  };

  const generateExcel = async () => {
    setOpen(false);

    try {
      if (!data || data.length === 0) {
        showErrorAlert("Error", "No hay horarios registrados.");
        return;
      }

      const selectedDate = new Date(selectedMonth);
      const selectedMonthNumber = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();

      const filteredData = data.filter((schedule) => {
        const date = new Date(schedule.fecha || schedule.start);
        return (
          date.getMonth() === selectedMonthNumber &&
          date.getFullYear() === selectedYear
        );
      });

      const dataToExport = filteredData.length > 0 ? filteredData : data;

      const worksheetData = dataToExport.map((row) => {
        const obj = {};
        reportColumns.forEach((col) => {
          const value = row[col.key];
          if (value instanceof Date) {
            obj[col.label] = value.toLocaleString("es-ES");
          } else {
            obj[col.label] = value ?? "";
          }
        });
        return obj;
      });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "AstroStar";
      workbook.created = new Date();
      workbook.title = `Reporte de Horarios - ${selectedDate.toLocaleString(
        "es",
        { month: "long" }
      )} ${selectedYear}`;

      const worksheet = workbook.addWorksheet("Horarios");

      const headers = reportColumns.map((c) => c.label);
      worksheet.addRow(headers);

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E0E0E0" },
      };

      worksheetData.forEach((dataRow) => {
        worksheet.addRow(reportColumns.map((col) => dataRow[col.label]));
      });

      worksheet.columns.forEach((column, i) => {
        const headerLength = headers[i].length;
        let maxLength = headerLength;
        worksheet.getColumn(i + 1).eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value ? cell.value.toString().length : 0;
          if (len > maxLength) maxLength = len;
        });
        column.width = Math.max(maxLength + 2, 15);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const monthName = selectedDate.toLocaleString("es", { month: "long" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, `${fileName}_${monthName}_${selectedYear}.xlsx`);
      showSuccessAlert("Exito", "Reporte de horarios generado correctamente.");
    } catch (error) {
      console.error("Error al generar Excel:", error);
      showErrorAlert("Error", `No se pudo generar Excel: ${error.message}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#9BE9FF] to-[#7B61FF] text-white rounded-lg shadow hover:opacity-90 transition"
      >
        <FiFileText className="text-white" />
        <span className="text-sm font-semibold">Reportes</span>
        <IoMdDownload className={`text-white transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mes de reporte
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-[#7B61FF] focus:border-[#7B61FF]"
              />
              <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-gray-700">
                <span className="px-2 py-1 bg-white border border-gray-200 rounded-full">{monthLabel}</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Programado: {stats.programado}</span>
                <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">Completado: {stats.completado}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Cancelado: {stats.cancelado}</span>
              </div>
            </div>

            <div className="p-2 flex flex-col gap-2">
              <button
                onClick={generatePDF}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
              >
                <FaFilePdf className="text-red-500" />
                <div>
                  <p className="font-semibold">Exportar a PDF</p>
                  <p className="text-xs text-gray-500">Captura el calendario filtrado</p>
                </div>
              </button>

              <button
                onClick={generateExcel}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition flex items-center gap-2"
              >
                <FaFileExcel className="text-green-600" />
                <div>
                  <p className="font-semibold">Exportar a Excel</p>
                  <p className="text-xs text-gray-500">Detalle tabular de horarios</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeScheduleReportGenerator;
