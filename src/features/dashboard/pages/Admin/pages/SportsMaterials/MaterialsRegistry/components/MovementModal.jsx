import { useState, useEffect } from 'react';
import { showErrorAlert } from '../../../../../../../../shared/utils/alerts';
import { FormField } from '../../../../../../../../shared/components/FormField';
import materialsService from '../../Materials/services/MaterialsService';
import { calculateNewStock, validateMovementQuantity } from '../../shared/utils/stockCalculations';

const MovementModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    materialId: '',
    materialNombre: '',
    categoria: '',
    tipoMovimiento: '',
    cantidad: '',
    origen: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const tipoMovimientoOptions = [
    { value: 'Entrada', label: 'Entrada' },
    { value: 'Baja', label: 'Baja' },
  ];

  const origenOptions = [
    { value: 'Compra', label: 'Compra' },
    { value: 'Donación', label: 'Donación' },
    { value: 'Ajuste', label: 'Ajuste' },
    { value: 'Baja por daño', label: 'Baja por daño' },
    { value: 'Otro', label: 'Otro' },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  useEffect(() => {
    if (materialSearchTerm.trim() === '') {
      setFilteredMaterials([]);
    } else if (materialSearchTerm.length >= 2) {
      const searchLower = materialSearchTerm.toLowerCase().trim();
      const filtered = materials.filter(material => {
        const matchesNombre = material.nombre?.toLowerCase().includes(searchLower);
        const matchesCategoria = material.categoria?.toLowerCase().includes(searchLower);
        return matchesNombre || matchesCategoria;
      });
      setFilteredMaterials(filtered);
    }
  }, [materialSearchTerm, materials]);

  const fetchMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const response = await materialsService.getMaterials({ limit: 1000 });
      if (response.success && response.data) {
        // Solo materiales activos
        const activeMaterials = response.data.filter(m => m.estado === 'Activo');
        setMaterials(activeMaterials);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
    setFormData(prev => ({ 
      ...prev, 
      materialId: material.id,
      materialNombre: material.nombre,
      categoria: material.categoria
    }));
    setMaterialSearchTerm(material.nombre);
    setShowMaterialDropdown(false);
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }));
    }
  };

  const handleMaterialInputChange = (e) => {
    const value = e.target.value;
    setMaterialSearchTerm(value);
    setSelectedMaterial(null);
    setFormData(prev => ({ 
      ...prev, 
      materialId: '',
      materialNombre: value,
      categoria: ''
    }));
    setShowMaterialDropdown(true);
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }));
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (name) => {
    const value = formData[name];
    let error = '';

    switch (name) {
      case 'materialId':
        if (!selectedMaterial) {
          error = 'Debes seleccionar un material de la lista';
        }
        break;
      case 'tipoMovimiento':
        if (!value) {
          error = 'Selecciona el tipo de movimiento';
        }
        break;
      case 'cantidad':
        if (!value || parseInt(value) <= 0) {
          error = 'La cantidad debe ser mayor a 0';
        } else {
          try {
            validateMovementQuantity(value);
          } catch (e) {
            error = e.message;
          }
        }
        // Validar stock suficiente para bajas
        if (formData.tipoMovimiento === 'Baja' && selectedMaterial) {
          const qty = parseInt(value);
          if (qty > selectedMaterial.stockActual) {
            error = `Stock insuficiente. Disponible: ${selectedMaterial.stockActual}`;
          }
        }
        break;
      case 'origen':
        if (!value) {
          error = 'Selecciona el origen del movimiento';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMaterialDropdown && !event.target.closest('.material-selector')) {
        setShowMaterialDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMaterialDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setTouched({
      materialId: true,
      tipoMovimiento: true,
      cantidad: true,
      origen: true,
    });

    if (!selectedMaterial) {
      setErrors(prev => ({ 
        ...prev, 
        materialId: 'Debes seleccionar un material existente de la lista' 
      }));
      return;
    }

    const materialError = validateField('materialId');
    const tipoError = validateField('tipoMovimiento');
    const cantidadError = validateField('cantidad');
    const origenError = validateField('origen');

    if (materialError || tipoError || cantidadError || origenError) {
      return;
    }

    setLoading(true);

    try {
      const cantidad = parseInt(formData.cantidad);
      const stockNuevo = calculateNewStock(
        selectedMaterial.stockActual,
        cantidad,
        formData.tipoMovimiento
      );

      const movementData = {
        materialId: formData.materialId,
        materialNombre: formData.materialNombre,
        categoria: formData.categoria,
        tipoMovimiento: formData.tipoMovimiento,
        cantidad: cantidad,
        origen: formData.origen,
        observaciones: formData.observaciones,
        stockAnterior: selectedMaterial.stockActual,
        stockNuevo: stockNuevo
      };

      const success = await onSave(movementData);
      
      if (success) {
        handleClose();
      }
    } catch (error) {
      showErrorAlert('Error', error.message || 'No se pudo registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      materialId: '',
      materialNombre: '',
      categoria: '',
      tipoMovimiento: '',
      cantidad: '',
      origen: '',
      observaciones: '',
    });
    setMaterialSearchTerm('');
    setSelectedMaterial(null);
    setShowMaterialDropdown(false);
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Registrar Movimiento de Material
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Material con Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Deportivo <span className="text-red-500">*</span>
              </label>
              <div className="relative material-selector">
                <input
                  type="text"
                  value={materialSearchTerm}
                  onChange={handleMaterialInputChange}
                  onBlur={() => handleBlur('materialId')}
                  onFocus={() => {
                    if (materialSearchTerm.length >= 2) {
                      setShowMaterialDropdown(true);
                    }
                  }}
                  placeholder="Buscar por nombre o categoría..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent ${
                    touched.materialId && errors.materialId
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  required
                  autoComplete="off"
                />
                
                {/* Dropdown de materiales */}
                {showMaterialDropdown && materialSearchTerm.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingMaterials ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Cargando materiales...
                      </div>
                    ) : filteredMaterials.length > 0 ? (
                      filteredMaterials.map((material) => (
                        <div
                          key={material.id}
                          onClick={() => handleMaterialSelect(material)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{material.nombre}</div>
                          <div className="text-xs text-gray-500">
                            {material.categoria} • Stock: {material.stockActual}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        {materialSearchTerm.length < 2 
                          ? 'Escribe al menos 2 caracteres para buscar'
                          : 'No se encontraron materiales activos'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {touched.materialId && errors.materialId && (
                <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                    !
                  </span>
                  <span>{errors.materialId}</span>
                </p>
              )}
            </div>

            {/* Categoría (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                value={formData.categoria}
                readOnly
                placeholder="Se autocompleta al seleccionar material"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Desglose de Stock (si hay material seleccionado) */}
            {selectedMaterial && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Actual del Material
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Disponible</p>
                    <p className="text-lg font-semibold text-green-700">
                      {selectedMaterial.stockDisponible || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Reservado</p>
                    <p className="text-lg font-semibold text-yellow-700">
                      {selectedMaterial.stockReservado || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-lg font-semibold text-blue-700">
                      {selectedMaterial.stockActual || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tipo de Movimiento y Cantidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormField
                  label="Tipo de Movimiento"
                  name="tipoMovimiento"
                  type="select"
                  placeholder="Selecciona el tipo"
                  value={formData.tipoMovimiento}
                  onChange={handleChange}
                  onBlur={() => handleBlur('tipoMovimiento')}
                  error={errors.tipoMovimiento}
                  touched={touched.tipoMovimiento}
                  options={tipoMovimientoOptions}
                  required
                />
              </div>

              <div>
                <FormField
                  label="Cantidad"
                  name="cantidad"
                  type="text"
                  placeholder="0"
                  value={formData.cantidad}
                  onChange={(name, value) => {
                    const numericValue = value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, [name]: numericValue }));
                    if (errors[name]) {
                      setErrors(prev => ({ ...prev, [name]: '' }));
                    }
                  }}
                  onBlur={() => handleBlur('cantidad')}
                  error={errors.cantidad}
                  touched={touched.cantidad}
                  required
                  helperText={selectedMaterial ? `Stock disponible: ${selectedMaterial.stockActual}` : ''}
                />
              </div>
            </div>

            {/* Origen */}
            <div>
              <FormField
                label="Origen del Registro"
                name="origen"
                type="select"
                placeholder="Selecciona el origen"
                value={formData.origen}
                onChange={handleChange}
                onBlur={() => handleBlur('origen')}
                error={errors.origen}
                touched={touched.origen}
                options={origenOptions}
                required
              />
            </div>

            {/* Observaciones */}
            <div>
              <FormField
                label="Observaciones"
                name="observaciones"
                type="textarea"
                placeholder="Notas adicionales (opcional)"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Fecha (informativa) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Registro
              </label>
              <input
                type="text"
                value={new Date().toLocaleDateString('es-CO')}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                La fecha se registra automáticamente
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue hover:bg-primary-purple text-white rounded-lg shadow transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementModal;
