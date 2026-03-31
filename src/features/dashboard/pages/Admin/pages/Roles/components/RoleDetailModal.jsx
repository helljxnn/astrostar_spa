import { createPortal } from "react-dom";
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
import {
  generateAdminPermissions,
  getModuleNamesMap,
} from "../../../../../../../shared/constants/moduleConfig";

const RoleDetailModal = ({ isOpen, onClose, roleData }) => {
  if (!isOpen) return null;

  const moduleNamesMap = getModuleNamesMap();

  // Función para contar privilegios (acciones) activos
  const countActivePermissions = (permissions) => {
    if (!permissions || typeof permissions !== "object") return 0;

    let count = 0;
    Object.entries(permissions).forEach(([, modulePerms]) => {
      if (Array.isArray(modulePerms)) {
        count += modulePerms.length;
      } else if (typeof modulePerms === "object" && modulePerms !== null) {
        // Solo contar permisos que están en true
        count += Object.values(modulePerms).filter(
          (value) => value === true,
        ).length;
      } else if (modulePerms === true) {
        count += 1;
      }
    });
    return count;
  };

  // Función para contar permisos (módulos) activos
  const countActiveModules = (permissions) => {
    if (!permissions || typeof permissions !== "object") return 0;

    return Object.entries(permissions).filter(([, modulePerms]) => {
      if (Array.isArray(modulePerms)) {
        return modulePerms.length > 0;
      }
      if (typeof modulePerms === "object" && modulePerms !== null) {
        // Solo contar módulos que tienen al menos un permiso en true
        return Object.values(modulePerms).some((value) => value === true);
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
      if (lowerPerm.includes("accept") || lowerPerm.includes("acept")) {
        return <FaCheck className="text-gray-500" />;
      }
      if (lowerPerm.includes("aprob")) {
        return <FaCheck className="text-gray-500" />;
      }
      if (
        lowerPerm.includes("update") ||
        lowerPerm.includes("edit") ||
        lowerPerm.includes("actualizar")
      ) {
        return <FaEdit className="text-gray-500" />;
      }
      if (lowerPerm.includes("descarg")) {
        return <FaEye className="text-gray-500" />;
      }
      if (
        lowerPerm.includes("delete") ||
        lowerPerm.includes("remove") ||
        lowerPerm.includes("eliminar")
      ) {
        return <FaTrash className="text-gray-500" />;
      }
      if (lowerPerm.includes("cancel")) {
        return <FaTimes className="text-gray-500" />;
      }
      if (lowerPerm.includes("reject") || lowerPerm.includes("rechaz")) {
        return <FaTimes className="text-gray-500" />;
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
    const activeModules = permissionEntries.filter(
      ([, modulePermissions]) => {
        if (Array.isArray(modulePermissions)) {
          return modulePermissions.length > 0;
        }
        if (
          typeof modulePermissions === "object" &&
          modulePermissions !== null
        ) {
          // Verificar que al menos un permiso esté en true
          const hasActivePermission = Object.values(modulePermissions).some(
            (value) => value === true,
          );
          return hasActivePermission;
        }
        return Boolean(modulePermissions);
      },
    );

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
                  .filter(([, permValue]) => permValue === true) // Solo mostrar permisos activos
                  .map(([permKey], pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-sm">
                      {getPermissionIcon(permKey)}
                      <span className="text-gray-700">
                        {formatPermissionName(permKey)}
                      </span>
                    </div>
                  ))}
                {Object.values(modulePermissions).every((val) => val !== true) && (
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

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative"
      >
        {/* Botón X para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          aria-label="Cerrar modal"
        >
          <FaTimes size={20} />
        </button>

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6 pr-8">
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
                    {countActiveModules(roleData?.permissions)} permisos
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {countActivePermissions(roleData?.permissions)} privilegios
                  </span>
                </div>
              )}
            </div>
          </div>
          {renderPermissions(roleData?.permissions)}
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-center pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-blue transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RoleDetailModal;



