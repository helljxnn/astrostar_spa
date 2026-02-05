import { useState, useEffect } from 'react';
import { FaUpload, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { showErrorAlert } from '../../../../../../../../shared/utils/alerts';
import providersService from '../../Providers/services/ProvidersService';

const PurchaseModal = ({ isOpen, onClose, onSave, purchase = null }) => {
  const navigate = useNavigate();
  const isEditMode = !!purchase;
  
  const [formData, setFormData] = useState({
    proveedor: '',
    concepto: '',
    fechaCompra: '',
    montoTotal: '',
    metodoPago: 'Transferencia',
    observaciones: '',
  });
  const [facturaFile, setFacturaFile] = useState(null);
  const [facturaPreview, setFacturaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [providerSearchTerm, setProviderSearchTerm] = useState('');
  const [loadingProviders, setLoadingProviders] = useState(false);

  const metodoPagoOptions = [
    { value: 'Transferencia', label: 'Transferencia' },
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Cheque', label: 'Cheque' },
  ];

  // Cargar datos de compra si está en modo edición
  useEffect(() => {
    if (isOpen && purchase) {
      setFormData({
        proveedor: purchase.proveedor || '',
        concepto: purchase.concepto || '',
        fechaCompra: purchase.fechaCompra || '',
        montoTotal: purchase.montoTotal || '',
        metodoPago: purchase.metodoPago || 'Transferencia',
        observaciones: purchase.observaciones || '',
      });
      setProviderSearchTerm(purchase.proveedor || '');
      setFacturaPreview(purchase.facturaUrl || null);
    }
  }, [isOpen, purchase]);

  // Filtrar proveedores según el término de búsqueda (solo cuando se escribe)
  useEffect(() => {
    if (providerSearchTerm.trim() === '') {
      setFilteredProviders([]);
    } else if (providerSearchTerm.length >= 2) {
      // Solo buscar cuando hay al menos 2 caracteres
      fetchFilteredProviders(providerSearchTerm);
    }
  }, [providerSearchTerm]);

  const fetchFilteredProviders = async (searchTerm) => {
    try {
      setLoadingProviders(true);
      const response = await providersService.getActiveProviders();
      if (response.success && response.data) {
        const searchLower = searchTerm.toLowerCase().trim();
        const filtered = response.data.filter(provider => {
          // Buscar en razón social (siempre presente)
          const matchesRazonSocial = provider.razonSocial?.toLowerCase().includes(searchLower);
          
          // Buscar en NIT/documento (puede estar vacío en naturales)
          // Normalizar el NIT quitando espacios, puntos y guiones
          const nitNormalizado = provider.nit?.toString().replace(/[\s.\-]/g, '').toLowerCase();
          const searchNormalizado = searchLower.replace(/[\s.\-]/g, '');
          const matchesNit = nitNormalizado?.includes(searchNormalizado);
          
          // Buscar en contacto principal (nombre de la persona)
          const matchesContacto = provider.contactoPrincipal?.toLowerCase().includes(searchLower);
          
          return matchesRazonSocial || matchesNit || matchesContacto;
        });
        
        setFilteredProviders(filtered);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setFilteredProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  // Función para obtener el label del tipo de documento
  const getDocumentLabel = (provider) => {
    if (provider.tipoEntidad === 'juridica') {
      return 'NIT';
    }
    // Para personas naturales, mostrar el tipo de documento si está disponible
    return provider.tipoDocumentoNombre || 'Documento';
  };

  const handleProviderSelect = (provider) => {
    setFormData(prev => ({ ...prev, proveedor: provider.razonSocial }));
    setProviderSearchTerm(provider.razonSocial);
    setShowProviderDropdown(false);
  };

  const handleProviderInputChange = (e) => {
    const value = e.target.value;
    setProviderSearchTerm(value);
    setFormData(prev => ({ ...prev, proveedor: value }));
    setShowProviderDropdown(true);
  };

  const handleAddNewProvider = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navegar al módulo de proveedores con el modal de crear abierto
    navigate('/dashboard/providers', { state: { openCreateModal: true } });
    handleClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showErrorAlert('Archivo inválido', 'Solo se permiten archivos PDF, JPG o PNG');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorAlert('Archivo muy grande', 'El archivo no debe superar 5MB');
      return;
    }

    setFacturaFile(file);

    // Preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFacturaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFacturaPreview(null);
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProviderDropdown && !event.target.closest('.provider-selector')) {
        setShowProviderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProviderDropdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.proveedor.trim()) {
      showErrorAlert('Campo requerido', 'El proveedor es obligatorio');
      return;
    }
    if (!formData.concepto.trim()) {
      showErrorAlert('Campo requerido', 'El concepto es obligatorio');
      return;
    }
    if (!formData.fechaCompra) {
      showErrorAlert('Campo requerido', 'La fecha de compra es obligatoria');
      return;
    }
    if (!formData.montoTotal || parseFloat(formData.montoTotal) <= 0) {
      showErrorAlert('Monto inválido', 'El monto debe ser mayor a 0');
      return;
    }
    // En modo edición, la factura es opcional
    if (!isEditMode && !facturaFile) {
      showErrorAlert('Factura requerida', 'Debes subir la factura');
      return;
    }

    setLoading(true);

    try {
      const purchaseData = {
        proveedor: formData.proveedor,
        concepto: formData.concepto,
        fechaCompra: formData.fechaCompra,
        montoTotal: parseFloat(formData.montoTotal),
        metodoPago: formData.metodoPago,
        observaciones: formData.observaciones,
      };

      // Si es edición, incluir el ID
      if (isEditMode) {
        purchaseData.id = purchase.id;
      }

      const success = await onSave(purchaseData, facturaFile, isEditMode);
      
      if (success) {
        handleClose();
      }
    } catch (error) {
      showErrorAlert('Error', 'No se pudo guardar la compra');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      proveedor: '',
      concepto: '',
      fechaCompra: '',
      montoTotal: '',
      metodoPago: 'Transferencia',
      observaciones: '',
    });
    setFacturaFile(null);
    setFacturaPreview(null);
    setProviderSearchTerm('');
    setShowProviderDropdown(false);
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
            {isEditMode ? 'Editar Compra' : 'Registrar Compra'}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <form onSubmit={handleSubmit} className="space-y-3">
          {/* Proveedor con Selector y Botón de Agregar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proveedor <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 provider-selector">
                <input
                  type="text"
                  name="proveedor"
                  value={providerSearchTerm}
                  onChange={handleProviderInputChange}
                  onFocus={() => {
                    if (providerSearchTerm.length >= 2) {
                      setShowProviderDropdown(true);
                    }
                  }}
                  placeholder="Buscar por nombre, NIT o contacto..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  required
                  autoComplete="off"
                />
                
                {/* Dropdown de proveedores */}
                {showProviderDropdown && providerSearchTerm.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingProviders ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Cargando proveedores...
                      </div>
                    ) : filteredProviders.length > 0 ? (
                      filteredProviders.map((provider) => (
                        <div
                          key={provider.id}
                          onClick={() => handleProviderSelect(provider)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{provider.razonSocial}</div>
                          <div className="text-xs text-gray-500">
                            {getDocumentLabel(provider)}: {provider.nit}
                            {provider.tipoEntidad === 'natural' && (
                              <span className="ml-2 text-gray-400">
                                • Natural
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        {providerSearchTerm.length < 2 
                          ? 'Escribe al menos 2 caracteres para buscar'
                          : 'No se encontraron proveedores'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Botón para agregar nuevo proveedor */}
              <div className="relative group flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAddNewProvider}
                  className="p-2 bg-primary-purple hover:bg-primary-blue text-white rounded-lg shadow transition-colors"
                  title="Nuevo proveedor"
                >
                  <FaPlus className="text-base" />
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Nuevo proveedor
                </div>
              </div>
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Concepto <span className="text-red-500">*</span>
            </label>
            <textarea
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              placeholder="¿Qué se compró?"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            />
          </div>

          {/* Fecha y Monto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Compra <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaCompra"
                value={formData.fechaCompra}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Total <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="montoTotal"
                value={formData.montoTotal}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <select
              name="metodoPago"
              value={formData.metodoPago}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            >
              {metodoPagoOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subir Factura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factura {!isEditMode && <span className="text-red-500">*</span>}
              {isEditMode && <span className="text-xs text-gray-500 ml-2">(opcional - solo si deseas cambiarla)</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-blue transition-colors">
              <input
                type="file"
                id="factura"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="factura"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FaUpload className="text-3xl text-gray-400" />
                <span className="text-sm text-gray-600">
                  {facturaFile ? facturaFile.name : 'Click para subir factura (PDF, JPG, PNG)'}
                </span>
                <span className="text-xs text-gray-400">Máximo 5MB</span>
              </label>
            </div>

            {/* Preview de imagen */}
            {facturaPreview && (
              <div className="mt-4">
                <img
                  src={facturaPreview}
                  alt="Preview"
                  className="max-h-40 mx-auto rounded-lg shadow"
                />
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales (opcional)"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
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
              {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Compra' : 'Guardar Compra')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
