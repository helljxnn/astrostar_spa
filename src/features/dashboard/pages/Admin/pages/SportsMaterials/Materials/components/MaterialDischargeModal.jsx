import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormField } from '../../../../../../../../shared/components/FormField';

const MaterialDischargeModal = ({ isOpen, onClose, onSave, material }) => {
  const [formData, setFormData] = useState({
    cantidad: '',
    motivo: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        cantidad: '',
        motivo: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (formData.cantidad > (material?.stockDisponible || 0)) {
      newErrors.cantidad = `No hay suficiente stock disponible (máximo: ${material?.stockDisponible || 0})`;
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    const success = await onSave({
      cantidad: parseInt(formData.cantidad),
      motivo: formData.motivo.trim(),
    });
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
                Stock Disponible
              </label>
              <input
                type="text"
                value={`${material?.stockDisponible || 0} unidades`}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
              />
            </div>

            <FormField
              label="Cantidad a dar de baja"
              name="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={(e) => handleChange('cantidad', e.target.value)}
              error={errors.cantidad}
              required
              min="1"
              max={material?.stockDisponible || 0}
            />

            <FormField
              label="Motivo de la baja"
              name="motivo"
              type="textarea"
              value={formData.motivo}
              onChange={(e) => handleChange('motivo', e.target.value)}
              error={errors.motivo}
              required
              placeholder="Ej: Material dañado, desgaste por uso, obsoleto, etc."
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
  }),
};

export default MaterialDischargeModal;
