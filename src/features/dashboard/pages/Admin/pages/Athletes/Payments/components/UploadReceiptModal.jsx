import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUpload, FaTimes, FaFile, FaCheck } from "react-icons/fa";
import { useUploadReceipt } from "../hooks/useUploadReceipt";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import { formatCurrency } from "../utils/currencyUtils";

const UploadReceiptModal = ({ isOpen, onClose, obligation, onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { uploadReceipt, uploading } = useUploadReceipt();

  const validateFile = (file) => {
    const errors = [];
    
    if (!file) {
      errors.push('Debe seleccionar un archivo');
      return errors;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('El archivo no debe superar los 5MB');
    }

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Solo se permiten imágenes (JPG, PNG, WEBP) o PDF');
    }

    return errors;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const errors = validateFile(file);
    if (errors.length > 0) {
      showErrorAlert(errors.join('\n'));
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showErrorAlert('Debe seleccionar un archivo');
      return;
    }

    try {
      const result = await uploadReceipt(obligation.id, selectedFile);
      
      if (result.success) {
        showSuccessAlert('Comprobante subido exitosamente. En revisión por administración.');
        onSuccess?.();
        onClose();
      } else {
        showErrorAlert(result.error || 'Error al subir el comprobante');
      }
    } catch (error) {
      showErrorAlert('Error al subir el comprobante');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              📤 Subir Comprobante de Pago
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={uploading}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Obligation Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">
                {obligation.type === 'MONTHLY' ? '📅 Mensualidad' : '🎓 Renovación Matrícula'}
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                {obligation.period && (
                  <p>Período: {obligation.period}</p>
                )}
                <p>Monto: {formatCurrency(obligation.baseAmount)}</p>
                {obligation.lateFee > 0 && (
                  <p>Mora: {formatCurrency(obligation.lateFee)}</p>
                )}
                <p className="font-medium">
                  Total: {formatCurrency(obligation.totalToPay)}
                </p>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : selectedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <FaCheck className="mx-auto text-green-500" size={32} />
                  <div>
                    <p className="text-green-700 font-medium">Archivo seleccionado:</p>
                    <p className="text-sm text-green-600">{selectedFile.name}</p>
                    <p className="text-xs text-green-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                    disabled={uploading}
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <FaUpload className="mx-auto text-gray-400" size={32} />
                  <div>
                    <p className="text-gray-700 font-medium">
                      Arrastra tu comprobante aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Formatos: JPG, PNG, WEBP, PDF (máx. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Important Notes */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 mb-2">📋 Importante:</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• El comprobante debe mostrar claramente el monto pagado</li>
                <li>• Incluye fecha y concepto del pago</li>
                <li>• La imagen debe ser legible y completa</li>
                <li>• Una vez enviado, estará en revisión por administración</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>Subir Comprobante</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UploadReceiptModal;