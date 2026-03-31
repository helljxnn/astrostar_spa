import { HELP_METADATA_INDEX } from "./helpMetadata";

export const buildHelpItemsForModule = (moduleItem) => {
  if (!moduleItem) return [];

  const moduleMetadata = HELP_METADATA_INDEX[moduleItem.moduleId] || {};

  return moduleItem.actions.map((actionItem) => {
    const metadata = moduleMetadata[actionItem.actionId] || {};

    return {
      moduleId: moduleItem.moduleId,
      moduleName: moduleItem.moduleName,
      modulePath: moduleItem.modulePath,
      actionId: actionItem.actionId,
      actionName: actionItem.actionName,
      title: metadata.title || `Ayuda de ${actionItem.actionName}`,
      description: metadata.description || "Ayuda rápida para esta acción.",
      duration: metadata.duration || "0:30",
      level: metadata.level || "Básico",
      category: metadata.category || "General",
      videoUrl: metadata.videoUrl || "",
      steps: Array.isArray(metadata.steps) ? metadata.steps : [],
      tips: Array.isArray(metadata.tips) ? metadata.tips : [],
      hasVideo: Boolean(metadata.videoUrl),
    };
  });
};
