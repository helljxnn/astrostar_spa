/**
 * Formatea un número con separadores de miles según el estándar colombiano
 * @param {number|string} value - El número a formatear
 * @returns {string} - Número formateado con punto como separador de miles
 * 
 * Ejemplos:
 * formatNumber(1000) => "1.000"
 * formatNumber(200000) => "200.000"
 * formatNumber(105) => "105"
 * formatNumber("200.000") => "200.000" (ya formateado)
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  // Si ya es un string formateado (contiene puntos), devolverlo tal cual
  if (typeof value === 'string' && value.includes('.')) {
    // Verificar si es un número formateado válido
    const cleanValue = value.replace(/\./g, '');
    if (!isNaN(cleanValue)) {
      return value; // Ya está formateado
    }
  }

  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  
  if (isNaN(num)) {
    return '0';
  }

  // Formatear con punto como separador de miles (estándar colombiano)
  return num.toLocaleString('es-CO');
};

/**
 * Formatea un número de stock con su unidad de medida
 * @param {number|string} value - El número a formatear
 * @param {string} unit - La unidad de medida (por defecto "unidades")
 * @returns {string} - Número formateado con unidad
 * 
 * Ejemplos:
 * formatStock(1000) => "1.000 unidades"
 * formatStock(200000, "Kilogramos") => "200.000 Kilogramos"
 * formatStock("200.000") => "200.000 unidades" (ya formateado)
 */
export const formatStock = (value, unit = 'unidades') => {
  return `${formatNumber(value)} ${unit}`;
};

