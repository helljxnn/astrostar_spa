import { useState, useEffect, useMemo } from "react";
import { Trash2, Lock, Package, X, AlertCircle, Edit } from "lucide-react";
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showDeleteAlert,
} from "../../../../../../../../../shared/utils/alerts";
import EventMaterialsService from "../../../../SportsMaterials/Materials/services/EventMaterialsService";
import MaterialsService from "../../../../SportsMaterials/Materials/services/materialsService";
import MaterialSearchSelector from "../../../../../../../../../shared/components/MaterialSearchSelector";

const DeliverableMaterialsTab = ({
  event,
  deliverables,
  pendingMaterials,
  onAddMaterial,
  onRemovePending,
  onRefresh,
}) => {
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");

  // Estado para edición
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
    loadAvailableMaterials();
  }, []);

  const loadAvailableMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const response = await MaterialsService.getMaterials({
        page: 1,
        limit: 1000,
        estado: "Activo",
      });

      if (response.success && response.data) {
        // Filtrar materiales que tengan stock en EVENTOS
        const materialsFiltered = response.data.filter(
          (m) => (m.stockEventos || 0) > 0,
        );

        setMaterials(materialsFiltered);
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

  // Get selected material details
  const selectedMaterialData = useMemo(() => {
    if (!selectedMaterial) return null;
    return materials.find((m) => m.id === parseInt(selectedMaterial));
  }, [selectedMaterial, materials]);

  // Validate quantity in real-time
  const quantityValidation = useMemo(() => {
    if (!quantity || !selectedMaterialData) {
      return { valid: false, message: "" };
    }

    const qty = parseInt(quantity);
    const available = selectedMaterialData.stockEventos || 0;

    if (qty <= 0) {
      return { valid: false, message: "La cantidad debe ser mayor a 0" };
    }

    if (qty > available) {
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${available}`,
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
        "Cantidad inválida",
        "Por favor ingresa una cantidad válida",
      );
      return;
    }

    if (!quantityValidation.valid) {
      showErrorAlert("Cantidad inválida", quantityValidation.message);
      return;
    }

    // Check if material is already assigned (in saved list)
    const materialId = parseInt(selectedMaterial);
    const isAlreadyAssigned = deliverables.some(
      (item) => item.material_id === materialId && item.qty_manual > 0,
    );

    if (isAlreadyAssigned) {
      const materialName = selectedMaterialData?.nombre || "este material";
      showWarningAlert(
        "Material ya asignado",
        `${materialName} ya está en la lista. Si deseas cambiar la cantidad, usa el botón de editar.`,
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
        `${materialName} ya está en la lista de pendientes. Si deseas cambiar la cantidad, elimínalo y agrégalo nuevamente.`,
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

  const handleRemoveManual = async (assignmentId, materialName, qty) => {
    const result = await showDeleteAlert(
      "¿Eliminar material?",
      `Se eliminará ${qty} unidades de ${materialName}`,
    );

    if (!result.isConfirmed) return;

    try {
      await EventMaterialsService.removeConsumable(assignmentId);

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
    setEditQuantity(item.qty_manual.toString());
    setEditNote(item.assignments?.[0]?.note || "");
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditQuantity("");
    setEditNote("");
  };

  // Validate edit quantity in real-time
  const editQuantityValidation = useMemo(() => {
    if (!editQuantity || !editingItem) {
      return { valid: false, message: "" };
    }

    const qty = parseInt(editQuantity);
    // stock_available es el stock real disponible en eventos
    // Cuando editamos, liberamos qty_manual actual, así que el máximo es stock_available + qty_manual
    const maxAvailable = editingItem.stock_available + editingItem.qty_manual;

    if (qty <= 0) {
      return { valid: false, message: "La cantidad debe ser mayor a 0" };
    }

    if (qty > maxAvailable) {
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${maxAvailable} (${editingItem.stock_available} disponibles + ${editingItem.qty_manual} actualmente asignadas)`,
      };
    }

    return { valid: true, message: "" };
  }, [editQuantity, editingItem]);

  const handleSaveEdit = async () => {
    const newQty = parseInt(editQuantity);

    // Validaciones
    if (!editQuantityValidation.valid) {
      showWarningAlert("Cantidad inválida", editQuantityValidation.message);
      return;
    }

    try {
      // Eliminar asignación actual
      await EventMaterialsService.removeConsumable(
        editingItem.assignments[0].id,
      );

      // Crear nueva asignación con valores actualizados
      await EventMaterialsService.assignConsumable(event.id, {
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
    const totalItems = deliverables.length;
    const totalUnits = deliverables.reduce(
      (sum, item) => sum + item.qty_total,
      0,
    );
    const totalDonated = deliverables.reduce(
      (sum, item) => sum + item.qty_donated,
      0,
    );
    const totalManual = deliverables.reduce(
      (sum, item) => sum + item.qty_manual,
      0,
    );

    return { totalItems, totalUnits, totalDonated, totalManual };
  };

  const totals = getTotals();

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Ítems</div>
          <div className="text-2xl font-semibold text-gray-900">
            {totals.totalItems}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-primary-purple">Total Unidades</div>
          <div className="text-2xl font-semibold text-purple-900">
            {totals.totalUnits}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Donados</div>
          <div className="text-2xl font-semibold text-gray-900">
            {totals.totalDonated}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Stock Evento</div>
          <div className="text-2xl font-semibold text-gray-900">
            {totals.totalManual}
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
                han iniciado. El stock ya fue descontado al asignar los
                materiales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Form - Always visible when event hasn't started */}
      {!eventHasStarted && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border-2 border-primary-purple/20">
          <h3 className="font-medium text-gray-900">
            Agregar Material desde Stock Evento
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <MaterialSearchSelector
                materials={materials.filter((m) => {
                  // Filtrar materiales que ya están asignados manualmente o pendientes
                  const isAssigned = deliverables.some(
                    (item) => item.material_id === m.id && item.qty_manual > 0,
                  );
                  const isPending = pendingMaterials.some(
                    (item) => item.materialId === m.id,
                  );
                  return !isAssigned && !isPending;
                })}
                value={selectedMaterial}
                onChange={(materialId) => {
                  setSelectedMaterial(materialId);
                  setQuantity(""); // Reset quantity when material changes
                }}
                placeholder="Buscar material..."
                disabled={loadingMaterials}
                showStock={true}
                stockField="stockEventos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
                {selectedMaterialData && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Máx: {selectedMaterialData.stockEventos})
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max={selectedMaterialData?.stockEventos || 999999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple ${
                  quantity && !quantityValidation.valid
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="0"
                disabled={!selectedMaterial}
              />
              {quantity && !quantityValidation.valid && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {quantityValidation.message}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observación (opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple"
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
              Agregar
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
                  (Máx: {editingItem.stock_available + editingItem.qty_manual} ={" "}
                  {editingItem.stock_available} disponibles +{" "}
                  {editingItem.qty_manual} actuales)
                </span>
              </label>
              <input
                type="number"
                min="1"
                max={editingItem.stock_available + editingItem.qty_manual}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observación (opcional)
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
                          • {pending.observaciones}
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
      {deliverables.length === 0 && pendingMaterials.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No hay materiales asignados</p>
          <p className="text-sm text-slate-500 mt-1">
            Agrega materiales desde stock evento o se cargarán automáticamente
            desde donaciones
          </p>
        </div>
      ) : deliverables.length > 0 ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Material
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Donado
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Stock Evento
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Observación
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {deliverables.map((item) => (
                <tr
                  key={item.material_id}
                  className={
                    item.is_locked
                      ? "bg-slate-50"
                      : "bg-white hover:bg-slate-50"
                  }
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.is_locked && (
                        <Lock className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <div className="font-medium text-slate-900">
                          {item.material_name}
                        </div>
                        <div className="text-sm text-slate-500">
                          Stock disponible: {item.stock_available} {item.unit}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.qty_donated > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-slate-200 text-slate-700">
                        {item.qty_donated}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.qty_manual > 0 ? (
                      <span className="text-slate-900 font-medium">
                        {item.qty_manual}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-semibold text-slate-900">
                      {item.qty_total}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-600">
                      {item.assignments?.[0]?.note || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.qty_manual > 0 &&
                    item.assignments?.[0]?.id &&
                    !eventHasStarted ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 text-gray-600 hover:text-primary-purple hover:bg-purple-50 rounded transition-colors"
                          title="Editar cantidad y observación"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveManual(
                              item.assignments[0].id,
                              item.material_name,
                              item.qty_manual,
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

export default DeliverableMaterialsTab;
