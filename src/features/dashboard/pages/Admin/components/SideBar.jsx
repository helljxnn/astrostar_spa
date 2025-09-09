import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdSearch,
  MdExpandMore,
  MdExpandLess,
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
      <aside
        className={`fixed lg:static top-0 left-0 h-full bg-white shadow-xl flex flex-col transition-transform duration-300 z-50 rounded-r-2xl w-72  ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header con logo grande */}
        <div className="relative border-b border-gray-200 px-6 pt-8 pb-6">
          <div className="flex items-center justify-center">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block"
            >
              <img
                src="/assets/images/Logo2FundacionMV_Dashboard.png"
                alt="Logo"
                className="h-50 w-50 md:h-28 md:w-30 object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Buscador
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100">
            <MdSearch size={18} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
            />
          </div>
        </div> */}

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
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
            <MdDashboard size={22} className="shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* Usuarios (sin submenu) */}

          <Link
            to="/dashboard/Users"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
              isActive("/dashboard/Users")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-indigo-50"
            }`}
          >
            <FaUsers size={20} className="shrink-0" />
            <span>Usuarios</span>
          </Link>

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
            {" "}
            <FaUserShield size={20} className="shrink-0" /> <span>Roles</span>
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
            {" "}
            <GiWeightLiftingUp size={20} className="shrink-0" />
            <span>Material Deportivo</span>{" "}
          </Link>

          {/* Servicios (submenu) */}
          <div className="mt-1">
            <button
              onClick={() => toggleMenu("services")}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition ${
                openMenu === "services" ||
                isActive("/dashboard/employees") ||
                isActive("/dashboard/employees-schedule") ||
                isActive("/dashboard/appointment-management")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
            >
              <span className="flex items-center gap-4">
                {" "}
                <FaBriefcase size={20} /> Servicios
              </span>{" "}
              {openMenu === "services" ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            {/* contenido submenu */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                openMenu === "services" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
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
                    {" "}
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
                    {" "}
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

          {/* Deportistas (submenu) */}
          <div className="mt-1">
            <button
              onClick={() => toggleMenu("athletes")}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition ${
                openMenu === "athletes" ||
                isActive("/dashboard/athletes") ||
                isActive("/dashboard/sports-category") ||
                isActive("/dashboard/temporary-workers")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
            >
              <span className="flex items-center gap-4">
                <FaClipboardList size={20} />
                Deportistas{" "}
              </span>
              {openMenu === "athletes" ? <MdExpandLess /> : <MdExpandMore />}
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

          {/* Compras (submenu) */}
          <div className="mt-1">
            <button
              onClick={() => toggleMenu("purchases")}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-[15px] transition ${
                openMenu === "purchases" ||
                isActive("/dashboard/purchases") ||
                isActive("/dashboard/providers")
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
            >
              <span className="flex items-center gap-4">
                <FaShoppingCart size={20} />
                Compras
              </span>
              {openMenu === "purchases" ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            {/* contenido submenu */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                openMenu === "purchases" ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="pl-12 pr-3 py-2 space-y-1">
                  <Link
                    to="/dashboard/purchases"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm transition ${
                      isActive("/dashboard/purchases")
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-indigo-50"
                    }`}
                  >
                    Compras
                  </Link>

                  <Link
                    to="/dashboard/providers"
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm transition ${
                      isActive("/dashboard/providers")
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-indigo-50"
                    }`}
                  >
                    Proveedores
                  </Link>
                </div>
              </div>
            </div>
          </div>

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
