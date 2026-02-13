import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { FormField } from '../../../../../../../../shared/components/FormField';
import categoriesService from '../../shared/services/CategoriesService';

const MaterialModal = ({ isOpen, onClose, onSave, material = null }) => {
  const isEditing = !!material;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    estado: 'Activo',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Estados para el selector de categorías
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const estadoOptions = [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
  ];

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Cargar datos del material si estamos editando
  useEffect(() => {
    if (isEditing && material) {
      setFormData({
        nombre: material.nombre || '',
        categoria: material.categoria_id || '',
        descripcion: material.descripcion || '',
        estado: material.estado || 'Activo',
      });
      setSelectedCategoryId(material.categoria_id || null);
    } else {
      setFormData({
        nombre: '',
        categoria: '',
        descripcion: '',
        estado: 'Activo',
      });
      setSelectedCategoryId(null);
    }
  }, [isEditing, material]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoriesService.getCategories();
      if (response.success && response.data) {
        // Filtrar solo categorías activas
        const activeCategories = response.data.filter(cat => cat.estado === 'Activa');
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
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
      case 'nombre':
        if (!value || !value.trim()) {
          error = 'El nombre es obligatorio';
        } else if (value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        }
        break;
      case 'categoria':
        if (!value || !value.trim()) {
          error = 'La categoría es obligatoria';
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

    setTouched({
      nombre: true,
      categoria: true,
    });

    const nombreError = validateField('nombre');
    const categoriaError = validateField('categoria');

    if (nombreError || categoriaError) {
      return;
    }

    if (!formData.categoria) {
      setErrors(prev => ({
        ...prev,
        categoria: 'Debes seleccionar una categoría',
      }));
      return;
    }

    setLoading(true);

    try {
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoria));
      
      const materialData = {
        nombre: formData.nombre.trim(),
        categoriaId: parseInt(formData.categoria),
        categoria: selectedCategory?.nombre || '',
        descripcion: formData.descripcion.trim(),
        estado: formData.estado,
      };

      const success = await onSave(materialData, material?.id);

      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error('Error al guardar material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      categoria: '',
      descripcion: '',
      estado: 'Activo',
    });
    setSelectedCategoryId(null);
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleGoToCategories = () => {
    handleClose();
    navigate('/dashboard/material-categories', { state: { openCreateModal: true } });
  };

  if (!isOpen) return null;

  return (
    <>
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
              {isEditing ? 'Editar Material' : 'Crear Material Deportivo'}
            </h2>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nombre del Material */}
              <div>
                <FormField
                  label="Nombre del Material"
                  name="nombre"
                  type="text"
                  placeholder="Ej: Balón fútbol #5"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur('nombre')}
                  error={errors.nombre}
                  touched={touched.nombre}
                  required
                />
              </div>

              {/* Categoría - Solo Selector con botón para crear */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={(e) => handleChange('categoria', e.target.value)}
                    onBlur={() => handleBlur('categoria')}
                    disabled={loadingCategories}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                      errors.categoria && touched.categoria
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300'
                    } ${loadingCategories ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  >
                    <option value="">
                      {loadingCategories ? "Cargando categorías..." : "Selecciona una categoría"}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleGoToCategories}
                    className="p-2.5 bg-primary-blue hover:bg-primary-purple text-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center"
                    title="Crear nueva categoría"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
                {errors.categoria && touched.categoria && (
                  <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                      !
                    </span>
                    <span>{errors.categoria}</span>
                  </p>
                )}
                {categories.length === 0 && !loadingCategories && (
                  <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full border border-red-400 text-[10px] leading-none">
                      !
                    </span>
                    <span>No hay categorías disponibles. Crea una desde el módulo "Categorías de Materiales"</span>
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <FormField
                  label="Descripción"
                  name="descripcion"
                  type="textarea"
                  placeholder="Información adicional del material (opcional)"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Stock Actual (solo en edición) */}
              {isEditing && material && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Actual
                  </label>
                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {material.stock || 0} unidades
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    ⚠️ El stock solo se modifica desde Ingresos de Materiales
                  </p>
                </div>
              )}

              {/* Estado (solo en edición) */}
              {isEditing && (
                <div>
                  <FormField
                    label="Estado"
                    name="estado"
                    type="select"
                    placeholder="Selecciona el estado"
                    value={formData.estado}
                    onChange={handleChange}
                    options={estadoOptions}
                    required
                  />
                </div>
              )}
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
                {loading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Material')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaterialModal;
