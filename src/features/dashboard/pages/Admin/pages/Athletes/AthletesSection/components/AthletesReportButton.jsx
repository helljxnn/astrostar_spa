import React, { useEffect, useRef, useState } from "react";
import { IoMdDownload } from "react-icons/io";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import { exportToExcel } from "../../../../../../../../shared/utils/Excel";
import { normalizeExportText } from "../../../../../../../../shared/utils/textEncoding.js";

const AthletesReportButton = ({
  dataProvider,
  fileName = "Deportistas",
  columns = [],
  buttonClassName = "",
  iconClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedColumns = columns.map((col) => {
    if (col.header && col.accessor) return col;
    if (col.label && col.key) return { header: col.label, accessor: col.key };
    return col;
  });

  const getData = async () => {
    if (typeof dataProvider === "function") {
      return await dataProvider();
    }
    return [];
  };

  const validateData = async () => {
    const reportData = await getData();
    if (!reportData || reportData.length === 0) {
      showErrorAlert("Error", "No hay datos para generar el reporte");
      return null;
    }
    return reportData;
  };

  const buildRows = (rows, reportColumns) =>
    rows.map((item) =>
      reportColumns.map((column) => {
        const value = item[column.accessor];
        return value ? normalizeExportText(String(value)) : "";
      }),
    );

  const generatePDF = async () => {
    setOpen(false);
    setIsGenerating(true);

    try {
      const reportData = await validateData();
      if (!reportData) return;

      const generationDate = new Date().toLocaleDateString("es-ES");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(fileName, 10, 12);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Generado: ${generationDate}`, 10, 18);
      doc.text(`Registros: ${reportData.length}`, 10, 23);

      autoTable(doc, {
        head: [normalizedColumns.map((column) => normalizeExportText(column.header))],
        body: buildRows(reportData, normalizedColumns),
        startY: 27,
        margin: { left: 4, right: 4, bottom: 10 },
        styles: {
          fontSize: 4.8,
          cellPadding: 0.7,
          overflow: "linebreak",
          valign: "top",
          lineColor: [210, 210, 210],
          lineWidth: 0.15,
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 5.2,
          cellPadding: 0.9,
        },
        alternateRowStyles: {
          fillColor: [248, 248, 252],
        },
        tableWidth: "wrap",
        horizontalPageBreak: false,
        columnStyles: normalizedColumns.reduce((acc, column, index) => {
          const widthMap = {
            nombres: 16,
            apellidos: 18,
            tipoDocumento: 18,
            numeroDocumento: 16,
            correo: 30,
            telefono: 14,
            direccion: 24,
            fechaNacimiento: 13,
            categoria: 12,
            beca: 9,
            estado: 10,
            estadoInscripcion: 16,
            acudienteNombre: 20,
            acudienteTipoDocumento: 18,
            acudienteDocumento: 16,
            acudienteTelefono: 15,
            acudienteCorreo: 28,
            acudienteDireccion: 24,
            acudienteParentesco: 13,
            fechaCreacion: 12,
            ultimaActualizacion: 14,
          };

          acc[index] = {
            cellWidth: widthMap[column.accessor] || 14,
          };
          return acc;
        }, {}),
        didDrawPage: () => {
          doc.setFontSize(7);
          doc.text(
            `Página ${doc.internal.getNumberOfPages()}`,
            pageWidth - 8,
            pageHeight - 4,
            { align: "right" },
          );
        },
      });

      doc.save(`${fileName}_${generationDate.replace(/\//g, "-")}.pdf`);
    } catch (error) {
      showErrorAlert("Error", "No se pudo generar el PDF de deportistas");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExcel = async () => {
    setOpen(false);
    setIsGenerating(true);

    try {
      const reportData = await validateData();
      if (!reportData) return;

      await exportToExcel(reportData, normalizedColumns, fileName);
    } catch (error) {
      showErrorAlert("Error", "No se pudo generar el Excel de deportistas");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        disabled={isGenerating}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
          isGenerating
            ? "bg-gray-300 cursor-not-allowed text-gray-700"
            : "text-gray-700 hover:bg-gray-200"
        } ${buttonClassName}`}
        whileHover={isGenerating ? {} : { scale: 1.03 }}
        whileTap={isGenerating ? {} : { scale: 0.97 }}
      >
        <IoMdDownload
          size={22}
          className={
            isGenerating
              ? "text-gray-500"
              : iconClassName || "text-primary-purple"
          }
        />
        {isGenerating ? "Generando..." : "Generar reporte"}
        {!isGenerating && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown size={18} />
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-1 w-40 bg-white shadow-lg border rounded-lg z-50 overflow-hidden"
          >
            <motion.button
              onClick={generateExcel}
              translate="no"
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="notranslate">Excel</span>
            </motion.button>
            <motion.button
              onClick={generatePDF}
              translate="no"
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="notranslate">PDF</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AthletesReportButton;
