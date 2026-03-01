import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FaSync, FaTimes, FaUpload, FaFileAlt, FaTrash, FaUserCircle, FaCalendarAlt } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import {
  findCategoryByName,
  resolveCategoryAgeRange,
  isAgeWithinRange,
  formatAgeRange,
} from "../../../../../../../../shared/utils/categoryAgeValidation";
import { calculateAge } from "../../../../../../../../shared/utils/dateUtils";

const categoryHierarchy = ["Infantil", "Sub 15", "Juvenil"];

const getAvailableCategories = (currentCategory, allCategories) => {
  if (!currentCategory || !allCategories || allCategories.length === 0) {
    return allCategories || [];
  }

  const currentIndex = categoryHierarchy.indexOf(currentCategory);
  if (currentIndex === -1) return allCategories;

  return allCategories.filter((cat) => {
    const catIndex = categoryHierarchy.indexOf(cat.name);
    return catIndex >= currentIndex;
  });
};

const RenewEnrollmentModal = ({
  isOpen,
  onClose,
  athlete,
  onRenew,
  sportsCategories = [],
  isProcessing = false,
}) => {
  const [categoria, setCategoria] = useState("");
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);

  // Obtener la matrícula más reciente
  const currentEnrollment = athlete?.inscripciones?.[0] || athlete?.enrollments?.[0];

  // Calcular edad usando la utilidad centralizada
  const age = athlete?.fechaNacimiento ? calculateAge(athlete.fechaNacimiento) : 0;

  // Obtener categorías disponibles según la categoría actual
  const availableCategories = getAvailableCategories(athlete?.categoria, sportsCategories);

  useEffect(() => {
    if (isOpen && athlete) {
      // Inicializar con la categoría actual o la primera disponible
      setCategoria(athlete.categoria || availableCategories[0]?.name || "");
    }
  }, [isOpen, athlete, availableCategories]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showErrorAlert(
        "Tipo de archivo no válido",
        "Solo se permiten imágenes (JPEG, PNG, GIF, WebP)"
      );
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorAlert(
        "Archivo demasiado grande",
        "El comprobante no puede ser mayor a 5MB"
      );
      return;
    }

    setComprobanteFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setComprobantePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveComprobante = () => {
    setComprobanteFile(null);
    setComprobantePreview(null);
    const fileInput = document.getElementById('comprobante-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async () => {
    // Validar que solo se pueda renovar si está vencida
    if (currentEnrollment && currentEnrollment.estado !== "Vencida") {
      showErrorAlert(
        "No se puede renovar",
        `Solo puede renovar cuando la matrícula actual esté Vencida. Estado actual: ${currentEnrollment.estado}`
      );
      return;
    }

    if (!categoria) {
      showErrorAlert("Campo requerido", "Debes seleccionar una categoría");
      return;
    }

    const selectedCategory = findCategoryByName(sportsCategories || [], categoria);
    if (categoria && !selectedCategory) {
      showErrorAlert(
        "Categoria invalida",
        "La categoria seleccionada no existe. Por favor, selecciona una categoria valida."
      );
      return;
    }
    
    // NUEVA LÓGICA: Permitir categorías mayores, bloquear categorías menores
    const minAge = selectedCategory.minAge || 0;
    const maxAge = selectedCategory.maxAge || 999;
    
    // Si la edad es MAYOR al máximo de la categoría, NO permitir (está muy grande para esa categoría)
    if (age > maxAge) {
      // NO mostrar sweet alert, el error ya está visible debajo del campo
      return;
    }

    if (!comprobanteFile) {
      showErrorAlert("Comprobante requerido", "Debes subir el comprobante de pago");
      return;
    }

    const enrollmentData = {
      categoria,
      comprobante: comprobanteFile,
    };

    await onRenew(enrollmentData);
  };

  const handleClose = () => {
    if (!isProcessing) {
      setCategoria("");
      setComprobanteFile(null);
      setComprobantePreview(null);
      onClose();
    }
  };

  if (!isOpen || !athlete) return null;

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("es-ES");
    } catch {
      return "N/A";
    }
  };

  const modalContent = (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 relative">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaSync className="text-primary-purple" />
            Renovar Matrícula
          </h2>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <FaUserCircle size={18} className="text-primary-purple" />
            <span className="font-semibold">
              {athlete.nombres} {athlete.apellidos}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Información del deportista */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserCircle className="text-primary-purple" />
              Información del Deportista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Edad actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {age > 0 ? `${age} años` : 'No disponible'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Categoría actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {athlete.categoria || "Por asignar"}
                </p>
              </div>
            </div>
          </div>

          {/* Información de la matrícula actual */}
          {currentEnrollment && (
            <div className="bg-red-50 rounded-lg p-5 border border-red-200">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <FaCalendarAlt />
                Matrícula Actual
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Estado:</span>
                  <span className="ml-2 font-semibold text-red-700">
                    {currentEnrollment.estado || "Vencida"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Categoría:</span>
                  <span className="ml-2 font-semibold text-gray-800">
                    {athlete.categoria}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fecha Matrícula:</span>
                  <span className="ml-2 text-gray-800">
                    {formatDate(currentEnrollment.fechaInscripcion || currentEnrollment.enrollmentDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fecha Vencimiento:</span>
                  <span className="ml-2 text-gray-800">
                    {(() => {
                      // Si existe fecha de vencimiento, usarla
                      if (currentEnrollment.fechaVencimiento || currentEnrollment.expirationDate) {
                        return formatDate(currentEnrollment.fechaVencimiento || currentEnrollment.expirationDate);
                      }
                      // Si no, calcular sumando 1 año a la fecha de inscripción
                      const fechaInsc = currentEnrollment.fechaInscripcion || currentEnrollment.enrollmentDate;
                      if (fechaInsc) {
                        const fecha = new Date(fechaInsc);
                        if (!isNaN(fecha.getTime())) {
                          fecha.setFullYear(fecha.getFullYear() + 1);
                          return formatDate(fecha.toISOString());
                        }
                      }
                      return "N/A";
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de renovación */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">Nueva Matrícula</h3>

            <FormField
              label="Categoría Deportiva"
              name="categoria"
              type="select"
              placeholder="Selecciona la categoría"
              options={availableCategories.map((cat) => ({
                value: cat.name,
                label: cat.name,
              }))}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              helperText="Solo puedes ascender de categoría o mantener la actual"
            />

            {/* Comprobante de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprobante de Pago <span className="text-red-500">*</span>
              </label>
              
              {comprobantePreview ? (
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FaFileAlt className="text-green-600" size={24} />
                      <div>
                        <p className="text-sm text-gray-700 font-medium">
                          {comprobanteFile?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(comprobanteFile?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveComprobante}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar comprobante"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                  {comprobanteFile?.type.startsWith('image/') && (
                    <img
                      src={comprobantePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg bg-white border border-gray-200"
                    />
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-purple transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="comprobante-upload"
                  />
                  <label
                    htmlFor="comprobante-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <FaUpload className="text-gray-400 mb-3" size={40} />
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      Click para subir comprobante
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF o WebP (máx. 5MB)
                    </p>
                  </label>
                </div>
              )}
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Al renovar la matrícula se creará una nueva
                matrícula con estado "Vigente" y fecha de vencimiento de 1 año desde hoy.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-between">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!categoria || !comprobanteFile || isProcessing}
            className="flex items-center gap-2 px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <FaSync className={isProcessing ? "animate-spin" : ""} />
            {isProcessing ? "Renovando..." : "Renovar Matrícula"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

export default RenewEnrollmentModal;
