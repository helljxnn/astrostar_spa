import { buildHelpModuleCatalog } from "../../../../../../shared/constants/permissionStructure";

const DEFAULT_LEVEL_BY_ACTION = {
  crear: "Básico",
  ver: "Básico",
  editar: "Frecuente",
  eliminar: "Avanzado",
  aprobar: "Frecuente",
  aceptar: "Frecuente",
  rechazar: "Frecuente",
  cancelar: "Frecuente",
  descargar: "Básico",
  inscribir: "Frecuente",
};

const DEFAULT_CATEGORY_BY_ACTION = {
  crear: "Registro",
  ver: "Consulta",
  editar: "Edición",
  eliminar: "Mantenimiento",
  aprobar: "Validación",
  aceptar: "Validación",
  rechazar: "Validación",
  cancelar: "Control",
  descargar: "Reporte",
  inscribir: "Proceso",
};

const DEFAULT_DURATION_BY_ACTION = {
  crear: "0:40",
  ver: "0:25",
  editar: "0:35",
  eliminar: "0:30",
  default: "0:30",
};

// Sparse metadata layer indexed by moduleId + actionId.
// Add or adjust only what you need. Everything else is derived.
export const HELP_METADATA_OVERRIDES = {
  roles: {
    crear: {
      title: "Cómo crear un rol",
      description: "Configura un rol con permisos por módulo y acción.",
      steps: [
        "Abre el formulario de crear rol.",
        "Ingresa nombre y descripción.",
        "Activa permisos y guarda.",
      ],
      tips: ["Asigna solo permisos necesarios para el rol."],
    },
    editar: {
      title: "Cómo editar un rol",
      description: "Actualiza permisos de un rol existente sin perder control.",
      steps: [
        "Abre el detalle del rol.",
        "Activa o desactiva permisos.",
        "Guarda cambios.",
      ],
      tips: ["Valida el alcance antes de confirmar."],
    },
  },
  users: {
    crear: {
      title: "Cómo crear un usuario",
      description: "Registra un usuario y asigna su rol inicial.",
    },
  },
  employees: {
    crear: {
      title: "Cómo crear un empleado",
      description: "Registra un empleado en pocos pasos.",
      steps: [
        "Haz clic en crear.",
        "Completa campos obligatorios.",
        "Guarda información.",
      ],
      tips: ["Valida documento y correo antes de guardar."],
    },
    editar: {
      title: "Cómo editar un empleado",
      description: "Actualiza datos del empleado seleccionado.",
      steps: [
        "Ubica el registro.",
        "Abre editar.",
        "Actualiza y guarda.",
      ],
      tips: ["Revisa cambios antes de confirmar."],
    },
    ver: {
      title: "Cómo ver un empleado",
      description: "Consulta la información de un empleado registrado.",
      steps: [
        "Ubica el registro en la tabla.",
        "Haz clic en ver.",
        "Revisa la información disponible.",
      ],
    },
    eliminar: {
      title: "Cómo eliminar un empleado",
      description: "Elimina un registro de empleado de forma segura.",
      steps: [
        "Ubica el registro en la tabla.",
        "Haz clic en eliminar.",
        "Confirma la eliminación.",
      ],
      tips: ["Verifica que sea el registro correcto antes de confirmar."],
    },
  },
  temporaryWorkers: {
    crear: {
      title: "Cómo crear una persona temporal",
      description: "Registra una persona temporal para eventos o apoyos.",
      steps: [
        "Haz clic en crear.",
        "Completa los datos obligatorios.",
        "Guarda la información.",
      ],
    },
    editar: {
      title: "Cómo editar una persona temporal",
      description: "Actualiza la información de una persona temporal.",
      steps: [
        "Ubica el registro en la tabla.",
        "Haz clic en editar.",
        "Actualiza la información y guarda.",
      ],
    },
    ver: {
      title: "Cómo ver una persona temporal",
      description: "Consulta la información de una persona temporal registrada.",
      steps: [
        "Ubica el registro en la tabla.",
        "Haz clic en ver.",
        "Revisa la información disponible.",
      ],
    },
    eliminar: {
      title: "Cómo eliminar una persona temporal",
      description: "Elimina un registro de persona temporal de forma segura.",
      steps: [
        "Ubica el registro en la tabla.",
        "Haz clic en eliminar.",
        "Confirma la eliminación.",
      ],
      tips: ["Verifica que sea el registro correcto antes de confirmar."],
    },
  },
};

