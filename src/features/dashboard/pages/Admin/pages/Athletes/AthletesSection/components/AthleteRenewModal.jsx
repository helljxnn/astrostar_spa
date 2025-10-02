import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";

const inscriptionStates = [
  { value: "Vigente", label: "Vigente" },
  { value: "Vencida", label: "Vencida" },
  { value: "Cancelada", label: "Cancelada" },
];

const categoryOptions = [
  { value: "Infantil", label: "Infantil" },
  { value: "Sub 15", label: "Sub 15" },
  { value: "Juvenil", label: "Juvenil" },
  { value: "Sin categoría", label: "Sin categoría" },
];

const getCategoryByAge = (age) => {
  if (age >= 5 && age <= 12) return "Infantil";
  if (age >= 13 && age <= 15) return "Sub 15";
  if (age >= 16 && age <= 18) return "Juvenil";
  return "Sin categoría";
};

const AthleteRenewModal = ({ isOpen, onClose, athlete, onRenew }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("Vigente");
  const [concept, setConcept] = useState("");

  // Calcular edad de forma segura
  const calculateAge = () => {
    if (!athlete?.fechaNacimiento) return 0;
    try {
      const birthDate = new Date(athlete.fechaNacimiento);
      const today = new Date();
      if (isNaN(birthDate.getTime())) return 0;

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return 0;
    }
  };

  const age = calculateAge();
  const suggestedCategory = getCategoryByAge(age);
  const today = new Date();
  const currentYear = today.getFullYear();

  // Inicializar valores cuando se abre el modal
  useEffect(() => {
    if (isOpen && athlete) {
      // Usar la categoría actual del atleta como valor por defecto
      setSelectedCategory(athlete.categoria || suggestedCategory);
      setSelectedState("Vigente");
      setConcept(`Renovación ${currentYear}`);
    }
  }, [isOpen, athlete?.id, suggestedCategory, currentYear]);

  // Resetear estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory("");
      setSelectedState("Vigente");
      setConcept("");
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isProcessing) return;

    // Validaciones
    if (!selectedCategory) {
      showErrorAlert(
        "Categoría requerida",
        "Debes seleccionar una categoría para la renovación."
      );
      return;
    }

    if (!concept.trim()) {
      showErrorAlert(
        "Concepto requerido",
        "Debes ingresar un concepto para la inscripción."
      );
      return;
    }

    try {
      setIsProcessing(true);

      const newInscription = {
        id: Date.now(),
        estadoInscripcion: selectedState,
        concepto: concept.trim(),
        fechaInscripcion: today.toISOString().split("T")[0],
        categoria: selectedCategory,
      };

      const renewedAthlete = {
        ...athlete,
        categoria: selectedCategory, // Actualizar la categoría del atleta
        estadoInscripcion: selectedState,
        inscripciones: [newInscription, ...(athlete.inscripciones || [])],
        lastInscription: newInscription,
      };

      await onRenew(renewedAthlete);

      showSuccessAlert(
        "Inscripción renovada",
        `La inscripción de ${athlete.nombres} ${athlete.apellidos} se renovó exitosamente para ${currentYear} en la categoría ${selectedCategory}.`
      );

      onClose();
    } catch (error) {
      console.error("Error renewing inscription:", error);
      showErrorAlert(
        "Error al renovar",
        error.message || "Ocurrió un error al renovar la inscripción."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !athlete) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            disabled={isProcessing}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
            Renovar Inscripción
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Renovación para el año {currentYear}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Información del deportista */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Información del Deportista
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre completo</p>
                <p className="font-medium text-gray-900">
                  {athlete.nombres || "N/A"} {athlete.apellidos || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documento</p>
                <p className="font-medium text-gray-900">
                  {athlete.numeroDocumento || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Edad actual</p>
                <p className="font-medium text-gray-900">{age} años</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Categoría actual</p>
                <p className="font-medium text-gray-900">
                  {athlete.categoria || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de renovación */}
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                Configurar Renovación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormField
                    label="Nueva Categoría"
                    name="categoria"
                    type="select"
                    options={categoryOptions}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    required
                  />
                  <div className="mt-2 text-sm text-blue-600">
                    <p><strong>Sugerencia por edad ({age} años):</strong> {suggestedCategory}</p>
                    <p className="text-xs mt-1">
                      Puedes seleccionar una categoría diferente según el rendimiento y criterio técnico.
                    </p>
                  </div>
                </div>

                <FormField
                  label="Estado de Inscripción"
                  name="estado"
                  type="select"
                  options={inscriptionStates}
                  value={selectedState}
                  onChange={setSelectedState}
                  required
                />
              </div>

              <div className="mt-4">
                <FormField
                  label="Concepto de la inscripción"
                  name="concepto"
                  type="text"
                  value={concept}
                  onChange={setConcept}
                  placeholder={`Ej: Renovación ${currentYear}, Promoción por rendimiento, etc.`}
                  required
                />
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Fecha de Inscripción"
                name="fechaInscripcion"
                type="date"
                value={today.toISOString().split("T")[0]}
                disabled
              />
              <div className="flex items-center">
                <div className="text-sm text-gray-600">
                  <p><strong>Año de inscripción:</strong> {currentYear}</p>
                  <p><strong>Categoría anterior:</strong> {athlete.categoria || "Sin categoría"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end gap-4">
            <motion.button
              onClick={onClose}
              disabled={isProcessing}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={isProcessing || !selectedCategory || !concept.trim()}
              className="px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Renovando...
                </>
              ) : (
                "Renovar Inscripción"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AthleteRenewModal;