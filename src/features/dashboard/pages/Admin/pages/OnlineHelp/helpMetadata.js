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

const formatActionNameFromId = (actionId = "") =>
  String(actionId)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
  enrollments: {
    aceptar: {
      actionName: "Matricular inscripción",
      title: "Cómo matricular una inscripción",
      description: "Acepta una inscripción para completar el proceso de matrícula.",
    },
    rechazar: {
      actionName: "Rechazar inscripción",
      title: "Cómo rechazar una inscripción",
      description: "Rechaza una inscripción con validaciones del flujo.",
    },
    "migracion-masiva-matricula": {
      actionName: "Migración masiva matrícula",
      title: "Cómo hacer migración masiva de matrícula",
      description: "Carga y procesa matrículas en bloque.",
    },
    "historial-matricula": {
      actionName: "Historial matrícula",
      title: "Cómo consultar historial de matrícula",
      description: "Revisa el historial y trazabilidad de una matrícula.",
    },
    "generar-reportes-matriculas": {
      actionName: "Generar reportes matrículas",
      title: "Cómo generar reportes de matrículas",
      description: "Exporta reportes de la gestión de matrículas.",
    },
    "filtros-gestion-matriculas": {
      actionName: "Filtros gestión matrículas",
      title: "Cómo usar filtros en gestión de matrículas",
      description: "Filtra la información para encontrar registros rápidamente.",
    },
    "crear-matricula": {
      actionName: "Crear matrícula",
      title: "Cómo crear una matrícula",
      description: "Registra una nueva matrícula paso a paso.",
    },
    "buscar-matricula": {
      actionName: "Buscar matrícula",
      title: "Cómo buscar una matrícula",
      description: "Encuentra matrículas por criterios clave.",
    },
    "buscar-inscripcion": {
      actionName: "Buscar inscripción",
      title: "Cómo buscar una inscripción",
      description: "Ubica inscripciones para su gestión posterior.",
    },
  },
  athletesSection: {
    "ver-mensualidades-deportista": {
      actionName: "Ver mensualidades deportista",
      title: "Cómo ver mensualidades de un deportista",
      description: "Consulta el estado de mensualidades del deportista.",
    },
    "ver-detalle-deportista": {
      actionName: "Ver detalle deportista",
      title: "Cómo ver detalle de deportista",
      description: "Revisa la información detallada del deportista.",
    },
    "ver-detalle-acudiente": {
      actionName: "Ver detalle acudiente",
      title: "Cómo ver detalle de acudiente",
      description: "Consulta los datos del acudiente asociado.",
    },
    "remover-acudiente": {
      actionName: "Remover acudiente",
      title: "Cómo remover un acudiente",
      description: "Desasocia un acudiente del deportista seleccionado.",
    },
    "generar-reporte-deportistas": {
      actionName: "Generar reporte deportistas",
      title: "Cómo generar reporte de deportistas",
      description: "Genera reportes del módulo de gestión de deportistas.",
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
    "generar-reporte-personas-temporales": {
      actionName: "Generar reporte personas temporales",
      title: "Cómo generar reporte de personas temporales",
      description: "Genera reportes del módulo de personas temporales.",
    },
  },
  temporaryTeams: {
    crear: {
      actionName: "Crear equipo",
      title: "Cómo crear un equipo",
      description: "Registra un equipo nuevo en el sistema.",
    },
    editar: {
      actionName: "Editar equipo",
      title: "Cómo editar un equipo",
      description: "Actualiza la información de un equipo existente.",
    },
    eliminar: {
      actionName: "Eliminar equipo",
      title: "Cómo eliminar un equipo",
      description: "Elimina un equipo de forma controlada.",
    },
    ver: {
      actionName: "Ver detalle equipos",
      title: "Cómo ver detalle de un equipo",
      description: "Consulta la información detallada de un equipo.",
    },
    "generar-reporte-equipos": {
      actionName: "Generar reporte equipos",
      title: "Cómo generar reporte de equipos",
      description: "Genera reportes del módulo de equipos.",
    },
    "buscar-equipo": {
      actionName: "Buscar equipo",
      title: "Cómo buscar un equipo",
      description: "Encuentra equipos por criterios y filtros.",
    },
  },
  myPayments: {
    "ver-comprobante-historial-pagos": {
      requiredPermission: "Ver",
      actionName: "Ver comprobante historial pagos",
      title: "Cómo ver comprobante en historial de pagos",
      description: "Consulta comprobantes desde el historial de pagos de deportista.",
      steps: [
        "Abre el módulo Mis Pagos.",
        "Ubica el pago en el historial.",
        "Haz clic en ver comprobante para abrirlo.",
      ],
      tips: ["Verifica que el comprobante corresponda al pago seleccionado."],
    },
    "ver-comprobante-deportista": {
      requiredPermission: "Ver",
      actionName: "Ver comprobante deportista",
      title: "Cómo ver mi comprobante",
      description: "Visualiza el comprobante de pago.",
      steps: [
        "Abre el módulo Mis Pagos.",
        "Selecciona el pago que quieres revisar.",
        "Haz clic en ver comprobante.",
      ],
      tips: ["Confirma la fecha y valor antes de continuar."],
    },
    "subir-comprobante": {
      requiredPermission: "Ver",
      actionName: "Subir comprobante",
      title: "Cómo subir un comprobante",
      description: "Carga el comprobante de pago desde la vista de deportista.",
      steps: [
        "Abre el módulo Mis Pagos.",
        "Selecciona la opción subir comprobante.",
        "Adjunta el archivo y confirma el envío.",
      ],
      tips: ["Sube una imagen o PDF legible para evitar rechazos."],
    },
    "descargar-comprobante": {
      requiredPermission: "Ver",
      actionName: "Descargar comprobante",
      title: "Cómo descargar un comprobante",
      description: "Descarga el comprobante de pago en formato disponible.",
      steps: [
        "Abre el módulo Mis Pagos.",
        "Ubica el comprobante que necesitas.",
        "Haz clic en descargar comprobante.",
      ],
      tips: ["Guarda el archivo con un nombre fácil de identificar."],
    },
    "buscar-historial-pagos-deportista": {
      requiredPermission: "Ver",
      actionName: "Buscar historial pagos deportista",
      title: "Cómo buscar en Mis Pagos",
      description: "Encuentra pagos del deportista usando filtros y búsqueda.",
      steps: [
        "Abre el módulo Mis Pagos.",
        "Escribe en el buscador del historial.",
        "Revisa los resultados que se muestran en la lista.",
      ],
      tips: ["Usa un dato corto como mes o estado para encontrar más rápido."],
    },
  },
  paymentsManagement: {
    ver: {
      actionName: "Ver pagos pendientes admin",
      title: "Cómo ver pagos pendientes",
      description: "Consulta los comprobantes pendientes por revisar.",
    },
    aprobar: {
      actionName: "Aprobar comprobante pagos pendientes",
      title: "Cómo aprobar comprobantes pendientes",
      description: "Aprueba comprobantes de pago pendientes desde el panel admin.",
    },
    rechazar: {
      actionName: "Rechazar comprobante pagos pendientes",
      title: "Cómo rechazar comprobantes pendientes",
      description: "Rechaza comprobantes de pago pendientes con validación.",
    },
    descargar: {
      actionName: "Descargar comprobante",
      title: "Cómo descargar un comprobante",
      description: "Descarga comprobantes para validación o soporte.",
    },
    "ver-comprobante-historial-pagos": {
      actionName: "Ver comprobante historial pagos",
      title: "Cómo ver comprobantes en historial de pagos",
      description: "Visualiza comprobantes dentro del historial de pagos.",
    },
    "buscar-historial-pagos": {
      actionName: "Buscar historial pagos",
      title: "Cómo buscar en historial de pagos",
      description: "Encuentra registros en el historial de pagos.",
    },
    "buscar-pagos-pendientes": {
      actionName: "Buscar pagos pendientes",
      title: "Cómo buscar pagos pendientes",
      description: "Filtra y ubica pagos pendientes rápidamente.",
    },
    "filtro-historial-pagos": {
      actionName: "Filtro historial pagos",
      title: "Cómo usar filtros en historial de pagos",
      description: "Aplica filtros para segmentar el historial de pagos.",
    },
    "generar-reporte-historial-pagos": {
      actionName: "Generar reporte historial pagos",
      title: "Cómo generar reporte de historial de pagos",
      description: "Genera reportes del historial de pagos desde admin.",
    },
  },
  materials: {
    crear: {
      actionName: "Crear material",
      title: "Cómo crear un material",
      description: "Registra un material nuevo en el inventario.",
    },
    editar: {
      actionName: "Editar material",
      title: "Cómo editar un material",
      description: "Actualiza la información de un material existente.",
    },
    eliminar: {
      actionName: "Eliminar material",
      title: "Cómo eliminar un material",
      description: "Elimina un material de forma controlada.",
    },
    ver: {
      actionName: "Ver detalle material",
      title: "Cómo ver detalle de un material",
      description: "Consulta el detalle de un material del inventario.",
    },
    "ver-asignaciones-del-material": {
      actionName: "Ver asignación evento material",
      title: "Cómo ver asignaciones de material en eventos",
      description: "Consulta en qué eventos está asignado el material.",
    },
    "transferir-stock": {
      actionName: "Transferencia stock material",
      title: "Cómo transferir stock de material",
      description: "Transfiere stock de material entre ubicaciones o contextos.",
    },
    "registrar-baja-de-material": {
      actionName: "Dar baja material",
      title: "Cómo dar de baja un material",
      description: "Registra la baja de un material en el inventario.",
    },
    "generar-reporte-materiales": {
      actionName: "Generar reporte materiales",
      title: "Cómo generar reporte de materiales",
      description: "Genera reportes del módulo de gestión de materiales.",
    },
    "buscar-material": {
      actionName: "Buscar material",
      title: "Cómo buscar un material",
      description: "Encuentra materiales por criterios y filtros.",
    },
  },
  providers: {
    crear: {
      actionName: "Crear proveedor",
      title: "Cómo crear un proveedor",
      description: "Registra un proveedor nuevo en el sistema.",
    },
    editar: {
      actionName: "Editar proveedor",
      title: "Cómo editar un proveedor",
      description: "Actualiza la información de un proveedor existente.",
    },
    eliminar: {
      actionName: "Eliminar proveedor",
      title: "Cómo eliminar un proveedor",
      description: "Elimina un proveedor de forma controlada.",
    },
    ver: {
      actionName: "Ver detalle proveedor",
      title: "Cómo ver detalle de un proveedor",
      description: "Consulta la información detallada de un proveedor.",
    },
    "generar-reporte-proveedores": {
      actionName: "Generar reporte proveedores",
      title: "Cómo generar reporte de proveedores",
      description: "Genera reportes del módulo de proveedores.",
    },
    "buscar-proveedor": {
      actionName: "Buscar proveedor",
      title: "Cómo buscar un proveedor",
      description: "Encuentra proveedores por filtros y criterios.",
    },
  },
  eventsManagement: {
    crear: {
      actionName: "Crear evento",
      title: "Cómo crear un evento",
      description: "Registra un evento nuevo en el sistema.",
    },
    editar: {
      actionName: "Editar evento",
      title: "Cómo editar un evento",
      description: "Actualiza la información de un evento existente.",
    },
    eliminar: {
      actionName: "Eliminar evento",
      title: "Cómo eliminar un evento",
      description: "Elimina un evento de forma controlada.",
    },
    ver: {
      actionName: "Ver evento",
      title: "Cómo ver un evento",
      description: "Consulta el detalle de un evento.",
    },
    "generar-reporte-eventos": {
      actionName: "Generar reporte eventos",
      title: "Cómo generar reporte de eventos",
      description: "Genera reportes del módulo de eventos.",
    },
    "filtros-eventos": {
      actionName: "Filtros eventos",
      title: "Cómo usar filtros de eventos",
      description: "Filtra eventos para ubicar registros rápidamente.",
    },
    "buscar-evento": {
      actionName: "Buscar evento",
      title: "Cómo buscar un evento",
      description: "Encuentra eventos por criterios de búsqueda.",
    },
    "materiales-usar": {
      actionName: "Materiales usar",
      title: "Cómo gestionar materiales por usar",
      description: "Administra materiales de uso para el evento.",
    },
    "materiales-entregar": {
      actionName: "Materiales entregar",
      title: "Cómo gestionar materiales por entregar",
      description: "Administra materiales para entrega en el evento.",
    },
    "ver-equipos-inscritos": {
      actionName: "Ver equipos inscritos",
      title: "Cómo ver equipos inscritos",
      description: "Consulta los equipos inscritos en el evento.",
    },
    "ver-deportistas-inscritas": {
      actionName: "Ver deportistas inscritas",
      title: "Cómo ver deportistas inscritas",
      description: "Consulta las deportistas inscritas en el evento.",
    },
    "inscribir-equipos": {
      actionName: "Inscribir equipos",
      title: "Cómo inscribir equipos",
      description: "Registra equipos en el evento seleccionado.",
    },
    "inscribir-deportistas": {
      actionName: "Inscribir deportistas",
      title: "Cómo inscribir deportistas",
      description: "Registra deportistas en el evento seleccionado.",
    },
  },
  materialsRegistry: {
    ver: {
      actionName: "Ver detalle ingreso",
      title: "Cómo ver detalle de un ingreso",
      description: "Consulta el detalle de un ingreso de materiales.",
    },
    editar: {
      actionName: "Editar ingresos",
      title: "Cómo editar un ingreso",
      description: "Actualiza la información de un ingreso de material.",
    },
    "ver-detalle-salidas": {
      actionName: "Ver detalle salidas",
      title: "Cómo ver detalle de salidas",
      description: "Consulta el detalle de salidas de materiales.",
    },
    "generar-reporte-salidas": {
      actionName: "Generar reporte salidas",
      title: "Cómo generar reporte de salidas",
      description: "Genera reportes de salidas de materiales.",
    },
    "generar-reporte-ingresos": {
      actionName: "Generar reporte ingresos",
      title: "Cómo generar reporte de ingresos",
      description: "Genera reportes de ingresos de materiales.",
    },
    "filtros-salidas": {
      actionName: "Filtros salidas",
      title: "Cómo usar filtros de salidas",
      description: "Filtra salidas para ubicar registros rápidamente.",
    },
    "filtros-ingresos": {
      actionName: "Filtros ingresos",
      title: "Cómo usar filtros de ingresos",
      description: "Filtra ingresos para ubicar registros rápidamente.",
    },
    "crear-ingreso-material": {
      actionName: "Crear ingreso material",
      title: "Cómo crear un ingreso de material",
      description: "Registra un nuevo ingreso de material.",
    },
    "buscar-salida": {
      actionName: "Buscar salida",
      title: "Cómo buscar una salida",
      description: "Encuentra salidas de materiales por criterios.",
    },
    "buscar-ingreso-material": {
      actionName: "Buscar ingreso material",
      title: "Cómo buscar un ingreso de material",
      description: "Encuentra ingresos de materiales por filtros.",
    },
  },
  materialCategories: {
    crear: {
      actionName: "Crear categoría material",
      title: "Cómo crear una categoría de material",
      description: "Registra una categoría nueva para organizar materiales.",
    },
    editar: {
      actionName: "Editar categoría material",
      title: "Cómo editar una categoría de material",
      description: "Actualiza la información de una categoría existente.",
    },
    eliminar: {
      actionName: "Eliminar categoría material",
      title: "Cómo eliminar una categoría de material",
      description: "Elimina una categoría de material de forma controlada.",
    },
    ver: {
      actionName: "Ver detalle categoría material",
      title: "Cómo ver detalle de una categoría de material",
      description: "Consulta el detalle de una categoría de material.",
    },
    "generar-reporte-categorias": {
      actionName: "Generar reporte categorías",
      title: "Cómo generar reporte de categorías",
      description: "Genera reportes de categorías de materiales.",
    },
    "buscar-categoria-material": {
      actionName: "Buscar categoría material",
      title: "Cómo buscar una categoría de material",
      description: "Encuentra categorías con filtros y búsqueda.",
    },
  },
};

