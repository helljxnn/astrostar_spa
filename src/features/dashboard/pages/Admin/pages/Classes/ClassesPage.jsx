import React, { useState } from "react";
import { Calendar, List, Plus, Filter, BarChart3 } from "lucide-react";
import ClassesCalendar from "./components/ClassesCalendar";
import ClassesList from "./components/ClassesList";
import ClassFormModal from "./components/ClassFormModal";
import ClassesStats from "./components/ClassesStats";
import ClassesFilters from "./components/ClassesFilters";
import { usePermissions } from "../../../../../../shared/hooks/usePermissions";

const ClassesPage = () => {
  const [activeView, setActiveView] = useState("calendar"); // calendar, list, stats
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { hasPermission } = usePermissions();

  // Permisos
  const canCreateClasses = hasPermission("classes", "create");
  const canViewStats = hasPermission("classes", "read");

  const views = [
    {
      id: "calendar",
      name: "Calendario",
      icon: Calendar,
      component: ClassesCalendar,
    },
    {
      id: "list",
      name: "Lista",
      icon: List,
      component: ClassesList,
    },
    {
      id: "stats",
      name: "Estadísticas",
      icon: BarChart3,
      component: ClassesStats,
      permission: canViewStats,
    },
  ].filter((view) => view.permission !== false);

  const ActiveComponent =
    views.find((view) => view.id === activeView)?.component || ClassesCalendar;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clases</h1>
          <p className="text-gray-600">
            Gestiona las clases y la asistencia de las deportistas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>

          {/* Botón crear clase */}
          {canCreateClasses && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Clase
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <ClassesFilters />
        </div>
      )}

      {/* Navegación de vistas */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeView === view.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {view.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido de la vista activa */}
        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>

      {/* Modal de crear/editar clase */}
      {showCreateModal && (
        <ClassFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // El hook se encargará de recargar los datos
          }}
        />
      )}
    </div>
  );
};

export default ClassesPage;
