import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { useCategoryNameValidation } from "../hooks/useCategoryNameValidation";
import { showConfirmAlert } from "../../../../../../../../shared/utils/alerts.js";

const CategoryModal = ({ isOpen, onClose, onSave, category = null }) => {
  const isEditing = !!category;
  const debounceRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    estado: "Activo",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [initialName, setInitialName] = useState("");

  const { nameValidation, validateCategoryName, resetNameValidation } =
    useCategoryNameValidation(category?.id || null);

  const estadoOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ];

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setTouched({});

    if (isEditing && category) {
      const incomingName = category.nombre || "";
      setFormData({
        nombre: incomingName,
        descripcion: category.descripcion || "",
        estado: category.estado || "Activo",
      });
      setInitialName(incomingName);
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        estado: "Activo",
      });
      setInitialName("");
    }

    // Limpiar validación al abrir/cerrar
    resetNameValidation();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditing, category]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Validación en tiempo real del nombre
    if (name === "nombre") {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const trimmed = String(value || "").trim();
      const currentInitial = (initialName || "").trim().toLowerCase();

      // Si estamos editando y el nombre es el mismo que el inicial, no validar
      if (isEditing && trimmed.toLowerCase() === currentInitial) {
        resetNameValidation();
      } else if (trimmed.length >= 3) {
        // Validar después de un delay
        debounceRef.current = setTimeout(() => {
          validateCategoryName(trimmed);
        }, 500);
      } else {
        resetNameValidation();
      }
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (name) => {
    const value = formData[name];
    let error = "";

    switch (name) {
      case "nombre":
        if (!value || !value.trim()) {
          error = "El nombre es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        }
        break;
      case "estado":
        if (!value || value === "") {
          error = "Debes seleccionar un estado";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setTouched({
      nombre: true,
      estado: isEditing ? true : false,
    });

    const nombreError = validateField("nombre");
    const estadoError = isEditing ? validateField("estado") : "";

    if (nombreError || estadoError || nameValidation.isDuplicate) {
      return;
    }

    // Si está editando y tiene materiales asociados, mostrar confirmación
    if (isEditing && category?.materialsCount > 0) {
      const result = await showConfirmAlert(
        "¿Continuar con la edición?",
        "Esta categoría tiene materiales asociados. Cambiar su nombre podría afectar la clasificación actual.",
        {
          confirmButtonText: "Sí, continuar",
          cancelButtonText: "Cancelar",
        },
      );

      if (!result.isConfirmed) {
        return;
      }
    }

    setLoading(true);

    try {
      const categoryData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        estado: formData.estado,
      };

      const success = await onSave(categoryData, category?.id);

      if (success) {
        handleClose();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      estado: "Activo",
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              onClick={handleClose}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
              {isEditing ? "Editar Categoría" : "Crear Categoría de Material"}
            </h2>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nombre */}
              <div>
                <FormField
                  label="Nombre de la Categoría"
                  name="nombre"
                  type="text"
                  placeholder="Implementos de Entrenamiento"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur("nombre")}
                  error={
                    errors.nombre ||
                    (nameValidation.isDuplicate ? nameValidation.message : "")
                  }
                  touched={touched.nombre}
                  required
                />
                {nameValidation.isChecking && (
                  <p className="mt-1 text-gray-500 text-xs flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                    <span>Verificando disponibilidad...</span>
                  </p>
                )}
                {nameValidation.isAvailable &&
                  !nameValidation.isDuplicate &&
                  formData.nombre.trim().length >= 3 && (
                    <p className="mt-1 text-green-600 text-xs flex items-center gap-1">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full border border-green-500 text-[10px] leading-none">
                        ✓
                      </span>
                      <span>Nombre disponible</span>
                    </p>
                  )}
              </div>

              {/* Descripción */}
              <div>
                <FormField
                  label="Descripción"
                  name="descripcion"
                  type="textarea"
                  placeholder="Describe qué tipo de materiales incluye esta categoría"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

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
                    onBlur={() => handleBlur("estado")}
                    error={errors.estado}
                    touched={touched.estado}
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
                {loading
                  ? isEditing
                    ? "Guardando..."
                    : "Creando..."
                  : isEditing
                    ? "Guardar Cambios"
                    : "Crear Categoría"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default CategoryModal;

