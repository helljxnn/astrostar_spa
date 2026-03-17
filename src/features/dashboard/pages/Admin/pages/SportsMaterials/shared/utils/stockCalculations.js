/**
 * Calcula el nuevo stock después de un movimiento
 * @param {number} stockActual - Stock actual del material
 * @param {number} cantidad - Cantidad del movimiento
 * @param {string} tipoMovimiento - "Entrada" o "Baja"
 * @returns {number} - Nuevo stock calculado
 * @throws {Error} - Si el stock resultante sería negativo
 */
export const calculateNewStock = (stockActual, cantidad, tipoMovimiento) => {
  const stock = parseInt(stockActual);
  const qty = parseInt(cantidad);

  if (isNaN(stock) || isNaN(qty)) {
    throw new Error('Stock y cantidad deben ser números válidos');
  }

  if (qty <= 0) {
    throw new Error('La cantidad debe ser mayor a cero');
  }

  let nuevoStock;

  if (tipoMovimiento === 'Entrada') {
    nuevoStock = stock + qty;
  } else if (tipoMovimiento === 'Baja') {
    nuevoStock = stock - qty;
    if (nuevoStock < 0) {
      throw new Error(`Stock insuficiente. Disponible: ${stock}, Solicitado: ${qty}`);
    }
  } else {
    throw new Error('Tipo de movimiento inválido. Debe ser "Entrada" o "Baja"');
  }

  return nuevoStock;
};

/**
 * Valida que una cantidad sea un número entero positivo
 * @param {any} cantidad - Valor a validar
 * @returns {boolean} - true si es válido
 * @throws {Error} - Si la validación falla
 */
export const validateMovementQuantity = (cantidad) => {
  const qty = parseInt(cantidad);

  if (isNaN(qty)) {
    throw new Error('La cantidad debe ser un número válido');
  }

  if (qty <= 0) {
    throw new Error('La cantidad debe ser mayor a cero');
  }

  if (!Number.isInteger(qty)) {
    throw new Error('La cantidad debe ser un número entero');
  }

  return true;
};

/**
 * Formatea un número como moneda colombiana
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha en formato colombiano
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-CO');
};

/**
 * Formatea una fecha y hora en formato colombiano
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} - Fecha y hora formateadas
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-CO');
};

