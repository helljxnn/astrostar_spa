import { useState, useEffect, useCallback } from "react";
import { X, Package, Recycle } from "lucide-react";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../../shared/utils/alerts.js";
import Modal from "../../../../../../../../../shared/components/Modal/Modal.jsx";
import DeliverableMaterialsTab from "./DeliverableMaterialsTab";
import UsableMaterialsTab from "./UsableMaterialsTab";
import EventMaterialsService from "../../../../SportsMaterials/Materials/services/EventMaterialsService";

const EventMaterialsModal = ({ isOpen, onClose, event }) => {
  const [activeTab, setActiveTab] = useState("deliverables");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Estado para materiales pendientes de guardar
  const [pendingDeliverables, setPendingDeliverables] = useState([]);
  const [pendingUsables, setPendingUsables] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const isReadOnly = ["en_curso", "finalizado", "in_progress", "finished", "completed"].includes(
    (event?.estado || event?.status || "").toLowerCase(),
  );

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Best-effort sync: pull donation materials linked to this event before rendering summary.
      // This ensures recently created in-kind donations appear in event materials.
      try {
        await EventMaterialsService.loadDonations(event.id);
      } catch (syncError) {
        console.warn("Donation materials sync skipped:", syncError);
      }

      const response = await EventMaterialsService.getSummary(event.id);

      if (response.success) {
        setSummary(response.data);
      } else {
        setError(response.message || "Error al cargar materiales");
      }
    } catch (err) {
      console.error("Error loading summary:", err);
      setError(err.message || "Error al cargar materiales");
    } finally {
      setLoading(false);
    }
  }, [event?.id]);

  useEffect(() => {
    if (isOpen && event?.id) {
      loadSummary();
      // Limpiar pendientes al abrir
      setPendingDeliverables([]);
      setPendingUsables([]);
      setHasChanges(false);
    }
  }, [isOpen, event?.id, loadSummary]);

  const handleClose = () => {
    if (hasChanges) {
      showConfirmAlert(
        "¿Descartar cambios?",
        "Tienes materiales sin guardar. ¿Deseas descartarlos?",
        {
          confirmButtonText: "Sí, descartar",
          cancelButtonText: "Cancelar",
        },
      ).then((result) => {
        if (result.isConfirmed) {
          setActiveTab("deliverables");
          setSummary(null);
          setError(null);
          setPendingDeliverables([]);
          setPendingUsables([]);
          setHasChanges(false);
          onClose();
        }
      });
    } else {
      setActiveTab("deliverables");
      setSummary(null);
      setError(null);
      setPendingDeliverables([]);
      setPendingUsables([]);
      setHasChanges(false);
      onClose();
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;

      // Guardar materiales a entregar
      for (const material of pendingDeliverables) {
        try {
          await EventMaterialsService.assignConsumable(event.id, material);
          successCount++;
        } catch (error) {
          console.error("Error saving deliverable:", error);
          errorCount++;
        }
      }

      // Guardar materiales a usar
      for (const material of pendingUsables) {
        try {
          await EventMaterialsService.assignReusable(event.id, material);
          successCount++;
        } catch (error) {
          console.error("Error saving usable:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        await showSuccessAlert(
          "Materiales guardados",
          `Se guardaron ${successCount} material(es) correctamente${errorCount > 0 ? `. ${errorCount} fallaron.` : ""}`,
        );

        setPendingDeliverables([]);
        setPendingUsables([]);
        setHasChanges(false);
        loadSummary();
      } else if (errorCount > 0) {
        await showErrorAlert("Error", "No se pudieron guardar los materiales");
      }
    } catch (error) {
      console.error("Error saving materials:", error);
      await showErrorAlert(
        "Error",
        "Ocurrió un error al guardar los materiales",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSummary();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-5xl"
      closeOnBackdropClick={false}
    >
      <div className="bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Materiales del Evento
          </h2>
          <p className="text-sm text-gray-600 text-center mt-1">
            {event?.name || "Evento"}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab("deliverables")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === "deliverables"
                  ? "border-b-2 border-primary-purple text-primary-purple"
                  : "text-gray-500 hover:text-primary-purple"
              }`}
            >
              <Package className="w-5 h-5" />
              Materiales a Entregar
              {summary?.deliverables?.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-primary-purple">
                  {summary.deliverables.length}
                </span>
              )}
              {pendingDeliverables.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                  +{pendingDeliverables.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("usables")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === "usables"
                  ? "border-b-2 border-primary-purple text-primary-purple"
                  : "text-gray-500 hover:text-primary-purple"
              }`}
            >
              <Recycle className="w-5 h-5" />
              Materiales a Usar
              {summary?.usables?.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-primary-purple">
                  {summary.usables.length}
                </span>
              )}
              {pendingUsables.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                  +{pendingUsables.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && summary && (
            <>
              {activeTab === "deliverables" && (
                <DeliverableMaterialsTab
                  event={event}
                  deliverables={summary.deliverables || []}
                  pendingMaterials={pendingDeliverables}
                  onAddMaterial={(material) => {
                    setPendingDeliverables([...pendingDeliverables, material]);
                    setHasChanges(true);
                  }}
                  onRemovePending={(index) => {
                    setPendingDeliverables(
                      pendingDeliverables.filter((_, i) => i !== index),
                    );
                    setHasChanges(
                      pendingDeliverables.length > 1 ||
                        pendingUsables.length > 0,
                    );
                  }}
                  onRefresh={handleRefresh}
                />
              )}
              {activeTab === "usables" && (
                <UsableMaterialsTab
                  event={event}
                  usables={summary.usables || []}
                  pendingMaterials={pendingUsables}
                  onAddMaterial={(material) => {
                    setPendingUsables([...pendingUsables, material]);
                    setHasChanges(true);
                  }}
                  onRemovePending={(index) => {
                    setPendingUsables(
                      pendingUsables.filter((_, i) => i !== index),
                    );
                    setHasChanges(
                      pendingUsables.length > 1 ||
                        pendingDeliverables.length > 0,
                    );
                  }}
                  onRefresh={handleRefresh}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between items-center">
            <button
              onClick={handleClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              disabled={loading}
            >
              Cerrar
            </button>
            {!isReadOnly && (
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <p className="text-sm text-gray-600">
                    {pendingDeliverables.length + pendingUsables.length}{" "}
                    material(es) pendiente(s)
                  </p>
                )}
                <button
                  onClick={handleSaveAll}
                  disabled={!hasChanges || loading}
                  className="px-6 py-2 bg-primary-purple text-white rounded-lg hover:bg-primary-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventMaterialsModal;