// Keep only video links here for quick maintenance.
// Key format: moduleId -> actionId -> driveUrl
export const HELP_VIDEO_URLS = {
  dashboard: {
    ver: "https://drive.google.com/file/d/1B5qw7sSsB9IAnM7O9ArgH3n-aL8FXTqT/view?usp=sharing",
  },
  users: {
    ver: "https://drive.google.com/file/d/1rwejLJ34Z_S-W4A7kkTNpibuDzhSk00x/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1gTOFTrduRQmWefPhYMVN77Q4RWdZQY7D/view?usp=sharing",
    "generar-reporte":
      "https://drive.google.com/file/d/16L54VcCMjTah6APPmHLZBcKI-8eSAMBw/view?usp=sharing",
  },
  enrollments: {
    rechazar: "https://drive.google.com/file/d/1KK2yBf2AmKwmY2RsCqtL-D9BiX0bsrFm/view?usp=sharing",
    aceptar: "https://drive.google.com/file/d/1ofwoALPF6IQYJmhPYD8ZDVtupK6vijaX/view?usp=sharing",
    "migracion-masiva-matricula":
      "https://drive.google.com/file/d/1wlUllkr_wFDjG2Gm9y3KvrgFvINYZYYT/view?usp=sharing",
    "historial-matricula":
      "https://drive.google.com/file/d/1KruDMZ9cyeuKHL111jL_yUHQy7mB3e4J/view?usp=sharing",
    "generar-reportes-matriculas":
      "https://drive.google.com/file/d/1tlm5ZpXI1KOyfx794abOYB4h8LefQ7hu/view?usp=sharing",
    "filtros-gestion-matriculas":
      "https://drive.google.com/file/d/1c1ZVwPhBb1mpwRwjEvBvZi9-JIKJrgGX/view?usp=sharing",
    "crear-matricula":
      "https://drive.google.com/file/d/1vgNIm69BlH_TRHzG6c__2OQZxE4RwnkJ/view?usp=sharing",
    "buscar-matricula":
      "https://drive.google.com/file/d/1AoEvoEvCOkeUsKag8-RduGomyvbyHTw6/view?usp=sharing",
    "buscar-inscripcion":
      "https://drive.google.com/file/d/1HMxsBWrlBgBaVT3ayrWI7r46hh1Pb858/view?usp=sharing",
  },
  athletesSection: {
    "ver-mensualidades-deportista":
      "https://drive.google.com/file/d/1t4ovGLuDzz34cO9oDVGeJqoX3Ke0liaR/view?usp=sharing",
    "ver-detalle-deportista":
      "https://drive.google.com/file/d/16EZqy3OEm0RkgdpA0JkBp2loNwPTp9qr/view?usp=sharing",
    "ver-detalle-acudiente":
      "https://drive.google.com/file/d/179qPLHHKHvV1xzdciTzdFbr0YjGceDE3/view?usp=sharing",
    "remover-acudiente":
      "https://drive.google.com/file/d/1bLlzBILSJAxZAGD8xfqk42XnRPnODvEW/view?usp=sharing",
    "generar-reporte-deportistas":
      "https://drive.google.com/file/d/1hMSGymxfqVDoxAbVUXmSZ5pJQIkTtSq-/view?usp=sharing",
  },
  roles: {
    crear: "https://drive.google.com/file/d/18hcqrAIH7zS9Mn795lWmj00eJ9UPU6D3/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1GxK9ak409cPj8NeV1nM6PZAXBUgwmPuo/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1WRm1q7WOrvvgHpB8RxgPN37aayNp-iVz/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1tX-We-4U2SEOFKUoo8nrmHpoMn_WPNAL/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1Wern0Buiv08-WyZvat5qcwW-D2in9CNo/view?usp=sharing",
  },
  employees: {
    crear: "https://drive.google.com/file/d/1sbNchxoN6T3XmD2KbhqGyxLhMeI3r7Jv/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1cggDOu8yrqnbl80-Q8gQhZoYAUwQKyZ6/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1iAJ8FEzodH64CIUq-zRGpE0W5vlNhbC_/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1ZSY3GmFlii7YmpWKAXxFb486WoYa84fq/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1VEHLVlw8FBvnNeA9IpJdSnch4tEDdsSL/view?usp=sharing",
    "generar-reporte":
      "https://drive.google.com/file/d/1unNxwlbrXmQdQZyGPG_leKzrBOkCXYOf/view?usp=sharing",
  },
  employeesSchedule: {
    crear: "https://drive.google.com/file/d/1fEYRqXl_FhiitpJCxlMDefhF3wpGYlwo/view?usp=sharing",
    ver: "https://drive.google.com/file/d/187POYxqHKFPnHCcF9WNJF30lTlW6fzxd/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1F1r4zHqZLp6BYWSteQ5HSY5ZHpyQVyQ-/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1wxJqQI5Rx1kpyoQXTbQYUlAptv8ErGIS/view?usp=sharing",
  },
  appointmentManagement: {
    crear: "https://drive.google.com/file/d/11UG4JSdIH2zvEcCEt2Z1U8kMNwRWlgiI/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1Y8trO9oCofZodxkIhFm_ax1qc_KwPDcR/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1hXaMlWfWfWEdkzkmhlmyGHwDz-dkNj7B/view?usp=sharing",
    completar: "https://drive.google.com/file/d/1dL5K14mIjtLvg4zfTgZbAM598N0fWB-X/view?usp=sharing",
    cancelar: "https://drive.google.com/file/d/1aD-_3DuhClpZ3nGEs9Wv5CCPmALi4sNk/view?usp=sharing",
  },
  sportsCategory: {
    crear: "https://drive.google.com/file/d/1x9hH24_KMPXc5yg78Dk52JNI-PmtlNXC/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1ASwWMKJOHfL5bhJK6wM-Ef-ZlYxObYAy/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1aYsBCCu-jH03g6KKgLShyx9TggzZbvwL/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1zqAhEJSyzpP9PSEsktxJixhfKQrDEMLt/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1aL8A8oIHJKeKJTVdf5pG4j3KUQH8iAme/view?usp=sharing",
    listar: "https://drive.google.com/file/d/1X9XcVFYk4DI_qrCWOaU-kBqqNc36gx93/view?usp=sharing",
  },
  athletesAssistance: {
    crear: "https://drive.google.com/file/d/1BFSK8VUthQgME2RMZkfETQd1V2TEAPHt/view?usp=sharing",
    ver: "https://drive.google.com/file/d/10xW8TUplcNUvz19CnqMF5FksP5RIGNJj/view?usp=sharing",
    editar: "https://drive.google.com/file/d/1yLtbTb-ZZcTBwgDbuc_opsSHQDIYr8Jx/view?usp=sharing",
  },
  donorsSponsors: {
    crear: "https://drive.google.com/file/d/1VRTa732Y3xJ4hd_8P-WJtiKE0f2AJ4H0/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1JftTmNkrdL3QSL5ZsIISZZh0ftKoRfOC/view?usp=sharing",
    editar: "https://drive.google.com/file/d/174Iv3i5sFr0j07csJxdn17uKb-sltsAq/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1MQXQuEE0s0YalH6DlcfC8JotfYz31Sji/view?usp=sharing",
  },
  donationsManagement: {
    crear: "https://drive.google.com/file/d/1-6DkuzbXedUqobVD-AaiJjOtoR9SP_e3/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1NYQRNIbwPDQe1l9Tsuj0VCQH0hpSkpWz/view?usp=sharing",
    "descargar-certificado-de-donacion":
      "https://drive.google.com/file/d/1W14LP5QASEYCrHtzeJ8Man6EN3n-C8IH/view?usp=sharing",
    "cambiar-estado":
      "https://drive.google.com/file/d/1gCYNOypX0aMdl4hUjldQoXIwOSqFLBiJ/view?usp=sharing",
    "filtrar-donaciones":
      "https://drive.google.com/file/d/1NfawH6CSPnUaH3hmhe84ZxhitlfCZswc/view?usp=sharing",
  },
  temporaryWorkers: {
    crear: "https://drive.google.com/file/d/1ildmWGv8gJHQT965hHGCCDXrnpQqiLr4/view?usp=sharing",
    editar: "https://drive.google.com/file/d/10xzo559nZ1kqbTaCxrGu6WrwlRTh-Em2/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1mOdGzil9RPVzFmmdcnARXR22ngMiB4Kx/view?usp=sharing",
    eliminar: "https://drive.google.com/file/d/1BeD1CWoBpD76yTA1DZTg6EVyjissHH0a/view?usp=sharing",
    buscar: "https://drive.google.com/file/d/1kJIYEkP9R08-9zsQ_XFtLGwB1vycB7KV/view?usp=sharing",
    "generar-reporte-personas-temporales":
      "https://drive.google.com/file/d/1X9dD7X5poirifArnFNd7tooFhsAM34xJ/view?usp=sharing",
  },
  temporaryTeams: {
    ver: "https://drive.google.com/file/d/1BIS-f1EXOdNaVJfAX5GjH_Pp82Z_UYyE/view?usp=sharing",
    "generar-reporte-equipos":
      "https://drive.google.com/file/d/1_jM2pMLjeHZ0WYNXKyeggGzjPiGm5b5A/view?usp=sharing",
    eliminar:
      "https://drive.google.com/file/d/1PTIskVPk2dWYSgYpFzsUnBL6OaBk3BUj/view?usp=sharing",
    editar:
      "https://drive.google.com/file/d/10PFHW53oWDuNstJNBBsSoSOBkyY27HPR/view?usp=sharing",
    crear:
      "https://drive.google.com/file/d/1xlRYgEmiE2dWmsZ_zUftIhA0VgIIa8py/view?usp=sharing",
    "buscar-equipo":
      "https://drive.google.com/file/d/1mrNAv4eyArGyVVGkvbfUK6ZKZJr8IlXG/view?usp=sharing",
  },
  myPayments: {
    "ver-comprobante-historial-pagos":
      "https://drive.google.com/file/d/1SdG4_AbeJCZBIzyew2msjf5BkThWsuf7/view?usp=sharing",
    "ver-comprobante-deportista":
      "https://drive.google.com/file/d/16WQOzmK8vzsbHA6g3WQjULoEv0d318bR/view?usp=sharing",
    "subir-comprobante":
      "https://drive.google.com/file/d/1THbbM4FLe6Jo60LH59E_D_hAJ2TedlPP/view?usp=sharing",
    "descargar-comprobante":
      "https://drive.google.com/file/d/1sYQ47h05CJwoKKSzET9KAG7So1WR4R8D/view?usp=sharing",
    "buscar-historial-pagos-deportista":
      "https://drive.google.com/file/d/1MyhQkXK7X5Uq_Vewo4C7B0nygq-yeuby/view?usp=sharing",
  },
  paymentsManagement: {
    aprobar:
      "https://drive.google.com/file/d/1H21eun0xIW6YmMSE0LbcGDXcrTRQOg3D/view?usp=sharing",
    "buscar-historial-pagos":
      "https://drive.google.com/file/d/1Ecm_v10OehXkl2T7E3bbnN0s-K0xOsnN/view?usp=sharing",
    "buscar-pagos-pendientes":
      "https://drive.google.com/file/d/1sCfTPEooFK14-SWqoy7QQdFnq2w9vZnf/view?usp=sharing",
    descargar:
      "https://drive.google.com/file/d/1dp03kulXasiqlP3HH49DRHV5-NsSu1Im/view?usp=sharing",
    "filtro-historial-pagos":
      "https://drive.google.com/file/d/1n9IZAHwV4s3avJluuVzd9OAWZSED1ZlP/view?usp=sharing",
    "generar-reporte-historial-pagos":
      "https://drive.google.com/file/d/1ObRx05EfA7exP2VjrG2T0XnGiGC1qx3R/view?usp=sharing",
    rechazar:
      "https://drive.google.com/file/d/15SxkWl6ZeSs3KYEW8Pt8iP8Or8PTsTfI/view?usp=sharing",
    "ver-comprobante-historial-pagos":
      "https://drive.google.com/file/d/1jDL7y46okFBwigvCIlhNdCvLy87Fdmnx/view?usp=sharing",
    ver: "https://drive.google.com/file/d/1QB8a2QuPgm3IVcCKaL2UomJS-zF9Y0vw/view?usp=sharing",
  },
  materials: {
    ver: "https://drive.google.com/file/d/1HUsNXVOkXO0itOAehzEZjQGHA6zzZJKd/view?usp=sharing",
    "ver-asignaciones-del-material":
      "https://drive.google.com/file/d/147byOM0nvPFAf2y4uxhSu_g0Q5sOLxKO/view?usp=sharing",
    "transferir-stock":
      "https://drive.google.com/file/d/1vXntQmxPHzbwRmw6_3iRfrKNDK-fUEhp/view?usp=sharing",
    "generar-reporte-materiales":
      "https://drive.google.com/file/d/1kSjAKDOaWozciMlyUKHQFW3LvwEnfLPr/view?usp=sharing",
    eliminar:
      "https://drive.google.com/file/d/11F1q8ENEtTjpROFmnepBPyHvItuUNdZL/view?usp=sharing",
    editar:
      "https://drive.google.com/file/d/17rqkPhviZ0Gq0w9RAHnX5bW7WFTu3WVG/view?usp=sharing",
    "registrar-baja-de-material":
      "https://drive.google.com/file/d/1JsAzbHvYl1sb-Wt8vh-7k1a8zlYd5cOn/view?usp=sharing",
    crear:
      "https://drive.google.com/file/d/1Lba_qlPEK0GmHfIxg4bhd-qjJa6DZ9XU/view?usp=sharing",
    "buscar-material":
      "https://drive.google.com/file/d/17xaUbMPbBsf24GCz47fNamRK2pS_JM_S/view?usp=sharing",
  },
  providers: {
    ver: "https://drive.google.com/file/d/1BcI7-OOnuivrE-pXdvsipdEEya9L9kVX/view?usp=sharing",
    "generar-reporte-proveedores":
      "https://drive.google.com/file/d/1AvHyCSxM0yN7moJJhl6-69d_BgxrDTWk/view?usp=sharing",
    eliminar:
      "https://drive.google.com/file/d/1sjLPx9YqBeHDcY-kH1OxfkUhx6yHo1TC/view?usp=sharing",
    editar:
      "https://drive.google.com/file/d/1PkIFkl4Vid9Oac6rSVd-TCtE2dqrywjj/view?usp=sharing",
    crear:
      "https://drive.google.com/file/d/1ct1aS-bh1WjFDj1OeJq1cEMIMEFtDBAs/view?usp=sharing",
    "buscar-proveedor":
      "https://drive.google.com/file/d/15_t_LAsKKV_afFbRBm7nIcLAz1fqpyCr/view?usp=sharing",
  },
  eventsManagement: {
    ver: "https://drive.google.com/file/d/1qCNA_QkuBXfc9sO_Gt6DeaPLiZSvfz-T/view?usp=sharing",
    "generar-reporte-eventos":
      "https://drive.google.com/file/d/1xu4QJhKpD_zaemKT5AsAhC82hHP5i_OS/view?usp=sharing",
    "filtros-eventos":
      "https://drive.google.com/file/d/1LI_tMwYG0t2UFbSPoypaJs-CtiZtdBkJ/view?usp=sharing",
    eliminar:
      "https://drive.google.com/file/d/1nhI1weNEvby6B-ZBt09n8k1cZB-zRIAO/view?usp=sharing",
    editar:
      "https://drive.google.com/file/d/1ZqtwaYVKsVtws6s2Bj2lA9EwlcuYfceW/view?usp=sharing",
    crear:
      "https://drive.google.com/file/d/1wZKdxaeF7DH4lux8EvJhxsgN-Rt1-9Ps/view?usp=sharing",
    "buscar-evento":
      "https://drive.google.com/file/d/1yy3pqx4UPxtiNLkqvpLq_9dvbSqo3tXd/view?usp=sharing",
    "materiales-usar":
      "https://drive.google.com/file/d/1lyvcmSWFGOfhFMlqwVmnrkdx_NgDp3ZH/view?usp=sharing",
    "materiales-entregar":
      "https://drive.google.com/file/d/1BPuaahBOqPP-pN0Sqb66B3dBn2JBTl4d/view?usp=sharing",
    "ver-equipos-inscritos":
      "https://drive.google.com/file/d/1nmK8saJPst8O1tXYa2VhSByhAZPGFhcu/view?usp=sharing",
    "ver-deportistas-inscritas":
      "https://drive.google.com/file/d/1ZpvP0b2jkh5pfIbL3LqpKpZgEriefnKA/view?usp=sharing",
    "inscribir-equipos":
      "https://drive.google.com/file/d/1Ulkuap__qEAyqoX3Vps1LWV38C5tdUn3/view?usp=sharing",
    "inscribir-deportistas":
      "https://drive.google.com/file/d/1jAfwjH87FZ07gKKtVVqkocy2aFJjProw/view?usp=sharing",
  },
  materialsRegistry: {
    ver: "https://drive.google.com/file/d/1eLg5uEozlcmOJg_v3Saf1_UcTe6o9AcR/view?usp=sharing",
    editar:
      "https://drive.google.com/file/d/1MXGDSmEiRWsh7CJnODTM_DZLYXpT8rE8/view?usp=sharing",
    "ver-detalle-salidas":
      "https://drive.google.com/file/d/1Snl1OM1kuQKdEGbYp6M-W7uRlGg6WTyy/view?usp=sharing",
    "generar-reporte-salidas":
      "https://drive.google.com/file/d/1MsSPASnh5nc3WnXHx98JTHjUaWDVKnmz/view?usp=sharing",
    "generar-reporte-ingresos":
      "https://drive.google.com/file/d/1p8y2sB5dfdlKWuFyfghhSiZ8ud9ZBL0N/view?usp=sharing",
    "filtros-salidas":
      "https://drive.google.com/file/d/1h58J-eCOTXU1tWP1itMsVNHzXxNr3sfd/view?usp=sharing",
    "filtros-ingresos":
      "https://drive.google.com/file/d/1qfAMRcl_xPpR-fuNTRBGYhbfEaYD5LxW/view?usp=sharing",
    "crear-ingreso-material":
      "https://drive.google.com/file/d/1A8n6FLmv4oPNbUro1t-cFpi-cGlXR6Gd/view?usp=sharing",
    "buscar-salida":
      "https://drive.google.com/file/d/10cU50QpaZM9yDUw0Ynm7GdqIhcVm1NaK/view?usp=sharing",
    "buscar-ingreso-material":
      "https://drive.google.com/file/d/1BSIImZzlcGp0rhBN_11dnqLpwzsLNoxM/view?usp=sharing",
  },
  materialCategories: {
    ver: "https://drive.google.com/file/d/1YX47AUgZxZJNcAPXlTR42Mm_l37ut_DR/view?usp=sharing",
    "generar-reporte-categorias":
      "https://drive.google.com/file/d/17E4-q2f7LIZWUwneu96zq4moblgOmn1U/view?usp=sharing",
    eliminar:
      "https://drive.google.com/file/d/1qGHpmzC7Nw6nsheCmv3VkaR42DyKbkOt/view?usp=sharing",
    editar:
      "https://drive.google.com/file/d/1y3EOzf4JeTPHIQTpPSRdtGcTyeOwPFPZ/view?usp=sharing",
    crear:
      "https://drive.google.com/file/d/1d1O1de3jvuWcuhOD_FyxSzRbn_LPlvki/view?usp=sharing",
    "buscar-categoria-material":
      "https://drive.google.com/file/d/11S9JDhJD29tnSIELFhS98vHPWY5dr12I/view?usp=sharing",
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

const HELP_HIDDEN_ACTIONS_BY_MODULE = {
  athletesSection: ["ver", "editar", "eliminar", "acudiente"],
  myPayments: ["crear", "ver", "editar", "eliminar"],
  enrollments: ["ver"],
  eventsManagement: ["materiales", "inscribir", "ver-inscritos"],
};

export const buildHelpMetadataIndex = () => {
  const moduleCatalog = buildHelpModuleCatalog();
  const index = {};

  moduleCatalog.forEach((moduleItem) => {
    index[moduleItem.moduleId] = {};
    const overrideEntries = HELP_METADATA_OVERRIDES[moduleItem.moduleId] || {};
    const videoEntries = HELP_VIDEO_URLS[moduleItem.moduleId] || {};
    const actionMap = new Map(
      moduleItem.actions.map((actionItem) => [actionItem.actionId, actionItem.actionName]),
    );
    const hiddenActions = new Set(
      (HELP_HIDDEN_ACTIONS_BY_MODULE[moduleItem.moduleId] || []).map((actionId) =>
        String(actionId),
      ),
    );
    const actionIds = [
      ...new Set([
        ...moduleItem.actions.map((actionItem) => actionItem.actionId),
        ...Object.keys(overrideEntries),
        ...Object.keys(videoEntries),
      ]),
    ].filter((actionId) => !hiddenActions.has(actionId));

    actionIds.forEach((actionId) => {
      const overrideEntry = overrideEntries[actionId] || {};
      const actionName =
        actionMap.get(actionId) ||
        overrideEntry.actionName ||
        formatActionNameFromId(actionId);
      const baseEntry = buildDefaultHelpEntry({
        moduleName: moduleItem.moduleName,
        actionId,
        actionName,
      });
      const videoUrlOverride = videoEntries[actionId] || "";

      index[moduleItem.moduleId][actionId] = mergeHelpEntries(
        baseEntry,
        {
          actionName,
          ...overrideEntry,
          videoUrl: videoUrlOverride || overrideEntry.videoUrl || baseEntry.videoUrl,
        },
      );
    });
  });

  return index;
};

export const HELP_METADATA_INDEX = buildHelpMetadataIndex();
