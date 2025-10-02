// En shared/utils/Excel.js
import ExcelJS from 'exceljs';

export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
};

export const exportToExcel = async (data, columns, fileName = 'Reporte') => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No hay datos para exportar a Excel.');
  }
  
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error('No se definieron columnas para el Excel.');
  }

  // Normalizar columnas para soportar diferentes estructuras
  const normalizedColumns = columns.map(col => {
    if (col.header && col.accessor) return col;
    if (col.label && col.key) return { header: col.label, accessor: col.key };
    if (col.title && col.dataIndex) return { header: col.title, accessor: col.dataIndex };
    console.warn('Columna con estructura no reconocida:', col);
    return col;
  });

  try {
    const workbook = new ExcelJS.Workbook();
    
    // Agregar metadatos
    workbook.creator = "AstroStar";
    workbook.lastModifiedBy = "AstroStar";
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Worksheet principal
    const worksheet = workbook.addWorksheet('Datos');
    
    // Encabezados
    const headers = normalizedColumns.map(col => col.header);
    worksheet.addRow(headers);
    
    // Estilo de encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Datos
    data.forEach(item => {
      const rowValues = normalizedColumns.map(col => {
        const rawValue = col.accessor?.includes('.')
          ? getNestedValue(item, col.accessor)
          : item[col.accessor];

        if (rawValue === undefined || rawValue === null) return '';
        if (typeof rawValue === 'object') {
          if (rawValue instanceof Date) {
            return rawValue.toLocaleDateString('es-ES');
          }
          return JSON.stringify(rawValue);
        }
        return rawValue;
      });
      worksheet.addRow(rowValues);
    });
    
    // Ajustar ancho de columnas
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index].length;
      worksheet.getColumn(index + 1).eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = Math.min(cellLength, 50);
        }
      });
      column.width = Math.max(maxLength + 2, 10);
    });
    
    // Aplicar bordes a todas las celdas
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });
    
    // Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const fileNameWithDate = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, fileNameWithDate);
    
    return true;
  } catch (err) {
    console.error('Error al generar el archivo de Excel:', err);
    throw err;
  }
};