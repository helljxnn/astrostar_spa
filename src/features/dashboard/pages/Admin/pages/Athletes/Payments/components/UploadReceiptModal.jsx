import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaUpload, FaImage, FaFilePdf, FaExclamationTriangle } from "react-icons/fa";
import { useUploadReceipt } from "../hooks/useUploadReceipt";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import { formatCurrency } from "../utils/currencyUtils";

const UploadReceiptModal = ({ isOpen, onClose, obligation, onSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { uploadReceipt, uploading } = useUploadReceipt();

  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file) => {
    const errors = [];
    
    if (!file) {
      errors.push('Debe seleccionar un archivo');
      return errors;
    }

    if (file.size > 5 * 1024 * 1024) {
      errors.push('El archivo no debe superar los 5MB');
    }

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
      showErrorAlert('Error de validación', errors.join('\n'));
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
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
      showErrorAlert('Error', 'Debe seleccionar un archivo');
      return;
    }

    try {
      const result = await uploadReceipt(obligation.id, selectedFile);
      
      if (result.success) {
        showSuccessAlert('Éxito', 'Comprobante subido exitosamente. En revisión por administración.');
        onSuccess?.();
        handleClose();
      } else {
        showErrorAlert('Error', result.error || 'Error al subir el comprobante');
      }
    } catch (error) {
      showErrorAlert('Error', 'Error al subir el comprobante');
    }
  };

  const resetModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!uploading) {
      resetModal();
      onClose();
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <FaUpload className="text-gray-400" size={40} />;
    
    if (selectedFile.type === 'application/pdf') {
      return <FaFilePdf className="text-red-500" size={40} />;
    }
    return <FaImage className="text-blue-500" size={40} />;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
            disabled={uploading}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center pr-8">
            Subir Comprobante
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 min-h-0">
          {/* Obligation Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4 border border-blue-100">
            <h4 className="font-medium text-gray-800 mb-2 text-sm">Información del Pago</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Tipo:</span>
                <p className="font-medium text-gray-900">
                  {obligation.type === 'MONTHLY' ? 'Mensualidad' : 
                   obligation.type === 'ENROLLMENT_INITIAL' ? 'Matrícula Inicial' : 
                   'Renovación Matrícula'}
                </p>
              </div>
              {obligation.period && (
                <div>
                  <span className="text-gray-600">Período:</span>
                  <p className="font-medium text-gray-900">{obligation.period}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Monto Base:</span>
                <p className="font-medium text-gray-900">{formatCurrency(obligation.baseAmount)}</p>
              </div>
              {obligation.lateFee > 0 && (
                <div>
                  <span className="text-gray-600">Mora:</span>
                  <p className="font-medium text-orange-600">{formatCurrency(obligation.lateFee)}</p>
                </div>
              )}
              <div className="col-span-2 pt-1 border-t border-blue-200">
                <span className="text-gray-600">Total a Pagar:</span>
                <p className="text-sm font-bold text-primary-blue">{formatCurrency(obligation.totalToPay)}</p>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragActive
                  ? 'border-primary-blue bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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

              <div className="space-y-3">
                <div className="flex justify-center">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="text-gray-700 font-medium mb-1">
                    Seleccionar archivo
                  </p>
                  <p className="text-xs text-gray-500">
                    o arrastra y suelta aquí
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  <p>JPG, PNG, WEBP, PDF • Máx. 5MB</p>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Area */
            <div className="space-y-3">
              <div className="p-2">
                <p className="text-green-700 text-sm">
                  ✓ {selectedFile.name}
                </p>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Vista previa:</p>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-32 rounded object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Change File Button */}
              <button
                onClick={resetModal}
                className="w-full py-1.5 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                Cambiar archivo
              </button>
            </div>
          )}

          {/* Important Notes */}
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FaExclamationTriangle className="text-gray-500 flex-shrink-0 mt-0.5 text-sm" />
              <div>
                <h5 className="font-medium text-gray-700 mb-1 text-sm">Importante:</h5>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  <li>• El comprobante debe mostrar claramente el monto pagado</li>
                  <li>• La imagen debe ser legible y completa</li>
                  <li>• Una vez enviado, estará en revisión por administración</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              disabled={uploading}
            >
              Cancelar
            </button>
            {selectedFile ? (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 text-sm bg-primary-blue text-white rounded hover:bg-primary-purple transition-colors disabled:opacity-50"
              >
                {uploading ? "Enviando..." : "Enviar Comprobante"}
              </button>
            ) : (
              <button
                disabled
                className="px-4 py-2 text-sm bg-gray-300 text-gray-500 rounded cursor-not-allowed"
              >
                Selecciona un archivo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UploadReceiptModal;
