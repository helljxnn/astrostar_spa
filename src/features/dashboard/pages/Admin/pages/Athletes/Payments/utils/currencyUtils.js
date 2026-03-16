/**
 * Utilidades para formateo de moneda en el módulo de pagos
 */

/**
 * Formatea un número como moneda colombiana
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como COP
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea un número con separadores de miles (sin símbolo de moneda)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Número formateado con separadores
 */
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }

  return new Intl.NumberFormat('es-CO').format(amount);
};
