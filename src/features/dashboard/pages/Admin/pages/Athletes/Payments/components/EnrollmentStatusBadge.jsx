/**
 * Badge para mostrar el estado de matrícula con el mismo estilo que PaymentStatusBadge
 * Estilo compacto y consistente con el sistema de pagos
 */
const EnrollmentStatusBadge = ({ 
  status, 
  needsRenewal = false, 
  daysToExpire = null,
  className = ""
}) => {
  const getStatusConfig = () => {
    // Casos especiales para renovación
    if (needsRenewal) {
      return {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        text: 'Renovación Pendiente'
      };
    }

    // Estados normales de matrícula
    switch (status) {
      case 'Vigente':
        // Verificar si está próxima a vencer
        if (daysToExpire !== null) {
          if (daysToExpire < 0) {
            return {
              color: 'bg-red-100 text-red-800 border-red-200',
              text: 'Vencida'
            };
          } else if (daysToExpire <= 7) {
            return {
              color: 'bg-orange-100 text-orange-800 border-orange-200',
              text: `Vence en ${daysToExpire}d`
            };
          } else if (daysToExpire <= 30) {
            return {
              color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              text: `Vence en ${daysToExpire}d`
            };
          }
        }
        
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Vigente'
        };

      case 'Vencida':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Vencida'
        };

      case 'Pending_Payment':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Pendiente de pago'
        };

      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: status || 'Sin Estado'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      {config.text}
    </span>
  );
};

export default EnrollmentStatusBadge;

