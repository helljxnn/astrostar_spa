/**
 * Formatea un número como una cadena de moneda, utilizando la configuración regional del navegador.
 *
 * @param {number} number - El número que se va a formatear.
 * @param {string} [locale='es-ES'] - El código de idioma y región para el formato. Ej: 'en-US'.
 * @param {string} [currency='EUR'] - El código de la moneda. Ej: 'USD'.
 * @returns {string} El número formateado como una cadena de moneda.
 *
 * @example
 * // Devuelve "1.234,56 €" en una configuración regional española.
 * formatCurrency(1234.56);
 *
 * @example
 * // Devuelve "$1,234.56" en una configuración regional estadounidense.
 * formatCurrency(1234.56, 'en-US', 'USD');
 *
 * @example
 * // Devuelve "$ 1.234,56" en una configuración regional colombiana por defecto.
 * formatCurrency(1234.56);
 */
export const formatCurrency = (number, locale = "es-CO", currency = "COP") => {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    number
  );
};
