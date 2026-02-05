import { jsPDF } from "jspdf";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Generar reporte PDF de emergencia (sin dependencias externas)
 */
export const generateFallbackPDF = (events, options = {}) => {
  try {
    const {
      title = "Reporte",
      fileName = "reporte.pdf",
      entityName = "eventos",
    } = options;

    // Crear documento básico
    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Título
    doc.setFontSize(16);
    doc.text(title, 20, yPos);
    yPos += lineHeight * 2;

    // Información general
    doc.setFontSize(12);
    doc.text(`Total de ${entityName}: ${events.length}`, 20, yPos);
    yPos += lineHeight * 2;

    // Listar eventos
    doc.setFontSize(10);
    events.forEach((event, index) => {
      // Verificar si necesitamos nueva página
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }

      // Número y título
      doc.text(`${index + 1}. ${event.title || "Sin título"}`, 20, yPos);
      yPos += lineHeight;

      // Detalles
      const fecha = formatDate(event.date || event.start) || "Sin fecha";
      const hora = event.time || extractTime(event.start) || "Sin hora";
      const estado = event.status || "Sin estado";
      const ubicacion = event.location || "Sin ubicación";

      doc.text(`   Fecha: ${fecha} | Hora: ${hora}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`   Estado: ${estado} | Ubicación: ${ubicacion}`, 20, yPos);
      yPos += lineHeight;

      // Información adicional si existe
      if (event.extendedProps?.professorName) {
        doc.text(`   Profesor: ${event.extendedProps.professorName}`, 20, yPos);
        yPos += lineHeight;
      }
      if (event.extendedProps?.totalAthletes) {
        doc.text(
          `   Deportistas: ${event.extendedProps.totalAthletes}`,
          20,
          yPos
        );
        yPos += lineHeight;
      }

      yPos += lineHeight; // Espacio entre eventos
    });

    // Pie de página
    const currentDate = new Date().toLocaleDateString("es-ES");
    const currentTime = new Date().toLocaleTimeString("es-ES");
    doc.text(
      `Generado el ${currentDate} a las ${currentTime}`,
      20,
      pageHeight - 10
    );

    // Descargar
    doc.save(fileName);

    return { success: true, message: "PDF generado exitosamente" };
  } catch (error) {
    throw error;
  }
};

/**
 * Generar reporte Excel de emergencia
 */
export const generateFallbackExcel = async (events, options = {}) => {
  try {
    const {
      title = "Reporte",
      fileName = "reporte.xlsx",
      entityName = "eventos",
    } = options;

    // Crear workbook simple
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte");

    // Headers
    const headers = ["#", "Título", "Fecha", "Hora", "Estado", "Ubicación"];

    // Agregar headers adicionales si hay datos
    if (events.some((e) => e.extendedProps?.professorName)) {
      headers.push("Profesor");
    }
    if (events.some((e) => e.extendedProps?.totalAthletes)) {
      headers.push("Deportistas");
    }

    worksheet.addRow(headers);

    // Datos
    events.forEach((event, index) => {
      const row = [
        index + 1,
        event.title || "Sin título",
        formatDate(event.date || event.start) || "Sin fecha",
        event.time || extractTime(event.start) || "Sin hora",
        event.status || "Sin estado",
        event.location || "Sin ubicación",
      ];

      if (headers.includes("Profesor")) {
        row.push(event.extendedProps?.professorName || "Sin asignar");
      }
      if (headers.includes("Deportistas")) {
        row.push(event.extendedProps?.totalAthletes || 0);
      }

      worksheet.addRow(row);
    });

    // Ajustar columnas
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    // Generar y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, fileName);

    return { success: true, message: "Excel generado exitosamente" };
  } catch (error) {
    throw error;
  }
};

// Funciones auxiliares
const formatDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date.toLocaleDateString("es-ES");
  } catch {
    return null;
  }
};

const extractTime = (dateValue) => {
  if (!dateValue) return null;
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime())
      ? null
      : date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return null;
  }
};
