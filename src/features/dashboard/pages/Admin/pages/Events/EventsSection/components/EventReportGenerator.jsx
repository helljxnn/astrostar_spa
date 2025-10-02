import React, { useState, useContext } from 'react';
import { IoMdDownload } from "react-icons/io";
import { FiChevronDown, FiFileText } from "react-icons/fi";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { showErrorAlert, showSuccessAlert } from "../../../../../../../../shared/utils/alerts";

const EventReportGenerator = ({ data = [], fileName = "Reporte_Eventos", columns }) => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const toggleDropdown = () => setOpen((prev) => !prev);

  // Usar columnas proporcionadas o definir unas por defecto
  const reportColumns = columns || [
    { key: "tipo", label: "Tipo de Evento" },
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "fechaInicio", label: "Fecha Inicio" },
    { key: "fechaFin", label: "Fecha Fin" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "estado", label: "Estado" }
  ];

  const generatePDF = () => {
    setOpen(false);
    
    try {
      // Obtener el elemento del calendario
      const calendarElement = document.querySelector('.rbc-calendar');
      
      if (!calendarElement) {
        showErrorAlert("Error", "No se pudo encontrar el calendario para capturar");
        return;
      }
      
      // Eliminamos la alerta de procesamiento para evitar interrupciones
      
      // Obtener fecha seleccionada para el nombre del archivo
      // Asegurarnos de que la fecha se procese correctamente
      const [year, month] = selectedMonth.split('-').map(num => parseInt(num, 10));
      const selectedDate = new Date(year, month - 1); // Restamos 1 porque los meses en JS van de 0-11
      const monthName = selectedDate.toLocaleString('es', { month: 'long' });
      const selectedYear = selectedDate.getFullYear();
      
      // Ocultar temporalmente los iconos de los botones y ajustar el estilo del estado
      const actionButtons = document.querySelectorAll('.event-action-buttons, .rbc-event-content button, .rbc-event button');
      const eventStatusElements = document.querySelectorAll('.event-status');
      const eventIcons = document.querySelectorAll('.rbc-event-content svg, .rbc-event svg, .event-icon, .status-icon');
      const eventInitials = document.querySelectorAll('.event-initial, .event-avatar');
      
      // Guardar estilos originales para restaurarlos después
      const originalStyles = [];
      
      // Ocultar todos los botones en el calendario
      actionButtons.forEach(button => {
        originalStyles.push({
          element: button,
          display: button.style.display,
          visibility: button.style.visibility
        });
        button.style.display = 'none';
        button.style.visibility = 'hidden';
      });
      
      // Ocultar iconos de estado y cualquier icono en los eventos
      eventIcons.forEach(icon => {
        originalStyles.push({
          element: icon,
          display: icon.style.display,
          visibility: icon.style.visibility
        });
        icon.style.display = 'none';
        icon.style.visibility = 'hidden';
      });
      
      // Ocultar iniciales o avatares
      eventInitials.forEach(initial => {
        originalStyles.push({
          element: initial,
          display: initial.style.display,
          visibility: initial.style.visibility
        });
        initial.style.display = 'none';
        initial.style.visibility = 'hidden';
      });
      
      // Ajustar estilo del estado del evento
      eventStatusElements.forEach(statusElement => {
        originalStyles.push({
          element: statusElement,
          whiteSpace: statusElement.style.whiteSpace,
          padding: statusElement.style.padding,
          textAlign: statusElement.style.textAlign,
          overflow: statusElement.style.overflow,
          textOverflow: statusElement.style.textOverflow
        });
        statusElement.style.whiteSpace = 'normal';
        statusElement.style.padding = '2px 4px';
        statusElement.style.textAlign = 'center';
        statusElement.style.overflow = 'visible';
        statusElement.style.textOverflow = 'clip';
      });
      
      // Función para restaurar los estilos originales
      const restoreOriginalStyles = () => {
        originalStyles.forEach(item => {
          if (item.element) {
            if (item.display !== undefined) {
              item.element.style.display = item.display;
            }
            if (item.visibility !== undefined) {
              item.element.style.visibility = item.visibility;
            }
            if (item.whiteSpace !== undefined) {
              item.element.style.whiteSpace = item.whiteSpace;
            }
            if (item.padding !== undefined) {
              item.element.style.padding = item.padding;
            }
            if (item.textAlign !== undefined) {
              item.element.style.textAlign = item.textAlign;
            }
            if (item.overflow !== undefined) {
              item.element.style.overflow = item.overflow;
            }
            if (item.textOverflow !== undefined) {
              item.element.style.textOverflow = item.textOverflow;
            }
          }
        });
      };
      
      // Usar html2canvas para capturar el calendario
      html2canvas(calendarElement, {
        scale: 1.5, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        // Restaurar estilos originales inmediatamente después de la captura
        restoreOriginalStyles();
        
        // Crear PDF con la imagen capturada
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Calcular dimensiones para ajustar la imagen al PDF
        const imgWidth = 280; // mm (ancho A4 landscape ~297mm)
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        // Crear PDF en formato landscape
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Calcular posición centrada
        const xPos = (pageWidth - imgWidth) / 2;
        const yPos = 20; // Margen superior
        
        // Título principal
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Calendario de Eventos - ${monthName} ${selectedYear}`, pageWidth / 2, 15, { align: 'center' });
        
        // Agregar la imagen del calendario
        doc.addImage(imgData, 'JPEG', xPos, yPos, imgWidth, imgHeight);
        
        // Fecha de generación en pie de página
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const currentDate = new Date().toLocaleString('es-ES');
        doc.text(`Generado el: ${currentDate}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        
        // Descargar PDF
        doc.save(`${fileName}_${monthName}_${selectedYear}.pdf`);
      }).catch(error => {
        console.error("Error al capturar calendario:", error);
        showErrorAlert("Error", `Error al capturar calendario: ${error.message}`);
        
        // Restaurar estilos originales en caso de error
        restoreOriginalStyles();
      });
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      showErrorAlert("Error", `Error al generar PDF: ${error.message}`);
    }
  };

  const generateExcel = async () => {
    setOpen(false);
    
    try {
      // Verificar si hay datos
      if (!data || data.length === 0) {
        showErrorAlert("Error", "No hay eventos disponibles");
        return;
      }
      
      // Filtrar eventos por el mes seleccionado
      const selectedDate = new Date(selectedMonth);
      const selectedMonthNumber = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      
      // Asegurarse de que los eventos tengan fechaInicio válida
      const filteredData = data.filter(event => {
        if (!event.fechaInicio && event.start) {
          // Si no hay fechaInicio pero hay start (formato de calendario)
          const eventDate = new Date(event.start);
          return eventDate.getMonth() === selectedMonthNumber && 
                 eventDate.getFullYear() === selectedYear;
        } else if (event.fechaInicio) {
          const eventDate = new Date(event.fechaInicio);
          return eventDate.getMonth() === selectedMonthNumber && 
                 eventDate.getFullYear() === selectedYear;
        }
        return false;
      });
      
      // Si no hay eventos para el mes seleccionado, mostrar todos los eventos disponibles
      const dataToExport = filteredData && filteredData.length > 0 ? filteredData : data;

      // Preparar datos para Excel con formato mejorado
      const worksheetData = dataToExport.map((row) => {
        const obj = {};
        reportColumns.forEach((col) => {
          let value = row[col.key];
          
          if (value === null || value === undefined) {
            obj[col.label] = "";
          } else if (typeof value === 'boolean') {
            // Convertir valores booleanos a "Sí" o "No"
            obj[col.label] = value === true ? "Sí" : "No";
          } else if (value === "true" || value === "false") {
            // Convertir strings "true"/"false" a "Sí"/"No"
            obj[col.label] = value === "true" ? "Sí" : "No";
          } else if (typeof value === 'object') {
            if (value instanceof Date) {
              obj[col.label] = value.toLocaleDateString('es-ES');
            } else if (col.key === 'fechaInicio' || col.key === 'fechaFin' || col.key === 'start' || col.key === 'end') {
              // Formatear fechas correctamente
              try {
                const date = new Date(value);
                if (!isNaN(date)) {
                  obj[col.label] = date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                } else {
                  obj[col.label] = value;
                }
              } catch (e) {
                obj[col.label] = value;
              }
            } else {
              obj[col.label] = JSON.stringify(value);
            }
          } else if (col.key === 'estado') {
            // Formatear estado sin códigos HTML
            obj[col.label] = value.toString().replace(/<[^>]*>/g, '');
          } else if (col.key === 'publicar' || col.key === 'published' || col.key.includes('activ')) {
            // Convertir campos relacionados con publicación o activación
            obj[col.label] = value === true || value === "true" || value === 1 || value === "1" ? "Sí" : "No";
          } else {
            obj[col.label] = value;
          }
        });
        return obj;
      });

      // Crear workbook con exceljs
      const workbook = new ExcelJS.Workbook();
      
      // Agregar metadatos
      workbook.creator = "AstroStar";
      workbook.lastModifiedBy = "AstroStar";
      workbook.created = new Date();
      workbook.modified = new Date();
      workbook.properties.date1904 = true;
      workbook.title = `Reporte de Eventos - ${selectedDate.toLocaleString('es', { month: 'long' })} ${selectedYear}`;
      workbook.subject = "Reporte de Eventos";
      
      // Crear worksheet
      const worksheet = workbook.addWorksheet('Eventos');
      
      // Agregar encabezados
      const headers = reportColumns.map(col => col.label);
      worksheet.addRow(headers);
      
      // Dar formato a la fila de encabezados
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: '000000' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E0E0E0' }
      };
      
      // Agregar datos
      worksheetData.forEach(data => {
        const rowValues = reportColumns.map(col => data[col.label]);
        worksheet.addRow(rowValues);
      });
      
      // Ajustar ancho de columnas
      worksheet.columns.forEach((column, index) => {
        let maxLength = headers[index].length;
        worksheet.getColumn(index + 1).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
          if (rowNumber > 1) {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          }
        });
        worksheet.getColumn(index + 1).width = Math.max(maxLength + 2, 15);
      });
      
      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      
      const monthName = selectedDate.toLocaleString('es', { month: 'long' });
      const fileName_with_date = `${fileName}_${monthName}_${selectedYear}.xlsx`;
      const blob = new Blob([buffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      saveAs(blob, fileName_with_date);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      showErrorAlert("Error", `Error al generar Excel: ${error.message}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-1 px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-xs"
      >
        <FiFileText className="text-primary-purple" />
        <span>Reportes</span>
        <FiChevronDown className={`transition-transform ${open ? "rotate-180" : ""} text-xs`} />
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
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mes
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-32 p-1 text-xs border border-gray-300 rounded-md focus:ring-primary-purple focus:border-primary-purple"
                  />
                </div>
              </div>
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

export default EventReportGenerator;