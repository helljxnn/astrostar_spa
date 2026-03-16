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
      const titulo = event.title || event.nombre || "Sin título";
      doc.text(`${index + 1}. ${titulo}`, 20, yPos);
      yPos += lineHeight;

      // Detalles - soportar múltiples estructuras de datos
      const fechaInicio =
        formatDate(event.fechaInicio || event.date || event.start) ||
        "Sin fecha";
      const fechaFin = formatDate(event.fechaFin || event.end) || fechaInicio;
      const horaInicio =
        event.horaInicio ||
        event.time ||
        event.extendedProps?.horaInicio ||
        extractTime(event.start) ||
        "Sin hora";
      const horaFin =
        event.horaFin ||
        event.extendedProps?.horaFin ||
        extractTime(event.end) ||
        horaInicio;
      const estado =
        event.estadoOriginal ||
        event.estado ||
        event.extendedProps?.estadoOriginal ||
        event.status ||
        "Sin estado";
      const ubicacion =
        event.ubicacion ||
        event.extendedProps?.ubicacion ||
        event.location ||
        "Sin ubicación";

      doc.text(
        `   Fecha: ${fechaInicio}${fechaFin !== fechaInicio ? ` - ${fechaFin}` : ""}`,
        20,
        yPos,
      );
      yPos += lineHeight;
      doc.text(`   Hora: ${horaInicio} - ${horaFin}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`   Estado: ${estado}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`   Ubicación: ${ubicacion}`, 20, yPos);
      yPos += lineHeight;

      // Información adicional si existe
      const tipo = event.tipo || event.extendedProps?.tipo || event.type;
      if (tipo) {
        doc.text(`   Tipo: ${tipo}`, 20, yPos);
        yPos += lineHeight;
      }

      // Categorías deportivas (múltiples)
      const categoriasDeportivas =
        event.categoriasDeportivas ||
        event.extendedProps?.categoriasDeportivas ||
        "";
      if (categoriasDeportivas) {
        doc.text(`   Categorías: ${categoriasDeportivas}`, 20, yPos);
        yPos += lineHeight;
      }

      const telefono =
        event.telefono || event.extendedProps?.telefono || event.phone;
      if (telefono) {
        doc.text(`   Teléfono: ${telefono}`, 20, yPos);
        yPos += lineHeight;
      }

      // Descripción
      const descripcion = event.descripcion || event.description || "";
      if (descripcion) {
        // Dividir descripción en líneas si es muy larga
        const maxWidth = 170;
        const lines = doc.splitTextToSize(
          `   Descripción: ${descripcion}`,
          maxWidth,
        );
        lines.forEach((line) => {
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 20, yPos);
          yPos += lineHeight;
        });
      }

      // Publicado
      const publicar =
        event.publicar !== undefined ? (event.publicar ? "Sí" : "No") : "";
      if (publicar) {
        doc.text(`   Publicado: ${publicar}`, 20, yPos);
        yPos += lineHeight;
      }

      if (event.extendedProps?.professorName) {
        doc.text(`   Profesor: ${event.extendedProps.professorName}`, 20, yPos);
        yPos += lineHeight;
      }
      if (event.extendedProps?.totalAthletes) {
        doc.text(
          `   Deportistas: ${event.extendedProps.totalAthletes}`,
          20,
          yPos,
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
      pageHeight - 10,
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
    const headers = [
      "#",
      "Título",
      "Fecha Inicio",
      "Fecha Fin",
      "Hora Inicio",
      "Hora Fin",
      "Estado",
      "Ubicación",
    ];

    // Agregar headers adicionales si hay datos
    if (events.some((e) => e.tipo || e.extendedProps?.tipo || e.type)) {
      headers.push("Tipo");
    }
    if (
      events.some(
        (e) => e.categoriasDeportivas || e.extendedProps?.categoriasDeportivas,
      )
    ) {
      headers.push("Categorías");
    }
    if (
      events.some((e) => e.telefono || e.extendedProps?.telefono || e.phone)
    ) {
      headers.push("Teléfono");
    }
    if (events.some((e) => e.descripcion || e.description)) {
      headers.push("Descripción");
    }
    if (events.some((e) => e.publicar !== undefined)) {
      headers.push("Publicado");
    }
    if (events.some((e) => e.extendedProps?.professorName)) {
      headers.push("Profesor");
    }
    if (events.some((e) => e.extendedProps?.totalAthletes)) {
      headers.push("Deportistas");
    }

    worksheet.addRow(headers);

    // Datos
    events.forEach((event, index) => {
      const fechaInicio =
        formatDate(event.fechaInicio || event.date || event.start) ||
        "Sin fecha";
      const fechaFin = formatDate(event.fechaFin || event.end) || fechaInicio;
      const horaInicio =
        event.horaInicio ||
        event.time ||
        event.extendedProps?.horaInicio ||
        extractTime(event.start) ||
        "Sin hora";
      const horaFin =
        event.horaFin ||
        event.extendedProps?.horaFin ||
        extractTime(event.end) ||
        horaInicio;

      const row = [
        index + 1,
        event.title || event.nombre || "Sin título",
        fechaInicio,
        fechaFin,
        horaInicio,
        horaFin,
        event.estadoOriginal ||
          event.estado ||
          event.extendedProps?.estadoOriginal ||
          event.status ||
          "Sin estado",
        event.ubicacion ||
          event.extendedProps?.ubicacion ||
          event.location ||
          "Sin ubicación",
      ];

      if (headers.includes("Tipo")) {
        row.push(event.tipo || event.extendedProps?.tipo || event.type || "");
      }
      if (headers.includes("Categorías")) {
        row.push(
          event.categoriasDeportivas ||
            event.extendedProps?.categoriasDeportivas ||
            "",
        );
      }
      if (headers.includes("Teléfono")) {
        row.push(
          event.telefono || event.extendedProps?.telefono || event.phone || "",
        );
      }
      if (headers.includes("Descripción")) {
        row.push(event.descripcion || event.description || "");
      }
      if (headers.includes("Publicado")) {
        row.push(
          event.publicar !== undefined ? (event.publicar ? "Sí" : "No") : "",
        );
      }
      if (headers.includes("Profesor")) {
        row.push(event.extendedProps?.professorName || "Sin asignar");
      }
      if (headers.includes("Deportistas")) {
        row.push(event.extendedProps?.totalAthletes || 0);
      }

      worksheet.addRow(row);
    });

    // Ajustar columnas con anchos específicos
    worksheet.columns.forEach((column, index) => {
      if (index === 0) {
        column.width = 5; // # (número)
      } else if (headers[index] === "Título") {
        column.width = 30;
      } else if (headers[index] === "Descripción") {
        column.width = 40;
      } else if (headers[index] === "Categorías") {
        column.width = 25;
      } else if (headers[index] === "Ubicación") {
        column.width = 25;
      } else {
        column.width = 15;
      }
    });

    // Aplicar estilos a los headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFB595FF" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

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

