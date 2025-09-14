import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/Alerts";
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
  userToEdit = null,
  mode = "create",
}) => {
  const isEditing = mode === "edit" && userToEdit !== null;

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
    if (isOpen) {
      if (isEditing && userToEdit) {
        console.log("Cargando datos para edición:", userToEdit); // Debug
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
      } else {
        // Resetear formulario para modo crear
        resetForm();
      }
    }
  }, [isOpen, isEditing, userToEdit, setValues, resetForm]);

  const handleSubmit = async () => {
    console.log("Enviando formulario:", { isEditing, values }); // Debug

    // 1. Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(userValidationRules).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // 2. Validar todos los campos
    if (!validateAllFields()) {
      showErrorAlert(
        "Campos incompletos",
        "Por favor completa todos los campos correctamente antes de continuar."
      );
      return;
    }

    // 3. Confirmar en modo edición
    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del usuario ${values.nombre} ${values.apellido}?`,
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
        if (!userToEdit || !userToEdit.id) {
          throw new Error("No se encontró el ID del usuario a actualizar");
        }
        
        const updatedUserData = { 
          ...values, 
          id: userToEdit.id 
        };
        
        console.log("Actualizando usuario con datos:", updatedUserData); // Debug
        await onUpdate(updatedUserData);
        
        showSuccessAlert(
          "Usuario actualizado",
          `Los datos de ${values.nombre} ${values.apellido} han sido actualizados exitosamente.`
        );
      } else {
        console.log("Creando nuevo usuario con datos:", values); // Debug
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
          {isEditing && userToEdit && (
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
              placeholder="3001234567 o 2345678"
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