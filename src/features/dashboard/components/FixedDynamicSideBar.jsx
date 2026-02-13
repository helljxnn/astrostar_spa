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
  FaSignOutAlt,
  FaCalendarAlt,
  FaRunning,
  FaClipboardCheck,
  FaFileContract,
  FaUserClock,
  FaTruck,
} from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";

function FixedDynamicSideBar({
  isOpen: externalIsOpen,
  setIsOpen: setExternalIsOpen,
  isExpanded: externalIsExpanded,
  setIsExpanded: setExternalIsExpanded,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = setExternalIsOpen || setInternalIsOpen;
  const isExpanded =
    externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = setExternalIsExpanded || setInternalIsExpanded;

  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
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

    if (isMobile) {
      setIsExpanded(true);
    }
  }, [isExpanded, isMobile]);

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

  // Función para obtener el icono
  const getIcon = (iconName, size = 20) => {
    const icons = {
      MdDashboard: <MdDashboard size={size} className="shrink-0" />,
      FaUsers: <FaUsers size={size} className="shrink-0" />,
      FaUserShield: <FaUserShield size={size} className="shrink-0" />,
      FaBriefcase: <FaBriefcase size={size} className="shrink-0" />,
      FaClipboardList: <FaClipboardList size={size} className="shrink-0" />,
      FaHandHoldingHeart: (
        <FaHandHoldingHeart size={size} className="shrink-0" />
      ),
      FaRegCalendarAlt: <FaRegCalendarAlt size={size} className="shrink-0" />,
      FaShoppingCart: <FaShoppingCart size={size} className="shrink-0" />,
      GiWeightLiftingUp: <GiWeightLiftingUp size={size} className="shrink-0" />,
      FaCalendarAlt: <FaCalendarAlt size={size} className="shrink-0" />,
      FaChalkboardTeacher: (
        <FaChalkboardTeacher size={size} className="shrink-0" />
      ),
      FaMedal: <FaMedal size={size} className="shrink-0" />,
      FaRunning: <FaRunning size={size} className="shrink-0" />,
      FaClipboardCheck: <FaClipboardCheck size={size} className="shrink-0" />,
      FaFileContract: <FaFileContract size={size} className="shrink-0" />,
      FaCalendarStar: <FaCalendarStar size={size} className="shrink-0" />,
      FaUserClock: <FaUserClock size={size} className="shrink-0" />,
      FaDonate: <FaDonate size={size} className="shrink-0" />,
      FaTruck: <FaTruck size={size} className="shrink-0" />,
    };
    return icons[iconName] || <FaUsers size={size} className="shrink-0" />;
  };

  // Configuración completa de módulos (basada en tu configuración original)
  const modules = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: "MdDashboard",
    },
  ];

  // Módulos individuales principales
  const individualModules = [
    {
      id: "users",
      name: "Usuarios",
      path: "/dashboard/users",
      icon: "FaUsers",
    },
    {
      id: "roles",
      name: "Roles",
      path: "/dashboard/roles",
      icon: "FaUserShield",
    },
  ];

  // Grupos de módulos
  const moduleGroups = [
    {
      id: "equipment",
      name: "Materiales",
      icon: "GiWeightLiftingUp",
      children: [
        {
          id: "sportsEquipment",
          name: "Materiales",
          path: "/dashboard/materials",
        },
        {
          id: "materialCategories",
          name: "Categorías de Materiales",
          path: "/dashboard/material-categories",
        },
        {
          id: "materialsRegistry",
          name: "Ingresos de Materiales",
          path: "/dashboard/materials-registry",
        },
        {
          id: "providers",
          name: "Proveedores",
          path: "/dashboard/providers",
        },
      ],
    },
    {
      id: "services",
      name: "Servicios",
      icon: "FaBriefcase",
      children: [
        {
          id: "employees",
          name: "Empleados",
          path: "/dashboard/employees",
        },
        {
          id: "employeesSchedule",
          name: "Horario Empleados",
          path: "/dashboard/employees-schedule",
        },
        {
          id: "appointmentManagement",
          name: "Gestión de Citas",
          path: "/dashboard/appointment-management",
        },
        {
          id: "classes",
          name: "Clases",
          path: "/dashboard/classes",
        },
      ],
    },
    {
      id: "athletes",
      name: "Deportistas",
      icon: "FaClipboardList",
      children: [
        {
          id: "sportsCategory",
          name: "Categoría Deportiva",
          path: "/dashboard/sports-category",
        },
        {
          id: "athletesSection",
          name: "Gestión de Deportistas",
          path: "/dashboard/athletes-section",
        },
        {
          id: "athletesAssistance",
          name: "Asistencia Deportistas",
          path: "/dashboard/athletes-assistance",
        },
        {
          id: "enrollments",
          name: "Matrículas",
          path: "/dashboard/enrollments",
        },
      ],
    },
    {
      id: "events",
      name: "Eventos",
      icon: "FaRegCalendarAlt",
      children: [
        {
          id: "eventsManagement",
          name: "Gestión de Eventos",
          path: "/dashboard/events",
        },
        {
          id: "temporaryWorkers",
          name: "Personas Temporales",
          path: "/dashboard/temporary-workers",
        },
        {
          id: "temporaryTeams",
          name: "Equipos Temporales",
          path: "/dashboard/temporary-teams",
        },
      ],
    },
    {
      id: "donations",
      name: "Donaciones",
      icon: "FaHandHoldingHeart",
      children: [
        {
          id: "donorsSponsors",
          name: "Donantes/Patrocinadores",
          path: "/dashboard/donors-sponsors",
        },
        {
          id: "donationsManagement",
          name: "Donaciones",
          path: "/dashboard/donations",
        },
      ],
    },
  ];

  // Renderizar módulo individual
  const renderModule = (module, delay = 0) => {
    return (
      <motion.div
        key={module.id}
        variants={menuItemVariants}
        initial="initial"
        animate="animate"
        className="mb-1"
        transition={{ delay }}
      >
        <Link
          to={module.path}
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${
            !isExpanded ? "justify-center" : ""
          } ${
            isActive(module.path)
              ? "bg-indigo-100 text-primary-purple shadow-sm"
              : "text-gray-700 hover:bg-indigo-50 hover:text-black"
          }`}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {getIcon(module.icon)}
          </motion.div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="whitespace-nowrap overflow-hidden"
              >
                {module.name}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.div>
    );
  };

  // Renderizar grupo de módulos
  const renderGroup = (group) => {
    const hasActiveChild = group.children.some((child) => isActive(child.path));

    return (
      <motion.div
        key={group.id}
        className="mt-1 relative mb-1"
        variants={menuItemVariants}
        initial="initial"
        animate="animate"
      >
        <motion.button
          onClick={() => toggleMenu(group.id)}
          className={`flex items-center justify-between ${
            isExpanded ? "w-full" : ""
          } px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${
            !isExpanded ? "justify-center" : ""
          } ${
            openMenu === group.id || hasActiveChild
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
              {getIcon(group.icon)}
            </motion.div>
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {group.name}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                animate={{ rotate: openMenu === group.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <MdExpandMore size={20} className="shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {isExpanded && (
          <AnimatePresence>
            {openMenu === group.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pl-12 pr-3 py-2 space-y-1">
                  {group.children.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={child.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive(child.path)
                            ? "bg-indigo-100 text-primary-purple shadow-sm"
                            : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                        }`}
                      >
                        {child.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <motion.aside
        variants={sidebarVariants}
        animate={{
          ...(isExpanded || isMobile
            ? sidebarVariants.expanded
            : sidebarVariants.collapsed),
          x: isMobile ? (isOpen ? 0 : -288) : 0,
        }}
        className="fixed top-0 left-0 h-screen bg-white shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out"
        initial={{ x: isMobile ? -288 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative border-b border-gray-200 px-6 pt-8 pb-6 overflow-visible">
          <div className="flex items-center justify-center overflow-hidden">
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

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 space-y-2">
          <div className={`${!isExpanded ? "flex flex-col items-center" : ""}`}>
            {/* Dashboard */}
            {modules.map((module, index) => renderModule(module, index * 0.05))}

            {/* Módulos individuales principales */}
            {individualModules.map((module, index) =>
              renderModule(module, (modules.length + index) * 0.05),
            )}

            {/* Grupos de módulos */}
            {moduleGroups.map((group) => renderGroup(group))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-4 mt-auto">
          <div className="overflow-hidden">
            <motion.button
              onClick={logout}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left text-[15px] transition-all duration-200 ${
                !isExpanded ? "justify-center" : ""
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
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    Cerrar sesión
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export default FixedDynamicSideBar;
