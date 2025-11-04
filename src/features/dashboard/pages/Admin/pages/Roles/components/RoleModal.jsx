import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormRoleValidation } from "../hooks/useFormRoleValidation";
import { useRoleNameValidation } from "../hooks/useRoleNameValidation";
import { FormField } from "../../../../../../../shared/components/FormField";
import { roleValidationRules } from "../hooks/useFormRoleValidation";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts";

// Organizar módulos por categorías para mejor visualización
const moduleCategories = {
  Dashboard: [
    {
      name: "Dashboard",
      icon: "📊",
      key: "dashboard",
    },
  ],
  Usuarios: [
    {
      name: "Usuarios",
      icon: "👤",
      key: "users",
    },
  ],
  Roles: [
    {
      name: "Roles",
      icon: "🛡️",
      key: "roles",
    },
  ],
  "Material Deportivo": [
    {
      name: "Material Deportivo",
      icon: "🏋️",
      key: "sportsEquipment",
    },
  ],
  Servicios: [
    {
      name: "Empleados",
      icon: "👥",
      key: "employees",
    },
    {
      name: "Horario Empleados",
      icon: "⏰",
      key: "employeesSchedule",
    },
    {
      name: "Gestión de citas",
      icon: "📅",
      key: "appointmentManagement",
    },
  ],
  Deportistas: [
    {
      name: "Categoría deportiva",
      icon: "🏆",
      key: "sportsCategory",
    },
    {
      name: "Gestión de deportistas",
      icon: "🏃",
      key: "athletesSection",
    },
    {
      name: "Asistencia Deportistas",
      icon: "✅",
      key: "athletesAssistance",
    },
  ],
  Donaciones: [
    {
      name: "Donantes/Patrocinadores",
      icon: "🤝",
      key: "donorsSponsors",
    },
    {
      name: "Donaciones",
      icon: "❤️",
      key: "donationsManagement",
    },
  ],
  Eventos: [
    {
      name: "Gestión de Eventos",
      icon: "📅",
      key: "eventsManagement",
    },
    {
      name: "Personas temporales",
      icon: "👷",
      key: "temporaryWorkers",
    },
    {
      name: "Equipos",
      icon: "⚽",
      key: "temporaryTeams",
    },
  ],
  Compras: [
    {
      name: "Proveedores",
      icon: "🏪",
      key: "providers",
    },
    {
      name: "Compras",
      icon: "🛒",
      key: "purchasesManagement",
    },
  ],
};

const actions = [
  { name: "Crear", color: "bg-gray-500", hoverColor: "hover:bg-gray-600" },
  { name: "Editar", color: "bg-gray-500", hoverColor: "hover:bg-gray-600" },
  { name: "Eliminar", color: "bg-gray-500", hoverColor: "hover:bg-gray-600" },
  { name: "Ver", color: "bg-gray-500", hoverColor: "hover:bg-gray-600" },
];

