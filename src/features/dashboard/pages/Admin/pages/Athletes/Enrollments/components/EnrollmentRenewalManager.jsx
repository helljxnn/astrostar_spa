import { useState, useEffect } from "react";
import { 
  FaSync, 
  FaCalendarAlt, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaUser,
  FaClock,
  FaPlay,
  FaRedo
} from "react-icons/fa";
import { useEnrollmentRenewal } from "../../Payments/hooks/useEnrollmentRenewal.js";
import { showSuccessAlert } from "../../../../../../../../shared/utils/alerts.js";

/**
 * Componente para gestionar renovaciones de matrículas (Admin Dashboard)
 * 
 * NOTA: Este componente fue removido del módulo de Matrículas para simplificar la UX.
 * Se mantiene aquí para futura integración en el dashboard de deportistas.
 * 
 * Funcionalidades incluidas:
 * - Visualización de matrículas próximas a vencer
 * - Estadísticas de renovaciones (vencidas, por vencer, etc.)
 * - Creación manual de obligaciones de renovación
 * - Procesamiento automático de matrículas vencidas
 * - Filtros por días hasta vencimiento
 * 
 * Dependencias:
 * - useEnrollmentRenewal hook (../../Payments/hooks/useEnrollmentRenewal.js)
 * - PaymentsService (../../Payments/services/PaymentsService.js)
 * - Utilidades de formato de moneda
 * 
 * Para integrar en el dashboard de deportistas:
 * 1. Importar este componente
 * 2. Asegurar que las rutas de los hooks y servicios sean correctas
 * 3. Verificar permisos de acceso apropiados
 * 
 * @component
 * @example
 * // Para uso futuro en dashboard de deportistas
 * <EnrollmentRenewalManager />
 */
const EnrollmentRenewalManager = () => {
  const [expiringEnrollments, setExpiringEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);
  
  const { 
    createRenewalObligation, 
    processExpiredEnrollments, 
    getExpiringEnrollments,
    loading: renewalLoading,
    processingExpired
  } = useEnrollmentRenewal();

  // Cargar matrículas próximas a vencer
  const fetchExpiringEnrollments = async () => {
    setLoading(true);
    try {
      const data = await getExpiringEnrollments(daysFilter);
      setExpiringEnrollments(data || []);
    } catch (error) {
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiringEnrollments();
  }, [daysFilter]);

  // Crear renovación manual para un atleta
  const handleCreateRenewal = async (athleteId, athleteName) => {
    try {
      await createRenewalObligation(athleteId);
      showSuccessAlert(
        'Renovación Creada',
        `Se creó la obligación de renovación para ${athleteName}`
      );
      fetchExpiringEnrollments();
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  // Procesar todas las matrículas vencidas
  const handleProcessExpired = async () => {
    try {
      await processExpiredEnrollments();
      fetchExpiringEnrollments();
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  // Calcular días hasta vencimiento
  const getDaysToExpire = (expirationDate) => {
    if (!expirationDate) return null;
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Obtener color según días restantes
  const getExpirationColor = (daysToExpire) => {
    if (daysToExpire === null) return 'gray';
    if (daysToExpire < 0) return 'red';
    if (daysToExpire <= 7) return 'red';
    if (daysToExpire <= 15) return 'orange';
    if (daysToExpire <= 30) return 'yellow';
    return 'green';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Renovación de Matrículas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las renovaciones automáticas y manuales de matrículas
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleProcessExpired}
            disabled={processingExpired}
            className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {processingExpired ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Procesando...
              </>
            ) : (
              <>
                <FaPlay className="w-4 h-4" />
                Procesar Vencidas
              </>
            )}
          </button>
          
          <button
            onClick={fetchExpiringEnrollments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            <FaRedo className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Mostrar matrículas que vencen en:
          </label>
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          >
            <option value={7}>7 días</option>
            <option value={15}>15 días</option>
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {expiringEnrollments.filter(e => getDaysToExpire(e.fechaVencimiento) < 0).length}
              </div>
              <div className="text-xs text-gray-500">Vencidas</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaClock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {expiringEnrollments.filter(e => {
                  const days = getDaysToExpire(e.fechaVencimiento);
                  return days >= 0 && days <= 7;
                }).length}
              </div>
              <div className="text-xs text-gray-500">Esta semana</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaCalendarAlt className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {expiringEnrollments.filter(e => {
                  const days = getDaysToExpire(e.fechaVencimiento);
                  return days > 7 && days <= 30;
                }).length}
              </div>
              <div className="text-xs text-gray-500">Este mes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {expiringEnrollments.length}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de matrículas */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Matrículas Próximas a Vencer
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Cargando matrículas...</p>
          </div>
        ) : expiringEnrollments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaCheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p>No hay matrículas próximas a vencer en los próximos {daysFilter} días</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {expiringEnrollments.map((enrollment) => {
              const daysToExpire = getDaysToExpire(enrollment.fechaVencimiento);
              const color = getExpirationColor(daysToExpire);
              const athlete = enrollment.athlete;
              const user = athlete?.user;
              const fullName = user ? `${user.firstName} ${user.lastName}` : 'Atleta';

              return (
                <div key={enrollment.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FaUser className="w-4 h-4 text-gray-600" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-800">{fullName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>ID: {enrollment.id}</span>
                          <span>Estado: {enrollment.estado}</span>
                          {enrollment.fechaVencimiento && (
                            <span>
                              Vence: {new Date(enrollment.fechaVencimiento).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Badge de días restantes */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        color === 'red' ? 'bg-red-100 text-red-800' :
                        color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        color === 'green' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {daysToExpire === null ? 'Sin fecha' :
                         daysToExpire < 0 ? 'Vencida' :
                         daysToExpire === 0 ? 'Vence hoy' :
                         `${daysToExpire} días restantes`}
                      </span>

                      {/* Botón de renovación */}
                      <button
                        onClick={() => handleCreateRenewal(athlete.id, fullName)}
                        disabled={renewalLoading}
                        className="flex items-center gap-2 px-3 py-1 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors text-sm disabled:opacity-50"
                      >
                        <FaSync className="w-3 h-3" />
                        Crear Renovación
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentRenewalManager;
