import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

/* ========================================================== */
/* HOOKS DE VALIDACIÓN */
/* ========================================================== */
import {
  useFormSportsCategoryValidation,
  sportsCategoryValidationRules,
} from "../hooks/useFormSportsCategoryValidation";
import { useSportsCategoryNameValidation } from "../hooks/useSportsCategoryNameValidation";

/* ========================================================== */
/* HOOK PRINCIPAL (para submit final) */
/* ========================================================== */
import useSportsCategories from "../hooks/useSportsCategories";

/* ========================================================== */
/* UTILIDADES */
/* ========================================================== */
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/Alerts";

/* ========================================================== */
/* CONSTANTES */
/* ========================================================== */
const MAX_FILE_SIZE_MB = 5;

/* ========================================================== */
/* COMPONENTE PRINCIPAL */
/* ========================================================== */
const SportsCategoryModal = ({
  isOpen,
  onClose,
  category = null,
  isNew = true,
}) => {
  /* ========================================================== */
  /* ESTADO INICIAL DEL FORMULARIO */
  /* ========================================================== */
  const initialForm = {
    nombre: "",
    edadMinima: "",
    edadMaxima: "",
    descripcion: "",
    archivo: null,
    estado: "Active",
    publicar: false,
  };

  /* ========================================================== */
  /* HOOKS */
  /* ========================================================== */
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAllFields,
    touchAllFields,
    setValues,
    setErrors,
  } = useFormSportsCategoryValidation(initialForm, sportsCategoryValidationRules);

  const {
    nameValidation,
    validateCategoryName,
    validateCategoryNameSync,
    resetForm,
  } = useSportsCategoryNameValidation(category?.id);

  // ✅ Hook principal — solo para operaciones de guardado (create/update)
  const { createSportsCategory, updateSportsCategory } = useSportsCategories();

  /* ========================================================== */
  /* ESTADOS LOCALES */
  /* ========================================================== */
  const [fileName, setFileName] = useState("No se ha seleccionado ningún archivo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ========================================================== */
  /* EFECTO: CARGAR DATOS EN EDICIÓN */
  /* ========================================================== */
  useEffect(() => {
    if (!isOpen) return;

    clearValidation();
    setErrors({});
    setIsSubmitting(false);

    if (category && !isNew) {
      // Modo edición
      setValues({
        nombre: category.name || category.nombre || "",
        edadMinima: String(category.minAge ?? category.edadMinima ?? ""),
        edadMaxima: String(category.maxAge ?? category.edadMaxima ?? ""),
        descripcion: category.description || category.descripcion || "",
        archivo: null,
        estado: category.status || category.estado || "Active",
        publicar: Boolean(category.publish ?? category.publicar),
      });
      setFileName(
        category.fileName || category.file || "No se ha seleccionado ningún archivo"
      );
    } else {
      // Modo creación
      setValues(initialForm);
      setFileName("No se ha seleccionado ningún archivo");
    }
  }, [isOpen, category, isNew, setValues, setErrors, clearValidation]);

  /* ========================================================== */
  /* HANDLERS */
  /* ========================================================== */

  const handleNameChange = useCallback(
    (value) => {
      handleChange("nombre", value);
      if (value.trim().length > 0) {
        validateCategoryName(value.trim());
      } else {
        clearValidation();
      }
    },
    [handleChange, validateCategoryName, clearValidation]
  );

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_SIZE_MB) {
        showErrorAlert(
          "Archivo muy pesado",
          `La imagen supera el límite de ${MAX_FILE_SIZE_MB}MB.`
        );
        e.target.value = "";
        setFileName("No se ha seleccionado ningún archivo");
        handleChange("archivo", null);
        return;
      }
    }

    handleChange("archivo", file);
    setFileName(file ? file.name : "No se ha seleccionado ningún archivo");
    handleBlur("archivo");
  }, [handleChange, handleBlur]);

  /* ------------------- SUBMIT ----------------------------- */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // 1. Validaciones básicas
      touchAllFields(values);
      if (!validateAllFields(values)) {
        showErrorAlert("Formulario incompleto", "Por favor revisa los campos obligatorios.");
        return;
      }

      // 2. Validar archivo en modo creación
      if (isNew && !(values.archivo instanceof File)) {
        showErrorAlert("Imagen requerida", "Debes subir una imagen para crear la categoría.");
        return;
      }

      // 3. ✅ VALIDACIÓN FINAL DE NOMBRE (usando el hook, no el servicio roto)
      if (values.nombre.trim().length >= 3) {
        try {
          const result = await validateCategoryNameSync(values.nombre.trim());
          if (!result.available) {
            showErrorAlert("Nombre duplicado", result.message);
            return;
          }
        } catch (err) {
          // Si falla, dejamos que el backend lo atrape (ya lo hace con 409)
          console.warn("Validación final falló — delegando al backend", err);
        }
      }

      // 4. Preparar FormData
      const formData = new FormData();
      formData.append("name", values.nombre.trim());
      formData.append("minAge", values.edadMinima);
      formData.append("maxAge", values.edadMaxima);
      formData.append("description", values.descripcion.trim());
      formData.append("status", values.estado);
      formData.append("publish", values.publicar ? "true" : "false");

      if (values.archivo instanceof File) {
        formData.append("file", values.archivo);
      }

      // 5. Guardar
      setIsSubmitting(true);
      try {
        if (isNew) {
          await createSportsCategory(formData, { page: 1, limit: 10 });
        } else {
          await updateSportsCategory(category.id, formData, { page: 1, limit: 10 });
        }

        showSuccessAlert(
          isNew ? "Categoría creada" : "Categoría actualizada",
          "La operación se realizó correctamente."
        );
        onClose();
      } catch (error) {
        // Manejo de errores del backend (incluyendo 409)
        const msg = error.response?.data?.message || "No se pudo guardar la categoría.";
        showErrorAlert("Error", msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      values,
      isNew,
      category?.id,
      validateCategoryNameSync,
      createSportsCategory,
      updateSportsCategory,
      onClose,
      touchAllFields,
      validateAllFields,
      showErrorAlert,
      showSuccessAlert,
    ]
  );

  /* ========================================================== */
  /* RENDERIZADO */
  /* ========================================================== */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-[18px] shadow-xl p-8 w-full max-w-5xl overflow-y-auto max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-7">
          <h2 className="text-[32px] font-bold text-[#9BE9FF]">
            {isNew ? "Crear Categoría Deportiva" : "Editar Categoría Deportiva"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9c7df5] hover:text-[#7a5be9] text-3xl font-bold transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NOMBRE */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Nombre categoría *
              </label>
              <input
                type="text"
                value={values.nombre}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => handleBlur("nombre")}
                placeholder="Ej: Infantil A"
                disabled={isSubmitting}
                className={`w-full border rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.nombre || nameValidation.isDuplicate
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.nombre}
                </p>
              )}
              {nameValidation.isChecking && (
                <p className="text-blue-500 text-xs mt-1 flex items-center gap-1">
                  <span className="animate-pulse">🔄</span> Verificando nombre...
                </p>
              )}
              {nameValidation.isDuplicate && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>❌</span> {nameValidation.message}
                </p>
              )}
              {nameValidation.isAvailable && !errors.nombre && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                  <span>✓</span> Nombre disponible
                </p>
              )}
            </div>

            {/* EDAD MÍNIMA */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Edad mínima *
              </label>
              <input
                type="number"
                value={values.edadMinima}
                onChange={(e) => handleChange("edadMinima", e.target.value)}
                onBlur={() => handleBlur("edadMinima")}
                placeholder="Ej: 10"
                min="5"
                disabled={isSubmitting}
                className={`w-full border rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.edadMinima ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.edadMinima && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.edadMinima}
                </p>
              )}
            </div>

            {/* EDAD MÁXIMA */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Edad máxima *
              </label>
              <input
                type="number"
                value={values.edadMaxima}
                onChange={(e) => handleChange("edadMaxima", e.target.value)}
                onBlur={() => handleBlur("edadMaxima")}
                placeholder="Ej: 15"
                disabled={isSubmitting}
                className={`w-full border rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.edadMaxima ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.edadMaxima && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.edadMaxima}
                </p>
              )}
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Descripción *
              </label>
              <textarea
                value={values.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                onBlur={() => handleBlur("descripcion")}
                placeholder="Breve descripción de la categoría..."
                disabled={isSubmitting}
                className={`w-full border rounded-xl px-4 py-3 min-h-[95px] text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  errors.descripcion ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.descripcion}
                </p>
              )}
            </div>

            {/* IMAGEN */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Subir imagen *
              </label>
              <label
                className={`${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                } bg-[#74D5F4] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#5fc4e3] transition-all shadow-sm hover:shadow-md w-fit`}
              >
                <span className="flex items-center gap-2">
                  📁 Elegir archivo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
              </label>
              <span className="text-xs mt-2 text-gray-600 truncate max-w-full">
                {fileName}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Tamaño máximo: {MAX_FILE_SIZE_MB}MB
              </span>
              {errors.archivo && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.archivo}
                </p>
              )}
            </div>

            {/* ESTADO */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Estado *
              </label>
              <select
                value={values.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                onBlur={() => handleBlur("estado")}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo</option>
              </select>
              {errors.estado && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.estado}
                </p>
              )}
            </div>
          </div>

          {/* PUBLICAR */}
          <div className="flex items-center gap-3 mt-6 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="publicar"
              checked={values.publicar}
              onChange={(e) => handleChange("publicar", e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="publicar" className="text-sm text-gray-700 cursor-pointer">
              Publicar categoría inmediatamente
            </label>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors font-medium text-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#74D5F4] text-white font-semibold hover:bg-[#5fc4e3] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Guardando...
                </span>
              ) : (
                `✓ ${isNew ? "Crear Categoría" : "Actualizar Categoría"}`
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SportsCategoryModal;