// Keep only video links here for quick maintenance.
// Key format: moduleId -> actionId -> driveUrl
export const HELP_VIDEO_URLS = {
  dashboard: {
    ver: "https://drive.google.com/file/d/1B5qw7sSsB9IAnM7O9ArgH3n-aL8FXTqT/view?usp=sharing",
  },
  roles: {
    crear: "https://drive.google.com/file/d/18hcqrAIH7zS9Mn795lWmj00eJ9UPU6D3/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1GxK9ak409cPj8NeV1nM6PZAXBUgwmPuo/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1WRm1q7WOrvvgHpB8RxgPN37aayNp-iVz/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1tX-We-4U2SEOFKUoo8nrmHpoMn_WPNAL/view?usp=sharing",
  },
  employees: {
    crear: "https://drive.google.com/file/d/1sbNchxoN6T3XmD2KbhqGyxLhMeI3r7Jv/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1cggDOu8yrqnbl80-Q8gQhZoYAUwQKyZ6/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1iAJ8FEzodH64CIUq-zRGpE0W5vlNhbC_/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1ZSY3GmFlii7YmpWKAXxFb486WoYa84fq/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1VEHLVlw8FBvnNeA9IpJdSnch4tEDdsSL/view?usp=sharing",
  },
  temporaryWorkers: {
    crear: "https://drive.google.com/file/d/1ildmWGv8gJHQT965hHGCCDXrnpQqiLr4/view?usp=sharing",
    editar: "https://drive.google.com/file/d/10xzo559nZ1kqbTaCxrGu6WrwlRTh-Em2/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1mOdGzil9RPVzFmmdcnARXR22ngMiB4Kx/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1BeD1CWoBpD76yTA1DZTg6EVyjissHH0a/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1kJIYEkP9R08-9zsQ_XFtLGwB1vycB7KV/view?usp=sharing",
  },
};

const buildDefaultSteps = (moduleName, actionName) => [
  `Abre el módulo ${moduleName}.`,
  `Selecciona la acción ${actionName}.`,
  "Completa el flujo y confirma los cambios.",
];

const buildDefaultTips = (actionName) => [
  `Revisa la información antes de ${String(actionName).toLowerCase()}.`,
];

const buildDefaultHelpEntry = ({ moduleName, actionId, actionName }) => ({
  title: `Cómo ${String(actionName).toLowerCase()} en ${moduleName}`,
  description: `Guía rápida para ${String(actionName).toLowerCase()} dentro del módulo ${moduleName}.`,
  duration: DEFAULT_DURATION_BY_ACTION[actionId] || DEFAULT_DURATION_BY_ACTION.default,
  level: DEFAULT_LEVEL_BY_ACTION[actionId] || "Básico",
  category: DEFAULT_CATEGORY_BY_ACTION[actionId] || "General",
  videoUrl: "",
  steps: buildDefaultSteps(moduleName, actionName),
  tips: buildDefaultTips(actionName),
});

const mergeHelpEntries = (baseEntry, overrideEntry = {}) => ({
  ...baseEntry,
  ...overrideEntry,
  steps: Array.isArray(overrideEntry.steps) ? overrideEntry.steps : baseEntry.steps,
  tips: Array.isArray(overrideEntry.tips) ? overrideEntry.tips : baseEntry.tips,
});

export const buildHelpMetadataIndex = () => {
  const moduleCatalog = buildHelpModuleCatalog();
  const index = {};

  moduleCatalog.forEach((moduleItem) => {
    index[moduleItem.moduleId] = {};

    moduleItem.actions.forEach((actionItem) => {
      const baseEntry = buildDefaultHelpEntry({
        moduleName: moduleItem.moduleName,
        actionId: actionItem.actionId,
        actionName: actionItem.actionName,
      });

      const overrideEntry =
        HELP_METADATA_OVERRIDES[moduleItem.moduleId]?.[actionItem.actionId] || {};

      const videoUrlOverride =
        HELP_VIDEO_URLS[moduleItem.moduleId]?.[actionItem.actionId] || "";

      index[moduleItem.moduleId][actionItem.actionId] = mergeHelpEntries(
        baseEntry,
        {
          ...overrideEntry,
          videoUrl: videoUrlOverride || overrideEntry.videoUrl || baseEntry.videoUrl,
        },
      );
    });
  });

  return index;
};

export const HELP_METADATA_INDEX = buildHelpMetadataIndex();
