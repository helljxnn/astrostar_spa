import React, { useState, useRef, useEffect } from "react";
import { IoMdDownload } from "react-icons/io";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { showErrorAlert } from "../../shared/utils/alerts";
import { exportToExcel } from "../../shared/utils/Excel";

const ReportButton = ({ data, fileName = "Reporte", columns }) => {
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

  const validateData = () => {
    if (!data || data.length === 0) {
      showErrorAlert("Error", "No hay datos para generar el reporte");
      return false;
    }
    return true;
  };

  const confirmLargeExport = () => {
    if (data.length > 500) {
      return window.confirm(
        `⚠️ Tienes ${data.length} registros. \n¿Deseas continuar con la exportación?`
      );
    }
    return true;
  };

  const generatePDF = async () => {
    setOpen(false);
    
    if (!validateData() || !confirmLargeExport()) return;

    setIsGenerating(true);
    
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const rowsPerPage = 40;
      const totalPages = Math.ceil(data.length / rowsPerPage);
      const generationDate = new Date().toLocaleDateString();

      const addHeader = (pageNumber) => {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(fileName, 15, 15);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generado: ${generationDate}`, 15, 22);
        doc.text(`Página ${pageNumber} de ${totalPages}`, 15, 29);
        doc.text(`Total de registros: ${data.length}`, 15, 36);
      };

      const generatePage = (pageNumber) => {
        doc.setPage(pageNumber);
        addHeader(pageNumber);

        const startIndex = (pageNumber - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, data.length);
        const pageData = data.slice(startIndex, endIndex);

        const tableColumn = normalizedColumns.map(col => col.header);
        const tableRows = pageData.map(item => 
          normalizedColumns.map(col => {
            const value = col.accessor.includes('.') 
              ? getNestedValue(item, col.accessor)
              : item[col.accessor];
            return value ? value.toString().substring(0, 30) : '';
          })
        );

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 40,
          styles: { 
            fontSize: 8, 
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.3
          },
          headStyles: { 
            fillColor: [79, 70, 229], 
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
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
    
    if (!validateData()) return;

    setIsGenerating(true);
    
    try {
      // Usar las columnas normalizadas
      await exportToExcel(data, normalizedColumns, fileName);
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
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold transition-colors ${
          isGenerating 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'hover:bg-gray-200'
        }`}
        whileHover={isGenerating ? {} : { scale: 1.03 }}
        whileTap={isGenerating ? {} : { scale: 0.97 }}
      >
        <IoMdDownload 
          size={22} 
          className={isGenerating ? "text-gray-500" : "text-primary-purple"} 
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