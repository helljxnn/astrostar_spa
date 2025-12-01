// SportsCategoryModal.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  useFormSportsCategoryValidation,
  sportsCategoryValidationRules,
} from "../hooks/useFormSportsCategoryValidation";
import useSportsCategoryNameValidation from "../hooks/useSportsCategoryNameValidation";
import { useSportsCategories } from "../hooks/useSportsCategories";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../../shared/utils/Alerts";

const MAX_FILE_SIZE_MB = 5;

const SportsCategoryModal = ({ isOpen, onClose, category = null, isNew = true }) => {
  // Estado inicial del formulario
  const initialForm = {
    nombre: "",
    edadMinima: "",
    edadMaxima: "",
    descripcion: "",
    archivo: null,
    estado: "Activo",
    publicar: false,
  };

  // Hooks de validación y gestión de formulario
  const {
    values,
    setValues,
    errors,
    setErrors,
    handleChange,
    handleBlur,
    validateForm,
    clearValidation,
    isSubmitting,
    setIsSubmitting,
  } = useFormSportsCategoryValidation(initialForm, sportsCategoryValidationRules);

  // Validación de nombre único
  const { nameValidation, validateCategoryName, validateCategoryNameSync, resetNameValidation } =
    useSportsCategoryNameValidation(category?.id || null);

  // Hooks para CRUD de categorías
  const { createSportsCategory, updateSportsCategory } = useSportsCategories();

  // Estado de archivo
  const [fileName, setFileName] = useState("No se ha seleccionado ningún archivo");
  const [previewUrl, setPreviewUrl] = useState("");
  const debounceRef = useRef(null);

  // Efecto al abrir/cerrar el modal
  useEffect(() => {
    if (!isOpen) return;

    clearValidation();
    resetNameValidation();
    setErrors({});
    setIsSubmitting(false);

    if (category && !isNew) {
      setValues({
        nombre: category.name ?? category.nombre ?? "",
        edadMinima: String(category.minAge ?? category.edadMinima ?? ""),
        edadMaxima: String(category.maxAge ?? category.edadMaxima ?? ""),
        descripcion: category.description ?? category.descripcion ?? "",
        archivo: null,
        estado: category.status ?? "Activo",
        publicar: Boolean(category.publish ?? category.publicar),
      });
      setFileName(category.fileName ?? "No se ha seleccionado ningún archivo");
      setPreviewUrl(category.fileUrl ?? category.imageUrl ?? "");
    } else {
      setValues(initialForm);
      setFileName("No se ha seleccionado ningún archivo");
      setPreviewUrl("");
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, category, isNew]);

  // Manejo de cambio de nombre con debounce
  const handleNameChange = (val) => {
    handleChange("nombre", val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = String(val || "").trim();
      if (trimmed.length > 2) validateCategoryName(trimmed);
      else resetNameValidation();
    }, 450);
  };

  // Manejo de archivo
  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      if (f.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
        showErrorAlert("Archivo muy pesado", `La imagen supera ${MAX_FILE_SIZE_MB}MB.`);
        e.target.value = "";
        setFileName("No se ha seleccionado ningún archivo");
        handleChange("archivo", null);
        setPreviewUrl("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(f);
    }
    handleChange("archivo", f);
    setFileName(f ? f.name : "No se ha seleccionado ningún archivo");
  };

  // ✅ Envío del formulario — ahora con FormData (subida desde backend)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones locales
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      showErrorAlert("Formulario incompleto", "Revisa los campos obligatorios");
      return;
    }

    if (nameValidation.isDuplicate) {
      showErrorAlert("Nombre duplicado", "Este nombre ya existe.");
      return;
    }

    const minA = parseInt(values.edadMinima);
    const maxA = parseInt(values.edadMaxima);
    if (isNaN(minA) || isNaN(maxA) || minA >= maxA) {
      showErrorAlert("Error en edades", "Edad máxima debe ser mayor que mínima.");
      return;
    }

    // Validación remota de nombre
    try {
      const sync = await validateCategoryNameSync(values.nombre.trim());
      if (!sync.available) {
        showErrorAlert("Nombre duplicado", sync.message || "Nombre en uso");
        return;
      }
    } catch {
      // fallback: continuar si la validación falla
    }

    setIsSubmitting(true);

    try {
      // ✅ FormData: el backend subirá la imagen usando sus credenciales de Cloudinary
      const formData = new FormData();
      formData.append("name", values.nombre.trim());
      formData.append("description", values.descripcion.trim());
      formData.append("minAge", minA);
      formData.append("maxAge", maxA);
      formData.append("status", values.estado || "Activo");
      formData.append("publicar", values.publicar ? "true" : "false");
      
      // ✅ CORREGIDO: "file" (no "image") para coincidir con upload.single('file')
      if (values.archivo instanceof File) {
        formData.append("file", values.archivo);
      }

      // Crear o actualizar
      if (isNew) {
        await createSportsCategory(formData, { page: 1, limit: 10 });
      } else {
        await updateSportsCategory(category.id, formData, { page: 1, limit: 10 });
      }

      showSuccessAlert(
        isNew ? "✅ Categoría creada" : "✅ Categoría actualizada",
        "Ahora se verá en la landing si está publicada."
      );
      onClose();
    } catch (err) {
      console.error("handleSubmit error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo guardar la categoría. Revisa los campos.";
      showErrorAlert("❌ Error al guardar", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render condicional
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-[18px] shadow-xl p-8 w-full max-w-5xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-7">
          <h2 className="text-[32px] font-bold text-[#9BE9FF]">
            {isNew ? "Crear Categoría Deportiva" : "Editar Categoría Deportiva"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9c7df5] hover:text-[#7a5be9] text-3xl font-bold"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
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
                className={`w-full border rounded-xl px-4 py-3 text-sm ${
                  errors.nombre ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">⚠ {errors.nombre}</p>}
              {values.nombre && values.nombre.trim().length > 0 && values.nombre.trim().length < 3 && (
                <p className="text-yellow-500 text-xs mt-1">⚠ Mínimo 3 caracteres</p>
              )}
              {nameValidation.isChecking && <p className="text-gray-500 text-xs mt-1">Comprobando nombre...</p>}
              {nameValidation.isDuplicate && <p className="text-red-500 text-xs mt-1">⚠ Este nombre ya existe</p>}
            </div>

            {/* Edad mínima */}
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
                className={`w-full border rounded-xl px-4 py-3 text-sm ${
                  errors.edadMinima ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {values.edadMinima && values.edadMaxima && parseInt(values.edadMinima) >= parseInt(values.edadMaxima) && (
                <p className="text-red-500 text-xs mt-1">⚠ Edad máxima debe ser mayor que mínima</p>
              )}
            </div>

            {/* Edad máxima */}
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
                className={`w-full border rounded-xl px-4 py-3 text-sm ${
                  errors.edadMaxima ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {values.edadMinima && values.edadMaxima && parseInt(values.edadMinima) >= parseInt(values.edadMaxima) && (
                <p className="text-red-500 text-xs mt-1">⚠ Edad máxima debe ser mayor que mínima</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Descripción *
              </label>
              <textarea
                value={values.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                onBlur={() => handleBlur("descripcion")}
                placeholder="Breve descripción..."
                className={`w-full border rounded-xl px-4 py-3 min-h-[95px] text-sm resize-none ${
                  errors.descripcion ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
            </div>

            {/* Imagen */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Subir imagen {isNew ? "*" : ""}
              </label>
              <label className="cursor-pointer bg-[#74D5F4] text-white px-5 py-2.5 rounded-lg text-sm w-fit">
                📁 Elegir archivo
                <input
                  type="file"
                  name="archivo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs mt-2 text-gray-600 truncate">{fileName}</span>
              <span className="text-xs text-gray-500 mt-1">
                Tamaño máximo: {MAX_FILE_SIZE_MB}MB
              </span>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border"
                />
              )}
              {values.archivo && values.archivo.size / (1024 * 1024) > MAX_FILE_SIZE_MB && (
                <p className="text-red-500 text-xs mt-1">⚠ La imagen supera {MAX_FILE_SIZE_MB}MB</p>
              )}
            </div>

            {/* Estado (solo en edición) */}
            {!isNew && (
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Estado *
                </label>
                <select
                  value={values.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          {/* Checkbox de publicación */}
          <div
            className={`flex items-center gap-3 mt-6 p-4 rounded-lg ${
              values.publicar ? "bg-green-50 border border-green-200" : "bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={values.publicar}
              onChange={(e) => handleChange("publicar", e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-sm">
              {values.publicar ? "✅ PUBLICADA EN LANDING" : "Publicar categoría inmediatamente"}
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#74D5F4] text-white font-semibold hover:bg-[#5fc4e3] disabled:opacity-70"
            >
              {isSubmitting ? "Guardando..." : isNew ? "Crear Categoría" : "Actualizar Categoría"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SportsCategoryModal;