import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard,
  MdExpandMore,
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

function DynamicSideBar({ isOpen: externalIsOpen, setIsOpen: setExternalIsOpen }) {
  const [openMenu, setOpenMenu] = useState(null);
  // Usar el estado externo si está disponible, o el interno si no lo está
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = setExternalIsOpen || setInternalIsOpen;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint en Tailwind
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  const location = useLocation();
  const { userRole, logout } = useAuth();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  useEffect(() => {
    if (!isExpanded) {
      setOpenMenu(null);
    }
    
    // Siempre mantener expandido en móvil
    if (isMobile) {
      setIsExpanded(true);
    }
  }, [isExpanded, isMobile]);

  const visibleModules = {
    dashboard: false,
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
    temporaryWorkers: false,
  };

  switch (userRole) {
    case "admin":
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
      visibleModules.temporaryWorkers = true;
      break;

    case "profesional_deportivo":
      visibleModules.services = true;
      visibleModules.athletes = true;
      visibleModules.employeesSchedule = true;
      visibleModules.sportsCategory = true;
      visibleModules.appointmentManagement = true;
      break;

    case "profesional_salud":
      visibleModules.services = true;
      visibleModules.athletes = true;
      visibleModules.employeesSchedule = true;
      visibleModules.sportsCategory = true;
      visibleModules.appointmentManagement = true;
      break;

    case "deportista":
      visibleModules.services = false;
      visibleModules.appointmentManagement = true;
      break;

    case "acudiente":
      visibleModules.services = false;
      visibleModules.appointmentManagement = true;
      break;

    default:
      break;
  }

  const sidebarVariants = {
    expanded: {
      width: "18rem",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: "5rem",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const menuItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botón de apertura del menú - Eliminado para evitar duplicidad con el botón del DashboardLayout */}

      {/* El overlay se maneja ahora desde el DashboardLayout */}

      <motion.aside
        variants={sidebarVariants}
        animate={{
          ...(isExpanded || isMobile
            ? sidebarVariants.expanded
            : sidebarVariants.collapsed),
          x: isMobile ? (isOpen ? 0 : -288) : 0,
        }}
        className={`fixed lg:static top-0 left-0 h-full bg-white shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out`}
        initial={{ x: -288 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
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
                  rotate: 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-20 md:h-24 object-contain"
                whileHover={{
                  scale: isExpanded ? 1.05 : 0.85,
                  rotate: [0, -2, 2, 0],
                }}
                initial={{ scale: 0, rotate: 180 }}
              />
            </Link>
          </div>

          {!isMobile && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-primary-purple text-white rounded-full p-1 shadow-md hover:bg-primary-blue transition-colors z-50"
              aria-label={isExpanded ? "Contraer menú" : "Expandir menú"}
              whileHover={{ scale: 1.1, backgroundColor: "#b595ff" }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {isExpanded ? (
                <MdChevronLeft size={20} />
              ) : (
                <MdChevronRight size={20} />
              )}
            </motion.button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          <div className={`${!isExpanded ? "flex flex-col items-center" : ""}`}>
            {visibleModules.dashboard && (
              <motion.div
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                className="mb-1"
              >
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${isActive("/dashboard")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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

            {visibleModules.users && (
              <motion.div
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                className="mb-1"
              >
                <Link
                  to="/dashboard/users"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${isActive("/dashboard/users")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                    }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
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
                </Link>
              </motion.div>
            )}

            {/* Roles - Solo para admin */}
            {visibleModules.roles && (
              <motion.div
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                className="mb-1"
              >
                <Link
                  to="/dashboard/roles"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${isActive("/dashboard/roles")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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
                className="mb-1"
              >
                <Link
                  to="/dashboard/sportsequipment"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${isActive("/dashboard/sportsequipment")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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
            {visibleModules.appointmentManagement &&
              (userRole === "deportista" || userRole === "acudiente") && (
                <motion.div
                  variants={menuItemVariants}
                  initial="initial"
                  animate="animate"
                  className="mb-1"
                >
                  <Link
                    to="/dashboard/appointment-management"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                      } ${isActive("/dashboard/appointment-management")
                        ? "bg-indigo-100 text-primary-purple shadow-sm"
                        : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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
                className="mt-1 relative mb-1"
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
              >
                <motion.button
                  onClick={() => toggleMenu("services")}
                  className={`flex items-center justify-between ${isExpanded ? "w-full" : ""
                    } px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${openMenu === "services" ||
                      isActive("/dashboard/employees") ||
                      isActive("/dashboard/employees-schedule") ||
                      isActive("/dashboard/appointment-management")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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

                {isExpanded && (
                  <AnimatePresence>
                    {openMenu === "services" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pl-12 pr-3 py-2 space-y-1">
                          {userRole === "admin" && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Link
                                to="/dashboard/employees"
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/employees")
                                    ? "bg-indigo-100 text-primary-purple shadow-sm"
                                    : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                                  }`}
                              >
                                Empleados
                              </Link>
                            </motion.div>
                          )}

                          {visibleModules.employeesSchedule && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: userRole === "admin" ? 0.15 : 0.1,
                              }}
                            >
                              <Link
                                to="/dashboard/employees-schedule"
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/employees-schedule")
                                    ? "bg-indigo-100 text-primary-purple shadow-sm"
                                    : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                                  }`}
                              >
                                Horario Empleados
                              </Link>
                            </motion.div>
                          )}

                          {visibleModules.appointmentManagement && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Link
                                to="/dashboard/appointment-management"
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/appointment-management")
                                    ? "bg-indigo-100 text-primary-purple shadow-sm"
                                    : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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
              </motion.div>
            )}

            {/* Deportistas (submenu) - Para admin, profesional_deportivo y profesional_salud */}
            {visibleModules.athletes && (
              <motion.div
                className="mt-1 relative mb-1"
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
              >
                <motion.button
                  onClick={() => toggleMenu("athletes")}
                  className={`flex items-center justify-between ${isExpanded ? "w-full" : ""
                    } px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${openMenu === "athletes" ||
                      isActive("/dashboard/athletes") ||
                      isActive("/dashboard/sports-category") ||
                      isActive("/dashboard/temporary-workers")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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

                {isExpanded && (
                  <AnimatePresence>
                    {openMenu === "athletes" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pl-12 pr-3 py-2 space-y-1">
                          {/* Categoría deportiva primero */}
                          {visibleModules.sportsCategory && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Link
                                to="/dashboard/sports-category"
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/sports-category")
                                    ? "bg-indigo-100 text-primary-purple shadow-sm"
                                    : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                                  }`}
                              >
                                Categoría deportiva
                              </Link>
                            </motion.div>
                          )}

                          {/* Gestión de deportistas */}
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Link
                              to="/dashboard/athletes"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/athletes")
                                  ? "bg-indigo-100 text-primary-purple shadow-sm"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                                }`}
                            >
                              Gestión de deportistas
                            </Link>
                          </motion.div>

                          {/* Personas Temporales */}
                          {visibleModules.temporaryWorkers && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Link
                                to="/dashboard/temporary-workers"
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/temporary-workers")
                                    ? "bg-indigo-100 text-primary-purple shadow-sm"
                                    : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                                  }`}
                              >
                                Personas temporales
                              </Link>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {visibleModules.donations && (
              <motion.div
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                className="mb-1"
              >
                <Link
                  to="/dashboard/donations"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${isActive("/dashboard/donations")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                    }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
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

            {visibleModules.events && (
              <motion.div
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                className="mb-1"
              >
                <Link
                  to="/dashboard/events"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${isActive("/dashboard/events")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
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

            {/* compras  */}
            {/* Compras (submenu) - Solo admin */}
            {visibleModules.purchases && (
              <motion.div
                className="mt-1 relative mb-1"
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
              >
                <motion.button
                  onClick={() => toggleMenu("purchases")}
                  className={`flex items-center justify-between ${isExpanded ? "w-full" : ""
                    } px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${openMenu === "purchases" ||
                      isActive("/dashboard/providers") ||
                      isActive("/dashboard/purchases")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
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
                  </span>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        animate={{ rotate: openMenu === "purchases" ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MdExpandMore size={20} className="shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {isExpanded && (
                  <AnimatePresence>
                    {openMenu === "purchases" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pl-12 pr-3 py-2 space-y-1">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Link
                              to="/dashboard/providers"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/providers")
                                  ? "bg-indigo-100 text-primary-purple shadow-sm"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                                }`}
                            >
                              Proveedores
                            </Link>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Link
                              to="/dashboard/purchases"
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive("/dashboard/purchases")
                                  ? "bg-indigo-100 text-primary-purple shadow-sm"
                                  : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                                }`}
                            >
                              Compras
                            </Link>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            )}


            {visibleModules.sales && (
              <motion.div
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
              >
                <Link
                  to="/dashboard/sales"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
                    } ${isActive("/dashboard/sales")
                      ? "bg-indigo-100 text-primary-purple shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                    }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
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

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-4 mt-auto">
          <motion.button
            onClick={logout}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left text-[15px] transition-all duration-200 ${!isExpanded ? "justify-center" : ""
              } text-red-600 hover:bg-red-50 hover:text-red-700`}
            whileHover={{ scale: 1.02, backgroundColor: "#fee2e2" }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
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
                  Cerrar sesión
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    </div>
  );
}

export default DynamicSideBar;
