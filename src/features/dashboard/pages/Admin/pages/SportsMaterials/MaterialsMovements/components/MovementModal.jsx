import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { showErrorAlert } from '../../../../../../../../shared/utils/alerts';
import { FormField } from '../../../../../../../../shared/components/FormField';
import SearchableSelect from '../../../../../../../../shared/components/SearchableSelect';
import ProviderModal from '../../../Providers/components/ProviderModal';
import materialsService from '../../Materials/services/MaterialsService';
import providersService from '../../../Providers/services/ProvidersService';
import eventsService from '../../../Events/services/eventsService';
import { calculateNewStock, validateMovementQuantity } from '../../shared/utils/stockCalculations';
import { formatStock, formatNumber } from '../../../../../../../../shared/utils/numberFormat';

// Helper para obtener fecha local en formato YYYY-MM-DD
const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MovementModal = ({ isOpen, onClose, onSave, movement = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    materialId: '',
    materialNombre: '',
    categoria: '',
    cantidad: '',
    fechaIngreso: getTodayLocalDate(), // Fecha de hoy por defecto
    destinoStock: '', // '' | 'USO_INTERNO' | 'EVENTOS'
    eventoId: '', // ID del evento al que se asigna
    proveedor: '',
    observaciones: '',
  });
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && movement) {
        // Cargar datos del movimiento a editar
        setFormData({
          materialId: movement.materialId || '',
          materialNombre: movement.materialNombre || '',
          categoria: movement.categoria || '',
          cantidad: movement.cantidad || '',
          fechaIngreso: movement.fechaIngreso ? movement.fechaIngreso.split('T')[0] : getTodayLocalDate(),
          destinoStock: movement.destinoStock || 'USO_INTERNO',
          eventoId: movement.eventoId || '',
          proveedor: movement.proveedorId || '',
          observaciones: movement.observaciones || '',
        });
        // Simular material seleccionado para modo edición
        setSelectedMaterial({
          id: movement.materialId,
          nombre: movement.materialNombre,
          categoria: movement.categoria,
          stockDisponible: movement.stockNuevo || 0,
        });
      } else {
        // Resetear formulario para nuevo registro
        setFormData({
          materialId: '',
          materialNombre: '',
          categoria: '',
          cantidad: '',
          fechaIngreso: getTodayLocalDate(),
          destinoStock: '',
          eventoId: '',
          proveedor: '',
          observaciones: '',
        });
        setSelectedMaterial(null);
      }
      fetchMaterials();
      fetchProviders();
      fetchEvents();
    }
  }, [isOpen, isEditing, movement]);

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

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const response = await providersService.getActiveProviders();
      if (response.success && response.data) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await eventsService.getActiveEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
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
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }));
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si cambia el destino y no es EVENTOS, limpiar eventoId
    if (name === 'destinoStock' && value !== 'EVENTOS') {
      setFormData(prev => ({ ...prev, eventoId: '' }));
      setErrors(prev => ({ ...prev, eventoId: '' }));
    }
    
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
      case 'cantidad':
        if (!value || parseInt(value) <= 0) {
          error = 'La cantidad debe ser mayor a 0';
        } else if (value.length > 6) {
          error = 'La cantidad no puede tener más de 6 dígitos';
        } else {
          try {
            validateMovementQuantity(value);
          } catch (e) {
            error = e.message;
          }
        }
        break;
      case 'fechaIngreso':
        if (!value) {
          error = 'La fecha de ingreso es obligatoria';
        } else {
          const fechaIngreso = new Date(value);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          
          if (fechaIngreso > hoy) {
            error = 'La fecha de ingreso no puede ser futura';
          }
        }
        break;
      case 'destinoStock':
        if (!value) {
          error = 'El destino es obligatorio';
        }
        break;
      case 'eventoId':
        if (formData.destinoStock === 'EVENTOS' && !value) {
          error = 'Debes seleccionar un evento';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isEditing) {
      // En modo edición, solo validar campos editables
      setTouched({
        fechaIngreso: true,
      });

      const fechaError = validateField('fechaIngreso');

      if (fechaError) {
        return;
      }

      setLoading(true);

      try {
        const movementData = {
          fechaIngreso: formData.fechaIngreso,
          proveedor: formData.proveedor || null,
          observaciones: formData.observaciones || null,
        };

        const success = await onSave(movementData);
        
        if (success) {
          handleClose();
        }
      } catch (error) {
        showErrorAlert('Error', error.message || 'No se pudo actualizar el ingreso');
      } finally {
        setLoading(false);
      }
    } else {
      // Modo creación - validar todos los campos
      setTouched({
        materialId: true,
        cantidad: true,
        fechaIngreso: true,
        destinoStock: true,
        eventoId: formData.destinoStock === 'EVENTOS',
      });

      if (!selectedMaterial) {
        setErrors(prev => ({ 
          ...prev, 
          materialId: 'Debes seleccionar un material existente de la lista' 
        }));
        return;
      }

      const materialError = validateField('materialId');
      const cantidadError = validateField('cantidad');
      const fechaError = validateField('fechaIngreso');
      const destinoError = validateField('destinoStock');
      const eventoError = formData.destinoStock === 'EVENTOS' ? validateField('eventoId') : '';

      if (materialError || cantidadError || fechaError || destinoError || eventoError) {
        return;
      }

      setLoading(true);

      try {
        const cantidad = parseInt(formData.cantidad);
        const stockAnterior = selectedMaterial.stockDisponible || 0;
        const stockNuevo = calculateNewStock(
          stockAnterior,
          cantidad,
          'Entrada' // Siempre es entrada en este módulo
        );

        const movementData = {
          materialId: formData.materialId,
          materialNombre: formData.materialNombre,
          categoria: formData.categoria,
          tipoMovimiento: 'Entrada', // Siempre es entrada
          cantidad: cantidad,
          fechaIngreso: formData.fechaIngreso,
          destinoStock: formData.destinoStock, // 'USO_INTERNO' | 'EVENTOS'
          eventoId: formData.destinoStock === 'EVENTOS' ? formData.eventoId : null,
          proveedor: formData.proveedor || null,
          observaciones: formData.observaciones || null,
          stockAnterior: stockAnterior,
          stockNuevo: stockNuevo
        };

        const success = await onSave(movementData);
        
        if (success) {
          handleClose();
        }
      } catch (error) {
        showErrorAlert('Error', error.message || 'No se pudo registrar el ingreso');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      materialId: '',
      materialNombre: '',
      categoria: '',
      cantidad: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      destinoStock: '',
      eventoId: '',
      proveedor: '',
      observaciones: '',
    });
    setSelectedMaterial(null);
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleSaveProvider = async (providerData) => {
    try {
      const response = await providersService.createProvider(providerData);
      if (response.success) {
        // Recargar proveedores
        await fetchProviders();
        // Seleccionar el nuevo proveedor
        if (response.data && response.data.id) {
          setFormData(prev => ({ ...prev, proveedor: response.data.id }));
        }
        return response;
      }
      return response;
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      throw error;
    }
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
            {isEditing ? 'Editar Ingreso de Material' : 'Registrar Ingreso de Material'}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Material con SearchableSelect */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  name="materialId"
                  options={materials.map(m => ({
                    value: m.id,
                    label: m.nombre
                  }))}
                  value={formData.materialId}
                  onChange={(name, value) => {
                    const material = materials.find(m => m.id === value);
                    if (material) {
                      handleMaterialSelect(material);
                    }
                  }}
                  onBlur={() => handleBlur('materialId')}
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
              </div>
            )}

            {/* Material (solo lectura en modo edición) */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material
                </label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {formData.materialNombre}
                </div>
              </div>
            )}

            {/* Stock Disponible (solo lectura) */}
            {selectedMaterial && !isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Disponible
                </label>
                <input
                  type="text"
                  value={formatStock(selectedMaterial.stockDisponible || 0)}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>
            )}

            {/* Destino del Ingreso */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destino del Ingreso <span className="text-red-500">*</span>
                </label>
                <select
                  name="destinoStock"
                  value={formData.destinoStock}
                  onChange={(e) => handleChange('destinoStock', e.target.value)}
                  onBlur={() => handleBlur('destinoStock')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                    touched.destinoStock && errors.destinoStock
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione destino</option>
                  <option value="USO_INTERNO">Uso Interno (Fundación)</option>
                  <option value="EVENTOS">Asignar a Evento</option>
                </select>
                {touched.destinoStock && errors.destinoStock && (
                  <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                      !
                    </span>
                    <span>{errors.destinoStock}</span>
                  </p>
                )}
                {!errors.destinoStock && formData.destinoStock && (
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.destinoStock === 'USO_INTERNO' 
                      ? 'Este material se sumará al stock disponible para uso de la fundación'
                      : 'Este material se reservará para el evento seleccionado (no baja del stock hasta finalizar el evento)'}
                  </p>
                )}
              </div>
            )}

            {/* Selección de Evento (solo si destino es EVENTOS) */}
            {!isEditing && formData.destinoStock === 'EVENTOS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evento <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  name="eventoId"
                  options={events.map(e => ({
                    value: e.id,
                    label: `${e.nombre} - ${e.fechaInicio ? new Date(e.fechaInicio).toLocaleDateString('es-CO') : 'Sin fecha'}`
                  }))}
                  value={formData.eventoId}
                  onChange={handleChange}
                  onBlur={() => handleBlur('eventoId')}
                  placeholder="Selecciona un evento"
                  loading={loadingEvents}
                  error={touched.eventoId && errors.eventoId}
                />
                {touched.eventoId && errors.eventoId && (
                  <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                      !
                    </span>
                    <span>{errors.eventoId}</span>
                  </p>
                )}
                {events.length === 0 && !loadingEvents && (
                  <p className="mt-1 text-amber-600 text-xs flex items-center gap-1">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-amber-500 text-[10px] leading-none">
                      ⚠
                    </span>
                    <span>No hay eventos activos disponibles</span>
                  </p>
                )}
              </div>
            )}

            {/* Cantidad y Fecha de Ingreso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEditing && (
                <div>
                  <FormField
                    label="Cantidad"
                    name="cantidad"
                    type="text"
                    placeholder="0"
                    value={formData.cantidad}
                    onChange={(name, value) => {
                      const numericValue = value.replace(/[^0-9]/g, '');
                      // Limitar a 6 dígitos
                      if (numericValue.length <= 6) {
                        setFormData((prev) => ({ ...prev, [name]: numericValue }));
                        if (errors[name]) {
                          setErrors((prev) => ({ ...prev, [name]: '' }));
                        }
                      }
                    }}
                    onBlur={() => handleBlur('cantidad')}
                    error={errors.cantidad}
                    touched={touched.cantidad}
                    required
                    maxLength={6}
                  />
                </div>
              )}

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {formatStock(formData.cantidad)}
                  </div>
                </div>
              )}

              <div>
                <FormField
                  label="Fecha de Ingreso"
                  name="fechaIngreso"
                  type="date"
                  value={formData.fechaIngreso}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fechaIngreso')}
                  error={errors.fechaIngreso}
                  touched={touched.fechaIngreso}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Proveedor (opcional) con botón crear */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor (opcional)
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    name="proveedor"
                    options={providers.map(p => ({
                      value: p.id,
                      label: `${p.razonSocial} - ${p.tipoDocumentoNombre || 'NIT'}: ${p.nit}`
                    }))}
                    value={formData.proveedor}
                    onChange={handleChange}
                    placeholder="Selecciona un proveedor"
                    loading={loadingProviders}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsProviderModalOpen(true)}
                  className="px-3 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors flex items-center gap-2"
                  title="Crear nuevo proveedor"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <FormField
                label="Observaciones (opcional)"
                name="observaciones"
                type="textarea"
                placeholder="Ej: Entrega parcial, material en buen estado, recibido sin empaque, etc."
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
              />
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
              {loading ? (isEditing ? 'Actualizando...' : 'Registrando...') : (isEditing ? 'Guardar Cambios' : 'Guardar Ingreso')}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Proveedor */}
      <ProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        onSave={handleSaveProvider}
      />
    </div>
  );
};

export default MovementModal;
