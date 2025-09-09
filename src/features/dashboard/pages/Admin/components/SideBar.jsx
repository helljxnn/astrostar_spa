import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdDashboard, MdExpandMore, MdExpandLess } from "react-icons/md";
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

// Variantes de animación
const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", duration: 0.4 } },
  exit: { x: -300, opacity: 0, transition: { duration: 0.3 } },
};

function SideBar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botón hamburguesa (móvil) */}
      <button
        aria-label="Abrir menú"
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-indigo-500 text-white shadow-md active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <FaBars size={18} />
      </button>

      {/* Backdrop (móvil) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.aside
            key="sidebar"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed lg:static top-0 left-0 h-full bg-white shadow-xl flex flex-col z-50 rounded-r-2xl w-72 overflow-hidden"
          >
            {/* Header con logo */}
            <div className="border-b border-gray-200 px-6 pt-8 pb-6">
              <div className="flex items-center justify-center">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <img
                    src="/assets/images/Logo2FundacionMV_Dashboard.png"
                    alt="Logo"
                    className="h-20 w-auto object-contain hover:scale-105 transition-transform"
                  />
                </Link>
              </div>
            </div>

            {/* Navegación */}
            <motion.nav
              className="flex-1 overflow-y-auto px-4 py-5 space-y-2"
              initial="hidden"
              animate="visible"
            >
              {/* Dashboard */}
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                  isActive("/dashboard")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <MdDashboard size={22} />
                <span>Dashboard</span>
              </Link>

              {/* Usuarios */}
              <div>
                <button
                  onClick={() => toggleMenu("users")}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition ${
                    openMenu === "users"
                      ? "bg-gradient-to-r from-primary-purple-light to-primary-blue text-indigo-900 shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <FaUsers size={20} /> Usuarios
                  </span>
                  {openMenu === "users" ? <MdExpandLess /> : <MdExpandMore />}
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    openMenu === "users" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-12 pr-3 py-2 space-y-1">
                      <Link
                        to="/dashboard/UsersManagement"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/UsersManagement")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Gestión de usuarios
                      </Link>
                      <Link
                        to="/dashboard/AccessManagement"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/AccessManagement")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Gestión de acceso
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles */}
              <Link
                to="/dashboard/roles"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                  isActive("/dashboard/roles")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <FaUserShield size={20} />
                <span>Roles</span>
              </Link>

              {/* Material Deportivo */}
              <Link
                to="/dashboard/sportsequipment"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                  isActive("/dashboard/sportsequipment")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <GiWeightLiftingUp size={20} />
                <span>Material Deportivo</span>
              </Link>

              {/* Servicios */}
              <div>
                <button
                  onClick={() => toggleMenu("services")}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition ${
                    openMenu === "services"
                      ? "bg-gradient-to-r from-primary-purple-light to-primary-blue text-indigo-900 shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <FaBriefcase size={20} /> Servicios
                  </span>
                  {openMenu === "services" ? <MdExpandLess /> : <MdExpandMore />}
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    openMenu === "services"
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-12 pr-3 py-2 space-y-1">
                      <Link
                        to="/dashboard/employees"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/employees")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Empleados
                      </Link>
                      <Link
                        to="/dashboard/employees-schedule"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/employees-schedule")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Horario Empleados
                      </Link>
                      <Link
                        to="/dashboard/appointment-management"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/appointment-management")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Gestión de citas
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deportistas */}
              <div>
                <button
                  onClick={() => toggleMenu("athletes")}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition ${
                    openMenu === "athletes"
                      ? "bg-gradient-to-r from-primary-purple-light to-primary-blue text-indigo-900 shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <FaClipboardList size={20} /> Deportistas
                  </span>
                  {openMenu === "athletes" ? <MdExpandLess /> : <MdExpandMore />}
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    openMenu === "athletes"
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pl-12 pr-3 py-2 space-y-1">
                      <Link
                        to="/dashboard/sports-category"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/sports-category")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Categoría Deportiva
                      </Link>
                      <Link
                        to="/dashboard/athletes"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/athletes")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Deportistas
                      </Link>
                      <Link
                        to="/dashboard/temporary-workers"
                        onClick={() => setIsOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${
                          isActive("/dashboard/temporary-workers")
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-gray-700 hover:bg-indigo-50"
                        }`}
                      >
                        Personas Temporales
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Donaciones */}
              <Link
                to="/dashboard/donations"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                  isActive("/dashboard/donations")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <FaHandHoldingHeart size={20} className="shrink-0" />
                <span>Donaciones</span>
              </Link>

              {/* Eventos */}
              <Link
                to="/dashboard/events"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                  isActive("/dashboard/events")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <FaRegCalendarAlt size={20} className="shrink-0" />
                <span>Eventos</span>
              </Link>

              {/* Compras */}
              <Link
                to="/dashboard/purchases"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                  isActive("/dashboard/purchases")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <FaShoppingCart size={20} className="shrink-0" />
                <span>Compras</span>
              </Link>

              {/* Ventas */}
              <Link
                to="/dashboard/sales"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                  isActive("/dashboard/sales")
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
              >
                <FaDollarSign size={20} className="shrink-0" />
                <span>Ventas</span>
              </Link>

              {/* Logout */}
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition text-purple-600 hover:bg-red-50"
              >
                <FaSignOutAlt size={20} className="shrink-0" />
                <span>Cerrar Sesión</span>
              </Link>
            </motion.nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SideBar;
