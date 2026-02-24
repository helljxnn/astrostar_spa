import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormField } from '../../../../../../../../shared/components/FormField';
import { formatStock } from '../../../../../../../../shared/utils/numberFormat';

const TransferModal = ({ isOpen, onClose, material, onSave }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    cantidad: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        from: '',
        to: '',
        cantidad: '',
        observaciones: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const stockOrigen = formData.from === 'FUNDACION' 
    ? material?.stockFundacion || 0
    : material?.stockEventos || 0;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.from) {
      newErrors.from = 'El inventario origen es obligatorio';
    }

    if (!formData.to) {
      newErrors.to = 'El inventario destino es obligatorio';
    }

    if (formData.from && formData.to && formData.from === formData.to) {
      newErrors.to = 'Los inventarios origen y destino deben ser diferentes';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (formData.cantidad > stockOrigen) {
      newErrors.cantidad = `No hay suficiente stock (máximo: ${stockOrigen})`;
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
      from: formData.from,
      to: formData.to,
      cantidad: parseInt(formData.cantidad),
      observaciones: formData.observaciones.trim(),
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
    
    // Si cambia el origen, limpiar destino si son iguales
    if (field === 'from' && value === formData.to) {
      setFormData(prev => ({ ...prev, to: '' }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !material) return null;

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
            Transferir Stock
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

            {/* Stock Actual */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Fundación
                </label>
                <input
                  type="text"
                  value={formatStock(material?.stockFundacion || 0)}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Eventos
                </label>
                <input
                  type="text"
                  value={formatStock(material?.stockEventos || 0)}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
                />
              </div>
            </div>

            {/* Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde <span className="text-red-500">*</span>
              </label>
              <select
                name="from"
                value={formData.from}
                onChange={(e) => handleChange('from', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                  errors.from ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione inventario origen</option>
                <option value="FUNDACION">Inventario Fundación</option>
                <option value="EVENTOS">Inventario Eventos</option>
              </select>
              {errors.from && (
                <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                    !
                  </span>
                  <span>{errors.from}</span>
                </p>
              )}
            </div>

            {/* Hacia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hacia <span className="text-red-500">*</span>
              </label>
              <select
                name="to"
                value={formData.to}
                onChange={(e) => handleChange('to', e.target.value)}
                disabled={!formData.from}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                  errors.to ? 'border-red-500' : 'border-gray-300'
                } ${!formData.from ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Seleccione inventario destino</option>
                <option value="FUNDACION" disabled={formData.from === 'FUNDACION'}>
                  Inventario Fundación
                </option>
                <option value="EVENTOS" disabled={formData.from === 'EVENTOS'}>
                  Inventario Eventos
                </option>
              </select>
              {errors.to && (
                <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                    !
                  </span>
                  <span>{errors.to}</span>
                </p>
              )}
            </div>

            {/* Stock Disponible en Origen */}
            {formData.from && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Stock disponible en {formData.from === 'FUNDACION' ? 'Fundación' : 'Eventos'}:</strong> {formatStock(stockOrigen)}
                </p>
              </div>
            )}

            {/* Cantidad */}
            <FormField
              label="Cantidad a transferir"
              name="cantidad"
              type="number"
              value={formData.cantidad}
              onChange={(name, value) => {
                const numericValue = value.replace(/[^0-9]/g, '');
                if (numericValue.length <= 6) {
                  handleChange(name, numericValue);
                }
              }}
              error={errors.cantidad}
              required
              min="1"
              max={stockOrigen}
              maxLength={6}
              placeholder="0"
            />

            {/* Observaciones */}
            <FormField
              label="Observaciones (opcional)"
              name="observaciones"
              type="textarea"
              value={formData.observaciones}
              onChange={(name, value) => handleChange(name, value)}
              placeholder="Ej: Transferencia para evento especial, ajuste de inventario, etc."
              rows={3}
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
                disabled={isSubmitting || !formData.from || !formData.to}
              >
                {isSubmitting ? 'Transfiriendo...' : 'Transferir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

TransferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  material: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    stockFundacion: PropTypes.number,
    stockEventos: PropTypes.number,
  }),
  onSave: PropTypes.func.isRequired,
};

export default TransferModal;
