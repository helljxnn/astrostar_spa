import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormField } from '../../../../../../../../shared/components/FormField';
import { formatStock } from '../../../../../../../../shared/utils/numberFormat';
import { getTipoBajaOptions } from '../../shared/utils/tipoBajaLabels';

const MaterialDischargeModal = ({ isOpen, onClose, onSave, material }) => {
  const [formData, setFormData] = useState({
    cantidad: '',
    origenStock: '', // '' | 'USO_INTERNO' | 'EVENTOS'
    tipo_baja: '',
    descripcion: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        cantidad: '',
        origenStock: '',
        tipo_baja: '',
        descripcion: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.origenStock) {
      newErrors.origenStock = 'El origen es obligatorio';
      setErrors(newErrors);
      return false;
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    // Validar stock suficiente según el origen
    const stockMax = formData.origenStock === 'USO_INTERNO' 
      ? material?.stockDisponible || 0
      : material?.stockReservado || 0;
    
    if (formData.cantidad > stockMax) {
      newErrors.cantidad = `No hay suficiente stock (máximo: ${stockMax})`;
    }

    if (!formData.tipo_baja) {
      newErrors.tipo_baja = 'El tipo de baja es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSend = {
      cantidad: parseInt(formData.cantidad),
      origenStock: formData.origenStock,
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
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Registrar Baja de Material
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Material (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 min-h-[42px] break-words">
                {material?.nombre || ''}
              </div>
            </div>

            {/* Stock Disponible (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Total
              </label>
              <input
                type="text"
                value={formatStock(material?.stockDisponible || 0)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
              />
            </div>

            {/* Stock Reservado (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Reservado (Eventos)
              </label>
              <input
                type="text"
                value={formatStock(material?.stockReservado || 0)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
              />
              <p className="mt-1 text-xs text-gray-500">
                Material asignado a eventos activos
              </p>
            </div>

            {/* Origen del Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Baja <span className="text-red-500">*</span>
              </label>
              <select
                name="origenStock"
                value={formData.origenStock}
                onChange={(e) => handleChange('origenStock', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                  errors.origenStock ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione tipo</option>
                <option value="USO_INTERNO">Baja de Stock (Uso Interno)</option>
                <option value="EVENTOS">Baja de Reserva (Evento)</option>
              </select>
              {errors.origenStock && (
                <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                    !
                  </span>
                  <span>{errors.origenStock}</span>
                </p>
              )}
              {!errors.origenStock && formData.origenStock && (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.origenStock === 'USO_INTERNO' 
                    ? `Baja del stock total (${formatStock(material?.stockDisponible || 0)} disponibles)`
                    : `Baja de material reservado para eventos (${formatStock(material?.stockReservado || 0)} reservados)`}
                </p>
              )}
            </div>

            <FormField
              label="Cantidad a dar de baja"
              name="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={(e) => {
                const value = e.target.value;
                // Limitar a 6 dígitos
                if (value.length <= 6) {
                  handleChange('cantidad', value);
                }
              }}
              error={errors.cantidad}
              required
              min="1"
              max={material?.stockDisponible || 0}
              maxLength={6}
            />

            <FormField
              label="Tipo de Baja"
              name="tipo_baja"
              type="select"
              value={formData.tipo_baja}
              onChange={(e) => handleChange('tipo_baja', e.target.value)}
              error={errors.tipo_baja}
              required
              options={getTipoBajaOptions()}
              placeholder="Selecciona el tipo de baja"
            />

            <FormField
              label={formData.tipo_baja === 'OTRO' ? 'Descripción detallada (especifica el motivo)' : 'Descripción detallada'}
              name="descripcion"
              type="textarea"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              error={errors.descripcion}
              required
              placeholder={
                formData.tipo_baja === 'OTRO'
                  ? 'Ej: Ajuste de inventario, material vencido, descarte por obsolescencia'
                  : 'Ej: Se rompió durante el torneo infantil'
              }
              rows={4}
            />

            <div className="flex justify-end gap-3 pt-4">
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
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Baja'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

MaterialDischargeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  material: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    stockDisponible: PropTypes.number,
    stockReservado: PropTypes.number,
  }),
};

export default MaterialDischargeModal;
