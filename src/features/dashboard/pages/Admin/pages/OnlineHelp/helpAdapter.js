import { HELP_METADATA_INDEX } from "./helpMetadata";

const normalizeToken = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const unique = (items = []) => [...new Set(items.filter(Boolean))];
const CORE_ACTION_ORDER = {
  crear: 0,
  ver: 1,
  editar: 2,
  eliminar: 3,
};
const MODULE_ACTION_BUCKET_OVERRIDES = {
  materialsRegistry: {
    filtro: 10,
    buscar: 20,
    "generar-reporte": 30,
  },
};
const MODULE_EXACT_ACTION_ORDER = {
  eventsManagement: {
    crear: 0,
    ver: 1,
    editar: 2,
    eliminar: 3,
    "filtros-eventos": 10,
    "buscar-evento": 20,
    "generar-reporte-eventos": 30,
    "materiales-usar": 40,
    "materiales-entregar": 41,
    "inscribir-equipos": 42,
    "inscribir-deportistas": 43,
    "ver-equipos-inscritos": 44,
    "ver-deportistas-inscritas": 45,
  },
};

const resolveCoreRank = (actionId) => {
  const token = normalizeToken(actionId);

  if (token === "crear" || token.startsWith("crear-")) return CORE_ACTION_ORDER.crear;
  if (token === "ver" || token.startsWith("ver-")) return CORE_ACTION_ORDER.ver;
  if (token === "editar" || token.startsWith("editar-")) return CORE_ACTION_ORDER.editar;
  if (token === "eliminar" || token.startsWith("eliminar-")) return CORE_ACTION_ORDER.eliminar;

  return 100;
};

const resolveModuleBucketRank = (moduleId, actionId) => {
  const token = normalizeToken(actionId);
  const moduleBuckets = MODULE_ACTION_BUCKET_OVERRIDES[moduleId];
  if (!moduleBuckets) return 100;

  if (token.startsWith("filtro-") || token.startsWith("filtros-")) {
    return moduleBuckets.filtro ?? 100;
  }
  if (token.startsWith("buscar-")) return moduleBuckets.buscar ?? 100;
  if (token.startsWith("generar-reporte-")) {
    return moduleBuckets["generar-reporte"] ?? 100;
  }

  return 100;
};

const resolveModuleExactRank = (moduleId, actionId) => {
  const moduleOrder = MODULE_EXACT_ACTION_ORDER[moduleId];
  if (!moduleOrder) return 1000;

  return Object.prototype.hasOwnProperty.call(moduleOrder, actionId)
    ? moduleOrder[actionId]
    : 1000;
};

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

  const helpItems = metadataEntries.map(([actionId, metadata]) => {
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

  return helpItems.sort((left, right) => {
    const leftExactRank = resolveModuleExactRank(left.moduleId, left.actionId);
    const rightExactRank = resolveModuleExactRank(right.moduleId, right.actionId);
    if (leftExactRank !== rightExactRank) return leftExactRank - rightExactRank;

    const leftCoreRank = resolveCoreRank(left.actionId);
    const rightCoreRank = resolveCoreRank(right.actionId);

    if (leftCoreRank !== rightCoreRank) return leftCoreRank - rightCoreRank;

    const leftModuleRank = resolveModuleBucketRank(left.moduleId, left.actionId);
    const rightModuleRank = resolveModuleBucketRank(right.moduleId, right.actionId);

    if (leftModuleRank !== rightModuleRank) return leftModuleRank - rightModuleRank;

    return String(left.actionName || "").localeCompare(
      String(right.actionName || ""),
      "es",
      { sensitivity: "base" },
    );
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
