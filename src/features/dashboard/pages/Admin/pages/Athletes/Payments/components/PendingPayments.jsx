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
import { formatCurrency } from "../utils/currencyUtils.js";
import PaymentReceiptViewModal from "./PaymentReceiptViewModal.jsx";
import PaymentRejectModal from "./PaymentRejectModal.jsx";
import SearchInput from "../../../../../../../../shared/components/SearchInput.jsx";
import { usePayments } from "../hooks/usePayments.js";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";

/**
 * Componente para gestionar pagos pendientes de aprobación
 * Incluye renovaciones de matrícula, matrículas iniciales y mensualidades
 */
const PendingPayments = () => {
  const {
    payments,
    loading,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    refetch,
    approvePayment,
    rejectPayment
  } = usePayments('pending');

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Filtrar pagos por tipo (el filtro de búsqueda ya se maneja en el hook)
  const filteredPayments = payments.filter(payment => {
    if (filters.type === 'ALL' || !filters.type) return true;
    return payment.obligation?.type === filters.type;
  });

  // Aprobar pago
  const handleApprovePayment = async (paymentId) => {
    const result = await approvePayment(paymentId);
    if (result.success) {
      const payment = payments.find(p => p.id === paymentId);
      const isRenewal = payment?.obligation?.type === 'ENROLLMENT_RENEWAL';
      
      showSuccessAlert(
        'Pago Aprobado',
        isRenewal 
          ? 'Pago aprobado. Nueva matrícula creada automáticamente.'
          : 'Pago aprobado exitosamente.'
      );
    }
  };

  // Rechazar pago
  const handleRejectPayment = async (paymentId, reason) => {
    const result = await rejectPayment(paymentId, reason);
    if (result.success) {
      showSuccessAlert('Pago Rechazado', 'El pago ha sido rechazado');
    }
  };

  // ── Usar información de mora del backend directamente ──
  const getMoraInfoFromBackend = (payment) => {
    const obligation = payment.obligation;
    if (!obligation) {
      return { diasMora: 0, diasMoraTexto: "", montoConMora: 0 };
    }

    // ✅ Usar datos calculados por el backend (ya corregidos)
    const diasMora = obligation.daysLate || 0;
    const montoConMora = obligation.totalAmount || obligation.baseAmount || 0;
    
    let diasMoraTexto = "Al día";
    if (diasMora > 0) {
      diasMoraTexto = `${diasMora} días de mora`;
    } else if (obligation.type === 'MONTHLY' && obligation.dueEnd) {
      // Verificar si está en período de gracia
      const fechaVencimiento = new Date(obligation.dueEnd);
      const hoy = new Date();
      const diferenciaDias = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24));
      
      if (diferenciaDias > 0 && diferenciaDias <= 5) {
        diasMoraTexto = `${5 - diferenciaDias} días restantes`;
      }
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
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaSync className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Filtro por tipo */}
          <div className="flex items-center gap-4">
            <FaFilter className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Filtrar por tipo:
            </label>
            <select
              value={filters.type || 'ALL'}
              onChange={(e) => setFilters({ type: e.target.value === 'ALL' ? '' : e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              <option value="ALL">Todos ({payments.length})</option>
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

          {/* Buscador */}
          <div className="flex-1 max-w-md">
            <SearchInput
              value={searchTerm}
              placeholder="Buscar por deportista, documento, tipo..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
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
            const moraInfo = getMoraInfoFromBackend(payment);
            
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
