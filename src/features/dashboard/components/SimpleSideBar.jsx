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
  FaTruck,
  FaRunning,
  FaClipboardCheck,
  FaFileContract,
  FaUserClock,
  FaTruck,
} from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";

function SimpleSideBar({
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

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const location = useLocation();
  const { logout } = useAuth();

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
    expanded: { width: "18rem" },
    collapsed: { width: "5rem" },
  };

  // Configuración de módulos con iconos seguros
  const modules = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/dashboard",
      icon: <MdDashboard size={20} className="shrink-0" />,
    },
  ];

  const individualModules = [
    {
      id: "users",
      name: "Usuarios",
      path: "/dashboard/users",
      icon: <FaUsers size={20} className="shrink-0" />,
    },
    {
      id: "roles",
      name: "Roles",
      path: "/dashboard/roles",
      icon: <FaUserShield size={20} className="shrink-0" />,
    },
  ];

  const moduleGroups = [
    {
      id: "services",
      name: "Servicios",
      icon: <FaBriefcase size={20} className="shrink-0" />,
      children: [
        { name: "Empleados", path: "/dashboard/employees" },
        { name: "Horario Empleados", path: "/dashboard/employees-schedule" },
        { name: "Gestión de Citas", path: "/dashboard/appointment-management" },
        { name: "Clases", path: "/dashboard/classes" },
      ],
    },
    {
      id: "athletes",
      name: "Deportistas",
      icon: <FaClipboardList size={20} className="shrink-0" />,
      children: [
        { name: "Categoría Deportiva", path: "/dashboard/sports-category" },
        { name: "Gestión de Deportistas", path: "/dashboard/athletes-section" },
        {
          name: "Asistencia Deportistas",
          path: "/dashboard/athletes-assistance",
        },
        { name: "Matrículas", path: "/dashboard/enrollments" },
      ],
    },
    {
      id: "events",
      name: "Eventos",
      icon: <FaRegCalendarAlt size={20} className="shrink-0" />,
      children: [
        { name: "Gestión de Eventos", path: "/dashboard/events" },
        { name: "Personas Temporales", path: "/dashboard/temporary-workers" },
        { name: "Equipos Temporales", path: "/dashboard/temporary-teams" },
      ],
    },
    {
      id: "donations",
      name: "Donaciones",
      icon: <FaHandHoldingHeart size={20} className="shrink-0" />,
      children: [
        { name: "Donantes/Patrocinadores", path: "/dashboard/donors-sponsors" },
        { name: "Donaciones", path: "/dashboard/donations" },
      ],
    },
    {
      id: "equipment",
      name: "Materiales",
      icon: <GiWeightLiftingUp size={20} className="shrink-0" />,
      children: [
        { name: "Materiales", path: "/dashboard/materials" },
        { name: "Categorías de Materiales", path: "/dashboard/material-categories" },
        { name: "Ingresos de Materiales", path: "/dashboard/materials-registry" },
        { name: "Proveedores", path: "/dashboard/providers" },
      ],
    },
  ];

  const renderModule = (module) => (
    <div key={module.id} className="mb-1">
      <Link
        to={module.path}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${
          !isExpanded ? "justify-center" : ""
        } ${
          isActive(module.path)
            ? "bg-indigo-100 text-purple-600 shadow-sm"
            : "text-gray-700 hover:bg-indigo-50 hover:text-black"
        }`}
      >
        {module.icon}
        {isExpanded && <span className="whitespace-nowrap">{module.name}</span>}
      </Link>
    </div>
  );

  const renderGroup = (group) => {
    const hasActiveChild = group.children.some((child) => isActive(child.path));

    return (
      <div key={group.id} className="mb-1">
        <button
          onClick={() => toggleMenu(group.id)}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition-all duration-200 ${
            !isExpanded ? "justify-center" : ""
          } ${
            openMenu === group.id || hasActiveChild
              ? "bg-indigo-100 text-purple-600 shadow-sm"
              : "text-gray-700 hover:bg-indigo-50 hover:text-black"
          }`}
        >
          <span className="flex items-center gap-4">
            {group.icon}
            {isExpanded && (
              <span className="whitespace-nowrap">{group.name}</span>
            )}
          </span>
          {isExpanded && (
            <MdExpandMore
              size={20}
              className={`shrink-0 transition-transform ${
                openMenu === group.id ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {isExpanded && openMenu === group.id && (
          <div className="pl-12 pr-3 py-2 space-y-1">
            {group.children.map((child, index) => (
              <Link
                key={index}
                to={child.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive(child.path)
                    ? "bg-indigo-100 text-purple-600 shadow-sm"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-black"
                }`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isExpanded || isMobile ? "expanded" : "collapsed"}
      className="fixed top-0 left-0 h-screen bg-white shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out"
      style={{
        transform: isMobile
          ? isOpen
            ? "translateX(0)"
            : "translateX(-100%)"
          : "translateX(0)",
      }}
    >
      {/* Header */}
      <div className="relative border-b border-gray-200 px-6 pt-8 pb-6">
        <div className="flex items-center justify-center">
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>
            <img
              src="/assets/images/astrostar.png"
              alt="Logo"
              className="h-20 md:h-24 object-contain"
            />
          </Link>
        </div>

        {!isMobile && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white rounded-full p-1 shadow-md hover:bg-purple-700 transition-colors z-50"
          >
            {isExpanded ? (
              <MdChevronLeft size={20} />
            ) : (
              <MdChevronRight size={20} />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
        {modules.map(renderModule)}
        {individualModules.map(renderModule)}
        {moduleGroups.map(renderGroup)}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-4">
        <button
          onClick={logout}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl w-full text-left text-[15px] transition-all duration-200 ${
            !isExpanded ? "justify-center" : ""
          } text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <FaSignOutAlt size={20} className="shrink-0" />
          {isExpanded && (
            <span className="whitespace-nowrap">Cerrar sesión</span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

export default SimpleSideBar;
