
import  ExcelJS from 'exceljs';

/**
 * Función auxiliar para acceder a propiedades anidadas usando notación de puntos
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return acc[part];
    }
    return undefined;
  }, obj);
};

/**
 * Genera y descarga un archivo de Excel usando Excel.js
 */
export const exportToExcel = async (data, columns, fileName = "Reporte") => {
  if (!data || data.length === 0) {
    console.error("No hay datos para exportar a Excel.");
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Agregar encabezados
    worksheet.addRow(columns.map(col => col.header));

    // Agregar datos
    data.forEach(item => {
      const row = columns.map(col => {
        // Manejar propiedades anidadas con notación de puntos
        const value = col.accessor.includes('.') 
          ? getNestedValue(item, col.accessor)
          : item[col.accessor];
        
        // Manejar valores undefined/null
        if (value === undefined || value === null) {
          return '';
        }
        
        // Manejar objetos
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        
        return value;
      });
      worksheet.addRow(row);
    });

    // Estilizar encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' },
        size: 12
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' } // Color púrpura
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Aplicar bordes a todas las celdas
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    // Autoajustar columnas
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value !== null && cell.value !== undefined 
          ? cell.value.toString() 
          : '';
        const columnLength = cellValue.length;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Generar blob y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error al generar el archivo de Excel:", error);
    // showErrorAlert("Error", "No se pudo generar el archivo Excel");
  }
};