// utils/exportToExcel.js
import ExcelJS from 'exceljs';

/**
 * Obtiene valores anidados con notación de puntos (p.e. "cliente.nombre")
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj);
};

/**
 * Genera y descarga un archivo Excel en el navegador.
 * @param {Array} data   Array de objetos a exportar
 * @param {Array} columns Array de columnas [{ header: 'Título', accessor: 'prop' }]
 * @param {string} fileName Nombre base del archivo
 */
export const exportToExcel = async (data, columns, fileName = 'Reporte') => {
  // Validaciones iniciales
  if (!Array.isArray(data) || data.length === 0) {
    console.error('No hay datos para exportar a Excel.');
    return;
  }
  if (!Array.isArray(columns) || columns.length === 0) {
    console.error('No se definieron columnas para el Excel.');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Encabezados
    worksheet.addRow(columns.map(col => col.header));

    // Filas de datos
    data.forEach(item => {
      const row = columns.map(col => {
        const rawValue = col.accessor?.includes('.')
          ? getNestedValue(item, col.accessor)
          : item[col.accessor];

        if (rawValue === undefined || rawValue === null) return '';
        if (typeof rawValue === 'object') return JSON.stringify(rawValue);
        return rawValue;
      });
      worksheet.addRow(row);
    });

    // Estilo de encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' } // púrpura
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Bordes y alineación en todas las celdas
    worksheet.eachRow({ includeEmpty: false }, row => {
      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    // Autoajustar ancho de columnas
    worksheet.columns.forEach(col => {
      let max = 10;
      col.eachCell({ includeEmpty: true }, cell => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > max) max = len;
      });
      col.width = Math.min(max + 2, 50);
    });

    // Crear y descargar blob
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
  } catch (err) {
    console.error('Error al generar el archivo de Excel:', err);
  }
};
