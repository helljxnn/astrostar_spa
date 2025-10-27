import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts";
import {
  useFormUserValidation,
  userValidationRules,
} from "../hooks/useFormUserValidation";

const documentTypes = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PAS", label: "Pasaporte" },
];

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const UserModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  roles,
  userToEdit = null, // null = crear, objeto = editar
  mode = userToEdit ? "edit" : "create", // 'create' | 'edit'
}) => {
  const isEditing = mode === "edit" || userToEdit !== null;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setTouched,
    setValues,
  } = useFormUserValidation(
    {
      nombre: "",
      apellido: "",
      tipoDocumento: "",
      identificacion: "",
      rol: "",
      correo: "",
      telefono: "",
      estado: "",
    },
    userValidationRules
  );

  // Cargar datos del usuario cuando se abra el modal en modo edición
  useEffect(() => {
    if (isOpen && isEditing && userToEdit) {
      setValues({
        nombre: userToEdit.nombre || "",
        apellido: userToEdit.apellido || "",
        tipoDocumento: userToEdit.tipoDocumento || "",
        identificacion: userToEdit.identificacion || "",
        rol: userToEdit.rol || "",
        correo: userToEdit.correo || "",
        telefono: userToEdit.telefono || "",
        estado: userToEdit.estado || "",
      });
    }
  }, [isOpen, isEditing, userToEdit, setValues]);

  const handleSubmit = async () => {
    // 1. Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(userValidationRules).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // 2. Validar todos los campos
    if (!validateAllFields()) {
      return; // detener ejecución si hay errores
    }

    // 3. Confirmar en modo edición
    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del usuario ${userToEdit.nombre} ${userToEdit.apellido}?`,
        {
          confirmButtonText: "Sí, actualizar",
          cancelButtonText: "Cancelar",
        }
      );

      if (!confirmResult.isConfirmed) {
        return;
      }
    }

    try {
      if (isEditing) {
        const updatedUserData = { ...values, id: userToEdit.id };
        await onUpdate(updatedUserData);
        showSuccessAlert(
          "Usuario actualizado",
          `Los datos de ${values.nombre} ${values.apellido} han sido actualizados exitosamente.`
        );
      } else {
        await onSave(values);
        showSuccessAlert(
          "Usuario creado",
          "El usuario ha sido creado exitosamente."
        );
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error(
        `Error al ${isEditing ? "actualizar" : "crear"} usuario:`,
        error
      );
      showErrorAlert(
        "Error",
        error.message ||
          `Ocurrió un error al ${isEditing ? "actualizar" : "crear"} el usuario`
      );
    }
  };
  // Función para cerrar el modal y resetear el formulario
  const handleClose = () => {
    resetForm();
    onClose();
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Usuario" : "Crear Usuario"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando información de:{" "}
              <span className="font-semibold text-primary-purple">
                {userToEdit.nombre} {userToEdit.apellido}
              </span>
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormField
              label="Tipo de documento"
              name="tipoDocumento"
              type="select"
              placeholder="Selecciona el tipo de documento"
              options={documentTypes}
              value={values.tipoDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.tipoDocumento}
              touched={touched.tipoDocumento}
              required
              delay={0.1}
            />

            <FormField
              label="Identificación"
              name="identificacion"
              type="text"
              placeholder="Número de identificación"
              value={values.identificacion}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.identificacion}
              touched={touched.identificacion}
              required
              delay={0.2}
            />

            <FormField
              label="Nombre"
              name="nombre"
              type="text"
              placeholder="Nombre del usuario"
              value={values.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombre}
              touched={touched.nombre}
              required
              delay={0.3}
            />

            <FormField
              label="Apellido"
              name="apellido"
              type="text"
              placeholder="Apellido del usuario"
              value={values.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.apellido}
              touched={touched.apellido}
              required
              delay={0.4}
            />

            <FormField
              label="Rol"
              name="rol"
              type="select"
              placeholder="Selecciona el rol"
              options={
                roles?.map((r) => ({ value: r.nombre, label: r.nombre })) || []
              }
              value={values.rol}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.rol}
              touched={touched.rol}
              required
              delay={0.5}
            />

            <FormField
              label="Correo"
              name="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              value={values.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.correo}
              touched={touched.correo}
              required
              delay={0.6}
            />

            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="Número de telefono"
              value={values.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.telefono}
              touched={touched.telefono}
              required
              delay={0.7}
            />

            <FormField
              label="Estado"
              name="estado"
              type="select"
              placeholder="Selecciona el estado"
              options={states}
              value={values.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.estado}
              touched={touched.estado}
              required
              delay={0.8}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              {isEditing ? "Actualizar Usuario" : "Crear Usuario"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserModal;