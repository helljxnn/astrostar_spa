// SportsCategoryModal.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  useFormSportsCategoryValidation,
  sportsCategoryValidationRules,
} from "../hooks/useFormSportsCategoryValidation";
import useSportsCategoryNameValidation from "../hooks/useSportsCategoryNameValidation";
import { useSportsCategories } from "../hooks/useSportsCategories";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/Alerts";

const MAX_FILE_SIZE_MB = 5;

const SportsCategoryModal = ({
  isOpen,
  onClose,
  category = null,
  isNew = true,
}) => {
  const initialForm = {
    nombre: "",
    edadMinima: "",
    edadMaxima: "",
    descripcion: "",
    archivo: null,
    estado: "Activo",
    publicar: false,
  };

  const [fileName, setFileName] = useState(
    "No se ha seleccionado ningun archivo"
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [initialName, setInitialName] = useState("");
  const [persistedImageUrl, setPersistedImageUrl] = useState("");
  const debounceRef = useRef(null);

  const shouldRequireFile = isNew || !persistedImageUrl;
  const validationRules = {
    ...sportsCategoryValidationRules,
    archivo: {
      ...sportsCategoryValidationRules.archivo,
      required: shouldRequireFile,
    },
  };

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
  } = useFormSportsCategoryValidation(initialForm, validationRules);

  const {
    nameValidation,
    validateCategoryName,
    validateCategoryNameSync,
    resetNameValidation,
  } = useSportsCategoryNameValidation(category?.id || null);

  const { createSportsCategory, updateSportsCategory } = useSportsCategories();

  useEffect(() => {
    if (!isOpen) return;

    clearValidation();
    resetNameValidation();
    setErrors({});
    setIsSubmitting(false);

    if (category && !isNew) {
      const existingImage =
        category.fileUrl ?? category.imageUrl ?? category.archivo ?? "";
      const incomingName = category.name ?? category.nombre ?? "";

      setValues({
        nombre: incomingName,
        edadMinima: String(category.minAge ?? category.edadMinima ?? ""),
        edadMaxima: String(category.maxAge ?? category.edadMaxima ?? ""),
        descripcion: category.description ?? category.descripcion ?? "",
        archivo: null,
        estado: category.status ?? "Activo",
        publicar: Boolean(category.publish ?? category.publicar),
      });

      setInitialName(incomingName);
      setPersistedImageUrl(existingImage);
      setFileName(
        category.fileName ??
          (existingImage
            ? "Imagen actual"
            : "No se ha seleccionado ningun archivo")
      );
      setPreviewUrl(existingImage);
    } else {
      setValues(initialForm);
      setInitialName("");
      setPersistedImageUrl("");
      setFileName("No se ha seleccionado ningun archivo");
      setPreviewUrl("");
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, category, isNew]);

  const handleNameChange = (val) => {
    handleChange("nombre", val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = String(val || "").trim();
      const currentInitial = (initialName || "").trim().toLowerCase();

      if (!isNew && trimmed.toLowerCase() === currentInitial) {
        resetNameValidation();
        return;
      }

      if (trimmed.length > 2) validateCategoryName(trimmed);
      else resetNameValidation();
    }, 450);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      if (f.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
        showErrorAlert(
          "Archivo muy pesado",
          `La imagen supera ${MAX_FILE_SIZE_MB}MB.`
        );
        e.target.value = "";
        setFileName("No se ha seleccionado ningun archivo");
        handleChange("archivo", null);
        setPreviewUrl("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(f);
    }
    handleChange("archivo", f);
    setFileName(f ? f.name : "No se ha seleccionado ningun archivo");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = (values.nombre || "").trim();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      showErrorAlert(
        "Formulario incompleto",
        "Revisa los campos obligatorios."
      );
      return;
    }

    if (!trimmedName) {
      showErrorAlert(
        "Nombre requerido",
        "El nombre de la categoria es obligatorio."
      );
      return;
    }

    if (nameValidation.isDuplicate) {
      showErrorAlert("Nombre duplicado", "Este nombre ya existe.");
      return;
    }

    const minA = parseInt(values.edadMinima, 10);
    const maxA = parseInt(values.edadMaxima, 10);
    if (Number.isNaN(minA) || Number.isNaN(maxA) || minA >= maxA) {
      showErrorAlert(
        "Error en edades",
        "Edad maxima debe ser mayor que la minima."
      );
      return;
    }

    const shouldValidateNameRemotely =
      isNew ||
      trimmedName.toLowerCase() !== (initialName || "").trim().toLowerCase();

    if (shouldValidateNameRemotely) {
      try {
        const sync = await validateCategoryNameSync(trimmedName);
        if (!sync.available) {
          showErrorAlert("Nombre duplicado", sync.message || "Nombre en uso");
          return;
        }
      } catch (validationError) {
        console.warn("Name validation skipped due to error:", validationError);
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("description", (values.descripcion || "").trim());
      formData.append("minAge", minA);
      formData.append("maxAge", maxA);
      formData.append("status", values.estado || "Activo");
      formData.append("publicar", values.publicar ? "true" : "false");

      if (values.archivo instanceof File) {
        formData.append("file", values.archivo);
      }

      if (isNew) {
        await createSportsCategory(formData, { page: 1, limit: 10 });
      } else {
        await updateSportsCategory(category.id, formData, {
          page: 1,
          limit: 10,
        });
      }

      showSuccessAlert(isNew ? "Categoria creada" : "Categoria actualizada");
      onClose();
    } catch (err) {
      console.error("handleSubmit error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo guardar la categoria. Revisa los campos.";
      showErrorAlert("Error al guardar", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTrimmedName = (values.nombre || "").trim();
  const isNameTooShort =
    currentTrimmedName.length > 0 && currentTrimmedName.length < 3;
  const descripcionLength = (values.descripcion || "").length;
  const nameStatus = (() => {
    if (nameValidation.isChecking) return "checking";
    if (errors.nombre || nameValidation.isDuplicate || isNameTooShort)
      return "error";
    if (nameValidation.isAvailable && currentTrimmedName.length >= 3)
      return "success";
    return "neutral";
  })();
  const nameInputStates = {
    checking:
      "border-primary-purple ring-2 ring-primary-purple/20 bg-purple-50",
    error: "border-red-400 ring-2 ring-red-100 bg-red-50",
    success: "border-green-500 ring-2 ring-green-100 bg-green-50",
    neutral:
      "border-gray-300 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30 bg-gray-50",
  };
  const nameInputClass = nameInputStates[nameStatus] || nameInputStates.neutral;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-3">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden border border-gray-100"
      >
        <div className="relative px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-[#8aa9ff] text-center">
            {isNew ? "Crear Categoria Deportiva" : "Editar Categoria Deportiva"}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-2xl font-bold transition"
            aria-label="Cerrar"
            type="button"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Nombre categoria *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={values.nombre}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={() => handleBlur("nombre")}
                  placeholder="Ej: Infantil A"
                  className={`w-full rounded-xl px-4 py-3 text-sm pr-11 transition-all duration-150 outline-none border bg-gray-50 ${nameInputClass}`}
                />
                {nameValidation.isChecking && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></span>
                )}
                {nameValidation.isDuplicate && !isNameTooShort && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-lg font-semibold">
                    Ɵ?
                  </span>
                )}
                {!nameValidation.isDuplicate &&
                  nameValidation.isAvailable &&
                  currentTrimmedName.length >= 3 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-lg font-semibold">
                      Ɵ?"
                    </span>
                  )}
              </div>
              <div className="space-y-1 text-xs mt-1">
                {nameValidation.isChecking && (
                  <p className="flex items-center gap-2 text-primary-purple font-medium">
                    <span className="w-3 h-3 border-2 border-primary-purple border-t-transparent rounded-full animate-spin"></span>
                    Verificando disponibilidad...
                  </p>
                )}
                {isNameTooShort && (
                  <p className="flex items-center gap-2 text-yellow-700">
                    <span className="text-base leading-none">!</span>
                    Debe tener minimo 3 caracteres.
                  </p>
                )}
                {errors.nombre && (
                  <p className="text-red-500">Aviso: {errors.nombre}</p>
                )}
                {nameValidation.isDuplicate && !isNameTooShort && (
                  <p className="flex items-center gap-2 text-red-600 font-semibold">
                    <span className="text-lg leading-none">Ɵ?</span>
                    {nameValidation.message || "Nombre no disponible"}
                  </p>
                )}
                {!nameValidation.isDuplicate &&
                  nameValidation.isAvailable &&
                  currentTrimmedName.length >= 3 && (
                    <p className="flex items-center gap-2 text-green-600 font-semibold">
                      <span className="text-lg leading-none">Ɵ?"</span>
                      {nameValidation.message || "Nombre disponible"}
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Edad minima *
              </label>
              <input
                type="number"
                value={values.edadMinima}
                onChange={(e) => handleChange("edadMinima", e.target.value)}
                onBlur={() => handleBlur("edadMinima")}
                placeholder="Ej: 10"
                className={`w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 ${
                  errors.edadMinima
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30"
                }`}
              />
              {values.edadMinima &&
                values.edadMaxima &&
                parseInt(values.edadMinima, 10) >=
                  parseInt(values.edadMaxima, 10) && (
                  <p className="text-red-500 text-xs mt-1">
                    Aviso: Edad maxima debe ser mayor que minima
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Edad maxima *
              </label>
              <input
                type="number"
                value={values.edadMaxima}
                onChange={(e) => handleChange("edadMaxima", e.target.value)}
                onBlur={() => handleBlur("edadMaxima")}
                placeholder="Ej: 15"
                className={`w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 ${
                  errors.edadMaxima
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30"
                }`}
              />
              {values.edadMinima &&
                values.edadMaxima &&
                parseInt(values.edadMinima, 10) >=
                  parseInt(values.edadMaxima, 10) && (
                  <p className="text-red-500 text-xs mt-1">
                    Aviso: Edad maxima debe ser mayor que minima
                  </p>
                )}
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Descripcion *
              </label>
              <textarea
                value={values.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                onBlur={() => handleBlur("descripcion")}
                placeholder="Breve descripcion..."
                maxLength={200}
                className={`w-full border rounded-xl px-4 py-3 min-h-[95px] text-sm resize-none bg-gray-50 ${
                  errors.descripcion
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30"
                }`}
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Maximo 200 caracteres</span>
                <span>{descripcionLength}/200</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Subir imagen {shouldRequireFile ? "*" : "(opcional en edicion)"}
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer bg-[#74D5F4] text-white px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-[#5fc4e3] transition">
                  Elegir archivo
                  <input
                    type="file"
                    name="archivo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-600 truncate">
                  {fileName}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Tamano maximo: {MAX_FILE_SIZE_MB}MB. Si no cambias la imagen se
                mantiene la actual.
              </span>
              {previewUrl && (
                <div className="w-full h-32 rounded-lg border overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {values.archivo &&
                values.archivo.size / (1024 * 1024) > MAX_FILE_SIZE_MB && (
                  <p className="text-red-500 text-xs">
                    Aviso: La imagen supera {MAX_FILE_SIZE_MB}MB
                  </p>
                )}
            </div>

            {!isNew && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Estado *
                </label>
                <select
                  value={values.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div
            className={`mt-3 p-4 rounded-lg border flex items-start gap-3 ${
              values.publicar ? "bg-green-50 border-green-200" : "bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={values.publicar}
              onChange={(e) => handleChange("publicar", e.target.checked)}
              className="mt-1 w-4 h-4"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {values.publicar
                  ? "Publicada en landing"
                  : "Publicar categoria inmediatamente"}
              </p>
              <p className="text-xs text-gray-600">
                Al activarlo la categoria se mostrara en la landing.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold border border-gray-300 shadow-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#74D5F4] text-white font-semibold hover:bg-[#5fc4e3] disabled:opacity-70 shadow-sm"
            >
              {isSubmitting
                ? "Guardando..."
                : isNew
                ? "Crear Categoria"
                : "Actualizar Categoria"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SportsCategoryModal;
