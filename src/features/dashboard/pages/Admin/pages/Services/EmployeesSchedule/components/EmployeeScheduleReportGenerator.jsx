import React, { useState } from "react";
import { IoMdDownload } from "react-icons/io";
import { FiChevronDown, FiFileText } from "react-icons/fi";
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
  ); // YYYY-MM

  const toggleDropdown = () => setOpen((prev) => !prev);

  // Columnas por defecto si no se proporcionan desde fuera
  const reportColumns = columns || [
    { key: "empleado", label: "Empleado" },
    { key: "cargo", label: "Cargo" },
    { key: "fecha", label: "Fecha" },
    { key: "horaInicio", label: "Hora Inicio" },
    { key: "horaFin", label: "Hora Fin" },
    { key: "estado", label: "Estado" },
  ];

  // ==============================
  // 🧾 Generar PDF del calendario
  // ==============================
  const generatePDF = () => {
    setOpen(false);

    try {
      const calendarElement = document.querySelector(".rbc-calendar");

      if (!calendarElement) {
        showErrorAlert("Error", "No se encontró el calendario de horarios.");
        return;
      }

      const [year, month] = selectedMonth.split("-").map((n) => parseInt(n, 10));
      const selectedDate = new Date(year, month - 1);
      const monthName = selectedDate.toLocaleString("es", { month: "long" });
      const selectedYear = selectedDate.getFullYear();

      // Ocultar iconos o botones antes de la captura
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

  // ==============================
  // 📊 Generar Excel de horarios
  // ==============================
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

      worksheetData.forEach((data) => {
        worksheet.addRow(reportColumns.map((col) => data[col.label]));
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
      showSuccessAlert("Éxito", "Reporte de horarios generado correctamente.");
    } catch (error) {
      console.error("Error al generar Excel:", error);
      showErrorAlert("Error", `No se pudo generar Excel: ${error.message}`);
    }
  };

  // ==============================
  // 🎛️ UI
  // ==============================
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-xs"
      >
        <FiFileText className="text-indigo-500" />
        <span>Reportes</span>
        <FiChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""} text-xs`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
          >
            <div className="p-2 border-b border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mes
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-1 text-xs border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="p-1.5 flex flex-col gap-1">
              <button
                onClick={generatePDF}
                className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1.5"
              >
                <FaFilePdf className="text-red-500" />
                <span className="font-medium">Exportar a PDF</span>
              </button>

              <button
                onClick={generateExcel}
                className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1.5"
              >
                <FaFileExcel className="text-green-600" />
                <span className="font-medium">Exportar a Excel</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeScheduleReportGenerator;
