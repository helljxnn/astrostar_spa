import React, { useState, useRef, useEffect } from "react";
import { IoMdDownload } from "react-icons/io";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { showErrorAlert } from "../../shared/utils/alerts.js";
import { exportToExcel } from "../../shared/utils/Excel";
import { normalizeExportText } from "../../shared/utils/textEncoding.js";

const ReportButton = ({
  data,
  dataProvider, // Nueva prop para función que retorna datos (puede ser async)
  fileName = "Reporte",
  columns,
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
  const normalizedColumns = columns.map(col => {
    // Si ya tiene la estructura correcta, dejarla igual
    if (col.header && col.accessor) return col;
    
    // Si viene con label/key, convertir a header/accessor
    if (col.label && col.key) {
      return { header: col.label, accessor: col.key };
    }
    
    // Si viene con title/dataIndex (otra estructura común)
    if (col.title && col.dataIndex) {
      return { header: col.title, accessor: col.dataIndex };
    }
    
    console.warn('Columna con estructura no reconocida:', col);
    return col;
  });

  // Función auxiliar unificada
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object') {
        return acc[part];
      }
      return undefined;
    }, obj);
  };

  // Función para obtener los datos (síncrona o asíncrona)
  const getData = async () => {
    if (dataProvider && typeof dataProvider === 'function') {
      return await dataProvider();
    }
    return data || [];
  };

  const validateData = async () => {
    const reportData = await getData();
    if (!reportData || reportData.length === 0) {
      showErrorAlert("Error", "No hay datos para generar el reporte");
      return null;
    }
    return reportData;
  };

  const confirmLargeExport = async () => {
    const reportData = await getData();
    if (reportData.length > 500) {
      return window.confirm(
        `⚠️ Tienes ${reportData.length} registros. \n¿Deseas continuar con la exportación?`
      );
    }
    return true;
  };

  const generatePDF = async () => {
    setOpen(false);
    setIsGenerating(true);
    
    try {
      const reportData = await validateData();
      if (!reportData) return;

      if (!(await confirmLargeExport())) return;

      const doc = new jsPDF({ orientation: 'landscape' });
      const rowsPerPage = 35; // Reducir filas por página para mejor legibilidad
      const totalPages = Math.ceil(reportData.length / rowsPerPage);
      const generationDate = new Date().toLocaleDateString();

      const addHeader = (pageNumber) => {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(fileName, 15, 15);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generado: ${generationDate}`, 15, 22);
        doc.text(`Página ${pageNumber} de ${totalPages}`, 15, 29);
        doc.text(`Total de registros: ${reportData.length}`, 15, 36);
      };

      const generatePage = (pageNumber) => {
        doc.setPage(pageNumber);
        addHeader(pageNumber);

        const startIndex = (pageNumber - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, reportData.length);
        const pageData = reportData.slice(startIndex, endIndex);

        const tableColumn = normalizedColumns.map((col) =>
          normalizeExportText(col.header)
        );
        const tableRows = pageData.map(item => 
          normalizedColumns.map(col => {
            const value = col.accessor.includes('.') 
              ? getNestedValue(item, col.accessor)
              : item[col.accessor];
            // Limitar texto pero no tan agresivamente
            return value
              ? normalizeExportText(value).substring(0, 50)
              : '';
          })
        );

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 42,
          margin: { left: 10, right: 10 },
          styles: { 
            fontSize: 7, // Reducir un poco más el tamaño de fuente
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.3,
            overflow: 'linebreak', // Permitir salto de línea
            cellWidth: 'wrap', // Ajustar ancho de celda
            valign: 'top' // Alinear texto arriba
          },
          headStyles: { 
            fillColor: [79, 70, 229], 
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
            cellPadding: 3
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: (() => {
            // Configuración dinámica basada en el número de columnas
            const numColumns = normalizedColumns.length;
            const styles = {};
            
            if (numColumns <= 6) {
              // Para pocas columnas, usar anchos generosos
              const baseWidth = 40;
              for (let i = 0; i < numColumns; i++) {
                styles[i] = { cellWidth: baseWidth };
              }
            } else if (numColumns <= 10) {
              // Para columnas medianas, usar anchos moderados
              const baseWidth = 25;
              for (let i = 0; i < numColumns; i++) {
                styles[i] = { cellWidth: baseWidth };
              }
            } else {
              // Para muchas columnas, usar anchos pequeños
              const baseWidth = 18;
              for (let i = 0; i < numColumns; i++) {
                styles[i] = { cellWidth: baseWidth };
              }
            }
            
            return styles;
          })(),
          // Configuración automática de ancho de columnas
          tableWidth: 'auto',
          // Permitir que las celdas se expandan verticalmente
          minCellHeight: 8,
          // Configurar el comportamiento del texto largo
          didParseCell: function (data) {
            // Ajustar altura mínima para celdas con mucho texto
            if (data.cell.text && data.cell.text.length > 0) {
              const textLength = data.cell.text.join('').length;
              if (textLength > 20) {
                data.cell.minCellHeight = 12;
              }
            }
          }
        });
      };

      generatePage(1);

      if (totalPages > 1) {
        for (let i = 2; i <= totalPages; i++) {
          doc.addPage();
          generatePage(i);
        }
      }

      doc.save(`${fileName}_${generationDate.replace(/\//g, '-')}.pdf`);
      
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
      const reportData = await validateData();
      if (!reportData) return;

      if (!(await confirmLargeExport())) return;

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
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Excel
            </motion.button>
            <motion.button
              onClick={generatePDF}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              PDF
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportButton;

