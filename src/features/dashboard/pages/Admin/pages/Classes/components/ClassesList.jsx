import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  MapPin,
  Eye,
} from "lucide-react";
import { useClasses } from "../hooks/useClasses";
import ClassFormModal from "./ClassFormModal";
import ClassDetailModal from "./ClassDetailModal";
import LoadingSpinner from "../../../../../../../shared/components/LoadingSpinner";
import Pagination from "../../../../../../../shared/components/Pagination";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

const ClassesList = () => {
  const { classes, loading, pagination, deleteClass, changePage } =
    useClasses();

  const { hasPermission } = usePermissions();

  const [selectedClass, setSelectedClass] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Permisos
  const canEditClasses = hasPermission("classes", "update");
  const canDeleteClasses = hasPermission("classes", "delete");

  /**
   * Obtener color del estado
   */
  const getStatusColor = (status) => {
    const colors = {
      Programada: "bg-blue-100 text-blue-800",
      En_curso: "bg-yellow-100 text-yellow-800",
      Finalizada: "bg-green-100 text-green-800",
      Cancelada: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Manejar edición
   */
  const handleEdit = (classData) => {
    setSelectedClass(classData);
    setShowEditModal(true);
  };

  /**
   * Manejar ver detalle
   */
  const handleViewDetail = (classData) => {
    setSelectedClass(classData);
    setShowDetailModal(true);
  };

  /**
   * Manejar eliminación
   */
  const handleDelete = async (classData) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar la clase "${classData.title}"?`
      )
    ) {
      try {
        await deleteClass(classData.id);
      } catch (error) {
        console.error("Error deleting class:", error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Lista de clases */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay clases
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando una nueva clase.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {classes.map((classItem) => (
              <li key={classItem.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {classItem.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              classItem.status
                            )}`}
                          >
                            {classItem.status.replace("_", " ")}
                          </span>
                        </div>

                        {classItem.description && (
                          <p className="mt-1 text-sm text-gray-600 truncate">
                            {classItem.description}
                          </p>
                        )}

                        <div className="mt-2 flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(classItem.classDate)}
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {classItem.startTime} - {classItem.endTime}
                          </div>

                          {classItem.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {classItem.location}
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {classItem._count?.athletes || 0} deportistas
                            {classItem.maxCapacity &&
                              ` / ${classItem.maxCapacity}`}
                          </div>
                        </div>

                        {classItem.employee && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Profesor:</span>{" "}
                            {classItem.employee.user.firstName}{" "}
                            {classItem.employee.user.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(classItem)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {canEditClasses && (
                      <button
                        onClick={() => handleEdit(classItem)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar clase"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}

                    {canDeleteClasses && (
                      <button
                        onClick={() => handleDelete(classItem)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar clase"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={changePage}
          showInfo={true}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
        />
      )}

      {/* Modal de edición */}
      {showEditModal && selectedClass && (
        <ClassFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClass(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
        />
      )}

      {/* Modal de detalle */}
      {showDetailModal && selectedClass && (
        <ClassDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClass(null);
          }}
          classData={selectedClass}
        />
      )}
    </div>
  );
};

export default ClassesList;
