import { HELP_METADATA_INDEX } from "./helpMetadata";

const normalizeToken = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const unique = (items = []) => [...new Set(items.filter(Boolean))];

const inferPermissionCandidates = (actionId) => {
  const token = normalizeToken(actionId);

  if (token.includes("verasignacionesdelmaterial")) {
    return ["Ver Asignaciones del Material", "Ver"];
  }
  if (token.includes("transferirstock")) {
    return ["Transferir Stock", "Editar"];
  }
  if (token.includes("registrarbajadematerial")) {
    return ["Registrar Baja de Material", "Editar", "Eliminar"];
  }
  if (token.includes("verinscritos")) {
    return ["Ver inscritos", "Ver"];
  }
  if (token.includes("listardeportistas")) {
    return ["Listar deportistas", "Ver"];
  }
  if (token.includes("materiales")) {
    return ["Materiales", "Ver"];
  }
  if (token.includes("inscribir")) {
    return ["Inscribir", "Crear", "Editar"];
  }
  if (token.includes("matricular")) {
    return ["Aceptar", "Crear", "Editar"];
  }
  if (token.includes("rechazar")) {
    return ["Rechazar", "Editar"];
  }
  if (token.includes("aprobar")) {
    return ["Aprobar", "Editar"];
  }
  if (token.includes("aceptar")) {
    return ["Aceptar", "Editar"];
  }
  if (token.includes("cancelar")) {
    return ["Cancelar", "Editar"];
  }
  if (token.includes("descargar")) {
    return ["Descargar", "Ver"];
  }
  if (token.includes("eliminar") || token.includes("remover")) {
    return ["Eliminar", "Editar"];
  }
  if (token.includes("editar") || token.includes("completar")) {
    return ["Editar"];
  }
  if (token.includes("crear") || token.includes("subir") || token.includes("registrar")) {
    return ["Crear", "Editar"];
  }
  if (
    token.includes("ver") ||
    token.includes("detalle") ||
    token.includes("buscar") ||
    token.includes("filtro") ||
    token.includes("historial") ||
    token.includes("reporte")
  ) {
    return ["Ver"];
  }

  return ["Ver"];
};

const resolvePermissionCandidates = ({
  actionId,
  metadata,
  fallbackActionName,
}) => {
  const requiredPermission = metadata.requiredPermission;
  if (Array.isArray(requiredPermission) && requiredPermission.length > 0) {
    return unique(requiredPermission);
  }
  if (typeof requiredPermission === "string" && requiredPermission.trim().length > 0) {
    return [requiredPermission.trim()];
  }
  if (fallbackActionName) {
    return [fallbackActionName];
  }

  return unique(inferPermissionCandidates(actionId));
};

export const buildHelpItemsForModule = (moduleItem) => {
  if (!moduleItem) return [];

  const moduleMetadata = HELP_METADATA_INDEX[moduleItem.moduleId] || {};
  const actionNameById = new Map(
    (moduleItem.actions || []).map((actionItem) => [actionItem.actionId, actionItem.actionName]),
  );
  const metadataEntries = Object.entries(moduleMetadata);

  return metadataEntries.map(([actionId, metadata]) => {
    const fallbackActionName = actionNameById.get(actionId);
    const resolvedActionName =
      metadata.actionName || fallbackActionName || `Acción ${actionId}`;
    const requiredPermissions = resolvePermissionCandidates({
      actionId,
      metadata,
      fallbackActionName,
    });

    return {
      moduleId: moduleItem.moduleId,
      moduleName: moduleItem.moduleName,
      modulePath: moduleItem.modulePath,
      actionId,
      actionName: resolvedActionName,
      title: metadata.title || `Ayuda de ${resolvedActionName}`,
      description: metadata.description || "Ayuda rápida para esta acción.",
      duration: metadata.duration || "0:30",
      level: metadata.level || "Básico",
      category: metadata.category || "General",
      requiredPermissions,
      videoUrl: metadata.videoUrl || "",
      steps: Array.isArray(metadata.steps) ? metadata.steps : [],
      tips: Array.isArray(metadata.tips) ? metadata.tips : [],
      hasVideo: Boolean(metadata.videoUrl),
    };
  });
};

export const canAccessHelpItem = (item, permissionApi) => {
  if (!item) return false;
  const { hasPermission, hasModuleAccess } = permissionApi || {};

  if (typeof hasModuleAccess === "function" && !hasModuleAccess(item.moduleId)) {
    return false;
  }

  if (typeof hasPermission !== "function") {
    return true;
  }

  const candidates =
    Array.isArray(item.requiredPermissions) && item.requiredPermissions.length > 0
      ? item.requiredPermissions
      : ["Ver"];

  return candidates.some((permissionName) =>
    hasPermission(item.moduleId, permissionName),
  );
};
