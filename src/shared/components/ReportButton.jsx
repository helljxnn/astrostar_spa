import { useState, useRef, useEffect } from "react";
import { IoMdDownload } from "react-icons/io";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { showErrorAlert } from "../../shared/utils/alerts.js";
import { exportToExcel } from "../../shared/utils/Excel";
import { normalizeExportText } from "../../shared/utils/textEncoding.js";

const ReportButton = ({
  data,
  dataProvider, // New prop for function that returns data (can be async)
  fileName = "Reporte",
  columns,
  customDataTransform,
  buttonClassName = "",
  iconClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normalizar columnas para soportar diferentes estructuras
  const normalizedColumns = columns.map((col) => {
    // Si ya tiene la estructura correcta, dejarla igual
    if (col.header && col.accessor) return col;

    // Si viene con label/key, convertir a header/accessor
    if (col.label && col.key) {
      return { header: col.label, accessor: col.key };
    }

    // If it comes as title/dataIndex (another common structure)
    if (col.title && col.dataIndex) {
      return { header: col.title, accessor: col.dataIndex };
    }

    console.warn("Columna con estructura no reconocida:", col);
    return col;
  });

  // Unified helper function
  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => {
      if (acc && typeof acc === "object") {
        return acc[part];
      }
      return undefined;
    }, obj);
  };

  const resolveColumnValue = (item, col) => {
    const rawValue = col.accessor.includes(".")
      ? getNestedValue(item, col.accessor)
      : item[col.accessor];

    return typeof col.format === "function"
      ? col.format(rawValue, item)
      : rawValue;
  };

  const formatExportValue = (value, maxLength = null) => {
    if (value === undefined || value === null) {
      return "";
    }

    const normalizedValue = normalizeExportText(String(value));

    if (maxLength && normalizedValue.length > maxLength) {
      return `${normalizedValue.substring(0, maxLength - 3)}...`;
    }

    return normalizedValue;
  };

  // Get data (sync or async) and call only once
  const getData = async () => {
    const sourceData =
      dataProvider && typeof dataProvider === "function"
        ? await dataProvider()
        : data || [];

    if (typeof customDataTransform === "function") {
      return sourceData.map((item) => customDataTransform(item));
    }

    return sourceData;
  };

  // Obtiene, valida y confirma en una sola llamada al API
  const fetchAndValidate = async () => {
    const reportData = await getData();
    if (!reportData || reportData.length === 0) {
      showErrorAlert("Error", "No hay datos para generar el reporte");
      return null;
    }
    if (reportData.length > 500) {
      const ok = window.confirm(
        `\u26A0\uFE0F Tienes ${reportData.length} registros.\n\u00BFDeseas continuar con la exportaci\u00F3n?`,
      );
      if (!ok) return null;
    }
    return reportData;
  };

  const generatePDF = async () => {
    setOpen(false);
    setIsGenerating(true);

    try {
      const reportData = await fetchAndValidate();
      if (!reportData) return;

      const doc = new jsPDF({ orientation: "landscape" });
      const generationDate = new Date().toLocaleDateString();
      const tableStartY = 42;

      const addHeader = () => {
        doc.setFontSize(16);
        doc.setFont(undefined, "bold");
        doc.text(fileName, 15, 15);

        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(`Generado: ${generationDate}`, 15, 22);
        doc.text(`Total de registros: ${reportData.length}`, 15, 36);
      };

      const tableColumn = normalizedColumns.map((col) =>
        normalizeExportText(col.header),
      );
      const tableRows = reportData.map((item) =>
        normalizedColumns.map((col) => {
          const header = normalizeExportText(col.header).toLowerCase();
          const value = resolveColumnValue(item, col);
          const maxLength = header.includes("descrip") ? 120 : 80;
          return formatExportValue(value, maxLength);
        }),
      );

      const pageWidth = doc.internal.pageSize.getWidth();
      const availableWidth = pageWidth - 20; // left + right margin
      const columnWeights = normalizedColumns.map((col) => {
        const header = normalizeExportText(col.header).toLowerCase();
        if (
          header.includes("descrip") ||
          header.includes("observ") ||
          header.includes("detalle")
        ) {
          return 1.6;
        }
        return 1;
      });
      const totalWeight = columnWeights.reduce(
        (sum, weight) => sum + weight,
        0,
      );
      const computedColumnStyles = {};

      normalizedColumns.forEach((_, index) => {
        computedColumnStyles[index] = {
          cellWidth: Math.max(
            12,
            (availableWidth * columnWeights[index]) / totalWeight,
          ),
        };
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        margin: { top: tableStartY, left: 10, right: 10 },
        styles: {
          fontSize: 7, // Slightly reduce font size
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.3,
          overflow: "linebreak", // Allow line wrapping
          cellWidth: "wrap", // Ajustar ancho de celda
          valign: "top", // Alinear texto arriba
        },
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: computedColumnStyles,
        // Automatic column width configuration
        tableWidth: availableWidth,
        horizontalPageBreak: false,
        // Permitir que las celdas se expandan verticalmente
        minCellHeight: 8,
        // Configurar el comportamiento del texto largo
        didParseCell: function (data) {
          // Increase minimum height for cells with long text
          if (data.cell.text && data.cell.text.length > 0) {
            const textLength = data.cell.text.join("").length;
            if (textLength > 20) {
              data.cell.minCellHeight = 12;
            }
          }
        },
        didDrawPage: function () {
          addHeader();
        },
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        doc.setPage(pageNumber);
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(`P\u00e1gina ${pageNumber} de ${totalPages}`, 15, 29);
      }

      doc.save(`${fileName}_${generationDate.replace(/\//g, "-")}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      showErrorAlert("Error", "No se pudo generar el PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExcel = async () => {
    setOpen(false);
    setIsGenerating(true);

    try {
      const reportData = await fetchAndValidate();
      if (!reportData) return;

      // Usar las columnas normalizadas
      await exportToExcel(reportData, normalizedColumns, fileName);
    } catch (error) {
      console.error("Error generando Excel:", error);
      showErrorAlert("Error", "No se pudo generar el Excel");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <motion.button
        onClick={toggleDropdown}
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

export default ReportButton;

