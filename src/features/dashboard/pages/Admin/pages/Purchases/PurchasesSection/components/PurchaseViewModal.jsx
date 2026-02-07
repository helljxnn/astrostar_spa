import { useState, useEffect } from 'react';
import { FaTimes, FaFileAlt, FaCalendar, FaDollarSign, FaCreditCard, FaUser, FaStickyNote, FaPlus } from 'react-icons/fa';
import AddNoteModal from './AddNoteModal';
import purchasesService from '../services/PurchasesService';
import { showSuccessAlert, showErrorAlert } from '../../../../../../../../shared/utils/alerts';

// Componente para ver detalles de una compra
const PurchaseViewModal = ({ isOpen, onClose, purchase, onRefresh }) => {
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Cargar notas cuando se abre el modal
  useEffect(() => {
    if (isOpen && purchase?.id) {
      fetchNotes();
    }
  }, [isOpen, purchase?.id]);

  const fetchNotes = async () => {
    if (!purchase?.id) return;
    
    try {
      setLoadingNotes(true);
      const response = await purchasesService.getNotes(purchase.id);
      if (response.success) {
        setNotes(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar notas:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleSaveNote = async (noteText) => {
    try {
      setLoadingNote(true);
      const response = await purchasesService.addNote(purchase.id, noteText);
      
      if (response.success) {
        showSuccessAlert('Nota agregada', 'La nota se ha guardado correctamente');
        fetchNotes(); // Recargar notas
        if (onRefresh) onRefresh(); // Refrescar lista de compras
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al guardar nota:', error);
      showErrorAlert('Error', 'No se pudo guardar la nota');
      return false;
    } finally {
      setLoadingNote(false);
    }
  };

  if (!isOpen || !purchase) return null;

  // Log para debugging
  console.log('📄 Datos de factura:', {
    facturaUrl: purchase.facturaUrl,
    facturaNombre: purchase.facturaNombre,
    purchaseCompleto: purchase
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPDF = purchase.facturaUrl?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png)$/i.test(purchase.facturaUrl);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Detalles de Compra
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proveedor */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaUser className="text-sm" />
                <span className="text-sm font-medium">Proveedor</span>
              </div>
              <p className="text-base text-gray-900">{purchase.proveedor}</p>
              {purchase.proveedorNit && (
                <p className="text-xs text-gray-500 mt-1">
                  {purchase.proveedorTipoDocumento || 'Documento'}: {purchase.proveedorNit}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaCalendar className="text-sm" />
                <span className="text-sm font-medium">Fecha de Compra</span>
              </div>
              <p className="text-base text-gray-900">{formatDate(purchase.fechaCompra)}</p>
            </div>

            {/* Monto */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaDollarSign className="text-sm" />
                <span className="text-sm font-medium">Monto Total</span>
              </div>
              <p className="text-xl text-gray-900">{formatCurrency(purchase.montoTotal)}</p>
            </div>

            {/* Método de Pago */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaCreditCard className="text-sm" />
                <span className="text-sm font-medium">Método de Pago</span>
              </div>
              <p className="text-base text-gray-900">{purchase.metodoPago}</p>
            </div>
          </div>

          {/* Concepto */}
          <div className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FaFileAlt className="text-sm" />
              <span className="text-sm font-medium">Concepto</span>
            </div>
            <p className="text-gray-900">{purchase.concepto}</p>
          </div>

          {/* Observaciones */}
          {purchase.observaciones && (
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FaStickyNote className="text-sm" />
                <span className="text-sm font-medium">Observaciones</span>
              </div>
              <p className="text-gray-900">{purchase.observaciones}</p>
            </div>
          )}

          {/* Factura */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <FaFileAlt className="text-sm" />
              <span className="text-sm font-medium">Factura Adjunta</span>
            </div>

            {/* Preview compacto de la factura */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 border border-gray-200">
              {isImage ? (
                <>
                  <img
                    src={purchase.facturaUrl}
                    alt="Factura"
                    className="h-16 w-16 object-cover rounded border border-gray-300"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">
                      {purchase.facturaNombre || 'Imagen adjunta'}
                    </p>
                  </div>
                </>
              ) : isPDF ? (
                <>
                  <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center border border-gray-300">
                    <FaFileAlt className="text-2xl text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">
                      {purchase.facturaNombre || 'Documento PDF'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center border border-gray-300">
                    <FaFileAlt className="text-2xl text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">
                      {purchase.facturaNombre || 'Archivo adjunto'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sección de Notas / Aclaraciones */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FaStickyNote className="text-primary-blue" />
                Notas / Aclaraciones
              </h3>
              <button
                onClick={() => setIsAddNoteModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-purple transition-colors"
              >
                <FaPlus className="text-xs" />
                Agregar Nota
              </button>
            </div>

            {/* Lista de notas */}
            <div className="space-y-3">
              {loadingNotes ? (
                <p className="text-sm text-gray-500 text-center py-4">Cargando notas...</p>
              ) : notes.length > 0 ? (
                notes.map((note, index) => (
                  <div key={note.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-800 text-sm mb-2 whitespace-pre-wrap">{note.text || note.note}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCalendar className="text-[10px]" />
                      <span className="font-medium">Nota agregada el {formatDateTime(note.createdAt)}</span>
                      {note.createdByName && (
                        <>
                          <span>•</span>
                          <span>{note.createdByName}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <FaStickyNote className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay notas registradas</p>
                  <p className="text-xs text-gray-400 mt-1">Agrega una nota para documentar información adicional</p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Registro */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400">
              Compra registrada el {formatDateTime(purchase.createdAt)}
              {purchase.createdByName && ` por ${purchase.createdByName}`}
            </p>
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar nota */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onSave={handleSaveNote}
        loading={loadingNote}
      />
    </div>
  );
};

export default PurchaseViewModal;
