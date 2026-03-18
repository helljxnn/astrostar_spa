/**
 * Utilidades para manejo de vencimientos de matrículas
 * Implementa lógica para identificar matrículas próximas a vencer
 */

/**
 * Calcula los días hasta el vencimiento de una matrícula
 * @param {string|Date} expirationDate - Fecha de vencimiento
 * @returns {number} Días hasta vencimiento (negativo si ya venció)
 */
export const calculateDaysToExpiration = (expirationDate) => {
  if (!expirationDate) return null;

  try {
    const expDate = new Date(expirationDate);
    const today = new Date();
    
    // Normalizar fechas a medianoche para comparación precisa
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
return null;
  }
};

/**
 * Determina el estado de vencimiento de una matrícula
 * @param {number} daysToExpiration - Días hasta vencimiento
 * @returns {Object} Estado con tipo, mensaje y estilo
 */
export const getExpirationStatus = (daysToExpiration) => {
  if (daysToExpiration === null) {
    return {
      type: 'unknown',
      message: 'Sin fecha',
      className: 'text-gray-400',
      priority: 0
    };
  }

  if (daysToExpiration < 0) {
    const daysExpired = Math.abs(daysToExpiration);
    return {
      type: 'expired',
      message: `Vencida hace ${daysExpired} día${daysExpired !== 1 ? 's' : ''}`,
      className: 'text-red-600 font-medium',
      priority: 4
    };
  }

  if (daysToExpiration === 0) {
    return {
      type: 'today',
      message: 'Vence hoy',
      className: 'text-red-600 font-bold',
      priority: 5
    };
  }

  if (daysToExpiration <= 7) {
    return {
      type: 'critical',
      message: `${daysToExpiration} día${daysToExpiration !== 1 ? 's' : ''} restante${daysToExpiration !== 1 ? 's' : ''}`,
      className: 'text-red-600 font-semibold',
      priority: 3
    };
  }

  if (daysToExpiration <= 15) {
    return {
      type: 'warning',
      message: `${daysToExpiration} días restantes`,
      className: 'text-orange-600 font-medium',
      priority: 2
    };
  }

  if (daysToExpiration <= 30) {
    return {
      type: 'attention',
      message: `${daysToExpiration} días restantes`,
      className: 'text-yellow-600 font-medium',
      priority: 1
    };
  }

  return {
    type: 'normal',
    message: `${daysToExpiration} días restantes`,
    className: 'text-gray-700',
    priority: 0
  };
};

/**
 * Filtra matrículas por estado de vencimiento
 * @param {Array} enrollments - Lista de matrículas
 * @param {string} filterType - Tipo de filtro ('all', 'expiring', 'expired', 'critical')
 * @returns {Array} Matrículas filtradas
 */
export const filterByExpirationStatus = (enrollments, filterType = 'all') => {
  if (filterType === 'all') return enrollments;

  return enrollments.filter(enrollment => {
    const expirationDate = enrollment.latestEnrollment?.fechaVencimiento || 
                          enrollment.enrollment?.fechaVencimiento;
    
    if (!expirationDate) return false;

    const daysToExpiration = calculateDaysToExpiration(expirationDate);
    const status = getExpirationStatus(daysToExpiration);

    switch (filterType) {
      case 'expiring':
        return status.type === 'attention' || status.type === 'warning' || status.type === 'critical';
      case 'expired':
        return status.type === 'expired';
      case 'critical':
        return status.type === 'critical' || status.type === 'today';
      default:
        return true;
    }
  });
};

/**
 * Ordena matrículas por prioridad de vencimiento
 * @param {Array} enrollments - Lista de matrículas
 * @returns {Array} Matrículas ordenadas por prioridad
 */
export const sortByExpirationPriority = (enrollments) => {
  return [...enrollments].sort((a, b) => {
    const aExpDate = a.latestEnrollment?.fechaVencimiento || a.enrollment?.fechaVencimiento;
    const bExpDate = b.latestEnrollment?.fechaVencimiento || b.enrollment?.fechaVencimiento;

    const aDays = calculateDaysToExpiration(aExpDate);
    const bDays = calculateDaysToExpiration(bExpDate);

    const aStatus = getExpirationStatus(aDays);
    const bStatus = getExpirationStatus(bDays);

    // Ordenar por prioridad (mayor prioridad primero)
    if (aStatus.priority !== bStatus.priority) {
      return bStatus.priority - aStatus.priority;
    }

    // Si tienen la misma prioridad, ordenar por días (menor primero)
    if (aDays !== null && bDays !== null) {
      return aDays - bDays;
    }

    // Si uno no tiene fecha, ponerlo al final
    if (aDays === null) return 1;
    if (bDays === null) return -1;

    return 0;
  });
};

/**
 * Obtiene estadísticas de vencimientos
 * @param {Array} enrollments - Lista de matrículas
 * @returns {Object} Estadísticas de vencimientos
 */
export const getExpirationStats = (enrollments) => {
  const stats = {
    total: enrollments.length,
    expired: 0,
    critical: 0,
    warning: 0,
    attention: 0,
    normal: 0,
    unknown: 0
  };

  enrollments.forEach(enrollment => {
    const expirationDate = enrollment.latestEnrollment?.fechaVencimiento || 
                          enrollment.enrollment?.fechaVencimiento;
    
    const daysToExpiration = calculateDaysToExpiration(expirationDate);
    const status = getExpirationStatus(daysToExpiration);

    switch (status.type) {
      case 'expired':
        stats.expired++;
        break;
      case 'today':
      case 'critical':
        stats.critical++;
        break;
      case 'warning':
        stats.warning++;
        break;
      case 'attention':
        stats.attention++;
        break;
      case 'normal':
        stats.normal++;
        break;
      default:
        stats.unknown++;
    }
  });

  return stats;
};
