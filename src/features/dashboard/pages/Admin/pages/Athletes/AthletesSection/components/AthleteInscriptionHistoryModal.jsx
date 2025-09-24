// src/.../AthleteInscriptionHistoryModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaEdit, FaTrash, FaCalendarAlt, FaUser } from "react-icons/fa";
import { showConfirmAlert, showDeleteAlert } from "../../../../../../../../shared/utils/alerts";

const AthleteInscriptionHistoryModal = ({
  isOpen,
  onClose,
  athlete,
  guardians = [],
  onUpdateInscription,
}) => {
  const [editingInscription, setEditingInscription] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  if (!isOpen || !athlete) return null;

  const inscriptions = athlete.inscripciones || [];
  const totalInscriptions = inscriptions.length;

  const guardianGlobal = guardians.find((g) => String(g.id) === String(athlete.acudiente));

  // 🔹 Calcula categoría en base a la edad al momento de la inscripción
 const calculateCategory = (birthDate, inscriptionDate) => {
  if (!birthDate || !inscriptionDate) return "No definida";
  const birth = new Date(birthDate);
  const inscription = new Date(inscriptionDate);
  let age = inscription.getFullYear() - birth.getFullYear();
  const monthDiff = inscription.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && inscription.getDate() < birth.getDate())) age--;
  
  // Nueva lógica de categorías
  if (age >= 5 && age <= 12) return "Infantil";
  if (age >= 13 && age <= 15) return "Sub 15";
  if (age >= 16 && age <= 18) return "Juvenil";
  return "Sin categoría";
};

  // 🔹 Categoría actual del deportista
