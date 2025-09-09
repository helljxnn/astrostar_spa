// components/RoleModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormRoleValidation } from "../hooks/useFormRoleValidation";
import { FormField } from "../../../../../../../shared/components/FormField";
import { roleValidationRules } from "../hooks/useFormRoleValidation";
import { showSuccessAlert } from "../../../../../../../shared/utils/alerts";


// Datos del formulario
const modules = [
  { name: "Usuarios", icon: "👤" },
  { name: "Roles", icon: "🛡️" },
  { name: "Material deportivo", icon: "🏋️" },
  { name: "Empleados", icon: "👥" },
  { name: "Deportistas", icon: "🏃" },
  { name: "Servicios", icon: "⚙️" },
  { name: "Donaciones", icon: "❤️" },
  { name: "Eventos", icon: "📅" },
  { name: "Compras", icon: "🛒" },
  { name: "Ventas", icon: "💰" },
];

const actions = [
  { name: "Crear", color: "bg-green-500", hoverColor: "hover:bg-green-600" },
  { name: "Editar", color: "bg-blue-500", hoverColor: "hover:bg-blue-600" },
  { name: "Eliminar", color: "bg-red-500", hoverColor: "hover:bg-red-600" },
  { name: "Ver", color: "bg-gray-500", hoverColor: "hover:bg-gray-600" },
];

const RoleModal = ({ isOpen, onClose, onSave }) => {
  // Hook de validación
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues: setFormData,
  } = useFormRoleValidation(
    {
      nombre: "",
      descripcion: "",
      estado: "",
      permisos: {},
    },
    roleValidationRules
  );

  const [expandedModules, setExpandedModules] = useState({});
  const [permissionError, setPermissionError] = useState("");

  // Validación de permisos en tiempo real
  useEffect(() => {
    const totalPermissions = Object.values(formData.permisos).reduce(
      (total, modulePerms) =>
        total + Object.values(modulePerms).filter(Boolean).length,
      0
    );

    if (totalPermissions === 0 && Object.keys(touched).length > 0) {
      setPermissionError("Debe seleccionar al menos un permiso");
    } else {
      setPermissionError("");
    }
  }, [formData.permisos, touched]);

  // Funciones de manejo de permisos
  const handlePermissionChange = (modulo, action) => {
    setFormData((prev) => {
      const current = prev.permisos[modulo] || {};
      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [modulo]: {
            ...current,
            [action]: !current[action],
          },
        },
      };
    });
  };

  const toggleModuleExpansion = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const selectAllPermissions = (moduleName) => {
    setFormData((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [moduleName]: actions.reduce(
          (acc, action) => ({
            ...acc,
            [action.name]: true,
          }),
          {}
        ),
      },
    }));
  };

  const clearAllPermissions = (moduleName) => {
    setFormData((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [moduleName]: {},
      },
    }));
  };

  const getModulePermissionCount = (moduleName) => {
    const modulePermissions = formData.permisos[moduleName] || {};
    return Object.values(modulePermissions).filter(Boolean).length;
  };

  // Manejo del submit con validaciones
  const handleSubmit = () => {
    const isValid = validateAllFields();
    const hasPermissions = Object.values(formData.permisos).some(
      (modulePerms) => Object.values(modulePerms).some(Boolean)
    );

    if (!hasPermissions) {
      setPermissionError("Debe seleccionar al menos un permiso");
      return;
    }

    if (isValid && hasPermissions) {
      onSave(formData);

      //Llamamos la alerta de éxito
      showSuccessAlert("Rol Creado", "El rol ha sido creado exitosamente.");

      // Reset form
      setFormData({ nombre: "", descripcion: "", estado: "", permisos: {} });
      setPermissionError("");
      onClose();
    }
  };

  const totalPermissions = Object.values(formData.permisos).reduce(
    (total, modulePerms) =>
      total + Object.values(modulePerms).filter(Boolean).length,
    0
  );

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
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
            Crear Rol
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Campos básicos con FormField */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre"
              name="nombre"
              type="text"
              placeholder="Nombre del rol"
              required
              value={formData.nombre}
              error={errors.nombre}
              touched={touched.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.1}
            />

            <FormField
              label="Estado"
              name="estado"
              type="select"
              placeholder="Seleccionar estado"
              required
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
              value={formData.estado}
              error={errors.estado}
              touched={touched.estado}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.2}
            />
          </div>

          <FormField
            label="Descripción"
            name="descripcion"
            type="textarea"
            placeholder="Descripción del rol"
            value={formData.descripcion}
            error={errors.descripcion}
            touched={touched.descripcion}
            onChange={handleChange}
            onBlur={handleBlur}
            delay={0.3}
          />

          {/* Sección de Permisos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-purple-600">🛡️</span>
                Permisos del Rol
                <span className="text-red-500">*</span>
              </h3>
              <div className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                {totalPermissions} permisos seleccionados
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {modules.map((module, index) => {
                  const permissionCount = getModulePermissionCount(module.name);
                  const isExpanded = expandedModules[module.name];

                  return (
                    <motion.div
                      key={module.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      {/* Header del módulo */}
                      <div
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-purple-50 hover:to-blue-50 transition-all duration-200"
                        onClick={() => toggleModuleExpansion(module.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{module.icon}</span>
                            <span className="font-semibold text-gray-800">
                              {module.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {permissionCount > 0 && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                {permissionCount}/4
                              </span>
                            )}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-gray-500"
                            >
                              ▼
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Contenido expandible */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-gray-100">
                              {/* Botones de selección rápida */}
                              <div className="flex gap-2 mb-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    selectAllPermissions(module.name)
                                  }
                                  className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                                >
                                  Seleccionar todo
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    clearAllPermissions(module.name)
                                  }
                                  className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                                >
                                  Limpiar
                                </button>
                              </div>

                              {/* Grid de permisos */}
                              <div className="grid grid-cols-2 gap-2">
                                {actions.map((action) => {
                                  const isChecked =
                                    formData.permisos[module.name]?.[
                                      action.name
                                    ] || false;

                                  return (
                                    <motion.label
                                      key={action.name}
                                      className={`
                                        flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                                        ${
                                          isChecked
                                            ? `${action.color} text-white shadow-sm`
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                        }
                                      `}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                          handlePermissionChange(
                                            module.name,
                                            action.name
                                          )
                                        }
                                        className="sr-only"
                                      />
                                      <div
                                        className={`
                                        w-4 h-4 rounded border-2 flex items-center justify-center
                                        ${
                                          isChecked
                                            ? "bg-white border-white"
                                            : "border-gray-300 bg-white"
                                        }
                                      `}
                                      >
                                        {isChecked && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`text-xs ${
                                              isChecked
                                                ? action.color.replace(
                                                    "bg-",
                                                    "text-"
                                                  )
                                                : ""
                                            }`}
                                          >
                                            ✓
                                          </motion.div>
                                        )}
                                      </div>
                                      <span className="text-sm font-medium">
                                        {action.name}
                                      </span>
                                    </motion.label>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Error de permisos */}
            <AnimatePresence>
              {permissionError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-red-500 text-sm flex items-center gap-1"
                >
                  <span>⚠️</span>
                  <span>{permissionError}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between pt-6 border-t border-gray-200"
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
              Crear Rol
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoleModal;
