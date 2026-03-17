import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { formatStock } from "../../../../../../../../shared/utils/numberFormat";
import { getTipoBajaOptions } from "../../shared/utils/tipoBajaLabels";
import materialsService from "../services/MaterialsService";

const MaterialDischargeModal = ({ isOpen, onClose, onSave, material }) => {
  const [formData, setFormData] = useState({
    cantidad: "",
    inventarioOrigen: "FUNDACION", // 'FUNDACION' | 'EVENTOS'
    tipo_baja: "",
    descripcion: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState({
    hasAssignments: false,
    count: 0,
    totalPlanned: 0,
    availableForDischarge: 0,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        cantidad: "",
        inventarioOrigen: "FUNDACION",
        tipo_baja: "",
        descripcion: "",
      });
      setErrors({});
      setTouched({});
      checkFutureAssignments();
    }
  }, [isOpen, material?.id]);

  // Verificar asignaciones futuras cuando cambia el origen
  useEffect(() => {
    if (isOpen && formData.inventarioOrigen === "FUNDACION") {
      checkFutureAssignments();
    } else {
      setAssignmentInfo({
        hasAssignments: false,
        count: 0,
        totalPlanned: 0,
        availableForDischarge: 0,
      });
    }
  }, [formData.inventarioOrigen, isOpen, material?.id]);

  const checkFutureAssignments = async () => {
    if (!material?.id) return;

    try {
      const response = await materialsService.checkFutureAssignments(
        material.id,
      );

      if (response.success && response.data) {
        setAssignmentInfo({
          hasAssignments: response.data.hasAssignments,
          count: response.data.count || 0,
          totalPlanned: response.data.totalPlanned || 0,
          availableForDischarge: response.data.availableForDischarge || 0,
        });
      }
    } catch (error) {
      // En caso de error, asumir que no hay asignaciones
      setAssignmentInfo({
        hasAssignments: false,
        count: 0,
        totalPlanned: 0,
        availableForDischarge: material?.stockFundacion || 0,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.inventarioOrigen) {
      newErrors.inventarioOrigen = "El origen es obligatorio";
      setErrors(newErrors);
      return false;
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }

    // Validar stock suficiente según el origen
    // Si es EVENTOS, debe considerar el stock reservado
    const stockMax =
      formData.inventarioOrigen === "FUNDACION"
        ? material?.stockFundacion || 0
        : (material?.stockEventos || 0) -
          (material?.stockEventosReservado || 0);

    if (formData.cantidad > stockMax) {
      newErrors.cantidad = `No hay suficiente stock (máximo: ${stockMax})`;
    }

    if (!formData.tipo_baja) {
      newErrors.tipo_baja = "El tipo de baja es obligatorio";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calcular stock máximo disponible según el origen seleccionado
  const getStockMaximo = () => {
    if (!formData.inventarioOrigen) return 0;

    if (formData.inventarioOrigen === "FUNDACION") {
      // Si hay asignaciones, usar el disponible calculado
      if (assignmentInfo.hasAssignments) {
        return assignmentInfo.availableForDischarge;
      }
      return material?.stockFundacion || 0;
    } else {
      // Para EVENTOS, considerar stock reservado
      return (
        (material?.stockEventos || 0) - (material?.stockEventosReservado || 0)
      );
    }
  };

  const stockMaximo = getStockMaximo();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      cantidad: true,
      inventarioOrigen: true,
      tipo_baja: true,
      descripcion: true,
    });

    if (!validateForm()) {
      return;
    }

    const dataToSend = {
      cantidad: parseInt(formData.cantidad),
      inventarioOrigen: formData.inventarioOrigen,
      tipo_baja: formData.tipo_baja,
      descripcion: formData.descripcion.trim(),
    };

    setIsSubmitting(true);
    const success = await onSave(dataToSend);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            X
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Registrar Baja de Material
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Material (readonly) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Material
              </label>
              <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[38px] break-words">
                {material?.nombre || ""}
              </div>
            </div>

            {/* Stock Fundación y Eventos en una fila */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stock Fundación
                </label>
                <input
                  type="text"
                  value={formatStock(material?.stockFundacion || 0)}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Stock Eventos
                </label>
                <input
                  type="text"
                  value={formatStock(material?.stockEventos || 0)}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
                />
              </div>
            </div>

            {/* Información de disponibilidad para Fundación */}
            {formData.inventarioOrigen === "FUNDACION" &&
              assignmentInfo.hasAssignments && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock Total:</span>
                      <span className="font-medium text-gray-900">
                        {formatStock(material?.stockFundacion || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Planificado en eventos:
                      </span>
                      <span className="font-medium text-blue-600">
                        {formatStock(assignmentInfo.totalPlanned)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                      <span className="text-gray-700 font-medium">
                        Disponible para baja:
                      </span>
                      <span className="font-bold text-green-600">
                        {formatStock(assignmentInfo.availableForDischarge)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Origen y Cantidad en una fila */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Inventario Origen"
                name="inventarioOrigen"
                type="select"
                value={formData.inventarioOrigen}
                onChange={handleChange}
                onBlur={() => handleBlur("inventarioOrigen")}
                error={errors.inventarioOrigen}
                touched={touched.inventarioOrigen}
                required
                options={[
                  { value: "FUNDACION", label: "Fundación" },
                  { value: "EVENTOS", label: "Eventos" },
                ]}
              />

              <FormField
                label="Cantidad a dar de baja"
                name="cantidad"
                type="text"
                value={formData.cantidad}
                onChange={(name, value) => {
                  const numericValue = value.replace(/[^0-9]/g, "");
                  if (numericValue.length <= 6) {
                    handleChange(name, numericValue);
                  }
                }}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onBlur={() => handleBlur("cantidad")}
                error={errors.cantidad}
                touched={touched.cantidad}
                required
                min="1"
                max={stockMaximo}
                maxLength={6}
                placeholder="0"
              />
            </div>

            {/* Advertencia cuando no hay stock disponible */}
            {formData.inventarioOrigen === "FUNDACION" &&
              assignmentInfo.hasAssignments &&
              assignmentInfo.availableForDischarge === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 text-lg">a️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">
                        No hay stock disponible para dar de baja
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Todo el stock de Fundación (
                        {formatStock(material?.stockFundacion || 0)}) está
                        planificado en {assignmentInfo.count} evento(s). Revisa
                        las "Asignaciones del Material" y reduce las
                        planificaciones para poder dar de baja.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            <FormField
              label="Tipo de Baja"
              name="tipo_baja"
              type="select"
              value={formData.tipo_baja}
              onChange={handleChange}
              onBlur={() => handleBlur("tipo_baja")}
              error={errors.tipo_baja}
              touched={touched.tipo_baja}
              required
              options={getTipoBajaOptions()}
              placeholder="Selecciona el tipo de baja"
            />

            <FormField
              label={
                formData.tipo_baja === "OTRO"
                  ? "Descripción (especifica el motivo)"
                  : "Descripción detallada"
              }
              name="descripcion"
              type="textarea"
              value={formData.descripcion}
              onChange={handleChange}
              onBlur={() => handleBlur("descripcion")}
              error={errors.descripcion}
              touched={touched.descripcion}
              required
              placeholder={
                formData.tipo_baja === "OTRO"
                  ? "Ej: Ajuste de inventario, material vencido"
                  : "Ej: Se rompió durante el torneo infantil"
              }
              rows={2}
            />

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isSubmitting ||
                  (formData.inventarioOrigen === "FUNDACION" &&
                    assignmentInfo.hasAssignments &&
                    assignmentInfo.availableForDischarge === 0)
                }
              >
                {isSubmitting ? "Registrando..." : "Registrar Baja"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

MaterialDischargeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  material: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    stockFundacion: PropTypes.number,
    stockEventos: PropTypes.number,
  }),
};

export default MaterialDischargeModal;


