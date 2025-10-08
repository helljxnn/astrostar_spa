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
      // Aquí es donde se encontraba la alerta. La hemos eliminado.
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
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
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              delay={0.1}
              required
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
              delay={0.15}
              required
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
              delay={0.1}
              required
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
              delay={0.15}
              required
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
              delay={0.4}
              required
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
              delay={0.5}
              required
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
              delay={0.6}
              required
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
              delay={0.7}
              required
            />
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-between pt-6 border-t border-gray-200"
          >
            <motion.button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              className="px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg 
           bg-gradient-to-r from-primary-purple to-primary-blue 
           hover:from-primary-purple hover:to-primary-blue"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isEditing ? "Actualizar Usuario" : "Crear Usuario"}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserModal;
