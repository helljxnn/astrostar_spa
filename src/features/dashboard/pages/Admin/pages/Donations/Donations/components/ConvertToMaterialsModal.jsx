import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FaBoxOpen, FaCheckCircle, FaPlus, FaTrash } from "react-icons/fa";
import { createPortal } from "react-dom";
import donationsService from "../services/donationsService";
import materialsService from "../../../SportsMaterials/Materials/services/MaterialsService";
import eventsService from "../../../Events/services/eventsService";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../../../../../../shared/utils/alerts.js";

const initialItem = {
  materialId: "",
  cantidad: "",
  observaciones: "",
};

const ConvertToMaterialsModal = ({ isOpen, onClose, donation, onSuccess }) => {
  const [materials, setMaterials] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(initialItem);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingMaterials(true);
      setLoadingEvents(true);
      try {
        const [materialsResponse, eventsResponse] = await Promise.all([
          materialsService.getAll({ limit: 1000, estado: "Activo" }),
          eventsService.getActiveEvents(),
        ]);

        const materialData =
          materialsResponse?.data?.data || materialsResponse?.data || [];
        const eventData = eventsResponse?.data || eventsResponse?.events || [];

        setMaterials(Array.isArray(materialData) ? materialData : []);
        setEvents(Array.isArray(eventData) ? eventData : []);
      } catch {
        showErrorAlert("Error", "No se pudieron cargar materiales o eventos.");
      } finally {
        setLoadingMaterials(false);
        setLoadingEvents(false);
      }
    };

    fetchData();
  }, [isOpen]);

  const resetState = () => {
    setSelectedEvent("");
    setItems([]);
    setCurrentItem(initialItem);
    setErrors({});
    setSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose?.();
  };

  const handleAddItem = () => {
    const nextErrors = {};
    if (!currentItem.materialId) nextErrors.materialId = "Selecciona un material";
    if (!currentItem.cantidad || Number(currentItem.cantidad) <= 0) {
      nextErrors.cantidad = "La cantidad debe ser mayor a 0";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        materialId: currentItem.materialId,
        cantidad: Number(currentItem.cantidad),
        observaciones: currentItem.observaciones?.trim() || "",
      },
    ]);
    setCurrentItem(initialItem);
    setErrors((prev) => ({ ...prev, materialId: null, cantidad: null }));
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!selectedEvent) nextErrors.selectedEvent = "Selecciona un evento";
    if (items.length === 0) nextErrors.items = "Agrega al menos un material";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      // Mantener compatibilidad con backends que todavia no tienen endpoint dedicado
      await donationsService.update(donation?.id, {
        status: "Ejecutada",
      });

      const payload = {
        donationId: donation?.id,
        eventId: selectedEvent,
        items,
      };
      onSuccess?.(payload);
      showSuccessAlert("Exito", "Donacion convertida a materiales correctamente.");
      handleClose();
    } catch (error) {
      showErrorAlert(
        "Error",
        error?.response?.data?.message || "No se pudo convertir la donacion."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl rounded-xl bg-white shadow-2xl"
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <FaBoxOpen className="text-primary-purple" />
              <h2 className="text-lg font-semibold">Convertir Donacion a Materiales</h2>
            </div>
            <button type="button" onClick={handleClose} className="rounded p-2 hover:bg-gray-100">
              <IoClose />
            </button>
          </div>

          <div className="grid gap-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-sm font-medium">Evento destino</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full rounded-lg border px-3 py-2"
                disabled={loadingEvents}
              >
                <option value="">Selecciona un evento</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name || event.nombre || `Evento #${event.id}`}
                  </option>
                ))}
              </select>
              {errors.selectedEvent && (
                <p className="mt-1 text-xs text-red-600">{errors.selectedEvent}</p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold">Agregar material</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <select
                  value={currentItem.materialId}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({ ...prev, materialId: e.target.value }))
                  }
                  className="rounded-lg border px-3 py-2"
                  disabled={loadingMaterials}
                >
                  <option value="">Material</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.nombre || material.name || `Material #${material.id}`}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={currentItem.cantidad}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({ ...prev, cantidad: e.target.value }))
                  }
                  placeholder="Cantidad"
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  value={currentItem.observaciones}
                  onChange={(e) =>
                    setCurrentItem((prev) => ({ ...prev, observaciones: e.target.value }))
                  }
                  placeholder="Observaciones (opcional)"
                  className="rounded-lg border px-3 py-2"
                />
              </div>
              {(errors.materialId || errors.cantidad) && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.materialId || errors.cantidad}
                </p>
              )}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-purple px-3 py-2 text-sm text-white hover:bg-primary-blue"
                >
                  <FaPlus /> Agregar
                </button>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-semibold">Materiales agregados</h3>
              {items.length === 0 ? (
                <p className="text-sm text-gray-500">No hay materiales agregados.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item, index) => {
                    const material = materials.find(
                      (m) => String(m.id) === String(item.materialId)
                    );
                    return (
                      <li
                        key={`${item.materialId}-${index}`}
                        className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                      >
                        <span>
                          {(material?.nombre || material?.name || "Material")} - Cantidad:{" "}
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {errors.items && <p className="mt-2 text-xs text-red-600">{errors.items}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-60"
              disabled={submitting}
            >
              <FaCheckCircle /> {submitting ? "Guardando..." : "Confirmar conversion"}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ConvertToMaterialsModal;
