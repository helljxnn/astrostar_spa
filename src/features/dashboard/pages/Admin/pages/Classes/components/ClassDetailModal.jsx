import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
} from "lucide-react";
import classesService from "../services/classesService";
import { InlineLoader } from "../../../../../../../shared/components/Loader";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { toast } from "../../../../../../../shared/utils/toast";

const ClassDetailModal = ({ isOpen, onClose, classData }) => {
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [updatingAttendance, setUpdatingAttendance] = useState(false);

  const { hasPermission } = usePermissions();
  const canManageAttendance = hasPermission("classes", "update");

  // Cargar detalles de la clase
  useEffect(() => {
    const loadClassDetail = async () => {
      if (!classData?.id) return;

      try {
        setLoading(true);
        const [detailResponse, statsResponse] = await Promise.all([
          classesService.getById(classData.id),
          classesService.getClassAttendanceStats(classData.id),
        ]);

        if (detailResponse.success) {
          setClassDetail(detailResponse.data);
        }

        if (statsResponse.success) {
          setAttendanceStats(statsResponse.data);
        }
      } catch (error) {
        console.error("Error loading class detail:", error);
        toast.error("Error al cargar los detalles de la clase");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadClassDetail();
    }
  }, [isOpen, classData?.id]);

  /**
   * Obtener color del estado de asistencia
   */
  const getAttendanceStatusColor = (status) => {
    const colors = {
      Pendiente: "bg-gray-100 text-gray-800",
      Confirmada: "bg-blue-100 text-blue-800",
      Asistio: "bg-green-100 text-green-800",
      No_asistio: "bg-red-100 text-red-800",
      Cancelada: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  /**
   * Obtener icono del estado de asistencia
   */
  const getAttendanceStatusIcon = (status) => {
    const icons = {
      Pendiente: AlertCircle,
      Confirmada: CheckCircle,
      Asistio: CheckCircle,
      No_asistio: XCircle,
      Cancelada: XCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  /**
   * Actualizar estado de asistencia
   */
  const updateAttendanceStatus = async (athleteId, newStatus) => {
    try {
      setUpdatingAttendance(true);
      await classesService.updateAttendanceStatus(
        classData.id,
        athleteId,
        newStatus
      );

      // Recargar detalles
      const [detailResponse, statsResponse] = await Promise.all([
        classesService.getById(classData.id),
        classesService.getClassAttendanceStats(classData.id),
      ]);

      if (detailResponse.success) {
        setClassDetail(detailResponse.data);
      }

      if (statsResponse.success) {
        setAttendanceStats(statsResponse.data);
      }

      toast.success("Estado de asistencia actualizado");
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Error al actualizar la asistencia");
    } finally {
      setUpdatingAttendance(false);
    }
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalle de Clase
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-8">
            <InlineLoader message="Cargando detalles..." />
          </div>
        ) : classDetail ? (
          <div className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Información General
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título
                      </label>
                      <p className="text-sm text-gray-900">
                        {classDetail.title}
                      </p>
                    </div>

                    {classDetail.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Descripción
                        </label>
                        <p className="text-sm text-gray-900">
                          {classDetail.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          classDetail.status === "Programada"
                            ? "bg-blue-100 text-blue-800"
                            : classDetail.status === "En_curso"
                            ? "bg-yellow-100 text-yellow-800"
                            : classDetail.status === "Finalizada"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {classDetail.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Detalles
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Fecha:</span>
                    <span>{formatDate(classDetail.classDate)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Horario:</span>
                    <span>
                      {classDetail.startTime} - {classDetail.endTime}
                    </span>
                  </div>

                  {classDetail.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Ubicación:</span>
                      <span>{classDetail.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Profesor:</span>
                    <span>
                      {classDetail.employee?.user?.firstName}{" "}
                      {classDetail.employee?.user?.lastName}
                    </span>
                  </div>

                  {classDetail.maxCapacity && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Capacidad:</span>
                      <span>
                        {classDetail.athletes?.length || 0} /{" "}
                        {classDetail.maxCapacity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas de asistencia */}
            {attendanceStats && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Estadísticas de Asistencia
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {attendanceStats.total}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">
                      {attendanceStats.pendientes}
                    </div>
                    <div className="text-sm text-gray-600">Pendientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {attendanceStats.confirmadas}
                    </div>
                    <div className="text-sm text-gray-600">Confirmadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceStats.asistieron}
                    </div>
                    <div className="text-sm text-gray-600">Asistieron</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceStats.noAsistieron}
                    </div>
                    <div className="text-sm text-gray-600">No asistieron</div>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de deportistas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Deportistas Asignadas ({classDetail.athletes?.length || 0})
              </h3>

              {classDetail.athletes && classDetail.athletes.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {classDetail.athletes.map((classAthlete) => (
                      <div
                        key={classAthlete.id}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {classAthlete.athlete.user.firstName}{" "}
                              {classAthlete.athlete.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {classAthlete.athlete.user.email}
                            </div>
                            {classAthlete.confirmedAt && (
                              <div className="text-xs text-gray-400">
                                Confirmado:{" "}
                                {new Date(
                                  classAthlete.confirmedAt
                                ).toLocaleString("es-ES")}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getAttendanceStatusColor(
                              classAthlete.attendanceStatus
                            )}`}
                          >
                            {getAttendanceStatusIcon(
                              classAthlete.attendanceStatus
                            )}
                            {classAthlete.attendanceStatus.replace("_", " ")}
                          </span>

                          {canManageAttendance && (
                            <div className="flex items-center gap-1">
                              <select
                                value={classAthlete.attendanceStatus}
                                onChange={(e) =>
                                  updateAttendanceStatus(
                                    classAthlete.athleteId,
                                    e.target.value
                                  )
                                }
                                disabled={updatingAttendance}
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Confirmada">Confirmada</option>
                                <option value="Asistio">Asistió</option>
                                <option value="No_asistio">No asistió</option>
                                <option value="Cancelada">Cancelada</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay deportistas asignadas a esta clase
                </div>
              )}
            </div>

            {/* Notas */}
            {classDetail.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Notas
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{classDetail.notes}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No se pudieron cargar los detalles de la clase
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailModal;
