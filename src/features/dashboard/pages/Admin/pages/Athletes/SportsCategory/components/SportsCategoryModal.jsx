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
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts.js";
import { fixMojibake } from "../../../../../../../../shared/utils/textEncoding.js";

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
    estado: "Activo",
  };

  const [initialName, setInitialName] = useState("");
  const debounceRef = useRef(null);

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
  } = useFormSportsCategoryValidation(
    initialForm,
    sportsCategoryValidationRules,
  );

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
      const incomingName = category.name ?? category.nombre ?? "";

      setValues({
        nombre: incomingName,
        edadMinima: String(category.minAge ?? category.edadMinima ?? ""),
        edadMaxima: String(category.maxAge ?? category.edadMaxima ?? ""),
        descripcion: category.description ?? category.descripcion ?? "",
        estado: category.status ?? "Activo",
      });

      setInitialName(incomingName);
    } else {
      setValues(initialForm);
      setInitialName("");
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
        `La edad minima debe ser mayor o igual a ${AGE_MIN} años.`,
      );
      return;
    }

    if (maxA > AGE_MAX) {
      showErrorAlert(
        "Edad maxima invalida",
        `La edad maxima debe ser menor o igual a ${AGE_MAX} años.`,
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
      } catch {
        // Si falla la validacion remota, se continua y el backend valida.
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

      if (isNew) {
        await createSportsCategory(formData, { page: 1, limit: 10 });
      } else {
        await updateSportsCategory(category.id, formData, {
          page: 1,
          limit: 10,
        });
      }

      onClose();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo guardar la categoria. Revisa los campos.";
      showErrorAlert("Error al guardar", fixMojibake(message));
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
  const isMinTooLow = Number.isFinite(minAgeValue) && minAgeValue < AGE_MIN;
  const isMaxTooHigh = Number.isFinite(maxAgeValue) && maxAgeValue > AGE_MAX;
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-100"
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
          <div className="grid grid-cols-1 gap-6">
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
                    onChange={(e) =>
                      handleChange("descripcion", e.target.value)
                    }
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
              className="px-6 py-2.5 rounded-xl bg-primary-blue text-white font-semibold hover:bg-primary-purple disabled:opacity-70 shadow-sm transition-colors"
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
