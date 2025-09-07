import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MdDashboard, MdSearch, MdExpandMore, MdExpandLess } from "react-icons/md";
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
  const [openMenu, setOpenMenu] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Animaciones
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 80, damping: 20 },
    },
    exit: { x: "-100%", transition: { duration: 0.3 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  return (
    <div className="flex h-screen bg-gray-100 font-questrial">
      {/* Botón hamburguesa (móvil) */}
      <button
        aria-label="Abrir menú"
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-primary-purple text-white shadow-md active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <FaBars size={18} />
      </button>

      {/* Backdrop (móvil) */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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

            {/* Buscador */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 focus-within:ring-2 focus-within:ring-primary-purple transition">
                <MdSearch size={18} className="text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
                />
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

                    <AnimatePresence>
                      {openMenu === item.submenu && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="pl-12 pr-3 py-2 space-y-1"
                        >
                          {item.links.map((link, idx) => (
                            <Link
                              key={idx}
                              to={link.to}
                              onClick={() => setIsOpen(false)}
                              className={`block px-3 py-2 rounded-lg text-sm transition ${
                                isActive(link.to)
                                  ? "bg-primary-purple-light text-indigo-900"
                                  : "text-gray-700 hover:bg-indigo-50"
                              }`}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div key={i} custom={i} variants={linkVariants}>
                    <Link
                      to={item.to}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
                        isActive(item.to)
                          ? "bg-gradient-to-r from-primary-purple-light to-primary-blue text-indigo-900 shadow-sm"
                          : "text-gray-700 hover:bg-indigo-50"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                )
              )}

              {/* Logout */}
              <motion.div custom={99} variants={linkVariants}>
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt size={20} className="shrink-0" />
                  <span>Cerrar Sesión</span>
                </Link>
              </motion.div>
            </motion.nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SideBar;
