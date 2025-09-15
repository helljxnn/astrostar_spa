// ReportButton.jsx - Con mejor diseño y distribución
import React, { useState } from "react";
import { IoMdDownload } from "react-icons/io";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// IMPORTACIÓN CORRECTA
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

import { showErrorAlert } from "../../shared/utils/alerts";

const ReportButton = ({ data, fileName = "Reporte", columns }) => {
  const [open, setOpen] = useState(false);

  if (!columns || columns.length === 0) {
    console.error("ReportButton: Debes definir las columnas del reporte");
    return null;
  }

  const toggleDropdown = () => setOpen((prev) => !prev);

  const generatePDF = () => {
    setOpen(false);
    
    try {
      if (!data || data.length === 0) {
        return showErrorAlert("Error", "No hay datos para generar el PDF");
      }

      console.log("Generando PDF con mejor diseño...");
      
      // Usar formato A4 landscape para más espacio horizontal
      const doc = new jsPDF('landscape', 'mm', 'a4'); // landscape = horizontal
      
      // Configurar márgenes y dimensiones
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Preparar encabezados
      const tableHeaders = columns.map((col) => col.label);
      
      // Preparar datos con mejor formateo
      const tableRows = data.map((row) => {
        return columns.map((col) => {
          let value = row[col.key];
          
          if (value === null || value === undefined) {
            return "";
          }
          
          if (typeof value === 'object') {
            if (value instanceof Date) {
              return value.toLocaleDateString('es-ES');
            }
            return JSON.stringify(value);
          }
          
          // Truncar texto muy largo para mejor presentación
          const stringValue = String(value);
          return stringValue.length > 30 ? stringValue.substring(0, 27) + '...' : stringValue;
        });
      });

      // Título principal con mejor formato
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(fileName, margin, 25);
      
      // Fecha y hora de generación
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleString('es-ES');
      doc.text(`Generado el: ${currentDate}`, margin, 35);
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 40, pageWidth - margin, 40);

      // Configurar la tabla con mejor diseño
      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: 45,
        margin: { left: margin, right: margin },
        styles: { 
          fontSize: 8,
          cellPadding: 4,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'middle'
        },
        headStyles: { 
          fillColor: [52, 73, 94], // Azul oscuro más profesional
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250] // Gris muy claro
        },
        columnStyles: {
          // Ajustar anchos de columnas dinámicamente
          ...columns.reduce((styles, col, index) => {
            // Dar más espacio a campos que suelen ser más largos
            if (col.key.includes('razonSocial') || col.key.includes('nombre')) {
              styles[index] = { cellWidth: 'auto', minCellWidth: 35 };
            } else if (col.key.includes('correo') || col.key.includes('email')) {
              styles[index] = { cellWidth: 'auto', minCellWidth: 30 };
            } else if (col.key.includes('telefono') || col.key.includes('nit')) {
              styles[index] = { cellWidth: 'auto', minCellWidth: 20 };
            } else {
              styles[index] = { cellWidth: 'auto' };
            }
            return styles;
          }, {})
        },
        didDrawPage: (data) => {
          // Pie de página con número de página
          const pageNumber = data.pageNumber;
          const totalPages = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text(
            `Página ${pageNumber} de ${totalPages}`, 
            pageWidth - margin, 
            pageHeight - 10,
            { align: 'right' }
          );
        }
      });

      const fileName_with_date = `${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName_with_date);
      
      console.log("✅ PDF generado exitosamente con mejor diseño");
      
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      showErrorAlert("Error", `Error al generar PDF: ${error.message}`);
    }
  };

  const generateExcel = () => {
    setOpen(false);
    
    try {
      if (!data || data.length === 0) {
        return showErrorAlert("Error", "No hay datos para generar el reporte");
      }

      console.log("Generando Excel con mejor formato...");

      // Preparar datos para Excel
      const worksheetData = data.map((row) => {
        const obj = {};
        columns.forEach((col) => {
          let value = row[col.key];
          
          // Formatear mejor los datos para Excel
          if (value === null || value === undefined) {
            obj[col.label] = "";
          } else if (typeof value === 'object') {
            if (value instanceof Date) {
              obj[col.label] = value.toLocaleDateString('es-ES');
            } else {
              obj[col.label] = JSON.stringify(value);
            }
          } else {
            obj[col.label] = value;
          }
        });
        return obj;
      });

      // Crear worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      // Mejorar el formato del worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      // Configurar anchos de columnas automáticamente
      const columnWidths = columns.map((col, index) => {
        // Calcular el ancho basado en el contenido
        let maxLength = col.label.length;
        
        data.forEach(row => {
          const value = String(row[col.key] || '');
          if (value.length > maxLength) {
            maxLength = Math.min(value.length, 50); // Máximo 50 caracteres
          }
        });
        
        return { wch: Math.max(maxLength + 2, 10) }; // Mínimo 10, +2 para padding
      });
      
      worksheet['!cols'] = columnWidths;

      // Formatear encabezados en negrita (esto requiere el formato de celdas)
      for (let i = 0; i <= columns.length - 1; i++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "CCCCCC" } },
            alignment: { horizontal: "center" }
          };
        }
      }

      // Crear workbook
      const workbook = XLSX.utils.book_new();
      
      // Agregar información adicional en una segunda hoja
      const infoSheet = XLSX.utils.json_to_sheet([
        { "Campo": "Archivo", "Valor": fileName },
        { "Campo": "Fecha de generación", "Valor": new Date().toLocaleString('es-ES') },
        { "Campo": "Total de registros", "Valor": data.length },
        { "Campo": "Columnas incluidas", "Valor": columns.length }
      ]);
      
      // Configurar anchos para la hoja de información
      infoSheet['!cols'] = [
        { wch: 20 }, // Campo
        { wch: 30 }  // Valor
      ];

      // Agregar hojas al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
      XLSX.utils.book_append_sheet(workbook, infoSheet, "Información");

      // Generar archivo
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      
      const blob = new Blob([excelBuffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const fileName_with_date = `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, fileName_with_date);
      
      console.log("✅ Excel generado exitosamente con mejor formato");
      
    } catch (error) {
      console.error("❌ Error al generar Excel:", error);
      showErrorAlert("Error", `Error al generar Excel: ${error.message}`);
    }
  };

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <IoMdDownload size={22} className="text-primary-purple" />
        Generar reporte
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown size={18} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
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