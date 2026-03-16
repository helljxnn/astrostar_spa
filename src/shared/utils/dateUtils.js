/**
 * Utilidades para manejo seguro de fechas sin problemas de zona horaria
 */

/**
 * Convierte cualquier formato de fecha a YYYY-MM-DD (formato de input date)
 * Maneja correctamente las zonas horarias para evitar cambios de día
 * 
 * @param {string|Date} dateValue - Fecha en cualquier formato
 * @returns {string} Fecha en formato YYYY-MM-DD o cadena vacía si es inválida
 */
export const toDateInputFormat = (dateValue) => {
  if (!dateValue) return "";

  try {
    // Si ya está en formato YYYY-MM-DD, retornar directamente
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // Si viene en formato DD/MM/YYYY o D/M/YYYY
    if (typeof dateValue === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
      const [day, month, year] = dateValue.split('/');
      const dayPadded = day.padStart(2, '0');
      const monthPadded = month.padStart(2, '0');
      return `${year}-${monthPadded}-${dayPadded}`;
    }

    // Si viene en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ), extraer solo la fecha
    if (typeof dateValue === 'string' && dateValue.includes('T')) {
      return dateValue.split('T')[0];
    }

    // Para cualquier otro formato, usar Date pero con manejo seguro de zona horaria
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      console.error('[dateUtils] Fecha inválida:', dateValue);
      return "";
    }

    // IMPORTANTE: Usar getFullYear, getMonth, getDate en lugar de toISOString
    // para evitar conversión a UTC que puede cambiar el día
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('[dateUtils] Error procesando fecha:', error);
    return "";
  }
};

/**
 * Convierte una fecha de input (YYYY-MM-DD) a formato ISO para el backend
 * Usa mediodía UTC para evitar problemas de zona horaria
 * 
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export const toISOString = (dateString) => {
  if (!dateString) return null;

  try {
    // Validar formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.error('[dateUtils] Formato de fecha inválido:', dateString);
      return null;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    
    // Crear fecha a mediodía UTC para evitar problemas de zona horaria
    // Esto garantiza que la fecha no cambie al convertir entre zonas horarias
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    
    if (isNaN(date.getTime())) {
      console.error('[dateUtils] Fecha inválida:', dateString);
      return null;
    }

    return date.toISOString();
  } catch (error) {
    console.error('[dateUtils] Error convirtiendo fecha a ISO:', error);
    return null;
  }
};

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * 
 * @param {string|Date} birthDate - Fecha de nacimiento
 * @returns {number} Edad en años
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  try {
    const today = new Date();
    let birth;

    // Si viene en formato YYYY-MM-DD, crear fecha directamente
    if (typeof birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      const [year, month, day] = birthDate.split('-').map(Number);
      birth = new Date(year, month - 1, day);
    } else {
      birth = new Date(birthDate);
    }

    if (isNaN(birth.getTime())) {
      console.error('[dateUtils] Fecha de nacimiento inválida:', birthDate);
      return 0;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Ajustar si aún no ha cumplido años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : 0;
  } catch (error) {
    console.error('[dateUtils] Error calculando edad:', error);
    return 0;
  }
};

/**
 * Formatea una fecha para mostrar en formato local (DD/MM/YYYY)
 * 
 * @param {string|Date} dateValue - Fecha en cualquier formato
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return "";

  try {
    const dateStr = toDateInputFormat(dateValue);
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('[dateUtils] Error formateando fecha:', error);
    return "";
  }
};

