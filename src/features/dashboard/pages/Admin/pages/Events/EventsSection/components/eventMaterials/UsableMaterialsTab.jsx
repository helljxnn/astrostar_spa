import { useState, useEffect, useMemo } from "react";
import { Trash2, Recycle, X, AlertCircle, Lock, Edit } from "lucide-react";
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showDeleteAlert,
} from "../../../../../../../../../shared/utils/alerts";
import EventMaterialsService from "../../../../SportsMaterials/Materials/services/EventMaterialsService";
import MaterialsService from "../../../../SportsMaterials/Materials/services/MaterialsService";
import MaterialSearchSelector from "../../../../../../../../../shared/components/MaterialSearchSelector";

const UsableMaterialsTab = ({
  event,
  usables,
  pendingMaterials,
  onAddMaterial,
  onRemovePending,
  onRefresh,
}) => {
  const [materials, setMaterials] = useState([]);
  const [materialsAvailability, setMaterialsAvailability] = useState({});
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  // Estado para ediciÃ³n
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editNote, setEditNote] = useState("");

  // Check if event has started
  const eventHasStarted = useMemo(() => {
    if (!event?.startDate) return false;
    const now = new Date();
    const startDate = new Date(event.startDate);
    return startDate <= now;
  }, [event]);

  useEffect(() => {
    if (event?.id) {
      loadAvailableMaterials();
    }
  }, [event?.id]);

  const loadAvailableMaterials = async () => {
    // Normalizar las fechas del evento (puede venir como start/end o startDate/endDate)
    const startDate = event?.startDate || event?.start;
    const endDate = event?.endDate || event?.end;

    try {
      setLoadingMaterials(true);
      const response = await MaterialsService.getMaterials({
        page: 1,
        limit: 1000,
        estado: "Activo",
      });

      if (response.success && response.data) {
        // Filtrar SOLO materiales ACTIVOS con stock en FUNDACION
        const materialsFiltered = response.data.filter(
          (m) => m.estado === "Activo" && (m.stockFundacion || 0) > 0,
        );

        setMaterials(materialsFiltered);

        // Cargar disponibilidad para cada material
        if (startDate && endDate) {
          await loadMaterialsAvailability(
            materialsFiltered,
            startDate,
            endDate,
          );
        }
      }
    } catch (error) {
      console.error("Error loading materials:", error);
      showErrorAlert(
        "Error",
        "No se pudieron cargar los materiales disponibles",
      );
    } finally {
      setLoadingMaterials(false);
    }
  };

  const loadMaterialsAvailability = async (
    materialsList,
    startDate,
    endDate,
  ) => {
    if (!startDate || !endDate) return;

    try {
      setLoadingAvailability(true);
      const availabilityMap = {};

      // Usar bulk availability para obtener todo en una sola llamada (optimizado)
      const materialIds = materialsList.map((m) => m.id);

      try {
        const response = await EventMaterialsService.checkBulkAvailability(
          materialIds,
          startDate,
          endDate,
          event.id,
        );

        if (response.success && response.data) {
          // El backend devuelve un mapa con la disponibilidad de cada material
          Object.keys(response.data).forEach((materialId) => {
            const data = response.data[materialId];
            availabilityMap[materialId] = {
              available: data.availableQuantity || 0,
              totalStock: data.totalStock || 0,
              usedInConflicts: data.usedInConflicts || 0,
              conflictingEvents: data.conflictingEvents || [],
            };
          });
        }
      } catch (error) {
        console.error("Error checking bulk availability:", error);
        // Si falla bulk, usar stock total como fallback
        materialsList.forEach((material) => {
          availabilityMap[material.id] = {
            available: material.stockFundacion || 0,
            totalStock: material.stockFundacion || 0,
            usedInConflicts: 0,
            conflictingEvents: [],
          };
        });
      }

      setMaterialsAvailability(availabilityMap);
    } catch (error) {
      console.error("Error loading materials availability:", error);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Get selected material details with availability
  const selectedMaterialData = useMemo(() => {
    if (!selectedMaterial) return null;
    const material = materials.find((m) => m.id === parseInt(selectedMaterial));
    if (!material) return null;

    const availability = materialsAvailability[material.id] || {
      available: material.stockFundacion || 0,
      totalStock: material.stockFundacion || 0,
      usedInConflicts: 0,
      conflictingEvents: [],
    };

    return {
      ...material,
      availableForEvent: availability.available,
      totalStock: availability.totalStock,
      usedInConflicts: availability.usedInConflicts,
      conflictingEvents: availability.conflictingEvents,
    };
  }, [selectedMaterial, materials, materialsAvailability]);

  // Validate quantity in real-time
  const quantityValidation = useMemo(() => {
    if (!quantity || !selectedMaterialData) {
      return { valid: false, message: "" };
    }

    const qty = parseInt(quantity);
    const available = selectedMaterialData.availableForEvent || 0;

    if (qty <= 0) {
      return { valid: false, message: "La cantidad debe ser mayor a 0" };
    }

    if (qty > available) {
      const conflictInfo =
        selectedMaterialData.conflictingEvents?.length > 0
          ? ` (${selectedMaterialData.usedInConflicts} en uso en otros eventos)`
          : "";
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${available}${conflictInfo}`,
      };
    }

    return { valid: true, message: "" };
  }, [quantity, selectedMaterialData]);

  const handleAddMaterial = () => {
    // Validations
    if (!selectedMaterial) {
      showWarningAlert(
        "Material requerido",
        "Por favor selecciona un material",
      );
      return;
    }

    if (!quantity || quantity <= 0) {
      showWarningAlert(
        "Cantidad invÃ¡lida",
        "Por favor ingresa una cantidad vÃ¡lida",
      );
      return;
    }

    if (!quantityValidation.valid) {
      showErrorAlert("Cantidad invÃ¡lida", quantityValidation.message);
      return;
    }

    // Check if material is already assigned (in saved list)
    const materialId = parseInt(selectedMaterial);
    const isAlreadyAssigned = usables.some(
      (item) => item.material_id === materialId,
    );

    if (isAlreadyAssigned) {
      const materialName = selectedMaterialData?.nombre || "este material";
      showWarningAlert(
        "Material ya asignado",
        `${materialName} ya estÃ¡ en la lista. Si deseas cambiar la cantidad, usa el botÃ³n de editar.`,
      );
      return;
    }

    // Check if material is already in pending list
    const isInPending = pendingMaterials.some(
      (item) => item.materialId === materialId,
    );

    if (isInPending) {
      const materialName = selectedMaterialData?.nombre || "este material";
      showWarningAlert(
        "Material ya agregado",
        `${materialName} ya estÃ¡ en la lista de pendientes. Si deseas cambiar la cantidad, elimÃ­nalo y agrÃ©galo nuevamente.`,
      );
      return;
    }

    // Add to pending list
    const materialData = {
      materialId: materialId,
      cantidad: parseInt(quantity),
      observaciones: note,
    };

    onAddMaterial(materialData);

    // Reset form
    setSelectedMaterial("");
    setQuantity("");
    setNote("");
  };

  const handleRemove = async (assignmentId, materialName, qty) => {
    const result = await showDeleteAlert(
      "Â¿Eliminar material?",
      `Se eliminarÃ¡ la planificaciÃ³n de ${qty} unidades de ${materialName}`,
    );

    if (!result.isConfirmed) return;

    try {
      await EventMaterialsService.removeReusable(assignmentId);

      showSuccessAlert("Material eliminado");

      onRefresh();
    } catch (error) {
      console.error("Error removing material:", error);
      showErrorAlert(
        "Error",
        error.message || "No se pudo eliminar el material",
      );
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditQuantity(item.qty_planned.toString());
    setEditNote(item.note || "");
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditQuantity("");
    setEditNote("");
  };

  // Get real availability for editing item
  const editingMaterialAvailability = useMemo(() => {
    if (!editingItem) return null;

    const availability = materialsAvailability[editingItem.material_id] || {
      available: editingItem.stock_available || 0,
      totalStock: editingItem.stock_available || 0,
      usedInConflicts: 0,
      conflictingEvents: [],
    };

    // Para materiales REUTILIZABLES (a usar):
    // - NO se descuenta stock, solo se valida disponibilidad en tiempo
    // - La cantidad actual YA estÃ¡ incluida en la disponibilidad calculada
    // - Por lo tanto, el mÃ¡ximo es simplemente la disponibilidad disponible
    //
    // Ejemplo: Stock 50, Evento1 usa 30, quedan 20 disponibles
    // - Al crear Evento2: mÃ¡x 20 âœ“
    // - Al editar Evento2 (tiene 10): mÃ¡x 20 âœ“ (NO 30, porque los 10 ya cuentan en la reserva)

    return {
      availableForEvent: availability.available,
      maxAllowed: availability.available, // NO sumamos qty_planned
      totalStock: availability.totalStock,
      usedInConflicts: availability.usedInConflicts,
      conflictingEvents: availability.conflictingEvents,
    };
  }, [editingItem, materialsAvailability]);

  // Validate edit quantity in real-time
  const editQuantityValidation = useMemo(() => {
    if (!editQuantity || !editingItem || !editingMaterialAvailability) {
      return { valid: false, message: "" };
    }

    const qty = parseInt(editQuantity);
    const maxAvailable = editingMaterialAvailability.maxAllowed;

    if (qty <= 0) {
      return { valid: false, message: "La cantidad debe ser mayor a 0" };
    }

    if (qty > maxAvailable) {
      const conflictInfo =
        editingMaterialAvailability.conflictingEvents?.length > 0
          ? ` (${editingMaterialAvailability.usedInConflicts} en uso en otros eventos)`
          : "";
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${maxAvailable}${conflictInfo}`,
      };
    }

    return { valid: true, message: "" };
  }, [editQuantity, editingItem, editingMaterialAvailability]);

  const handleSaveEdit = async () => {
    const newQty = parseInt(editQuantity);

    // Validaciones
    if (!editQuantityValidation.valid) {
      showWarningAlert("Cantidad invÃ¡lida", editQuantityValidation.message);
      return;
    }

    try {
      // Eliminar asignaciÃ³n actual
      await EventMaterialsService.removeReusable(editingItem.id);

      // Crear nueva asignaciÃ³n con valores actualizados
      await EventMaterialsService.assignReusable(event.id, {
        materialId: editingItem.material_id,
        cantidad: newQty,
        observaciones: editNote.trim(),
      });

      showSuccessAlert("Material actualizado");

      handleCancelEdit();
      onRefresh();
    } catch (error) {
      console.error("Error updating material:", error);
      showErrorAlert(
        "Error",
        error.message || "No se pudo actualizar el material",
      );
    }
  };

  const getTotals = () => {
    const totalItems = usables.length;
    const totalUnits = usables.reduce((sum, item) => sum + item.qty_planned, 0);

    return { totalItems, totalUnits };
  };

  const totals = getTotals();

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Ãtems</div>
          <div className="text-2xl font-semibold text-gray-900">
            {totals.totalItems}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-primary-purple">
            Total Unidades Planificadas
          </div>
          <div className="text-2xl font-semibold text-purple-900">
            {totals.totalUnits}
          </div>
        </div>
      </div>

      {/* Event Started Warning Banner */}
      {eventHasStarted && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Evento iniciado - Materiales bloqueados
              </p>
              <p className="text-xs text-amber-700 mt-1">
                No se pueden agregar ni eliminar materiales de eventos que ya
                han iniciado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Form - Always visible when event hasn't started */}
      {!eventHasStarted && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border-2 border-primary-purple/20">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Planificar Material</h3>
            {loadingAvailability && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <span className="animate-spin">â³</span>
                Verificando disponibilidad...
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <MaterialSearchSelector
                materials={materials
                  .filter((m) => {
                    // Filtrar materiales que ya estÃ¡n asignados o pendientes
                    const isAssigned = usables.some(
                      (item) => item.material_id === m.id,
                    );
                    const isPending = pendingMaterials.some(
                      (item) => item.materialId === m.id,
                    );
                    return !isAssigned && !isPending;
                  })
                  .map((m) => ({
                    ...m,
                    // Mostrar disponibilidad real en lugar de stock total
                    stockFundacion:
                      materialsAvailability[m.id]?.available ??
                      m.stockFundacion,
                  }))}
                value={selectedMaterial}
                onChange={(materialId) => {
                  setSelectedMaterial(materialId);
                  setQuantity(""); // Reset quantity when material changes
                }}
                placeholder="Buscar material..."
                disabled={loadingMaterials || loadingAvailability}
                showStock={true}
                stockField="stockFundacion"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
                {selectedMaterialData && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Disponible: {selectedMaterialData.availableForEvent} de{" "}
                    {selectedMaterialData.totalStock})
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max={selectedMaterialData?.availableForEvent || 999999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue ${
                  quantity && !quantityValidation.valid
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="0"
                disabled={!selectedMaterial || loadingAvailability}
              />
              {quantity && !quantityValidation.valid && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {quantityValidation.message}
                </div>
              )}
              {selectedMaterialData &&
                selectedMaterialData.conflictingEvents?.length > 0 && (
                  <div className="mt-1 text-xs text-amber-600">
                    âš  {selectedMaterialData.usedInConflicts} unidades reservadas
                    en {selectedMaterialData.conflictingEvents.length} evento(s)
                    con fechas solapadas
                  </div>
                )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ObservaciÃ³n (opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddMaterial}
              disabled={
                !selectedMaterial || !quantity || !quantityValidation.valid
              }
              className="flex-1 px-4 py-2 bg-primary-purple hover:bg-primary-blue text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Planificar
            </button>
            <button
              onClick={() => {
                setSelectedMaterial("");
                setQuantity("");
                setNote("");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Edit Material Form */}
      {editingItem && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              Editar: {editingItem.material_name}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
                <span className="text-xs text-gray-500 ml-2">
                  {editingMaterialAvailability ? (
                    <>
                      (Disponible:{" "}
                      {editingMaterialAvailability.availableForEvent} de{" "}
                      {editingMaterialAvailability.totalStock})
                    </>
                  ) : (
                    <>(MÃ¡x: {editingItem.stock_available})</>
                  )}
                </span>
              </label>
              <input
                type="number"
                min="1"
                max={
                  editingMaterialAvailability?.maxAllowed ||
                  editingItem.stock_available
                }
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple ${
                  editQuantity && !editQuantityValidation.valid
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="0"
              />
              {editQuantity && !editQuantityValidation.valid && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {editQuantityValidation.message}
                </div>
              )}
              {editingMaterialAvailability &&
                editingMaterialAvailability.conflictingEvents?.length > 0 && (
                  <div className="mt-1 text-xs text-amber-600">
                    âš  {editingMaterialAvailability.usedInConflicts} unidades
                    reservadas en{" "}
                    {editingMaterialAvailability.conflictingEvents.length}{" "}
                    evento(s) con fechas solapadas
                  </div>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ObservaciÃ³n (opcional)
              </label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={!editQuantity || !editQuantityValidation.valid}
              className="flex-1 px-4 py-2 bg-primary-purple hover:bg-primary-blue text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Cambios
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Pending Materials Section */}
      {pendingMaterials.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-3">
            Materiales Pendientes de Guardar ({pendingMaterials.length})
          </h3>
          <div className="space-y-2">
            {pendingMaterials.map((pending, index) => {
              const material = materials.find(
                (m) => m.id === pending.materialId,
              );
              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {material?.nombre || "Material"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Cantidad: {pending.cantidad}{" "}
                      {material?.unidadMedida || "unidades"}
                      {pending.observaciones && (
                        <span className="ml-2 text-gray-500">
                          â€¢ {pending.observaciones}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemovePending(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Materials Table */}
      {usables.length === 0 && pendingMaterials.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Recycle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No hay materiales planificados</p>
          <p className="text-sm text-slate-500 mt-1">
            Agrega materiales reutilizables para planificar su uso en este
            evento
          </p>
        </div>
      ) : usables.length > 0 ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Material
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Cantidad Planificada
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  ObservaciÃ³n
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usables.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-900">
                        {item.material_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        Stock disponible: {item.stock_available} {item.unit}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-slate-900">
                      {item.qty_planned}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">
                      {item.note || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!eventHasStarted ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 text-gray-600 hover:text-primary-purple hover:bg-purple-50 rounded transition-colors"
                          title="Editar cantidad y observaciÃ³n"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemove(
                              item.id,
                              item.material_name,
                              item.qty_planned,
                            )
                          }
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 opacity-40">
                        <Lock className="w-4 h-4 mx-auto" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
};

export default UsableMaterialsTab;

