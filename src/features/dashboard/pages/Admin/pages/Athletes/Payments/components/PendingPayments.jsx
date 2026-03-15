import { useState, useEffect } from "react";
import { 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaMoneyBillWave,
  FaSync
} from "react-icons/fa";
import { paymentsService } from "../services/PaymentsService.js";
import { formatCurrency } from "../utils/currencyUtils.js";
import PaymentReceiptViewModal from "./PaymentReceiptViewModal.jsx";
import PaymentRejectModal from "./PaymentRejectModal.jsx";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";

/**
 * Componente para gestionar pagos pendientes de aprobación
 * Incluye renovaciones de matrícula, matrículas iniciales y mensualidades
 */
const PendingPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Cargar pagos pendientes
  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentsService.getPendingPayments();
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      showErrorAlert('Error', 'No se pudieron cargar los pagos pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  // Filtrar pagos por tipo
  const filteredPayments = payments.filter(payment => {
    if (filter === 'ALL') return true;
    return payment.obligation?.type === filter;
  });

  // Aprobar pago
  const handleApprovePayment = async (paymentId) => {
    try {
      const response = await paymentsService.approvePayment(paymentId);
      
      if (response.success) {
        const payment = payments.find(p => p.id === paymentId);
        const isRenewal = payment?.obligation?.type === 'ENROLLMENT_RENEWAL';
        
        showSuccessAlert(
          'Pago Aprobado',
          isRenewal 
            ? 'Pago aprobado. Nueva matrícula creada automáticamente.'
            : 'Pago aprobado exitosamente.'
        );
        
        fetchPendingPayments(); // Recargar lista
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      showErrorAlert('Error', 'No se pudo aprobar el pago');
    }
  };

  // Rechazar pago
  const handleRejectPayment = async (paymentId, reason) => {
    try {
      const response = await paymentsService.rejectPayment(paymentId, reason);
      
      if (response.success) {
        showSuccessAlert('Pago Rechazado', 'El pago ha sido rechazado');
        fetchPendingPayments(); // Recargar lista
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showErrorAlert('Error', 'No se pudo rechazar el pago');
    }
  };

  // Calcular información de mora para mensualidades
  const calculateMoraInfo = (payment) => {
    if (payment.obligation?.type !== 'MONTHLY' || !payment.obligation?.dueEnd) {
      return { diasMora: 0, diasMoraTexto: "", montoConMora: payment.obligation?.baseAmount || 0 };
    }

    const fechaVencimiento = new Date(payment.obligation.dueEnd);
    const hoy = new Date();
    const diferenciaDias = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24));
    
    let diasMora = 0;
    let diasMoraTexto = "";
    let montoConMora = payment.obligation?.baseAmount || 0;
    
    if (diferenciaDias > 5) { // Después del período de gracia
      diasMora = diferenciaDias - 5;
      diasMoraTexto = `${diasMora} días de mora`;
      // Aplicar recargo de $2,000 por día de mora
      montoConMora = montoConMora + (diasMora * 2000);
    } else if (diferenciaDias > 0) {
      diasMoraTexto = `${5 - diferenciaDias} días restantes`;
    } else if (diferenciaDias <= 0) {
      diasMoraTexto = "Al día";
    }
    
    return { diasMora, diasMoraTexto, montoConMora };
  };

  // Obtener etiqueta del tipo de pago
  const getPaymentTypeLabel = (type) => {
    const labels = {
      'ENROLLMENT_INITIAL': 'Matrícula Inicial',
      'ENROLLMENT_RENEWAL': 'Renovación Matrícula',
      'MONTHLY': 'Mensualidad'
    };
    return labels[type] || type;
  };

  // Obtener color del tipo de pago
  const getPaymentTypeColor = (type) => {
    const colors = {
      'ENROLLMENT_INITIAL': 'bg-blue-100 text-blue-800',
      'ENROLLMENT_RENEWAL': 'bg-green-100 text-green-800',
      'MONTHLY': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Cargando pagos pendientes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Pagos Pendientes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Revisa y aprueba los comprobantes de pago subidos por los deportistas
          </p>
        </div>
        
        <button
          onClick={fetchPendingPayments}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <FaFilter className="text-gray-500" />
          <label className="text-sm font-medium text-gray-700">
            Filtrar por tipo de pago:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
          >
            <option value="ALL">Todos los Pagos ({payments.length})</option>
            <option value="ENROLLMENT_INITIAL">
              Matrículas Iniciales ({payments.filter(p => p.obligation?.type === 'ENROLLMENT_INITIAL').length})
            </option>
            <option value="ENROLLMENT_RENEWAL">
              Renovaciones ({payments.filter(p => p.obligation?.type === 'ENROLLMENT_RENEWAL').length})
            </option>
            <option value="MONTHLY">
              Mensualidades ({payments.filter(p => p.obligation?.type === 'MONTHLY').length})
            </option>
          </select>
        </div>
      </div>

      {/* Lista de pagos */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
          <FaMoneyBillWave className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos pendientes</h3>
          <p className="text-gray-500">
            {filter === 'ALL' 
              ? 'No hay pagos esperando aprobación en este momento.'
              : `No hay pagos de tipo "${getPaymentTypeLabel(filter)}" pendientes.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayments.map((payment) => {
            const moraInfo = calculateMoraInfo(payment);
            
            return (
              <div key={payment.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header del pago */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentTypeColor(payment.obligation?.type)}`}>
                      {getPaymentTypeLabel(payment.obligation?.type)}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(moraInfo.montoConMora)}
                      </span>
                      {moraInfo.diasMora > 0 && (
                        <div className="text-xs text-red-600">
                          (Base: {formatCurrency(payment.obligation?.baseAmount || 0)})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Información del deportista */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaUser className="w-4 h-4" />
                    <span className="font-medium">
                      {payment.athlete?.user?.firstName} {payment.athlete?.user?.lastName}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    ID: {payment.athlete?.user?.identification}
                  </div>
                </div>

                {/* Detalles del pago */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>Subido: {formatDate(payment.uploadedAt)}</span>
                  </div>

                  {payment.obligation?.period && (
                    <div className="text-sm text-gray-600">
                      <strong>Período:</strong> {payment.obligation.period}
                    </div>
                  )}

                  {/* Información de mora para mensualidades */}
                  {payment.obligation?.type === 'MONTHLY' && moraInfo.diasMoraTexto && (
                    <div className="text-sm">
                      <strong className="text-gray-700">Estado de Mora:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        moraInfo.diasMora > 0 
                          ? 'bg-red-100 text-red-800' 
                          : moraInfo.diasMoraTexto.includes('restantes')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {moraInfo.diasMoraTexto}
                      </span>
                    </div>
                  )}

                  {/* Preview del comprobante */}
                  {payment.receiptUrl && (
                    <div className="mt-3">
                      <img
                        src={payment.receiptUrl}
                        alt="Comprobante"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsReceiptModalOpen(true);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="p-4 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsReceiptModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <FaEye className="w-4 h-4" />
                    Ver
                  </button>
                  
                  <button
                    onClick={() => handleApprovePayment(payment.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <FaCheck className="w-4 h-4" />
                    Aprobar
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsRejectModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <FaTimes className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {selectedPayment && (
        <>
          <PaymentReceiptViewModal
            isOpen={isReceiptModalOpen}
            onClose={() => {
              setIsReceiptModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment}
          />
          
          <PaymentRejectModal
            isOpen={isRejectModalOpen}
            onClose={() => {
              setIsRejectModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment}
            onReject={handleRejectPayment}
          />
        </>
      )}
    </div>
  );
};

export default PendingPayments;