const getCurrentCategory = () => {
  if (!athlete?.fechaNacimiento) return athlete?.categoria || "No definida";
  const birth = new Date(athlete.fechaNacimiento);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  
  if (athlete?.categoria) return athlete.categoria; // respeta si viene definida
  
  // Nueva lógica de categorías
  if (age >= 5 && age <= 12) return "Infantil";
  if (age >= 13 && age <= 15) return "Sub 15";
  if (age >= 16 && age <= 18) return "Juvenil";
  return "Sin categoría";
};

  // 🔹 Editar inscripción
  const handleEditInscription = (inscription) => {
    setEditingInscription(inscription.id);
    setEditFormData({
      estadoInscripcion: inscription.estadoInscripcion || "",
      concepto: inscription.concepto || "",
      fechaConcepto: inscription.fechaConcepto || "",
      fechaInscripcion: inscription.fechaInscripcion || "",
    });
  };

  // 🔹 Guardar edición
  const handleSaveEdit = async () => {
    if (!editFormData.estadoInscripcion || !editFormData.concepto) return;

    const confirmResult = await showConfirmAlert(
      "¿Actualizar inscripción?",
      "¿Estás seguro de que deseas actualizar esta inscripción?"
    );
    if (!confirmResult.isConfirmed) return;

    const updatedInscriptions = inscriptions.map((ins) =>
      ins.id === editingInscription
        ? {
            ...ins,
            ...editFormData,
            acudiente: ins.acudiente || guardianGlobal?.nombreCompleto || "Sin acudiente",
            categoria:
              ins.categoria ||
              (editFormData.fechaInscripcion
                ? calculateCategory(athlete.fechaNacimiento, editFormData.fechaInscripcion)
                : calculateCategory(athlete.fechaNacimiento, ins.fechaInscripcion)),
          }
        : ins
    );

    onUpdateInscription(athlete.id, updatedInscriptions);
    setEditingInscription(null);
    setEditFormData({});
  };

  // 🔹 Eliminar inscripción
  const handleDeleteInscription = async (inscriptionId) => {
    const confirmResult = await showDeleteAlert(
      "¿Eliminar inscripción?",
      "Esta acción no se puede deshacer. ¿Estás seguro?"
    );
    if (!confirmResult.isConfirmed) return;
    const updatedInscriptions = inscriptions.filter((ins) => ins.id !== inscriptionId);
    onUpdateInscription(athlete.id, updatedInscriptions);
  };

  const handleCancelEdit = () => {
    setEditingInscription(null);
    setEditFormData({});
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "vigente":
        return "bg-green-100 text-green-800";
      case "vencida":
        return "bg-red-100 text-red-800";
      case "cancelada":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <FaTimes size={18} />
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-gradient-to-r from-primary-purple to-primary-blue p-3 text-white">
                <FaUser />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Historial de Inscripciones
                </h2>
                <div className="text-sm text-gray-600">
                  {athlete.nombres} {athlete.apellidos} · Documento:{" "}
                  {athlete.numeroDocumento || "N/D"}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Categoría actual</div>
              <div className="font-semibold text-primary-purple">{getCurrentCategory()}</div>
              <div className="mt-2 inline-flex items-center bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-md px-3 py-1 text-sm">
                <FaCalendarAlt className="mr-2 opacity-90" />
                {totalInscriptions} Inscripción{totalInscriptions !== 1 ? "es" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {totalInscriptions > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {inscriptions.map((inscription, index) => {
                  const inscriptionGuardian =
                    guardians.find((g) => String(g.id) === String(inscription.acudiente)) || {};
                  return (
                    <motion.div
                      key={inscription.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {editingInscription === inscription.id ? (
                        /* EDIT MODE */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Fecha de Inscripción
                              </label>
                              <input
                                type="date"
                                value={editFormData.fechaInscripcion}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    fechaInscripcion: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Estado
                              </label>
                              <select
                                value={editFormData.estadoInscripcion}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    estadoInscripcion: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              >
                                <option value="">Seleccionar</option>
                                <option value="Vigente">Vigente</option>
                                <option value="Vencida">Vencida</option>
                                <option value="Cancelada">Cancelada</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Concepto
                              </label>
                              <input
                                type="text"
                                value={editFormData.concepto}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    concepto: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Fecha Concepto
                              </label>
                              <input
                                type="date"
                                value={editFormData.fechaConcepto}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    fechaConcepto: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-gray-600">Acudiente</div>
                                <div className="font-medium">
                                  {inscription.acudiente ||
                                    inscriptionGuardian.nombreCompleto ||
                                    "Sin acudiente"}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Categoría</div>
                                <div className="font-medium">
                                  {editFormData.fechaInscripcion
                                    ? calculateCategory(
                                        athlete.fechaNacimiento,
                                        editFormData.fechaInscripcion
                                      )
                                    : inscription.categoria ||
                                      calculateCategory(
                                        athlete.fechaNacimiento,
                                        inscription.fechaInscripcion
                                      )}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Deportista</div>
                                <div className="font-medium">
                                  {athlete.nombres} {athlete.apellidos}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* VIEW MODE */
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <div className="text-sm text-gray-500">Año</div>
                              <div className="text-lg font-semibold text-gray-900">
                                {inscription.fechaInscripcion
                                  ? new Date(inscription.fechaInscripcion).getFullYear()
                                  : "N/D"}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500">Fecha de Inscripción</div>
                              <div className="text-gray-900">
                                {inscription.fechaInscripcion
                                  ? new Date(
                                      inscription.fechaInscripcion
                                    ).toLocaleDateString("es-CO")
                                  : "No especificada"}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500">Estado</div>
                              <div>
                                <span
                                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                                    inscription.estadoInscripcion
                                  )}`}
                                >
                                  {inscription.estadoInscripcion || "Sin estado"}
                                </span>
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-gray-500">Categoría en ese momento</div>
                              <div className="text-gray-900 font-medium">
                                {inscription.categoria ||
                                  calculateCategory(
                                    athlete.fechaNacimiento,
                                    inscription.fechaInscripcion
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-gray-500">Concepto</div>
                              <div className="text-gray-900">
                                {inscription.concepto || "Sin concepto"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Fecha Concepto</div>
                              <div className="text-gray-900">
                                {inscription.fechaConcepto
                                  ? new Date(
                                      inscription.fechaConcepto
                                    ).toLocaleDateString("es-CO")
                                  : "No especificada"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Acudiente</div>
                              <div className="text-gray-900">
                                {inscription.acudiente ||
                                  inscriptionGuardian.nombreCompleto ||
                                  "Sin acudiente registrado"}
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-gray-500">Deportista</div>
                                <div className="text-gray-900 font-medium">
                                  {athlete.nombres} {athlete.apellidos}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Documento</div>
                                <div className="text-gray-900">
                                  {athlete.numeroDocumento || "No especificado"}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Estado del deportista</div>
                                <div className="text-gray-900">
                                  {athlete.estadoInscripcion || "No especificado"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleEditInscription(inscription)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar inscripción"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInscription(inscription.id)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar inscripción"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin inscripciones registradas
              </h3>
              <p className="text-gray-500">
                Este deportista aún no tiene inscripciones en el historial.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-center">
            <motion.button
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cerrar Historial
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AthleteInscriptionHistoryModal;
