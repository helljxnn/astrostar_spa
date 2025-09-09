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

function SideBar() {
  const [openMenu, setOpenMenu] = useState(null); // "services" | "athletes" | null
  const [isOpen, setIsOpen] = useState(false); // hamburguesa (móvil)
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
            {/* Header con logo grande */}
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
                    className="h-50 w-50 md:h-28 md:w-30 object-contain hover:scale-105 transition-transform"
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
              {[
                { to: "/dashboard", label: "Dashboard", icon: <MdDashboard size={22} /> },
                {
                  submenu: "users",
                  label: "Usuarios",
                  icon: <FaUsers size={20} />,
                  links: [
                    { to: "/dashboard/UsersManagement", label: "Gestión de usuarios" },
                    { to: "/dashboard/AccessManagement", label: "Gestión de acceso" },
                  ],
                },
                { to: "/dashboard/roles", label: "Roles", icon: <FaUserShield size={20} /> },
                {
                  to: "/dashboard/sportsequipment",
                  label: "Material Deportivo",
                  icon: <GiWeightLiftingUp size={20} />,
                },
                {
                  submenu: "services",
                  label: "Servicios",
                  icon: <FaBriefcase size={20} />,
                  links: [
                    { to: "/dashboard/employees", label: "Empleados" },
                    { to: "/dashboard/employees-schedule", label: "Horario Empleados" },
                    { to: "/dashboard/appointment-management", label: "Gestión de citas" },
                  ],
                },
                {
                  submenu: "athletes",
                  label: "Deportistas",
                  icon: <FaClipboardList size={20} />,
                  links: [
                    { to: "/dashboard/athletes", label: "Deportistas" },
                    { to: "/dashboard/sports-category", label: "Categoría Deportiva" },
                  ],
                },
                { to: "/dashboard/donations", label: "Donaciones", icon: <FaHandHoldingHeart size={20} /> },
                { to: "/dashboard/events", label: "Eventos", icon: <FaRegCalendarAlt size={20} /> },
                { to: "/dashboard/purchases", label: "Compras", icon: <FaShoppingCart size={20} /> },
                { to: "/dashboard/sales", label: "Ventas", icon: <FaDollarSign size={20} /> },
              ].map((item, i) =>
                item.submenu ? (
                  <div key={item.submenu}>
                    <button
                      onClick={() => toggleMenu(item.submenu)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition ${
                        openMenu === item.submenu
                          ? "bg-gradient-to-r from-primary-purple-light to-primary-blue text-indigo-900 shadow-sm"
                          : "text-gray-700 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="flex items-center gap-4">{item.icon}{item.label}</span>
                      {openMenu === item.submenu ? <MdExpandLess /> : <MdExpandMore />}
                    </button>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                openMenu === "athletes" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
                    {" "}
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
                    {" "}
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
        </nav>
      </aside>
    </div>
  );
}

export default SideBar;
