import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, MapPin, Package } from "lucide-react";
import EventMaterialsService from "../services/EventMaterialsService";
import { formatStock } from "../../../../../../../../shared/utils/numberFormat";

const MaterialAssignmentsModal = ({ material, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [consumableData, setConsumableData] = useState(null);
  const [reusableData, setReusableData] = useState(null);
  const [activeTab, setActiveTab] = useState("reusable"); // 'reusable' | 'consumable'

  useEffect(() => {
    if (isOpen && material) {
      loadAssignments();
    }
  }, [isOpen, material]);

  const loadAssignments = async () => {
    try {
      setLoading(true);

      // Cargar asignaciones consumibles (a entregar)
      const consumableResponse =
        await EventMaterialsService.getMaterialAssignments(material.id, {
          includeCompleted: false,
        });

      if (consumableResponse.success) {
        setConsumableData(consumableResponse.data);
      }

      // Cargar asignaciones reutilizables (planificados)
      const reusableResponse =
        await EventMaterialsService.getReusableMaterialAssignments(
          material.id,
          { includeCompleted: false },
        );

      if (reusableResponse.success) {
        setReusableData(reusableResponse.data);
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
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">
                    Stock Fundación
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {formatStock(material?.stockFundacion || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    planificados en{" "}
                    {reusableData?.summary?.totalAsignaciones || 0} eventos
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600">
                    Stock Eventos
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {formatStock(material?.stockEventos || 0)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    asignados en{" "}
                    {consumableData?.summary?.totalAsignaciones || 0} eventos
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-600">
                    Total Eventos
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">
                    {(reusableData?.summary?.totalAsignaciones || 0) +
                      (consumableData?.summary?.totalAsignaciones || 0)}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    próximos eventos
                  </div>
                </div>
              </div>

              {/* Materiales Planificados (Fundación - Reutilizables) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Materiales Planificados (Stock Fundación)
                </h3>
                {!reusableData || reusableData.assignments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No hay eventos próximos con este material planificado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reusableData.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border border-blue-200 bg-blue-50/50 rounded-lg p-3 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {assignment.evento.nombre}
                            </h4>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span>
                                  {new Date(
                                    assignment.evento.fechaInicio,
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              {assignment.observaciones && (
                                <p className="text-xs text-gray-600 pl-5">
                                  {assignment.observaciones}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-3 text-right flex-shrink-0">
                            <div className="text-xl font-bold text-blue-600">
                              {assignment.cantidad}
                            </div>
                            <div className="text-xs text-gray-500">
                              unidades
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Materiales a Entregar (Eventos - Consumibles) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Materiales a Entregar (Stock Eventos)
                </h3>
                {!consumableData || consumableData.assignments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      No hay eventos próximos con este material asignado
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {consumableData.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border border-purple-200 bg-purple-50/50 rounded-lg p-3 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {assignment.evento.nombre}
                            </h4>
                            <div className="mt-1 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span>
                                  {new Date(
                                    assignment.evento.fechaInicio,
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              {assignment.observaciones && (
                                <p className="text-xs text-gray-600 pl-5">
                                  {assignment.observaciones}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-3 text-right flex-shrink-0">
                            <div className="text-xl font-bold text-purple-600">
                              {assignment.cantidad}
                            </div>
                            <div className="text-xs text-gray-500">
                              unidades
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
