/**
 * Configuración centralizada de módulos del sistema
 * Este archivo define todos los módulos y se auto-mantiene
 */

/**
 * Configuración de módulos con sus metadatos
 * Cada módulo tiene:
 * - id: identificador único
 * - name: nombre para mostrar
 * - path: ruta base
 * - icon: icono a usar
 * - category: categoría para agrupación
 * - requiredRole: roles mínimos (opcional)
 */
export const MODULE_CONFIG = {
  // === MÓDULOS PRINCIPALES ===
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    path: "/dashboard/analytics",
    icon: "MdDashboard",
    category: "main",
    description: "Panel principal con estadísticas",
  },

  // === GESTIÓN DE USUARIOS ===
  users: {
    id: "users",
    name: "Usuarios",
    path: "/dashboard/users",
    icon: "FaUsers",
    category: "admin",
    description: "Gestión de usuarios del sistema",
  },

  roles: {
    id: "roles",
    name: "Roles",
    path: "/dashboard/roles",
    icon: "FaUserShield",
    category: "admin",
    description: "Gestión de roles y permisos",
  },

  // === SERVICIOS ===
  employees: {
    id: "employees",
    name: "Empleados",
    path: "/dashboard/employees",
    icon: "FaUsers",
    category: "services",
    parent: "services",
    description: "Gestión de empleados",
  },

  employeesSchedule: {
    id: "employeesSchedule",
    name: "Horario Empleados",
    path: "/dashboard/employees-schedule",
    icon: "FaCalendarAlt",
    category: "services",
    parent: "services",
    description: "Horarios de empleados",
  },

  appointmentManagement: {
    id: "appointmentManagement",
    name: "Gestión de Citas",
    path: "/dashboard/appointment-management",
    icon: "FaRegCalendarAlt",
    category: "services",
    parent: "services",
    description: "Gestión de citas médicas",
  },

  // === DEPORTISTAS ===
  sportsCategory: {
    id: "sportsCategory",
    name: "Categoría Deportiva",
    path: "/dashboard/sports-category",
    icon: "FaMedal",
    category: "athletes",
    parent: "athletes",
    description: "Categorías deportivas",
  },

  athletesSection: {
    id: "athletesSection",
    name: "Gestión de Deportistas",
    path: "/dashboard/athletes-section",
    icon: "FaRunning",
    category: "athletes",
    parent: "athletes",
    description: "Gestión de deportistas",
  },

  athletesAssistance: {
    id: "athletesAssistance",
    name: "Asistencia Deportistas",
    path: "/dashboard/athletes-assistance",
    icon: "FaClipboardCheck",
    category: "athletes",
    parent: "athletes",
    description: "Control de asistencia",
  },

  enrollments: {
    id: "enrollments",
    name: "Gestión de Matrículas",
    path: "/dashboard/enrollments",
    icon: "FaFileContract",
    category: "athletes",
    parent: "athletes",
    description: "Gestión de matrículas",
  },

  paymentsManagement: {
    id: "paymentsManagement",
    name: "Gestión de Pagos",
    path: "/dashboard/payments-management",
    icon: "FaCreditCard",
    category: "athletes",
    parent: "athletes",
    description: "Gestión de pagos y comprobantes",
  },

  myPayments: {
    id: "myPayments",
    name: "Mis Pagos",
    path: "/dashboard/athlete-payments",
    icon: "FaCreditCard",
    category: "athletes",
    parent: "athletes",
    description: "Estado financiero y comprobantes de pago",
  },

  // === EVENTOS ===
  eventsManagement: {
    id: "eventsManagement",
    name: "Gestión de Eventos",
    path: "/dashboard/events",
    icon: "FaCalendarStar",
    category: "events",
    parent: "events",
    description: "Gestión de eventos deportivos",
  },

  temporaryWorkers: {
    id: "temporaryWorkers",
    name: "Personas Temporales",
    path: "/dashboard/temporary-workers",
    icon: "FaUserClock",
    category: "events",
    parent: "events",
    description: "Personal temporal para eventos",
  },

  temporaryTeams: {
    id: "temporaryTeams",
    name: "Equipos",
    path: "/dashboard/temporary-teams",
    icon: "FaUsers",
    category: "events",
    parent: "events",
    description: "Equipos para eventos",
  },

  // === DONACIONES ===
  donorsSponsors: {
    id: "donorsSponsors",
    name: "Donantes/Patrocinadores",
    path: "/dashboard/donors-sponsors",
    icon: "FaHandHoldingHeart",
    category: "donations",
    parent: "donations",
    description: "Gestión de donantes y patrocinadores",
  },

  donationsManagement: {
    id: "donationsManagement",
    name: "Donaciones",
    path: "/dashboard/donations",
    icon: "FaDonate",
    category: "donations",
    parent: "donations",
    description: "Gestión de donaciones",
  },

  // === MATERIALES ===
  materials: {
    id: "materials",
    name: "Gestión de Materiales",
    path: "/dashboard/materials",
    icon: "GiWeightLiftingUp",
    category: "equipment",
    parent: "equipment",
    description: "Gestión de materiales",
  },

  materialCategories: {
    id: "materialCategories",
    name: "Categorías de Materiales",
    path: "/dashboard/material-categories",
    icon: "FaTags",
    category: "equipment",
    parent: "equipment",
    description: "Gestión de categorías de materiales",
  },

  materialsRegistry: {
    id: "materialsRegistry",
    name: "Movimientos de Materiales",
    path: "/dashboard/materials-movements",
    icon: "FaClipboardList",
    category: "equipment",
    parent: "equipment",
    description: "Registro de ingresos y bajas de inventario",
  },

  providers: {
    id: "providers",
    name: "Proveedores",
    path: "/dashboard/providers",
    icon: "FaTruck",
    category: "equipment",
    parent: "equipment",
    description: "Gestión de proveedores",
  },
};

