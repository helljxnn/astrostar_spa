/**
 * Utilidad para manejar tipos de baja de materiales
 * 
 * IMPORTANTE: El backend actualmente espera valores con tildes y espacios
 * aunque el enum de Prisma usa UPPER_SNAKE_CASE.
 * El backend hace la conversión internamente.
 */

// Valores que espera el backend (con tildes y espacios)
export const TIPO_BAJA_VALUES = {
  DANO_DETERIORO: 'Daño o Deterioro',
  PERDIDA: 'Pérdida',
  ROBO: 'Robo',
  AJUSTE_INVENTARIO: 'Ajuste de Inventario',
  OTRO: 'Otro',
};

// Mapeo inverso para convertir desde el backend
export const TIPO_BAJA_FROM_BACKEND = {
  'DANO_DETERIORO': 'Daño o Deterioro',
  'PERDIDA': 'Pérdida',
  'ROBO': 'Robo',
  'AJUSTE_INVENTARIO': 'Ajuste de Inventario',
  'OTRO': 'Otro',
  // También aceptar valores con tildes (por si el backend los devuelve así)
  'Daño o Deterioro': 'Daño o Deterioro',
  'Pérdida': 'Pérdida',
  'Robo': 'Robo',
  'Ajuste de Inventario': 'Ajuste de Inventario',
  'Otro': 'Otro',
};

/**
 * Convierte un valor de tipo de baja a su etiqueta legible
 * @param {string} tipoBaja - Valor del tipo de baja
 * @returns {string} Etiqueta legible
 */
export const getTipoBajaLabel = (tipoBaja) => {
  if (!tipoBaja) return 'No especificado';
  return TIPO_BAJA_FROM_BACKEND[tipoBaja] || tipoBaja;
};

/**
 * Obtiene todas las opciones de tipo de baja para usar en selects
 * @returns {Array<{value: string, label: string}>}
 */
export const getTipoBajaOptions = () => {
  return Object.entries(TIPO_BAJA_VALUES).map(([_, value]) => ({
    value,
    label: value,
  }));
};

