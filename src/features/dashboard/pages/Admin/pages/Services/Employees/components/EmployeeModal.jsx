import React from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  useFormEmployeeValidation,
  employeeValidationRules,
} from "../hooks/useFormEmployeeValidation";
import { showSuccessAlert } from "../../../../../../../../shared/utils/Alerts";

const EmployeeModal = ({ isOpen, onClose, onSave }) => {
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues: setFormData,
  } = useFormEmployeeValidation(
    {
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      edad: "",
      identificacion: "",
      tipoDocumento: "",
      tipoEmpleado: "",
      rol: "",
      estado: "",
      fechaAsignacion: "",
    },
    employeeValidationRules
  );

  const handleSubmit = () => {
    const isValid = validateAllFields();
    if (isValid) {
      onSave(formData);

      showSuccessAlert(
        "Empleado Creado",
        "El empleado ha sido registrado exitosamente."
      );

      // Reset
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        edad: "",
        identificacion: "",
        tipoDocumento: "",
        tipoEmpleado: "",
        rol: "",
        estado: "",
        fechaAsignacion: "",
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
            Crear Empleado
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo Documento */}
            <FormField
              label="Tipo de Documento"
              name="tipoDocumento"
              type="select"
              placeholder="Seleccionar tipo de documento"
              required
              options={[
                { value: "Tarjeta de Identidad", label: "Tarjeta de Identidad" },
                { value: "Cédula de Ciudadanía", label: "Cédula de Ciudadanía" },
                { value: "Permiso Especial de Permanencia", label: "Permiso Especial de Permanencia" },
                { value: "Tarjeta de Extranjería", label: "Tarjeta de Extranjería" },
                { value: "Cédula de Extranjería", label: "Cédula de Extranjería" },
                { value: "Número de Identificación Tributaria", label: "Número de Identificación Tributaria" },
                { value: "Pasaporte", label: "Pasaporte" },
                { value: "Documento de Identificación Extranjero", label: "Documento de Identificación Extranjero" },
              ]}
              value={formData.tipoDocumento}
              error={errors.tipoDocumento}
              touched={touched.tipoDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.1}
            />

            {/* Identificación */}
            <FormField
              label="Número de Documento"
              name="identificacion"
              type="text"
              placeholder="Número de documento del empleado"
              required
              value={formData.identificacion}
              error={errors.identificacion}
              touched={touched.identificacion}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.2}
            />

            {/* Nombre */}
            <FormField
              label="Nombre"
              name="nombre"
              type="text"
              placeholder="Nombre del empleado"
              required
              value={formData.nombre}
              error={errors.nombre}
              touched={touched.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.3}
            />

            {/* Apellido */}
            <FormField
              label="Apellido"
              name="apellido"
              type="text"
              placeholder="Apellido del empleado"
              required
              value={formData.apellido}
              error={errors.apellido}
              touched={touched.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.4}
            />

            {/* Correo */}
            <FormField
              label="Correo"
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              value={formData.correo}
              error={errors.correo}
              touched={touched.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.5}
            />

            {/* Teléfono */}
            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="Número de teléfono"
              required
              value={formData.telefono}
              error={errors.telefono}
              touched={touched.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.6}
            />

            {/* Edad */}
            <FormField
              label="Edad"
              name="edad"
              type="number"
              placeholder="Edad del empleado"
              required
              value={formData.edad}
              error={errors.edad}
              touched={touched.edad}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.7}
            />

            {/* Rol */}
            <FormField
              label="Rol"
              name="rol"
              type="select"
              placeholder="Seleccione el rol"
              required
              options={[
                { value: "Profesional Deportivo", label: "Profesional Deportivo" },
                { value: "Profesional en Salud", label: "Profesional en Salud" },
              ]}
              value={formData.rol}
              error={errors.rol}
              touched={touched.rol}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.8}
            />

            {/* Tipo Empleado */}
            <FormField
              label="Tipo Empleado"
              name="tipoEmpleado"
              type="select"
              placeholder="Seleccionar tipo empleado"
              required
              options={[
                { value: "Entrenador", label: "Entrenador" },
                { value: "Fisioterapeuta", label: "Fisioterapeuta" },
                { value: "Psicólogo", label: "Psicólogo" },
                { value: "Nutricionista", label: "Nutricionista" },
                { value: "Administrativo", label: "Administrativo" },
              ]}
              value={formData.tipoEmpleado}
              error={errors.tipoEmpleado}
              touched={touched.tipoEmpleado}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.9}
            />

            {/* Estado */}
            <FormField
              label="Estado"
              name="estado"
              type="select"
              placeholder="Seleccionar estado"
              required
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Incapacitado", label: "Incapacitado" },
                { value: "Vacaciones", label: "Vacaciones" },
                { value: "Retirado", label: "Retirado" },
                { value: "Fallecido", label: "Fallecido" },
              ]}
              value={formData.estado}
              error={errors.estado}
              touched={touched.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={1}
            />

            {/* Fecha asignación */}
            <FormField
              label="Fecha Asignación Estado"
              name="fechaAsignacion"
              type="date"
              required
              value={formData.fechaAsignacion}
              error={errors.fechaAsignacion}
              touched={touched.fechaAsignacion}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={1.1}
            />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between px-6 py-6 border-t border-gray-200"
        >
          <motion.button
            type="button"
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl hover:from-primary-purple hover:to-primary-blue transition-all duration-200 font-medium shadow-lg"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Crear Empleado
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeModal;
