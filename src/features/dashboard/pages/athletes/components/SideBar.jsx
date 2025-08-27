import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { MdSearch } from "react-icons/md";
import { FaClipboardList, FaSignOutAlt, FaBars } from "react-icons/fa";

function SideBar() {
  const [isOpen, setIsOpen] = useState(false); // hamburguesa (móvil)
  const location = useLocation();

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
        className={`fixed lg:static top-0 left-0 h-full bg-white shadow-xl flex flex-col transition-transform duration-300 z-50 rounded-r-2xl w-72  
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header con logo grande */}
        <div className="relative border-b border-gray-200 px-6 pt-8 pb-6">
          <div className="flex items-center justify-center">
            <Link
              to="/dashboard/athletes"
              onClick={() => setIsOpen(false)}
              className="block"
            >
              <img
                src="/assets/images/Logo2FundacionMV.png"
                alt="Logo"
                className="h-24 w-24 md:h-28 md:w-28 object-contain"
              />
            </Link>
          </div>
        </div>

        {/* Buscador */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100">
            <MdSearch size={18} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
            />
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          {/* Gestión de Citas */}
          <Link
            to="/dashboard/athletes/appointmentmanagementathletes"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition ${
              isActive("/dashboard/athletes/appointmentmanagementathletes")
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-700 hover:bg-indigo-50"
            }`}
          >
            <FaClipboardList size={20} className="shrink-0" />
            <span>Gestión de Citas</span>
          </Link>
        </nav>

        {/* Cerrar Sesión (mismo diseño y color que tu snippet, abajo) */}
        <div className="px-4 py-5 border-t border-gray-200">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] transition text-purple-600 hover:bg-red-50"
          >
            <FaSignOutAlt size={20} className="shrink-0" />
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default SideBar;
