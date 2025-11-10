import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useFormSportsCategoryValidation,
  sportsCategoryValidationRules,
} from "../hooks/useFormSportsCategoryValidation";
import { useSportsCategoryNameValidation } from "../hooks/useSportsCategoryNameValidation";

const SportsCategoryModal = ({
  isOpen,
  onClose,
  onSave,
  category = null,
  isNew = true,
}) => {
  /* ---------- ESTADO INICIAL ---------- */
  const initialForm = {
    nombre: "",
    edadMinima: "",
    edadMaxima: "",
    descripcion: "",
    archivo: null,
    estado: "Active", // El backend requiere "Active"/"Inactive"
    publicar: false,
  };

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

  const [fileName, setFileName] = useState("No se ha seleccionado ningún archivo");

  const { checkNameUnique } = useSportsCategoryNameValidation();

  /* ---------- EFECTO: CARGA DE DATOS ---------- */
  useEffect(() => {
    if (!isOpen) return;

    if (category && !isNew) {
      const loadedValues = {
        nombre: category.name || category.nombre || "",
        edadMinima: String(category.minAge ?? category.edadMinima ?? ""),
        edadMaxima: String(category.maxAge ?? category.edadMaxima ?? ""),
        descripcion: category.description || category.descripcion || "",
        archivo: null,
        // Normaliza el estado al formato backend
        estado:
          category.status === "Inactive" || category.estado === "Inactive"
            ? "Inactive"
            : "Active",
        publicar: Boolean(category.publish ?? category.publicar ?? false),
      };

      setValues(loadedValues);
      setFileName(category.fileName || category.archivo || "No se ha seleccionado ningún archivo");
    } else {
      setValues(initialForm);
      setFileName("No se ha seleccionado ningún archivo");
    }
  }, [category, isNew, isOpen, setValues]);

  /* ---------- MANEJADORES ---------- */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleChange("archivo", file);
    setFileName(file ? file.name : "No se ha seleccionado ningún archivo");
  };

  const handleNameBlur = async () => {
    handleBlur("nombre");

    if (!values.nombre.trim()) return;
    if (!isNew && values.nombre === (category?.name || category?.nombre)) return;

    const exists = await checkNameUnique(values.nombre.trim());
    if (exists) {
      setErrors((prev) => ({
        ...prev,
        nombre: "Ya existe una categoría con este nombre",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    touchAllFields(values);
    if (!validateAllFields(values)) return;

    // ✅ Convertimos el estado antes de enviar (por si alguien lo cambia manualmente)
    const estadoBack = values.estado === "Activo" ? "Active" : values.estado === "Inactivo" ? "Inactive" : values.estado;

    const formData = new FormData();
    formData.append("name", values.nombre.trim());
    formData.append("minAge", values.edadMinima);
    formData.append("maxAge", values.edadMaxima);
    formData.append("description", values.descripcion.trim());
    formData.append("status", estadoBack);
    formData.append("publish", values.publicar ? "true" : "false");

    if (values.archivo instanceof File) {
      formData.append("file", values.archivo);
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  /* ---------- RENDER ---------- */
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-[18px] shadow-xl p-8 w-full max-w-5xl overflow-y-auto max-h-[90vh]"
      >
        {/* CABECERA */}
        <div className="flex justify-between items-center mb-7">
          <h2 className="text-[32px] font-bold text-[#9BE9FF]">
            {isNew ? "Crear Categoría Deportiva" : "Editar Categoría Deportiva"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9c7df5] hover:text-[#7a5be9] text-3xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="text-sm font-semibold">Nombre categoría *</label>
              <input
                type="text"
                placeholder="Ej: Infantil A"
                value={values.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onBlur={handleNameBlur}
                className={`w-full border ${errors.nombre ? "border-red-400" : "border-gray-300"} rounded-xl px-4 py-3 text-sm`}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            {/* Edad mínima */}
            <div>
              <label className="text-sm font-semibold">Edad mínima *</label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={values.edadMinima}
                onChange={(e) => handleChange("edadMinima", e.target.value)}
                onBlur={() => handleBlur("edadMinima")}
                className={`w-full border ${errors.edadMinima ? "border-red-400" : "border-gray-300"} rounded-xl px-4 py-3 text-sm`}
              />
              {errors.edadMinima && <p className="text-red-500 text-xs mt-1">{errors.edadMinima}</p>}
            </div>

            {/* Edad máxima */}
            <div>
              <label className="text-sm font-semibold">Edad máxima *</label>
              <input
                type="number"
                placeholder="Ej: 15"
                value={values.edadMaxima}
                onChange={(e) => handleChange("edadMaxima", e.target.value)}
                onBlur={() => handleBlur("edadMaxima")}
                className={`w-full border ${errors.edadMaxima ? "border-red-400" : "border-gray-300"} rounded-xl px-4 py-3 text-sm`}
              />
              {errors.edadMaxima && <p className="text-red-500 text-xs mt-1">{errors.edadMaxima}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label className="text-sm font-semibold">Descripción</label>
              <textarea
                placeholder="Breve descripción de la categoría..."
                value={values.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[95px] text-sm"
              />
            </div>

            {/* Archivo */}
            <div className="flex items-center gap-3 md:col-span-1">
              <label className="text-sm font-semibold w-full">
                Subir archivo (PNG, JPG) *
              </label>
              <label className="bg-[#74D5F4] hover:bg-[#5DCFF0] px-4 py-2 text-sm rounded-lg cursor-pointer text-white whitespace-nowrap">
                Elegir archivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-600">{fileName}</span>
            </div>

            {/* Estado */}
            <div>
              <label className="text-sm font-semibold">Estado *</label>
              <select
                value={values.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                onBlur={() => handleBlur("estado")}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"
              >
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo</option>
              </select>
              {errors.estado && <p className="text-red-500 text-xs mt-1">{errors.estado}</p>}
            </div>
          </div>

          {/* Publicar */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={values.publicar}
              onChange={(e) => handleChange("publicar", e.target.checked)}
            />
            <label className="text-sm text-gray-700">
              Publicar categoría (visible en portal público)
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#74D5F4] text-white font-semibold"
            >
              {isNew ? "Crear Categoría" : "Actualizar Categoría"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SportsCategoryModal;
