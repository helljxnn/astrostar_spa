import React from "react";
import { motion } from "framer-motion";
import {
  FaLock,
  FaFolderOpen,
  FaCheck,
  FaTimes,
  FaEye,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const RoleDetailModal = ({ isOpen, onClose, roleData }) => {
  if (!isOpen) return null;

  // Función para generar permisos completos de administrador
  const generateAdminPermissions = () => {
    const modules = [
      "dashboard",
      "users",
      "roles",
      "sportsEquipment",
      "employees",
      "employeesSchedule",
      "appointmentManagement",
      "sportsCategory",
      "athletesSection",
      "athletesAssistance",
      "donorsSponsors",
      "donationsManagement",
      "eventsManagement",
      "temporaryWorkers",
      "temporaryTeams",
      "providers",
      "purchasesManagement",
    ];
    const actions = ["Ver", "Crear", "Editar", "Eliminar"];

    const adminPermissions = {};
    modules.forEach((module) => {
      adminPermissions[module] = {};
      actions.forEach((action) => {
        adminPermissions[module][action] = true;
      });
    });

    return adminPermissions;
  };

  // Mapeo de nombres de módulos 
  const moduleNamesMap = {
    dashboard: "Dashboard",
    users: "Usuarios",
    roles: "Roles",
    sportsEquipment: "Material Deportivo",
    employees: "Empleados",
    employeesSchedule: "Horario Empleados",
    appointmentManagement: "Gestión de citas",
    sportsCategory: "Categoría deportiva",
    athletesSection: "Gestión de deportistas",
    athletesAssistance: "Asistencia Deportistas",
    donorsSponsors: "Donantes/Patrocinadores",
    donationsManagement: "Donaciones",
    eventsManagement: "Gestión de Eventos",
    temporaryWorkers: "Personas temporales",
    temporaryTeams: "Equipos",
    providers: "Proveedores",
    purchasesManagement: "Compras",
  };

  // Función para contar permisos activos
  const countActivePermissions = (permissions) => {
    if (!permissions || typeof permissions !== "object") return 0;

    let count = 0;
    Object.entries(permissions).forEach(([module, modulePerms]) => {
      if (Array.isArray(modulePerms)) {
        count += modulePerms.length;
      } else if (typeof modulePerms === "object" && modulePerms !== null) {
        // Solo contar permisos que están en true
        count += Object.values(modulePerms).filter(value => value === true).length;
      } else if (modulePerms === true) {
        count += 1;
      }
    });
    return count;
  };

  // Función para contar módulos activos
  const countActiveModules = (permissions) => {
    if (!permissions || typeof permissions !== "object") return 0;

    return Object.entries(permissions).filter(([module, modulePerms]) => {
      if (Array.isArray(modulePerms)) {
        return modulePerms.length > 0;
      }
      if (typeof modulePerms === "object" && modulePerms !== null) {
        // Solo contar módulos que tienen al menos un permiso en true
        return Object.values(modulePerms).some(value => value === true);
      }
      return Boolean(modulePerms);
    }).length;
  };

  // Función para renderizar permisos de forma organizada
  const renderPermissions = (permissions) => {
    // Si es el rol de Administrador, mostrar todos los permisos
    if (roleData?.name === "Administrador") {
      permissions = generateAdminPermissions();
    }

    if (!permissions || typeof permissions !== "object") {
      return (
        <p className="text-gray-500 italic">
          Este rol no tiene permisos asignados.
        </p>
      );
    }

    // Mapeo de iconos para diferentes tipos de permisos 
    const getPermissionIcon = (permission) => {
      const lowerPerm = permission.toLowerCase();
      if (
        lowerPerm.includes("read") ||
        lowerPerm.includes("view") ||
        lowerPerm.includes("ver")
      ) {
        return <FaEye className="text-gray-500" />;
      }
      if (
        lowerPerm.includes("create") ||
        lowerPerm.includes("add") ||
        lowerPerm.includes("crear")
      ) {
        return <FaPlus className="text-gray-500" />;
      }
      if (
        lowerPerm.includes("update") ||
        lowerPerm.includes("edit") ||
        lowerPerm.includes("actualizar")
      ) {
        return <FaEdit className="text-gray-500" />;
      }
      if (
        lowerPerm.includes("delete") ||
        lowerPerm.includes("remove") ||
        lowerPerm.includes("eliminar")
      ) {
        return <FaTrash className="text-gray-500" />;
      }
      return <FaCheck className="text-gray-500" />;
    };

    // Función para formatear nombres de módulos en español
    const formatModuleName = (key) => {
      return (
        moduleNamesMap[key] ||
        key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim()
      );
    };

    // Función para formatear nombres de permisos
    const formatPermissionName = (permission) => {
      if (typeof permission === "string") {
        return permission
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      }
      return String(permission);
    };

    const permissionEntries = Object.entries(permissions);

    if (permissionEntries.length === 0) {
      return (
        <p className="text-gray-500 italic">
          Este rol no tiene permisos asignados.
        </p>
      );
    }

    // Filtrar solo módulos que tienen al menos un permiso activo
    const activeModules = permissionEntries.filter(([module, modulePermissions]) => {
      if (Array.isArray(modulePermissions)) {
        return modulePermissions.length > 0;
      }
      if (typeof modulePermissions === "object" && modulePermissions !== null) {
        // Verificar que al menos un permiso esté en true
        const hasActivePermission = Object.values(modulePermissions).some(value => value === true);
        return hasActivePermission;
      }
      return Boolean(modulePermissions);
    });

    if (activeModules.length === 0) {
      return (
        <p className="text-gray-500 italic">
          Este rol no tiene permisos activos asignados.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeModules.map(([module, modulePermissions], idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100"
          >
            <div className="flex items-center gap-2 mb-3">
              <FaFolderOpen className="text-primary-blue" />
              <span className="font-semibold text-gray-800">
                {formatModuleName(module)}
              </span>
            </div>

            {Array.isArray(modulePermissions) ? (
              <div className="space-y-2">
                {modulePermissions.map((permission, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-2 text-sm">
                    {getPermissionIcon(permission)}
                    <span className="text-gray-700">
                      {formatPermissionName(permission)}
                    </span>
                  </div>
                ))}
              </div>
            ) : typeof modulePermissions === "object" &&
              modulePermissions !== null ? (
              <div className="space-y-2">
                {Object.entries(modulePermissions)
                  .filter(([permKey, permValue]) => Boolean(permValue)) // Solo mostrar permisos activos
                  .map(([permKey, permValue], pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-sm">
                      {getPermissionIcon(permKey)}
                      <span className="text-gray-700">
                        {formatPermissionName(permKey)}
                      </span>
                    </div>
                  ))}
                {Object.values(modulePermissions).every(val => !Boolean(val)) && (
                  <p className="text-gray-400 italic text-sm">
                    Sin permisos activos en este módulo
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                {modulePermissions ? (
                  <FaCheck className="text-gray-500" />
                ) : (
                  <FaTimes className="text-gray-500" />
                )}
                <span
                  className={`${
                    modulePermissions ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {modulePermissions ? "Habilitado" : "Deshabilitado"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Detalle del Rol</h2>

        </div>

        {/* Info básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Información General
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-600">Nombre:</span>{" "}
                <span className="text-gray-800">{roleData?.name}</span>
              </p>
              <p>
                <span className="font-medium text-gray-600">Descripción:</span>{" "}
                <span className="text-gray-800">{roleData?.description}</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Fechas</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-gray-600">Creado:</span>{" "}
                <span className="text-gray-800">
                  {roleData?.createdAt
                    ? new Date(roleData.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-600">Actualizado:</span>{" "}
                <span className="text-gray-800">
                  {roleData?.updatedAt
                    ? new Date(roleData.updatedAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Lista de permisos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaLock className="text-primary-purple" /> Permisos del Rol
            </h3>
            <div className="flex items-center gap-2">
              {roleData?.name === "Administrador" ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Acceso Completo
                </span>
              ) : (
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {countActiveModules(roleData?.permissions)} módulos activos
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {countActivePermissions(roleData?.permissions)} permisos activos
                  </span>
                </div>
              )}
            </div>
          </div>
          {renderPermissions(roleData?.permissions)}
        </div>

        {/* Usuarios asignados */}
        {roleData?.users && roleData.users.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <FaFolderOpen className="text-primary-blue" />
              Usuarios con este rol ({roleData.users.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roleData.users.map((user, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 shadow-sm bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <p className="font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón cerrar */}
        <div className="flex justify-center pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleDetailModal;
