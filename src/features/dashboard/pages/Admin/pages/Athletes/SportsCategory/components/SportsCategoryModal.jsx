// SportsCategoryModal.jsx
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  useFormSportsCategoryValidation,
  sportsCategoryValidationRules,
} from "../hooks/useFormSportsCategoryValidation";
import useSportsCategoryNameValidation from "../hooks/useSportsCategoryNameValidation";
import { useSportsCategories } from "../hooks/useSportsCategories";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts.js";

const MAX_FILE_SIZE_MB = 5;
const AGE_MIN = 5;
const AGE_MAX = 30;

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
    "No se ha seleccionado ningun archivo",
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
            : "No se ha seleccionado ningun archivo"),
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
          `La imagen supera ${MAX_FILE_SIZE_MB}MB.`,
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
        "Revisa los campos obligatorios.",
      );
      return;
    }

    if (!trimmedName) {
      showErrorAlert(
        "Nombre requerido",
        "El nombre de la categoria es obligatorio.",
      );
      return;
    }

    if (nameValidation.isDuplicate) {
      showErrorAlert("Nombre duplicado", "Este nombre ya existe.");
      return;
    }

    const minA = parseInt(values.edadMinima, 10);
    const maxA = parseInt(values.edadMaxima, 10);
    if (Number.isNaN(minA) || Number.isNaN(maxA)) {
      showErrorAlert("Error en edades", "Las edades deben ser numericas.");
      return;
    }

    if (minA < AGE_MIN) {
      showErrorAlert(
        "Edad minima invalida",
        `La edad minima debe ser mayor o igual a ${AGE_MIN} años.`
      );
      return;
    }

    if (maxA > AGE_MAX) {
      showErrorAlert(
        "Edad maxima invalida",
        `La edad maxima debe ser menor o igual a ${AGE_MAX} años.`
      );
      return;
    }

    if (minA >= maxA) {
      showErrorAlert(
        "Error en edades",
        "Edad maxima debe ser mayor que la minima.",
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
  const minAgeValue =
    values.edadMinima === "" || values.edadMinima === null
      ? null
      : Number(values.edadMinima);
  const maxAgeValue =
    values.edadMaxima === "" || values.edadMaxima === null
      ? null
      : Number(values.edadMaxima);
  const minAgeLimit = Number.isFinite(maxAgeValue)
    ? Math.max(AGE_MIN, maxAgeValue - 1)
    : AGE_MAX - 1;
  const maxAgeLimit = Number.isFinite(minAgeValue)
    ? Math.min(AGE_MAX, minAgeValue + 1)
    : AGE_MIN + 1;
  const isMinTooLow =
    Number.isFinite(minAgeValue) && minAgeValue < AGE_MIN;
  const isMaxTooHigh =
    Number.isFinite(maxAgeValue) && maxAgeValue > AGE_MAX;
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

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 px-3"
      style={{ zIndex: 10000 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl overflow-hidden border border-gray-100"
        style={{ zIndex: 10001 }}
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
          <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">
                    Datos principales
                  </p>
                  <span className="text-xs text-gray-500">
                    Campos obligatorios *
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Nombre de categoría *
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
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <FaTimesCircle size={18} aria-hidden="true" />
                      </span>
                    )}
                    {!nameValidation.isDuplicate &&
                      nameValidation.isAvailable &&
                      currentTrimmedName.length >= 3 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                          <FaCheckCircle size={18} aria-hidden="true" />
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
                        Debe tener mínimo 3 caracteres.
                      </p>
                    )}
                    {errors.nombre && (
                      <p className="text-red-500">Aviso: {errors.nombre}</p>
                    )}
                    {nameValidation.isDuplicate && !isNameTooShort && (
                      <p className="flex items-center gap-2 text-red-600 font-semibold">
                        <FaTimesCircle size={16} aria-hidden="true" />
                        {nameValidation.message || "Nombre no disponible"}
                      </p>
                    )}
                    {!nameValidation.isDuplicate &&
                      nameValidation.isAvailable &&
                      currentTrimmedName.length >= 3 && (
                        <p className="flex items-center gap-2 text-green-600 font-semibold">
                          <FaCheckCircle size={16} aria-hidden="true" />
                          {nameValidation.message || "Nombre disponible"}
                        </p>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Descripción *
                  </label>
                  <textarea
                    value={values.descripcion}
                    onChange={(e) => handleChange("descripcion", e.target.value)}
                    onBlur={() => handleBlur("descripcion")}
                    placeholder="Breve descripción..."
                    maxLength={200}
                    className={`w-full border rounded-xl px-4 py-3 min-h-[95px] text-sm resize-none bg-gray-50 ${
                      errors.descripcion
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30"
                    }`}
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Máximo 200 caracteres</span>
                    <span>{descripcionLength}/200</span>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border px-4 py-4 bg-white shadow-sm ${
                  errors.edadMinima || errors.edadMaxima
                    ? "border-red-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Rango de edades *
                    </p>
                    <p className="text-xs text-gray-500">
                      Selecciona edad mínima y máxima
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      Number.isFinite(minAgeValue) &&
                      Number.isFinite(maxAgeValue)
                        ? "bg-[#c8a9ff]/20 text-[#7f63ff] border-[#c8a9ff]/50"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {Number.isFinite(minAgeValue) &&
                    Number.isFinite(maxAgeValue)
                      ? `${minAgeValue} - ${maxAgeValue} años`
                      : "Sin rango"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Edad mínima *
                    </label>
                    <input
                      type="number"
                      name="edadMinima"
                      min={AGE_MIN}
                      max={minAgeLimit}
                      step="1"
                      value={values.edadMinima ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    placeholder={`Mínimo ${AGE_MIN}`}
                      className={`w-full border rounded-xl px-3 py-3 text-sm bg-gray-50 ${
                        errors.edadMinima || isMinTooLow
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30"
                      }`}
                    />
                    <p className="text-xs text-gray-500">
                      Mínimo permitido: {AGE_MIN} años
                    </p>
                    {isMinTooLow && (
                      <p className="text-red-500 text-xs mt-1">
                        La edad mínima debe ser mayor o igual a {AGE_MIN} años.
                      </p>
                    )}
                    {errors.edadMinima && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.edadMinima}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Edad máxima *
                    </label>
                    <input
                      type="number"
                      name="edadMaxima"
                      min={maxAgeLimit}
                      max={AGE_MAX}
                      step="1"
                      value={values.edadMaxima ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    placeholder={`Máximo ${AGE_MAX}`}
                      className={`w-full border rounded-xl px-3 py-3 text-sm bg-gray-50 ${
                        errors.edadMaxima || isMaxTooHigh
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 focus:border-[#7cafff] focus:ring-2 focus:ring-[#7cafff]/30"
                      }`}
                    />
                    <p className="text-xs text-gray-500">
                      Máximo permitido: {AGE_MAX} años
                    </p>
                    {isMaxTooHigh && (
                      <p className="text-red-500 text-xs mt-1">
                        La edad máxima debe ser menor o igual a {AGE_MAX} años.
                      </p>
                    )}
                    {errors.edadMaxima && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.edadMaxima}
                      </p>
                    )}
                  </div>
                </div>

                {values.edadMinima &&
                  values.edadMaxima &&
                  parseInt(values.edadMinima, 10) >=
                    parseInt(values.edadMaxima, 10) && (
                    <p className="text-red-500 text-xs mt-2">
                      Aviso: Edad máxima debe ser mayor que mínima
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
                <label className="block font-medium text-gray-700">
                  Subir imagen
                  {shouldRequireFile ? "*" : "(opcional en edicion)"}
                </label>
                <label className="group border-2 border-dashed border-purple-300 bg-purple-50 rounded-xl px-4 py-5 text-center cursor-pointer transition hover:bg-purple-100 w-full flex flex-col items-center justify-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="32"
                    viewBox="0 0 640 512"
                    fill="#a78bfa"
                  >
                    <path
                      d="M144 480C64.5 480 0 415.5 0 336c0-62.8 
                    40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1
                    c0-88.4 71.6-160 160-160c59.3 0 111 
                    32.2 138.7 80.2C409.9 102 428.3 96 
                    448 96c53 0 96 43 96 96c0 12.2-2.3 
                    23.8-6.4 34.6C596 238.4 640 290.1 
                    640 352c0 70.7-57.3 128-128 
                    128H144zm79-217c-9.4 9.4-9.4 24.6 
                    0 33.9s24.6 9.4 33.9 0l39-39V392c0 
                    13.3 10.7 24 24 24s24-10.7 
                    24-24V257.9l39 39c9.4 9.4 24.6 
                    9.4 33.9 0s9.4-24.6 0-33.9l-80-80
                    c-9.4-9.4-24.6-9.4-33.9 
                    0l-80 80z"
                    />
                  </svg>
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    Arrastra una imagen aqui
                    <br />
                    <span className="text-purple-500 underline">
                      o selecciona archivo
                    </span>
                  </p>
                  <input
                    type="file"
                    name="archivo"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-500">
                  Tamaño máximo: {MAX_FILE_SIZE_MB}MB. Si no cambias la imagen se
                  mantiene la actual.
                </span>
                {(previewUrl || values.archivo) && (
                  <div className="flex items-center gap-3 bg-purple-100 text-purple-900 px-3 py-2 rounded-lg text-xs w-full">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Vista previa"
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <span className="truncate font-medium">{fileName}</span>
                  </div>
                )}
                {values.archivo &&
                  values.archivo.size / (1024 * 1024) > MAX_FILE_SIZE_MB && (
                    <p className="text-red-500 text-xs">
                      Aviso: La imagen supera {MAX_FILE_SIZE_MB}MB
                    </p>
                  )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Publicar categoria
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("publicar", !values.publicar)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full
                      transition-colors duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2
                      ${values.publicar ? "bg-primary-purple" : "bg-gray-300"}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white
                        transition-transform duration-200 ease-in-out
                        ${values.publicar ? "translate-x-6" : "translate-x-1"}
                      `}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      values.publicar ? "text-primary-purple" : "text-gray-500"
                    }`}
                  >
                    {values.publicar
                      ? "Visible para todos"
                      : "Solo visible para administradores"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {values.publicar
                    ? "La categoria sera visible en la pagina publica"
                    : "La categoria solo sera visible en el panel de administracion"}
                </p>
              </div>

              {!isNew && (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
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

  return createPortal(modalContent, document.body);
};

export default SportsCategoryModal;



