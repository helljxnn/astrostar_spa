import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormUserValidation, userValidationRules } from "../hooks/useFormUserValidation";
import { FormField } from "../../../../../../../shared/components/FormField";
import { showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/Alerts"; // Ruta corregida a 5 niveles

// Opciones para Tipo de Documento
const tiposDocumento = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "RC", label: "Registro Civil" },
];

// Opciones de estado
const estados = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const UserModal = ({ isOpen, onClose, onSave, roles }) => {
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
  } = useFormUserValidation(
    {
      nombre: "",
      tipoDocumento: "",
      identificacion: "",
      rol: "",
      correo: "",
      telefono: "",
      estado: "",
    },
    userValidationRules
  );

  // Manejo del submit con validaciones
  const handleSubmit = async () => {
    console.log("Validando formulario...", formData);
    const isValid = validateAllFields();
    console.log("Resultado de validación:", isValid, "Errores:", errors);
    if (isValid) {
      try {
        console.log("Guardando usuario...", formData);
        await onSave(formData);
        console.log("Mostrando alerta...");
        await showSuccessAlert("Usuario creado exitosamente", "El nuevo usuario ha sido registrado en el sistema.");
        console.log("Alerta cerrada, reseteando formulario...");
        resetForm();
        onClose();
      } catch (error) {
        console.error("Error en handleSubmit:", error);
        showErrorAlert("Error al crear usuario", "Hubo un problema al guardar el usuario. Por favor, inténtalo de nuevo.");
      }
    } else {
      console.log("Validación fallida, mostrando errores:", errors);
      showErrorAlert("Errores de validación", "Por favor, corrige los campos destacados para continuar.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={onClose} // 🔵 Cierra si das click en el fondo
>
  <motion.div
    className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
    initial={{ scale: 0.8, opacity: 0, y: 50 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.8, opacity: 0, y: 50 }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    onClick={(e) => e.stopPropagation()} // 🔵 Evita que el clic dentro cierre el modal
  >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Crear Usuario
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Campos del formulario */}
          <div className="space-y-4">
            <FormField
              label="Nombre"
              name="nombre"
              type="text"
              placeholder="Nombre del usuario"
              required
              value={formData.nombre}
              error={errors.nombre}
              touched={touched.nombre}
              onChange={(e) => {
                console.log("onChange nombre:", e.target.value); // Depuración
                handleChange(e);
              }}
              onBlur={(e) => {
                console.log("onBlur nombre:", e.target.name); // Depuración
                handleBlur(e);
              }}
              delay={0.1}
              labelClassName="text-blue-300 font-medium"
              inputClassName="border-purple-300 focus:border-primary-purple"
            />
            <FormField
              label="Tipo de documento"
              name="tipoDocumento"
              type="select"
              placeholder="Seleccionar tipo de documento"
              required
              options={tiposDocumento}
              value={formData.tipoDocumento}
              error={errors.tipoDocumento}
              touched={touched.tipoDocumento}
              onChange={(e) => {
                console.log("onChange tipoDocumento:", e.target.value); // Depuración
                handleChange(e);
              }}
              onBlur={(e) => {
                console.log("onBlur tipoDocumento:", e.target.name); // Depuración
                handleBlur(e);
              }}
              delay={0.2}
              labelClassName="text-blue-300 font-medium"
              inputClassName="border-purple-300 focus:border-primary-purple"
            />
            <FormField
              label="Identificación"
              name="identificacion"
              type="text"
              placeholder="Identificación del usuario"
              required
              value={formData.identificacion}
              error={errors.identificacion}
              touched={touched.identificacion}
              onChange={(e) => {
                console.log("onChange identificacion:", e.target.value); // Depuración
                handleChange(e);
              }}
              onBlur={(e) => {
                console.log("onBlur identificacion:", e.target.name); // Depuración
                handleBlur(e);
              }}
              delay={0.3}
              labelClassName="text-blue-300 font-medium"
              inputClassName="border-purple-300 focus:border-primary-purple"
            />
            <FormField
              label="Rol"
              name="rol"
              type="select"
              placeholder="Seleccionar rol"
              required
              options={roles.map((role) => ({ value: role.nombre, label: role.nombre }))}
              value={formData.rol}
              error={errors.rol}
              touched={touched.rol}
              onChange={(e) => {
                console.log("onChange rol:", e.target.value); // Depuración
                handleChange(e);
              }}
              onBlur={(e) => {
                console.log("onBlur rol:", e.target.name); // Depuración
                handleBlur(e);
              }}
              delay={0.4}
              labelClassName="text-blue-300 font-medium"
              inputClassName="border-purple-300 focus:border-primary-purple"
            />
            <FormField
              label="Correo"
              name="correo"
              type="email"
              placeholder="Correo del usuario"
              required
              value={formData.correo}
              error={errors.correo}
              touched={touched.correo}
              onChange={(e) => {
                console.log("onChange correo:", e.target.value); // Depuración
                handleChange(e);
              }}
              onBlur={(e) => {
                console.log("onBlur correo:", e.target.name); // Depuración
                handleBlur(e);
              }}
              delay={0.5}
              labelClassName="text-blue-300 font-medium"
              inputClassName="border-purple-300 focus:border-primary-purple"
            />
            <FormField
              label="Número telefónico"
              name="telefono"
              type="tel"
              placeholder="Número telefónico del usuario"
              required
              value={formData.telefono}
              error={errors.telefono}
              touched={touched.telefono}
              onChange={(e) => {
                console.log("onChange telefono:", e.target.value); // Depuración
                handleChange(e);
              }}
              onBlur={(e) => {
                console.log("onBlur telefono:", e.target.name); // Depuración
                handleBlur(e);
              }}
              delay={0.6}
              labelClassName="text-blue-300 font-medium"
              inputClassName="border-purple-300 focus:border-primary-purple"
            />
            <FormField
              label="Estado"
              name="estado"
              type="select"
              placeholder="Seleccionar estado"
              required
              options={estados}
              value={formData.estado}
              error={errors.estado}
              touched={touched.estado}
              onChange={(e) => {
                console.log("onChange estado:", e.target.value); // Depuración
                handleChange(e);
              }}
              onBlur={(e) => {
                console.log("onBlur estado:", e.target.name); // Depuración
                handleBlur(e);
              }}
              delay={0.7}
              labelClassName="text-blue-300 font-medium"
              inputClassName="border-purple-300 focus:border-primary-purple"
            />
          </div>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-between pt-6 border-t border-gray-200"
          >
            <motion.button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border-2 border-purple-300 text-purple-700 rounded-xl hover:bg-purple-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              className="px-8 py-3 bg-primary-purple text-white rounded-xl hover:bg-primary-purple/90 transition-all duration-200 font-medium shadow-lg"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              Crear
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserModal;