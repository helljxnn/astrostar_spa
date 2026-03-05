import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, MapPin, Package } from "lucide-react";
import EventMaterialsService from "../services/EventMaterialsService";
import { formatStock } from "../../../../../../../../shared/utils/numberFormat";

const MaterialAssignmentsModal = ({ material, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && material) {
      loadAssignments();
    }
  }, [isOpen, material]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await EventMaterialsService.getMaterialAssignments(
        material.id,
        { includeCompleted: false }, // Solo eventos futuros/activos
      );

      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
              Asignaciones del Material
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {material?.nombre || "Material"}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">
                    Stock Total
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {formatStock(data.material.stockTotal)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    unidades disponibles
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">
                    Eventos Planificados
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {data.summary.totalAsignaciones}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    próximos eventos
                  </div>
                </div>
              </div>

              {/* Assignments List */}
              {data.assignments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    No hay eventos próximos usando este material
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {assignment.evento.nombre}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {new Date(
                                  assignment.evento.fechaInicio,
                                ).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}{" "}
                                -{" "}
                                {new Date(
                                  assignment.evento.fechaFin,
                                ).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            {assignment.evento.ubicacion && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{assignment.evento.ubicacion}</span>
                              </div>
                            )}
                            {assignment.observaciones && (
                              <p className="text-sm text-gray-600 mt-2 pl-6">
                                {assignment.observaciones}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-primary-blue">
                            {assignment.cantidad}
                          </div>
                          <div className="text-xs text-gray-500">unidades</div>
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.evento.estado === "Completado"
                                  ? "bg-gray-100 text-gray-700"
                                  : assignment.evento.estado === "En Curso"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {assignment.evento.estado}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MaterialAssignmentsModal;
