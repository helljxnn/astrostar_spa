import { useState, useEffect } from "react";
import { FaSync, FaExclamationTriangle, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { paymentsService } from "../services/PaymentsService.js";

/**
 * Banner de notificación para renovaciones de matrículas pendientes
 * Se muestra en el dashboard cuando hay matrículas próximas a vencer
 */
const RenewalNotificationBanner = ({ onNavigateToRenewals }) => {
  const [expiringCount, setExpiringCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchExpiringEnrollments = async () => {
      try {
        setLoading(true);
        
        // Obtener matrículas que vencen en los próximos 30 días
        const expiring30 = await paymentsService.getExpiringEnrollments(30);
        const expiring7 = await paymentsService.getExpiringEnrollments(7);
        
        setExpiringCount(expiring30?.length || 0);
        setUrgentCount(expiring7?.length || 0);
      } catch (error) {
        console.error('Error fetching expiring enrollments:', error);
        setExpiringCount(0);
        setUrgentCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringEnrollments();
  }, []);

  // No mostrar si está cargando, fue descartado, o no hay matrículas próximas a vencer
  if (loading || dismissed || expiringCount === 0) {
    return null;
  }

  const isUrgent = urgentCount > 0;

  return (
    <div className={`rounded-xl p-4 mb-6 border-2 ${
      isUrgent 
        ? 'bg-red-50 border-red-300' 
        : 'bg-yellow-50 border-yellow-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            isUrgent ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {isUrgent ? (
              <FaExclamationTriangle className={`w-5 h-5 ${
                isUrgent ? 'text-red-600' : 'text-yellow-600'
              }`} />
            ) : (
              <FaCalendarAlt className="w-5 h-5 text-yellow-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold ${
              isUrgent ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {isUrgent ? 'Renovaciones Urgentes' : 'Renovaciones Próximas'}
            </h3>
            
            <p className={`text-sm mt-1 ${
              isUrgent ? 'text-red-700' : 'text-yellow-700'
            }`}>
              {isUrgent ? (
                <>
                  <strong>{urgentCount}</strong> matrícula{urgentCount !== 1 ? 's' : ''} vence{urgentCount === 1 ? '' : 'n'} en los próximos 7 días.
                  {expiringCount > urgentCount && (
                    <> Además, <strong>{expiringCount - urgentCount}</strong> más vence{expiringCount - urgentCount === 1 ? '' : 'n'} este mes.</>
                  )}
                </>
              ) : (
                <>
                  <strong>{expiringCount}</strong> matrícula{expiringCount !== 1 ? 's' : ''} vence{expiringCount === 1 ? '' : 'n'} en los próximos 30 días.
                </>
              )}
            </p>
            
            <button
              onClick={onNavigateToRenewals}
              className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isUrgent 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              <FaSync className="w-3 h-3" />
              Gestionar Renovaciones
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setDismissed(true)}
          className={`p-1 rounded-lg transition-colors ${
            isUrgent 
              ? 'text-red-400 hover:text-red-600 hover:bg-red-100' 
              : 'text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100'
          }`}
          title="Descartar notificación"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RenewalNotificationBanner;