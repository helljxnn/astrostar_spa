import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { showSuccessAlert } from "../../../../../../../../shared/utils/alerts";
import {
  useFormSportsCategoryValidation,
  sportsCategoryValidationRules,
} from "../hooks/useFormSportsCategoryValidation";

const SportsCategoryModal = ({ isOpen, onClose, onSave, category, isNew = true }) => {
  // Estado inicial del formulario
  const initialForm = {
    nombreCategoria: "",
    edadMinima: "",
    edadMaxima: "",
    descripcion: "",
    archivo: null,
    estado: "",
    publicar: false,
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    touchAllFields,
    setValues,
  } = useFormSportsCategoryValidation(initialForm, sportsCategoryValidationRules);

  // Prellenar solo si estamos editando
  useEffect(() => {
    if (!isNew && category) {
      const editForm = {
        nombreCategoria: category.Nombre || category.nombreCategoria || "",
        edadMinima: category.EdadMinima || category.edadMinima || "",
        edadMaxima: category.EdadMaxima || category.edadMaxima || "",
        descripcion: category.Descripcion || category.descripcion || "",
        archivo: category.Archivo || category.archivo || null,
        estado: category.Estado || category.estado || "",
        publicar: category.Publicar || category.publicar || false,
      };
      setValues(editForm);
    } else {
      // Resetear formulario para nuevo registro
      setValues(initialForm);
    }
  }, [category, isNew, isOpen, setValues]);

  // Manejar archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleChange("archivo", file);
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e && e.preventDefault();
    
    console.log("Valores actuales del formulario:", values);
    
    // Marcar todos los campos como tocados y validar
    touchAllFields(values);
    
    // Esperar un momento para que se actualice el estado de errores
    setTimeout(() => {
      console.log("Errores después de touchAllFields:", errors);
      
      // Validar todos los campos
      const isValid = validateAllFields(values);
      console.log("¿Es válido el formulario?", isValid);
      console.log("Errores finales:", errors);
      
      if (!isValid) {
        console.log("Formulario inválido - no se enviará");
        return;
      }

      console.log("Formulario válido - enviando datos");
      const categoryData = {
        Nombre: values.nombreCategoria,
        EdadMinima: parseInt(values.edadMinima),
        EdadMaxima: parseInt(values.edadMaxima),
        Descripcion: values.descripcion,
        Estado: values.estado,
        Publicar: values.publicar,
        Archivo: values.archivo,
        id: category?.id || Date.now(),
      };

      onSave(categoryData);
      onClose();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -60 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#9BE9FF]">
            {isNew ? "Crear Categoría Deportiva" : "Editar Categoría Deportiva"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ✖
          </button>
        </div>

        {/* Body - Formulario */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre categoría */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Nombre categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.nombreCategoria}
              onChange={(e) => handleChange("nombreCategoria", e.target.value)}
              onBlur={() => handleBlur("nombreCategoria")}
              placeholder="Nombre de la categoría"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BE9FF] focus:border-transparent"
            />
            {touched.nombreCategoria && errors.nombreCategoria && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⚠</span>
                <span className="text-red-500 text-sm">{errors.nombreCategoria}</span>
              </div>
            )}
          </div>

          {/* Edad mínima */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Edad mínima <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={values.edadMinima}
              onChange={(e) => handleChange("edadMinima", e.target.value)}
              onBlur={() => handleBlur("edadMinima")}
              placeholder="Edad mínima"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BE9FF] focus:border-transparent"
            />
            {touched.edadMinima && errors.edadMinima && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⚠</span>
                <span className="text-red-500 text-sm">{errors.edadMinima}</span>
              </div>
            )}
          </div>

          {/* Edad máxima */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Edad máxima <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={values.edadMaxima}
              onChange={(e) => handleChange("edadMaxima", e.target.value)}
              onBlur={() => handleBlur("edadMaxima")}
              placeholder="Edad máxima"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BE9FF] focus:border-transparent"
            />
            {touched.edadMaxima && errors.edadMaxima && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⚠</span>
                <span className="text-red-500 text-sm">{errors.edadMaxima}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={values.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              onBlur={() => handleBlur("descripcion")}
              placeholder="Descripción de la categoría"
              rows="3"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BE9FF] focus:border-transparent resize-none"
            />
            {touched.descripcion && errors.descripcion && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⚠</span>
                <span className="text-red-500 text-sm">{errors.descripcion}</span>
              </div>
            )}
          </div>

          {/* Subir archivo */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Subir archivo <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              onBlur={() => handleBlur("archivo")}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
                         file:rounded-full file:border-0 
                         file:text-sm file:font-semibold
                         file:bg-[#9BE9FF] file:text-gray-900 
                         hover:file:bg-[#80dfff] transition"
            />
            {touched.archivo && errors.archivo && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⚠</span>
                <span className="text-red-500 text-sm">{errors.archivo}</span>
              </div>
            )}
            {values.archivo && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-green-600"
              >
                {typeof values.archivo === 'object' ? values.archivo.name : values.archivo}
              </motion.span>
            )}
          </div>

          {/* Estado */}
          <div className="flex flex-col">
            <label className="mb-2 font-medium text-gray-700">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={values.estado}
              onChange={(e) => handleChange("estado", e.target.value)}
              onBlur={() => handleBlur("estado")}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9BE9FF] focus:border-transparent"
            >
              <option value="">Seleccione estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            {touched.estado && errors.estado && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⚠</span>
                <span className="text-red-500 text-sm">{errors.estado}</span>
              </div>
            )}
          </div>

          {/* Publicar */}
          <div className="flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              name="publicar"
              checked={values.publicar}
              onChange={(e) => handleChange("publicar", e.target.checked)}
              className="w-4 h-4 text-[#9BE9FF] focus:ring-[#9BE9FF] border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Publicar categoría
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-[#9BE9FF] text-gray-900 font-semibold hover:bg-[#80dfff] transition"
          >
            {isNew ? "Crear" : "Actualizar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SportsCategoryModal;