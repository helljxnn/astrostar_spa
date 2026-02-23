import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext.jsx";
import { useSidebarVisibility } from "../../../shared/hooks/useSidebarVisibility.js";
import {
  MODULE_CONFIG,
  MODULE_GROUPS,
} from "../../../shared/constants/moduleConfig.js";
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
} from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";

function DynamicSideBar({
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
  const {
    visibleModules,
    visibleGroups,
    isModuleVisible,
    isGroupVisible,
    getVisibleChildModules,
  } = useSidebarVisibility();

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
      width: "288px", // Usar px en lugar de rem para mayor precisión
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: "80px", // Usar px en lugar de rem para mayor precisión
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
    };
    return icons[iconName] || <FaUsers size={size} className="shrink-0" />;
  };

  // Renderizar módulo individual
  const renderModule = (moduleId, delay = 0) => {
    const module = MODULE_CONFIG[moduleId];
    if (!module || !isModuleVisible(moduleId)) return null;

    return (
      <motion.div
        key={moduleId}
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
  const renderGroup = (groupId) => {
    const group = MODULE_GROUPS[groupId];
    if (!group || !isGroupVisible(groupId)) return null;

    const visibleChildren = getVisibleChildModules(groupId);
    if (visibleChildren.length === 0) return null;

    return (
      <motion.div
        key={groupId}
        className="mt-1 relative mb-1"
        variants={menuItemVariants}
        initial="initial"
        animate="animate"
      >
        <motion.button
          onClick={() => toggleMenu(groupId)}
          className={`flex items-center justify-between ${
            isExpanded ? "w-full" : ""
          } px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${
            !isExpanded ? "justify-center" : ""
          } ${
            openMenu === groupId ||
            visibleChildren.some((childId) =>
              isActive(MODULE_CONFIG[childId]?.path),
            )
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
                animate={{ rotate: openMenu === groupId ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <MdExpandMore size={20} className="shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {isExpanded && (
          <AnimatePresence>
            {openMenu === groupId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pl-12 pr-3 py-2 space-y-1">
                  {visibleChildren.map((childId, index) => {
                    const childModule = MODULE_CONFIG[childId];
                    if (!childModule) return null;

                    return (
                      <motion.div
                        key={childId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={childModule.path}
                          onClick={() => setIsOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive(childModule.path)
                              ? "bg-indigo-100 text-primary-purple shadow-sm"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                          }`}
                        >
                          {childModule.name}
                        </Link>
                      </motion.div>
                    );
                  })}
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
        className="fixed top-0 left-0 h-screen bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out dynamic-sidebar"
        style={{
          zIndex: 30,
          position: "fixed",
        }}
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
            {renderModule("dashboard")}

            {/* Módulos individuales principales */}
            {renderModule("users")}
            {renderModule("roles")}
            {renderModule("sportsEquipment")}

            {/* Enlace directo a Gestión de citas para deportista y acudiente */}
            {isModuleVisible("appointmentManagement") &&
              (userRole === "deportista" || userRole === "acudiente") &&
              renderModule("appointmentManagement")}

            {/* Grupos de módulos */}
            {renderGroup("services")}
            {renderGroup("athletes")}
            {renderGroup("donations")}
            {renderGroup("events")}
            {renderGroup("purchases")}
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

export default DynamicSideBar;
