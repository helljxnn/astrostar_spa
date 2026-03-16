import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { formatCurrency } from "../utils/currencyUtils";
import { BUSINESS_CONSTANTS } from "../constants/paymentConstants";

/**
 * Componente para mostrar la mora con indicadores visuales según días de retraso
 * 
 * Rangos de indicadores:
 * - 0-15 días: Verde/Normal - "Mora moderada"
 * - 16-70 días: Amarillo/Advertencia - "Mora considerable"  
 * - 71-89 días: Naranja/Alerta - "Cerca del límite máximo"
 * - 90+ días: Rojo/Crítico - "Mora en límite máximo"
 */
const LateFeeDisplay = ({ lateDays, lateFeeAmount, showDetails = false }) => {
  const isAtCap = lateDays >= BUSINESS_CONSTANTS.MAX_LATE_DAYS_CAP;
  const isNearCap = lateDays >= 71 && lateDays < BUSINESS_CONSTANTS.MAX_LATE_DAYS_CAP;
  const isConsiderable = lateDays >= 16 && lateDays < 71;
  const isModerate = lateDays > 0 && lateDays < 16;

  // Determinar color y mensaje según el rango
  let colorClass = "text-gray-600";
  let bgClass = "";
  let borderClass = "";
  let icon = null;
  let statusText = "";
  let statusMessage = "";

  if (isAtCap) {
    colorClass = "text-red-700";
    bgClass = "bg-red-50";
    borderClass = "border-red-200";
    icon = <FaExclamationTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />;
    statusText = "Mora en límite máximo";
    statusMessage = `La mora ha alcanzado el límite de ${BUSINESS_CONSTANTS.MAX_LATE_DAYS_CAP} días (${formatCurrency(BUSINESS_CONSTANTS.MAX_LATE_FEE)}). No seguirá aumentando, pero la deuda permanece pendiente.`;
  } else if (isNearCap) {
    colorClass = "text-orange-700";
    bgClass = "bg-orange-50";
    borderClass = "border-orange-200";
    icon = <FaExclamationTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />;
    statusText = "Cerca del límite máximo";
    statusMessage = `Quedan ${BUSINESS_CONSTANTS.MAX_LATE_DAYS_CAP - lateDays} días hasta alcanzar el límite máximo de mora.`;
  } else if (isConsiderable) {
    colorClass = "text-yellow-700";
    bgClass = "bg-yellow-50";
    borderClass = "border-yellow-200";
    icon = <FaInfoCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />;
    statusText = "Mora considerable";
    statusMessage = `Mora acumulada por ${lateDays} días. Se recomienda regularizar el pago pronto.`;
  } else if (isModerate) {
    colorClass = "text-green-700";
    bgClass = "bg-green-50";
    borderClass = "border-green-200";
    icon = <FaCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />;
    statusText = "Mora moderada";
    statusMessage = `Mora de ${lateDays} ${lateDays === 1 ? 'día' : 'días'}. Aún está en un rango manejable.`;
  }

  return (
    <div className="space-y-2">
      {/* Monto de mora */}
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold ${colorClass}`}>
          {formatCurrency(lateFeeAmount)}
        </span>
        {lateDays > 0 && (
          <span className="text-sm text-gray-600">
            ({lateDays} {lateDays === 1 ? 'día' : 'días'})
          </span>
        )}
      </div>

      {/* Indicador visual según el rango */}
      {lateDays > 0 && (
        <div className={`flex items-start gap-2 p-3 ${bgClass} border ${borderClass} rounded-lg`}>
          {icon}
          <div className={`text-xs ${colorClass}`}>
            <p className="font-semibold mb-1">{statusText}</p>
            <p>{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Información adicional detallada */}
      {showDetails && lateDays > 0 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <FaInfoCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">Detalles del cálculo:</p>
            <p>• Mora diaria: {formatCurrency(BUSINESS_CONSTANTS.LATE_FEE_DAILY)}</p>
            <p>• Días de mora: {lateDays} días</p>
            {!isAtCap && (
              <p>• Días hasta límite: {BUSINESS_CONSTANTS.MAX_LATE_DAYS_CAP - lateDays} días</p>
            )}
            <p>• Mora máxima posible: {formatCurrency(BUSINESS_CONSTANTS.MAX_LATE_FEE)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LateFeeDisplay;

