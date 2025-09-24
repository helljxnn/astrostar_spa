// src/.../InscriptionModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

const InscriptionModal = ({ isOpen, onClose, athlete, guardians = [], onSave }) => {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    fechaInscripcion: today,
    concepto: "",
    fechaConcepto: today,
    estado: "Vigente",
  });

  useEffect(() => {
    // cada vez que abrimos el modal con un deportista nuevo, reseteamos la fecha por defecto
    setFormData((prev) => ({
      ...prev,
      fechaInscripcion: new Date().toISOString().split("T")[0],
      fechaConcepto: new Date().toISOString().split("T")[0],
    }));
  }, [isOpen, athlete?.id]);

  // Función para calcular categoría (misma lógica que usará el historial)
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

  // Guardián relacionado al deportista
  const guardian = guardians?.find((g) => String(g.id) === String(athlete?.acudiente));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (!formData.concepto || !formData.fechaConcepto || !formData.estado) {
      return showErrorAlert("Campos requeridos", "Completa todos los campos");
    }

    const categoriaComputed = athlete?.categoria
      ? athlete.categoria
      : calculateCategory(athlete?.fechaNacimiento, formData.fechaInscripcion);

    // Devuelve la inscripción sin id — el padre la insertará y le pondrá id
    const newInscription = {
      deportistaId: athlete?.id,
      deportista: athlete ? `${athlete.nombres} ${athlete.apellidos}` : "Sin nombre",
      numeroDocumento: athlete?.numeroDocumento || "",
      correo: athlete?.correo || "",
      telefono: athlete?.telefono || "",
      acudiente: guardian?.nombreCompleto || "Sin acudiente",
      categoria: categoriaComputed,
      ...formData,
    };

    onSave(newInscription, athlete?.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
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
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
            Renovar Inscripción
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Deportista"
              type="text"
              value={athlete ? `${athlete.nombres} ${athlete.apellidos}` : ""}
              disabled
            />
            <FormField
              label="Acudiente"
              type="text"
              value={guardian?.nombreCompleto || "Sin acudiente"}
              disabled
            />

            <FormField
              label="Fecha inscripción"
              type="date"
              name="fechaInscripcion"
              value={formData.fechaInscripcion}
              onChange={handleChange}
              disabled // <--- fecha por defecto y no editable
            />

            <FormField
              label="Concepto"
              name="concepto"
              type="text"
              value={formData.concepto}
              onChange={handleChange}
              placeholder="Ej. Renovación anual"
            />

            <FormField
              label="Fecha concepto"
              name="fechaConcepto"
              type="date"
              value={formData.fechaConcepto}
              onChange={handleChange}
            />

            <FormField
              label="Estado"
              name="estado"
              type="select"
              value={formData.estado}
              onChange={handleChange}
              options={[
                { value: "Vigente", label: "Vigente" },
                { value: "Vencida", label: "Vencida" },
                { value: "Cancelada", label: "Cancelada" },
              ]}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-6 border-t border-gray-200 px-6 pb-6">
          <motion.button
            type="button"
            onClick={onClose}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            onClick={handleSave}
            className="px-8 py-3 text-white rounded-xl font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Renovar inscripción
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InscriptionModal;
