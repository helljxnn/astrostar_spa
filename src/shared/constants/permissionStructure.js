import {
  MODULE_CONFIG,
  MODULE_GROUPS,
  getModuleAllowedActions,
} from "./moduleConfig";

export const STANDALONE_MODULE_ORDER = ["dashboard", "roles", "users"];
export const GROUP_MODULE_ORDER = [
  "services",
  "athletes",
  "equipment",
  "donations",
  "events",
];

const normalizeKey = (value = "") =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildActionItems = (moduleId) =>
  getModuleAllowedActions(moduleId).map((actionName) => ({
    actionId: normalizeKey(actionName),
    actionName,
  }));

const buildModuleItem = (moduleId, groupId = null, groupName = null) => {
  const moduleData = MODULE_CONFIG[moduleId];
  if (!moduleData) return null;

  return {
    moduleId: moduleData.id,
    moduleName: moduleData.name,
    modulePath: moduleData.path,
    groupId,
    groupName,
    actions: buildActionItems(moduleData.id),
  };
};

export const buildRoleModuleCategories = () => {
  const categories = {};

  STANDALONE_MODULE_ORDER.forEach((moduleId) => {
    const moduleItem = buildModuleItem(moduleId);
    if (!moduleItem) return;

    categories[moduleItem.moduleName] = [
      {
        name: moduleItem.moduleName,
        key: moduleItem.moduleId,
      },
    ];
  });

  GROUP_MODULE_ORDER.forEach((groupId) => {
    const groupData = MODULE_GROUPS[groupId];
    if (!groupData) return;

    const modules = (groupData.children || [])
      .map((moduleId) => buildModuleItem(moduleId, groupData.id, groupData.name))
      .filter(Boolean)
      .map((moduleItem) => ({
        name: moduleItem.moduleName,
        key: moduleItem.moduleId,
      }));

    if (modules.length > 0) {
      categories[groupData.name] = modules;
    }
  });

  return categories;
};

export const buildHelpModuleCatalog = () => {
  const modules = [];

  STANDALONE_MODULE_ORDER.forEach((moduleId) => {
    const moduleItem = buildModuleItem(moduleId);
    if (moduleItem) modules.push(moduleItem);
  });

  GROUP_MODULE_ORDER.forEach((groupId) => {
    const groupData = MODULE_GROUPS[groupId];
    if (!groupData) return;

    (groupData.children || []).forEach((moduleId) => {
      const moduleItem = buildModuleItem(moduleId, groupData.id, groupData.name);
      if (moduleItem) modules.push(moduleItem);
    });
  });

  return modules;
};

export const getCurrentModuleFromPath = (pathname, moduleCatalog) => {
  if (!pathname || !Array.isArray(moduleCatalog)) return null;

  const normalizedPath = String(pathname).replace(/\/+$/, "") || "/";

  if (normalizedPath === "/dashboard") {
    return (
      moduleCatalog.find((moduleItem) => moduleItem.moduleId === "dashboard") ||
      null
    );
  }

  return moduleCatalog
    .filter((moduleItem) => {
      const basePath = String(moduleItem.modulePath || "").replace(/\/+$/, "");
      if (!basePath) return false;
      return (
        normalizedPath === basePath ||
        normalizedPath.startsWith(`${basePath}/`)
      );
    })
    .sort((left, right) => right.modulePath.length - left.modulePath.length)[0] || null;
};
