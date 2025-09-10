import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard,
  MdSearch,
  MdExpandMore,
  MdExpandLess,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import {
  FaUsers,
  FaUserShield,
  FaBriefcase,
  FaClipboardList,
  FaHandHoldingHeart,
  FaRegCalendarAlt,
  FaShoppingCart,
  FaDollarSign,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";

function DynamicSideBar() {
  const [openMenu, setOpenMenu] = useState(null); 
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const location = useLocation();
  const { userRole, logout } = useAuth();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Cerrar submenús cuando el sidebar se contrae
  useEffect(() => {
    if (!isExpanded) {
      setOpenMenu(null);
    }
  }, [isExpanded]);

  // Definir los módulos visibles según el rol
  const visibleModules = {
    // Inicialmente, ningún rol tiene acceso al dashboard
    dashboard: false,
    
    // Inicialmente, ningún módulo es visible
    users: false,
    roles: false,
    sportsEquipment: false,
    services: false,
    athletes: false,
    donations: false,
    events: false,
    purchases: false,
    sales: false,
    employeesSchedule: false,
    sportsCategory: false,
    appointmentManagement: false,
  };
  
  // Configurar los módulos visibles según el rol específico
  switch(userRole) {
    case "admin":
      // Administrador tiene acceso a todos los módulos
      visibleModules.dashboard = true;
      visibleModules.users = true;
      visibleModules.roles = true;
      visibleModules.sportsEquipment = true;
      visibleModules.services = true;
      visibleModules.athletes = true;
      visibleModules.donations = true;
      visibleModules.events = true;
      visibleModules.purchases = true;
      visibleModules.sales = true;
      visibleModules.employeesSchedule = true;
      visibleModules.sportsCategory = true;
      visibleModules.appointmentManagement = true;
      break;
      
    case "profesional_deportivo":
      // Profesionales deportivos solo ven: Categoría deportiva, Horario empleados, Deportistas, Gestión de Citas
      visibleModules.services = true; 
      visibleModules.athletes = true; 
      visibleModules.employeesSchedule = true;
      visibleModules.sportsCategory = true;
      visibleModules.appointmentManagement = true;
      break;
      
    case "profesional_salud":
      // Profesionales de salud solo ven: Categoría deportiva, Horario empleados, Deportistas, Gestión de Citas
      visibleModules.services = true; 
      visibleModules.athletes = true; 
      visibleModules.employeesSchedule = true;
      visibleModules.sportsCategory = true;
      visibleModules.appointmentManagement = true;
      break;
      
    case "deportista":
      // Deportistas solo ven: Gestión de Citas directamente
      visibleModules.services = false; // Ya no necesitamos el menú desplegable
      visibleModules.appointmentManagement = true;
      break;
      
    case "acudiente":
      // Acudientes solo ven: Gestión de Citas directamente
      visibleModules.services = false; // Ya no necesitamos el menú desplegable
      visibleModules.appointmentManagement = true;
      break;
      
    default:
      // Por defecto, solo dashboard es visible
      break;
  }

  // Animaciones para el sidebar
  const sidebarVariants = {
    expanded: { 
      width: "18rem",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: { 
      width: "5rem",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  // Animaciones para los elementos del menú
  const menuItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  // Animaciones para submenús
  const submenuVariants = {
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  // Animaciones para submenús flotantes (cuando está colapsado)
  const floatingSubmenuVariants = {
    initial: { opacity: 0, x: -10, scale: 0.95 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -10, 
      scale: 0.95,
      transition: { duration: 0.15, ease: "easeIn" }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botón hamburguesa (móvil) */}
      <motion.button
        aria-label="Abrir menú"
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-indigo-500 text-white shadow-md"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FaBars size={18} />
      </motion.button>

      {/* Backdrop (móvil) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={{
          ...(isExpanded ? sidebarVariants.expanded : sidebarVariants.collapsed),
          x: 0
        }}
        className={`fixed lg:static top-0 left-0 h-full bg-white shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        initial={{ x: -288 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header con logo grande */}
        <div className="relative border-b border-gray-200 px-6 pt-8 pb-6">
          <div className="flex items-center justify-center">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block"
            >
              <motion.img
                src="/assets/images/astrostar.png"
                alt="Logo"
                animate={{ 
                  width: isExpanded ? "auto" : "2.5rem",
                  scale: isExpanded ? 1 : 0.8,
                  rotate: 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-20 md:h-24 object-contain"
                whileHover={{ 
                  scale: isExpanded ? 1.05 : 0.85,
                  rotate: [0, -2, 2, 0]
                }}
                initial={{ scale: 0, rotate: 180 }}
              />
            </Link>
          </div>
          
          {/* Botón para expandir/contraer */}
          <motion.button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-indigo-500 text-white rounded-full p-1 shadow-md hover:bg-indigo-600 transition-colors z-50"
            aria-label={isExpanded ? "Contraer menú" : "Expandir menú"}
            whileHover={{ scale: 1.1, backgroundColor: "#4338ca" }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isExpanded ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
          </motion.button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          {/* Contenedor para centrar los íconos cuando está contraído */}
          <div className={`${!isExpanded ? "flex flex-col items-center" : ""}`}>
          
          {/* Dashboard - Visible para todos los roles */}
          {visibleModules.dashboard && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <MdDashboard size={22} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Dashboard
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          {/* Usuarios (submenu) - Solo para admin */}
          {visibleModules.users && (
            <motion.div 
              className="mt-1 relative"
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
              onMouseEnter={() => !isExpanded && setHoveredSubmenu("users")}
              onMouseLeave={() => !isExpanded && setHoveredSubmenu(null)}
            >
              <motion.button
                onClick={() => toggleMenu("users")}
                className={`flex items-center justify-between ${isExpanded ? "w-full" : ""} px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  openMenu === "users" ||
                  isActive("/dashboard/users-management") ||
                  isActive("/dashboard/access-management")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaUsers size={20} className="shrink-0" />
                  </motion.div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Usuarios
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      animate={{ rotate: openMenu === "users" ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MdExpandMore size={20} className="shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Contenido submenu expandido */}
              {isExpanded && (
                <AnimatePresence>
                  {openMenu === "users" && (
                    <motion.div
                      variants={submenuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="overflow-hidden"
                    >
                      <div className="pl-12 pr-3 py-2 space-y-1">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Link
                            to="/dashboard/UsersManagement"
                            onClick={() => setIsOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive("/dashboard/users-management")
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                          >
                            Gestión de usuarios
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <Link
                            to="/dashboard/AccessManagement"
                            onClick={() => setIsOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              isActive("/dashboard/access-management")
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                          >
                            Gestión de acceso
                          </Link>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Submenu flotante cuando está colapsado */}
              <AnimatePresence>
                {!isExpanded && hoveredSubmenu === "users" && (
                  <motion.div
                    variants={floatingSubmenuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg w-48 z-50 border"
                  >
                    <div className="p-2 space-y-1">
                      <Link
                        to="/dashboard/UsersManagement"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive("/dashboard/users-management")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        Gestión de usuarios
                      </Link>
                      <Link
                        to="/dashboard/AccessManagement"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive("/dashboard/access-management")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        Gestión de acceso
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Roles - Solo para admin */}
          {visibleModules.roles && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard/roles"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard/roles")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaUserShield size={20} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Roles
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          {/* Material Deportivo - Solo para admin */}
          {visibleModules.sportsEquipment && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard/sportsequipment"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard/sportsequipment")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <GiWeightLiftingUp size={20} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Material Deportivo
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          {/* Enlace directo a Gestión de citas - Para deportista y acudiente */}
          {visibleModules.appointmentManagement && (userRole === "deportista" || userRole === "acudiente") && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard/appointment-management"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard/appointment-management")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaRegCalendarAlt size={20} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Gestión de citas
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          {/* Servicios (submenu) - Para admin, profesional_deportivo y profesional_salud */}
          {visibleModules.services && (
            <motion.div 
              className="mt-1 relative"
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
              onMouseEnter={() => !isExpanded && setHoveredSubmenu("services")}
              onMouseLeave={() => !isExpanded && setHoveredSubmenu(null)}
            >
              <motion.button
                onClick={() => toggleMenu("services")}
                className={`flex items-center justify-between ${isExpanded ? "w-full" : ""} px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  openMenu === "services" ||
                  isActive("/dashboard/employees") ||
                  isActive("/dashboard/employees-schedule") ||
                  isActive("/dashboard/appointment-management")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaBriefcase size={20} className="shrink-0" />
                  </motion.div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Servicios
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      animate={{ rotate: openMenu === "services" ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MdExpandMore size={20} className="shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Contenido submenu expandido */}
              {isExpanded && (
                <AnimatePresence>
                  {openMenu === "services" && (
                    <motion.div
                      variants={submenuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="overflow-hidden"
                    >
                      <div className="pl-12 pr-3 py-2 space-y-1">
                        {/* Empleados - Solo para admin */}
                        {userRole === "admin" && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Link
                              to="/dashboard/employees"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive("/dashboard/employees")
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                            >
                              Empleados
                            </Link>
                          </motion.div>
                        )}

                        {/* Horario Empleados */}
                        {visibleModules.employeesSchedule && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: userRole === "admin" ? 0.15 : 0.1 }}
                          >
                            <Link
                              to="/dashboard/employees-schedule"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive("/dashboard/employees-schedule")
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                            >
                              Horario Empleados
                            </Link>
                          </motion.div>
                        )}

                        {/* Gestión de citas */}
                        {visibleModules.appointmentManagement && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Link
                              to="/dashboard/appointment-management"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive("/dashboard/appointment-management")
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                            >
                              Gestión de citas
                            </Link>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Submenu flotante cuando está colapsado */}
              <AnimatePresence>
                {!isExpanded && hoveredSubmenu === "services" && (
                  <motion.div
                    variants={floatingSubmenuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg w-56 z-50 border"
                  >
                    <div className="p-2 space-y-1">
                      {userRole === "admin" && (
                        <Link
                          to="/dashboard/employees"
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive("/dashboard/employees")
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          Empleados
                        </Link>
                      )}
                      {visibleModules.employeesSchedule && (
                        <Link
                          to="/dashboard/employees-schedule"
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive("/dashboard/employees-schedule")
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          Horario Empleados
                        </Link>
                      )}
                      {visibleModules.appointmentManagement && (
                        <Link
                          to="/dashboard/appointment-management"
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive("/dashboard/appointment-management")
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          Gestión de citas
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Deportistas (submenu) - Para admin, profesional_deportivo y profesional_salud */}
          {visibleModules.athletes && (
            <motion.div 
              className="mt-1 relative"
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
              onMouseEnter={() => !isExpanded && setHoveredSubmenu("athletes")}
              onMouseLeave={() => !isExpanded && setHoveredSubmenu(null)}
            >
              <motion.button
                onClick={() => toggleMenu("athletes")}
                className={`flex items-center justify-between ${isExpanded ? "w-full" : ""} px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  openMenu === "athletes" ||
                  isActive("/dashboard/athletes") ||
                  isActive("/dashboard/sports-category") ||
                  isActive("/dashboard/temporary-workers")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaClipboardList size={20} className="shrink-0" />
                  </motion.div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        Deportistas
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      animate={{ rotate: openMenu === "athletes" ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MdExpandMore size={20} className="shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Contenido submenu expandido */}
              {isExpanded && (
                <AnimatePresence>
                  {openMenu === "athletes" && (
                    <motion.div
                      variants={submenuVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="overflow-hidden"
                    >
                      <div className="pl-12 pr-3 py-2 space-y-1">
                        {/* Deportistas */}
                        {["admin", "profesional_deportivo", "profesional_salud"].includes(userRole) && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Link
                              to="/dashboard/athletes"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive("/dashboard/athletes")
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                            >
                              Deportistas
                            </Link>
                          </motion.div>
                        )}

                        {/* Categoría Deportiva */}
                        {visibleModules.sportsCategory && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Link
                              to="/dashboard/sports-category"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive("/dashboard/sports-category")
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                            >
                              Categoría Deportiva
                            </Link>
                          </motion.div>
                        )}

                        {/* Trabajadores Temporales - Solo para admin */}
                        {userRole === "admin" && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Link
                              to="/dashboard/temporary-workers"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                isActive("/dashboard/temporary-workers")
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                              }`}
                            >
                              Trabajadores Temporales
                            </Link>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Submenu flotante cuando está colapsado */}
              <AnimatePresence>
                {!isExpanded && hoveredSubmenu === "athletes" && (
                  <motion.div
                    variants={floatingSubmenuVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute left-full top-0 ml-2 bg-white shadow-lg rounded-lg w-56 z-50 border"
                  >
                    <div className="p-2 space-y-1">
                      {["admin", "profesional_deportivo", "profesional_salud"].includes(userRole) && (
                        <Link
                          to="/dashboard/athletes"
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive("/dashboard/athletes")
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          Deportistas
                        </Link>
                      )}
                      {visibleModules.sportsCategory && (
                        <Link
                          to="/dashboard/sports-category"
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive("/dashboard/sports-category")
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          Categoría Deportiva
                        </Link>
                      )}
                      {userRole === "admin" && (
                        <Link
                          to="/dashboard/temporary-workers"
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive("/dashboard/temporary-workers")
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          Trabajadores Temporales
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Donaciones - Solo para admin */}
          {visibleModules.donations && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard/donations"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard/donations")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaHandHoldingHeart size={20} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Donaciones
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          {/* Eventos - Solo para admin */}
          {visibleModules.events && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard/events"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard/events")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaRegCalendarAlt size={20} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Eventos
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          {/* Compras - Solo para admin */}
          {visibleModules.purchases && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard/purchases"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard/purchases")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaShoppingCart size={20} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Compras
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          {/* Ventas - Solo para admin */}
          {visibleModules.sales && (
            <motion.div
              variants={menuItemVariants}
              initial="initial"
              animate="animate"
            >
              <Link
                to="/dashboard/sales"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""} ${
                  isActive("/dashboard/sales")
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaDollarSign size={20} className="shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Ventas
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )}

          </div>
        </nav>
        
        {/* Cerrar Sesión */}
        <div className="mt-auto pt-4 border-t border-gray-200 px-4 pb-4">
          <div className={`${!isExpanded ? "flex justify-center" : ""}`}>
            <motion.button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 ${!isExpanded ? "justify-center" : ""} ${isExpanded ? "w-full" : ""}`}
              whileHover={{ scale: 1.02, backgroundColor: "rgb(254 242 242)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <FaSignOutAlt size={20} className="shrink-0" />
              </motion.div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Cerrar Sesión
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

export default DynamicSideBar;