import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Recycle,
  X,
  AlertCircle,
  Lock,
  Edit,
} from "lucide-react";
import {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showDeleteAlert,
} from "../../../../../../../../../shared/utils/alerts";
import EventMaterialsService from "../../../../SportsMaterials/Materials/services/EventMaterialsService";
import MaterialsService from "../../../../SportsMaterials/Materials/services/materialsService";

const UsableMaterialsTab = ({
  event,
  usables,
  pendingMaterials,
  onAddMaterial,
  onRemovePending,
  onRefresh,
}) => {
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
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
        // Filtrar SOLO materiales ACTIVOS con stock en FUNDACION
        const materialsFiltered = response.data.filter(
          (m) => m.estado === "Activo" && (m.stockFundacion || 0) > 0,
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
    const available = selectedMaterialData.stockFundacion || 0;

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

    // Add to pending list
    const materialData = {
      materialId: parseInt(selectedMaterial),
      cantidad: parseInt(quantity),
      observaciones: note,
    };

    onAddMaterial(materialData);

    // Reset form
    setSelectedMaterial("");
    setQuantity("");
    setNote("");
    setShowAddForm(false);
  };

  const handleRemove = async (assignmentId, materialName, qty) => {
    const result = await showDeleteAlert(
      "¿Eliminar material?",
      `Se eliminará la planificación de ${qty} unidades de ${materialName}`,
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

  const handleSaveEdit = async () => {
    const newQty = parseInt(editQuantity);

    // Validaciones
    if (!newQty || newQty <= 0) {
      showWarningAlert("Cantidad inválida", "La cantidad debe ser mayor a 0");
      return;
    }

    if (newQty > editingItem.stock_available + editingItem.qty_planned) {
      showWarningAlert(
        "Stock insuficiente",
        `Solo hay ${editingItem.stock_available + editingItem.qty_planned} unidades disponibles`,
      );
      return;
    }

    try {
      // Eliminar asignación actual
      await EventMaterialsService.removeReusable(editingItem.id);

      // Crear nueva asignación con valores actualizados
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
          <div className="text-sm text-gray-600">Total Ítems</div>
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

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los materiales a usar son patrimonio de la
          fundación. Se planifica su uso pero NO se descuenta stock. Deben
          regresar después del evento.
        </p>
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

      {/* Add Material Button */}
      {!showAddForm && !eventHasStarted && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-purple hover:bg-primary-blue text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Material
        </button>
      )}

      {/* Add Material Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Planificar Material</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => {
                  setSelectedMaterial(e.target.value);
                  setQuantity(""); // Reset quantity when material changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue"
                disabled={loadingMaterials}
              >
                <option value="">Seleccionar...</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.nombre} (Stock: {material.stockFundacion})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
                {selectedMaterialData && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Máx: {selectedMaterialData.stockFundacion})
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                max={selectedMaterialData?.stockFundacion || 999999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue ${
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
                setShowAddForm(false);
                setSelectedMaterial("");
                setQuantity("");
                setNote("");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancelar
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
                  (Máx: {editingItem.stock_available + editingItem.qty_planned})
                </span>
              </label>
              <input
                type="number"
                min="1"
                max={editingItem.stock_available + editingItem.qty_planned}
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-primary-purple"
                placeholder="0"
              />
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
              disabled={!editQuantity || parseInt(editQuantity) <= 0}
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
                  Observación
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
                          title="Editar cantidad y observación"
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