/**
 * Configuración de grupos de módulos (para el sidebar)
 */
export const MODULE_GROUPS = {
  equipment: {
    id: "equipment",
    name: "Materiales",
    icon: "GiWeightLiftingUp",
    children: ["materialCategories", "materials", "materialsRegistry", "providers"],
  },

  services: {
    id: "services",
    name: "Servicios",
    icon: "FaBriefcase",
    children: ["employees", "employeesSchedule", "appointmentManagement"],
  },

  athletes: {
    id: "athletes",
    name: "Deportistas",
    icon: "FaClipboardList",
    children: [
      "sportsCategory",
      "enrollments",
      "athletesSection",
      "paymentsManagement",
      "myPayments",
      "athletesAssistance",
    ],
  },

  events: {
    id: "events",
    name: "Eventos",
    icon: "FaRegCalendarAlt",
    children: ["eventsManagement", "temporaryWorkers", "temporaryTeams"],
  },

  donations: {
    id: "donations",
    name: "Donaciones",
    icon: "FaHandHoldingHeart",
    children: ["donorsSponsors", "donationsManagement"],
  },
};

/**
 * Acciones disponibles en el sistema
 */
export const DEFAULT_ACTIONS = ["Crear", "Ver", "Editar", "Eliminar"];
export const AVAILABLE_ACTIONS = [
  ...DEFAULT_ACTIONS,
  "Aceptar",
  "Rechazar",
  "Aprobar",
  "Descargar",
  "Acudiente",
  "Materiales",
  "Inscribir",
  "Ver inscritos",
  "Cancelar",
  "Listar deportistas",
  "Ver Asignaciones del Material",
  "Transferir Stock",
  "Registrar Baja de Material",
];

export const MODULE_ALLOWED_ACTIONS = {
  dashboard: ["Ver"],
  users: ["Ver"],
  roles: ["Crear", "Ver", "Editar", "Eliminar"],
  employees: ["Crear", "Ver", "Editar", "Eliminar"],
  employeesSchedule: ["Crear", "Ver", "Editar", "Eliminar"],
  appointmentManagement: ["Crear", "Ver", "Editar", "Cancelar"],
  eventsManagement: [
    "Crear",
    "Ver",
    "Editar",
    "Eliminar",
    "Materiales",
    "Inscribir",
    "Ver inscritos",
  ],
  temporaryWorkers: ["Crear", "Ver", "Editar", "Eliminar"],
  temporaryTeams: ["Crear", "Ver", "Editar", "Eliminar"],
  sportsCategory: ["Crear", "Ver", "Editar", "Eliminar", "Listar deportistas"],
  athletesSection: ["Ver", "Editar", "Eliminar", "Acudiente"],
  athletesAssistance: ["Crear", "Ver", "Editar"],
  materials: [
    "Crear",
    "Ver",
    "Editar",
    "Eliminar",
    "Ver Asignaciones del Material",
    "Transferir Stock",
    "Registrar Baja de Material",
  ],
  materialCategories: ["Crear", "Ver", "Editar", "Eliminar"],
  materialsRegistry: ["Ver", "Editar"],
  providers: ["Crear", "Ver", "Editar", "Eliminar"],
  donorsSponsors: ["Crear", "Ver", "Editar", "Eliminar"],
  donationsManagement: ["Crear", "Ver", "Editar"],
  enrollments: ["Ver", "Aceptar", "Rechazar"],
  paymentsManagement: ["Ver", "Descargar", "Aprobar", "Rechazar"],
};

/**
 * Funciones de utilidad auto-generadas
 */

// Auto-generar lista de todos los módulos
export const ALL_MODULES = Object.keys(MODULE_CONFIG);

// Auto-generar mapeo de ID a nombre (para componentes de UI)
export const getModuleNamesMap = () => {
  const map = {};
  ALL_MODULES.forEach((moduleId) => {
    map[moduleId] = MODULE_CONFIG[moduleId].name;
  });
  return map;
};

// Auto-generar permisos de admin
export const generateAdminPermissions = () => {
  const permissions = {};
  ALL_MODULES.forEach((module) => {
    permissions[module] = {};
    const allowedActions = MODULE_ALLOWED_ACTIONS[module] || DEFAULT_ACTIONS;
    AVAILABLE_ACTIONS.forEach((action) => {
      permissions[module][action] = allowedActions.includes(action);
    });
  });
  return permissions;
};

export const getModuleAllowedActions = (moduleId) =>
  MODULE_ALLOWED_ACTIONS[moduleId] || DEFAULT_ACTIONS;

// Obtener módulos por categoría
export const getModulesByCategory = (category) => {
  return ALL_MODULES.filter(
    (moduleId) => MODULE_CONFIG[moduleId].category === category,
  );
};

// Obtener módulos hijos de un grupo
export const getChildModules = (groupId) => {
  return MODULE_GROUPS[groupId]?.children || [];
};

// Verificar si un módulo existe
export const moduleExists = (moduleId) => {
  return Object.prototype.hasOwnProperty.call(MODULE_CONFIG, moduleId);
};

// Obtener configuración de un módulo
export const getModuleConfig = (moduleId) => {
  return MODULE_CONFIG[moduleId];
};




