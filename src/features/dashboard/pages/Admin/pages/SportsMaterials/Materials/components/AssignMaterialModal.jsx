import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import SearchableSelect from '../../../../../../../../shared/components/SearchableSelect';
import { FormField } from '../../../../../../../../shared/components/FormField';
import { formatStock } from '../../../../../../../../shared/utils/numberFormat';
import materialsService from '../services/MaterialsService';

const AssignMaterialModal = ({ isOpen, onClose, onSave }) => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    materialId: '',
    cantidad: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
      setFormData({
        materialId: '',
        cantidad: '',
        observaciones: '',
      });
      setSelectedMaterial(null);
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  const loadMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const response = await materialsService.getMaterials({ 
        estado: 'Activo',
        limit: 1000 
      });
      
      if (response.success && response.data) {
        // Filtrar solo materiales con stock DISPONIBLE en EVENTOS (no reservado)
        const materialsWithStock = response.data.filter(m => {
          const disponible = (m.stockEventos || 0) - (m.stockEventosReservado || 0);
          return disponible > 0;
        });
        setMaterials(materialsWithStock);
      }
    } catch {
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleMaterialChange = (name, value) => {
    const material = materials.find(m => String(m.id) === String(value));
    setSelectedMaterial(material);
    setFormData(prev => ({ ...prev, materialId: value, cantidad: '' }));
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }));
    }
  };

  const getStockDisponible = (material) => {
    if (!material) return 0;
    return (material.stockEventos || 0) - (material.stockEventosReservado || 0);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateForm();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedMaterial) {
      newErrors.materialId = 'Debes seleccionar un material';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (selectedMaterial && formData.cantidad > getStockDisponible(selectedMaterial)) {
      newErrors.cantidad = `No hay suficiente stock disponible (máximo: ${getStockDisponible(selectedMaterial)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      materialId: true,
      cantidad: true,
    });
    
    if (!validateForm()) {
      return;
    }

    const dataToSend = {
      materialId: formData.materialId,
      cantidad: parseInt(formData.cantidad),
      observaciones: formData.observaciones.trim(),
    };

    setLoading(true);
    const success = await onSave(dataToSend);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Asignar Material al Evento
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={materials.map(m => ({
                  value: String(m.id),
                  label: `${m.nombre} (Disponible: ${getStockDisponible(m)})`
                }))}
                value={String(formData.materialId || "")}
                onChange={(value) => handleMaterialChange("materialId", value)}
                placeholder="Selecciona un material"
                loading={loadingMaterials}
                error={touched.materialId && errors.materialId}
              />
              {touched.materialId && errors.materialId && (
                <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                    !
                  </span>
                  <span>{errors.materialId}</span>
                </p>
              )}
              {materials.length === 0 && !loadingMaterials && (
                <p className="mt-1 text-amber-600 text-xs flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border border-amber-500 text-[10px] leading-none">
                    ⚠
                  </span>
                  <span>No hay materiales con stock disponible en eventos</span>
                </p>
              )}
            </div>

            {/* Stock Disponible */}
            {selectedMaterial && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm text-blue-800">
                    <strong>Stock total en eventos:</strong> {formatStock(selectedMaterial.stockEventos)}
                  </p>
                  <p className="text-sm text-amber-700">
                    <strong>Ya reservado:</strong> {formatStock(selectedMaterial.stockEventosReservado || 0)}
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    <strong>Disponible para asignar:</strong> {formatStock(getStockDisponible(selectedMaterial))}
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ⓘ El stock se reservará pero NO se descontará hasta que el evento se finalice
                </p>
              </div>
            )}

            {/* Cantidad */}
            <FormField
              label="Cantidad"
              name="cantidad"
              type="text"
              value={formData.cantidad}
              onChange={(name, value) => {
                const numericValue = value.replace(/[^0-9]/g, '');
                if (numericValue.length <= 6) {
                  handleChange(name, numericValue);
                }
              }}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onBlur={() => handleBlur('cantidad')}
              error={errors.cantidad}
              touched={touched.cantidad}
              required
              placeholder="0"
              maxLength={6}
              disabled={!selectedMaterial}
            />

            {/* Observaciones */}
            <FormField
              label="Observaciones (opcional)"
              name="observaciones"
              type="textarea"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Ej: Material para torneo, entrega especial, etc."
              rows={3}
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50"
                disabled={loading || !formData.materialId}
              >
                {loading ? 'Asignando...' : 'Asignar Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

AssignMaterialModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AssignMaterialModal;