const RoleModal = ({ isOpen, onClose, onSave, roleData = null }) => {
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

  // Hook para validación de nombres duplicados
  const { nameValidation, validateRoleName, clearValidation, reloadRoles } = useRoleNameValidation(
    roleData?.id
  );

  const [expandedCategories, setExpandedCategories] = useState({});
  const [permissionError, setPermissionError] = useState("");

  // Manejar cambios en el nombre con validación de duplicados
  const handleNameChange = (name, value) => {
    handleChange(name, value);
    if (name === 'nombre') {
      validateRoleName(value);
    }
  };

  // Si recibimos roleData (editar), precargamos los datos
  useEffect(() => {
    if (roleData) {
      // Verificar si es el rol de Administrador
      if (roleData.name === 'Administrador') {
        showErrorAlert(
          'Acción no permitida',
          'El rol de Administrador es un rol del sistema y no puede ser editado.'
        );
        onClose();
        return;
      }

      // Convertir estado de español a inglés si es necesario
      let status = roleData.status || roleData.estado || "";
      if (status === "Activo") status = "Active";
      if (status === "Inactivo") status = "Inactive";

      setFormData({
        id: roleData.id,
        nombre: roleData.name || roleData.nombre || "",
        descripcion: roleData.description || roleData.descripcion || "",
        estado: status,
        permisos: roleData.permissions || roleData.permisos || {},
      });
      
      // Limpiar validación de nombres al cargar datos
      clearValidation();
    }
  }, [roleData, setFormData, onClose]);

  // Validación de permisos
  useEffect(() => {
    const totalPermissions = Object.values(formData.permisos).reduce(
      (total, modulePerms) => {
        if (typeof modulePerms === "object" && modulePerms !== null) {
          return total + Object.values(modulePerms).filter(Boolean).length;
        }
        return total;
      },
      0
    );

    if (totalPermissions === 0 && Object.keys(touched).length > 0) {
      setPermissionError("Debe seleccionar al menos un permiso");
    } else {
      setPermissionError("");
    }
  }, [formData.permisos, touched]);

  // Manejo de permisos simplificado (cada módulo es independiente)
  const handlePermissionChange = (moduleKey, action) => {
    setFormData((prev) => {
      const current = prev.permisos[moduleKey] || {};
      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [moduleKey]: {
            ...current,
            [action]: !current[action],
          },
        },
      };
    });
  };

  const toggleCategoryExpansion = (categoryName) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const selectAllPermissionsForCategory = (categoryName) => {
    setFormData((prev) => {
      const newPermisos = { ...prev.permisos };

      moduleCategories[categoryName].forEach((module) => {
        // Para Dashboard y Usuarios, solo permitir "Ver"
        if (module.key === 'dashboard' || module.key === 'users') {
          newPermisos[module.key] = { Ver: true };
        } else {
          newPermisos[module.key] = actions.reduce(
            (acc, action) => ({ ...acc, [action.name]: true }),
            {}
          );
        }
      });

      return {
        ...prev,
        permisos: newPermisos,
      };
    });
  };

  const clearAllPermissionsForCategory = (categoryName) => {
    setFormData((prev) => {
      const newPermisos = { ...prev.permisos };

      moduleCategories[categoryName].forEach((module) => {
        newPermisos[module.key] = {};
      });

      return {
        ...prev,
        permisos: newPermisos,
      };
    });
  };

  const selectAllPermissionsForModule = (moduleKey) => {
    setFormData((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [moduleKey]: 
          // Para Dashboard y Usuarios, solo permitir "Ver"
          moduleKey === 'dashboard' || moduleKey === 'users'
            ? { Ver: true }
            : actions.reduce(
                (acc, action) => ({ ...acc, [action.name]: true }),
                {}
              ),
      },
    }));
  };

  const clearAllPermissionsForModule = (moduleKey) => {
    setFormData((prev) => ({
      ...prev,
      permisos: { ...prev.permisos, [moduleKey]: {} },
    }));
  };

  const getModulePermissionCount = (moduleKey) => {
    const modulePermissions = formData.permisos[moduleKey] || {};
    return Object.values(modulePermissions).filter(Boolean).length;
  };

  const getCategoryPermissionCount = (categoryName) => {
    return moduleCategories[categoryName].reduce((total, module) => {
      return total + getModulePermissionCount(module.key);
    }, 0);
  };

  const getCategoryTotalPermissions = (categoryName) => {
    return moduleCategories[categoryName].reduce((total, module) => {
      // Para Dashboard y Usuarios, solo hay 1 acción disponible (Ver)
      if (module.key === 'dashboard' || module.key === 'users') {
        return total + 1;
      }
      return total + actions.length;
    }, 0);
  };

  // Submit
  const handleSubmit = async () => {
    const isValid = validateAllFields();
    const hasPermissions = Object.values(formData.permisos).some(
      (modulePerms) => Object.values(modulePerms).some(Boolean)
    );

    if (!hasPermissions) {
      setPermissionError("Debe seleccionar al menos un permiso");
    }

    // Verificar si hay nombre duplicado
    if (nameValidation.isDuplicate) {
      showErrorAlert(
        "Nombre duplicado",
        nameValidation.message
      );
      return;
    }

    if (!isValid || !hasPermissions || nameValidation.isChecking) {
      if (nameValidation.isChecking) {
        showErrorAlert(
          "Validando nombre",
          "Por favor, espere mientras se valida el nombre del rol."
        );
      } else {
        showErrorAlert(
          "Campos incompletos",
          "Por favor, complete todos los campos obligatorios y seleccione al menos un permiso antes de continuar."
        );
      }
      return;
    }

    const roleToSave = {
      name: formData.nombre,
      description: formData.descripcion,
      status: formData.estado,
      permissions: formData.permisos,
    };

    // alerta de confirmación si se está editando
    if (roleData) {
      const result = await showConfirmAlert(
        "¿Estás seguro de actualizar este rol?",
        "Los cambios se guardarán y no se podrán deshacer fácilmente."
      );

      if (!result.isConfirmed) return;
    }

    // Guardar rol
    await onSave(roleToSave);

    // Recargar roles para validación futura
    await reloadRoles();

    showSuccessAlert(
      roleData ? "Rol Actualizado" : "Rol Creado",
      roleData
        ? "El rol ha sido actualizado exitosamente."
        : "El rol ha sido creado exitosamente."
    );

    if (!roleData) {
      setFormData({ nombre: "", descripcion: "", estado: "", permisos: {} });
    }

    setPermissionError("");
    clearValidation();
    onClose();
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto relative"
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
            {roleData ? "Editar Rol" : "Crear Rol"}
          </h2>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6 space-y-6">
          {/* Campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FormField
                label="Nombre"
                name="nombre"
                type="text"
                placeholder="Nombre del rol"
                required
                value={formData.nombre}
                error={errors.nombre || (nameValidation.isDuplicate ? nameValidation.message : '')}
                touched={touched.nombre}
                onChange={handleNameChange}
                onBlur={handleBlur}
                delay={0.1}
              />
              {/* Estados de validación en tiempo real */}
              {nameValidation.isChecking && (
                <div className="text-blue-500 text-sm flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>Verificando disponibilidad...</span>
                </div>
              )}
              
              {!nameValidation.isChecking && nameValidation.isDuplicate && (
                <div className="text-red-500 text-sm flex items-center gap-1">
                  <span>❌</span>
                  <span>Nombre no disponible</span>
                </div>
              )}
              
              {!nameValidation.isChecking && nameValidation.isAvailable && formData.nombre.trim().length >= 2 && (
                <div className="text-green-500 text-sm flex items-center gap-1">
                  <span>✅</span>
                  <span>Nombre disponible</span>
                </div>
              )}
            </div>

            <FormField
              label="Estado"
              name="estado"
              type="select"
              placeholder="Seleccionar estado"
              required
              options={[
                { value: "Active", label: "Activo" },
                { value: "Inactive", label: "Inactivo" },
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

          {/* Permisos */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-purple-600">🛡️</span>
                Permisos del Rol <span className="text-red-500">*</span>
              </h3>
              <div className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                {totalPermissions} permisos seleccionados
              </div>
            </div>

            {/* Módulos organizados por categorías */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
              <div className="space-y-6">
                {Object.entries(moduleCategories).map(
                  ([categoryName, modules], categoryIndex) => {
                    const categoryPermissionCount =
                      getCategoryPermissionCount(categoryName);
                    const categoryTotalPermissions =
                      getCategoryTotalPermissions(categoryName);
                    const isExpanded = expandedCategories[categoryName];

                    return (
                      <motion.div
                        key={categoryName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * categoryIndex }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        {/* Header de categoría */}
                        <div
                          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-purple-50 hover:to-blue-50 transition-all duration-200"
                          onClick={() => toggleCategoryExpansion(categoryName)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-gray-800">
                                {categoryName}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {categoryPermissionCount > 0 && (
                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                  {categoryPermissionCount}/
                                  {categoryTotalPermissions}
                                </span>
                              )}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectAllPermissionsForCategory(
                                      categoryName
                                    );
                                  }}
                                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                                >
                                  Todo
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearAllPermissionsForCategory(
                                      categoryName
                                    );
                                  }}
                                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                                >
                                  Limpiar
                                </button>
                              </div>
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

                        {/* Módulos de la categoría */}
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                  {modules.map((module, moduleIndex) => {
                                    const permissionCount =
                                      getModulePermissionCount(module.key);

                                    return (
                                      <motion.div
                                        key={module.key}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                          delay: 0.05 * moduleIndex,
                                        }}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-all duration-200"
                                      >
                                        {/* Header del módulo */}
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                              {module.icon}
                                            </span>
                                            <span className="font-semibold text-gray-800 text-sm">
                                              {module.name}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {permissionCount > 0 && (
                                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                {permissionCount}/
                                                {module.key === 'dashboard' || module.key === 'users' ? 1 : actions.length}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Botones de control del módulo */}
                                        <div className="flex gap-1 mb-3">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              selectAllPermissionsForModule(
                                                module.key
                                              )
                                            }
                                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                          >
                                            Todo
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              clearAllPermissionsForModule(
                                                module.key
                                              )
                                            }
                                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                          >
                                            Limpiar
                                          </button>
                                        </div>

                                        {/* Permisos del módulo */}
                                        <div className="grid grid-cols-2 gap-2">
                                          {actions
                                            .filter((action) => {
                                              // Para Dashboard y Usuarios, solo mostrar "Ver"
                                              if (module.key === 'dashboard' || module.key === 'users') {
                                                return action.name === 'Ver';
                                              }
                                              return true;
                                            })
                                            .map((action) => {
                                            const isChecked =
                                              formData.permisos[module.key]?.[
                                                action.name
                                              ] || false;

                                            return (
                                              <motion.label
                                                key={action.name}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all duration-200 text-xs
                                                ${
                                                  isChecked
                                                    ? `${action.color} text-white shadow-sm`
                                                    : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                                                }`}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={() =>
                                                    handlePermissionChange(
                                                      module.key,
                                                      action.name
                                                    )
                                                  }
                                                  className="sr-only"
                                                />
                                                <div
                                                  className={`w-3 h-3 rounded border flex items-center justify-center
                                                ${
                                                  isChecked
                                                    ? "bg-white border-white"
                                                    : "border-gray-300 bg-white"
                                                }`}
                                                >
                                                  {isChecked && (
                                                    <motion.div
                                                      initial={{ scale: 0 }}
                                                      animate={{ scale: 1 }}
                                                      className={`text-xs ${action.color.replace(
                                                        "bg-",
                                                        "text-"
                                                      )}`}
                                                    >
                                                      ✓
                                                    </motion.div>
                                                  )}
                                                </div>
                                                <span className="font-medium">
                                                  {action.name}
                                                </span>
                                              </motion.label>
                                            );
                                          })}
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }
                )}
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
              className="px-8 py-3 bg-primary-blue text-white rounded-xl hover:bg-primary-purple transition-all duration-200 font-medium shadow-lg"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {roleData ? "Actualizar Rol" : "Crear Rol"}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoleModal;
