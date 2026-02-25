/**
 * Utilidad para depurar problemas de permisos
 * Usar en la consola del navegador
 */

export const debugPermissions = () => {
  // Obtener el usuario del localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  console.group("🔍 DEBUG DE PERMISOS");

  console.log("👤 Usuario:", user);
  console.log("🎭 Rol:", user?.role?.name || user?.rol || user?.role);
  console.log("📋 Permisos del rol:", user?.role?.permissions);

  // Verificar si es admin
  const isAdmin =
    user?.role?.name === "admin" ||
    user?.rol === "admin" ||
    user?.role === "admin" ||
    user?.role?.name === "Administrador";

  console.log("👑 ¿Es Admin?:", isAdmin);

  // Verificar permisos específicos de materials
  if (user?.role?.permissions) {
    console.group("📦 Permisos de Materials");
    console.log("materials:", user.role.permissions.materials);
    console.log(
      "materialCategories:",
      user.role.permissions.materialCategories,
    );
    console.groupEnd();
  }

  // Verificar el servicio de permisos
  import("../services/permissionsService.js").then(
    ({ default: permissionsService }) => {
      console.group("🔧 Estado del Servicio de Permisos");
      console.log("Debug Info:", permissionsService.getDebugInfo());
      console.log(
        "hasPermission(materials, Crear):",
        permissionsService.hasPermission("materials", "Crear"),
      );
      console.log(
        "hasPermission(materialCategories, Ver):",
        permissionsService.hasPermission("materialCategories", "Ver"),
      );
      console.groupEnd();
    },
  );

  console.groupEnd();
};

// Hacer disponible globalmente
if (typeof window !== "undefined") {
  window.debugPermissions = debugPermissions;
}

export default debugPermissions;
