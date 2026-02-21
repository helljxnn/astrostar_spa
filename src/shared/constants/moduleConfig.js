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

  classes: {
    id: "classes",
    name: "Clases",
    path: "/dashboard/classes",
    icon: "FaChalkboardTeacher",
    category: "services",
    parent: "services",
    description: "Gestión de clases deportivas",
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
    name: "Equipos Temporales",
    path: "/dashboard/temporary-teams",
    icon: "FaUsers",
    category: "events",
    parent: "events",
    description: "Equipos temporales para eventos",
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
    name: "Ingresos de Materiales",
    path: "/dashboard/materials-registry",
    icon: "FaClipboardList",
    category: "equipment",
    parent: "equipment",
    description: "Registro de movimientos de inventario",
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
    children: [
      "employees",
      "employeesSchedule",
      "appointmentManagement",
      "classes",
    ],
  },

  athletes: {
    id: "athletes",
    name: "Deportistas",
    icon: "FaClipboardList",
    children: [
      "sportsCategory",
      "enrollments",
      "athletesSection",
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
export const AVAILABLE_ACTIONS = ["Ver", "Crear", "Editar", "Eliminar"];

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
    AVAILABLE_ACTIONS.forEach((action) => {
      permissions[module][action] = true;
    });
  });
  return permissions;
};

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
  return MODULE_CONFIG.hasOwnProperty(moduleId);
};

// Obtener configuración de un módulo
export const getModuleConfig = (moduleId) => {
  return MODULE_CONFIG[moduleId];
};
