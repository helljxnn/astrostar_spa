import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts";

const documentTypes = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PA", label: "Pasaporte" },
];

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

export const AthleteModal = ({ isOpen, onClose, onSave, athleteToEdit, mode }) => {
  const isEditing = mode === "edit";

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipoDocumento: "",
    identificacion: "",
    correo: "",
    telefono: "",
    fechaNacimiento: "",
    deportePrincipal: "",
    categoria: "",
    estado: "Activo",
    // extras solo para editar
    estadoInscripcion: "",
    concepto: "",
    fechaConcepto: "",
  });

  useEffect(() => {
    if (isEditing && athleteToEdit) {
      setFormData({
        nombres: athleteToEdit.nombres || "",
        apellidos: athleteToEdit.apellidos || "",
        tipoDocumento: athleteToEdit.tipoDocumento || "",
        identificacion: athleteToEdit.identificacion || "",
        correo: athleteToEdit.correo || "",
        telefono: athleteToEdit.telefono || "",
        fechaNacimiento: athleteToEdit.fechaNacimiento || "",
        deportePrincipal: athleteToEdit.deportePrincipal || "",
        categoria: athleteToEdit.categoria || "",
        estado: athleteToEdit.estado || "Activo",
        estadoInscripcion: athleteToEdit.estadoInscripcion || "",
        concepto: athleteToEdit.concepto || "",
        fechaConcepto: athleteToEdit.fechaConcepto || "",
      });
    } else {
      setFormData({
        nombres: "",
        apellidos: "",
        tipoDocumento: "",
        identificacion: "",
        correo: "",
        telefono: "",
        fechaNacimiento: "",
        deportePrincipal: "",
        categoria: "",
        estado: "Activo",
        estadoInscripcion: "",
        concepto: "",
        fechaConcepto: "",
      });
    }
  }, [isEditing, athleteToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombres || !formData.apellidos) {
      showErrorAlert("Por favor completa los campos requeridos (nombres y apellidos).");
      return;
    }

    if (isEditing) {
      const confirm = await showConfirmAlert("¿Seguro que deseas actualizar este deportista?");
      if (!confirm.isConfirmed) return;
    }

    try {
      await onSave(formData, mode);
      showSuccessAlert(
        isEditing ? "Deportista actualizado correctamente" : "Deportista registrado correctamente"
      );
      onClose();
    } catch (error) {
      console.error("Error al guardar deportista:", error);
      showErrorAlert("Ocurrió un error al guardar el deportista.");
    }
  };

  const handleClose = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      tipoDocumento: "",
      identificacion: "",
      correo: "",
      telefono: "",
      fechaNacimiento: "",
      deportePrincipal: "",
      categoria: "",
      estado: "Activo",
      estadoInscripcion: "",
      concepto: "",
      fechaConcepto: "",
    });
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Deportista" : "Crear Deportista"}
          </h2>
          {isEditing && athleteToEdit && (
            <p className="text-center text-gray-600 mt-2">
              Modificando información de:{" "}
              <span className="font-semibold text-primary-purple">
                {athleteToEdit.nombres} {athleteToEdit.apellidos}
              </span>
            </p>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campos comunes */}
            <FormField label="Nombres" name="nombres" type="text" placeholder="Nombres del deportista"
              value={formData.nombres} onChange={handleChange} delay={0.1} required />
            <FormField label="Apellidos" name="apellidos" type="text" placeholder="Apellidos del deportista"
              value={formData.apellidos} onChange={handleChange} delay={0.15} required />
            <FormField label="Tipo de Documento" name="tipoDocumento" type="select" placeholder="Selecciona el tipo de documento"
              options={documentTypes} value={formData.tipoDocumento} onChange={handleChange} delay={0.2} required />
            <FormField label="Identificación" name="identificacion" type="text" placeholder="Número de identificación"
              value={formData.identificacion} onChange={handleChange} delay={0.25} required />
            <FormField label="Correo Electrónico" name="correo" type="email" placeholder="correo@ejemplo.com"
              value={formData.correo} onChange={handleChange} delay={0.3} required />
            <FormField label="Teléfono" name="telefono" type="text" placeholder="3001234567"
              value={formData.telefono} onChange={handleChange} delay={0.35} required />
            <FormField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" placeholder="Selecciona la fecha"
              value={formData.fechaNacimiento} onChange={handleChange} delay={0.4} required />
            <FormField label="Deporte Principal" name="deportePrincipal" type="text" placeholder="Ej. Fútbol, Natación"
              value={formData.deportePrincipal} onChange={handleChange} delay={0.45} required />
            <FormField label="Categoría" name="categoria" type="text" placeholder="Ej. Juvenil, Profesional"
              value={formData.categoria} onChange={handleChange} delay={0.5} required />
            <FormField label="Estado" name="estado" type="select" placeholder="Selecciona el estado"
              options={states} value={formData.estado} onChange={handleChange} delay={0.55} required />

            {/* Solo en edición */}
            {isEditing && (
              <>
                <FormField label="Estado Inscripción" name="estadoInscripcion" type="text"
                  placeholder="Ej. Vigente, No vigente" value={formData.estadoInscripcion}
                  onChange={handleChange} delay={0.6} />
                <FormField label="Concepto" name="concepto" type="text"
                  placeholder="Detalle del concepto" value={formData.concepto}
                  onChange={handleChange} delay={0.65} />
                <FormField label="Fecha Concepto" name="fechaConcepto" type="date"
                  placeholder="Selecciona la fecha" value={formData.fechaConcepto}
                  onChange={handleChange} delay={0.7} />
              </>
            )}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex justify-between pt-6 border-t border-gray-200"
          >
            <motion.button type="button" onClick={handleClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Cancelar
            </motion.button>
            <motion.button type="submit"
              className="px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue hover:from-primary-purple hover:to-primary-blue"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}>
              {isEditing ? "Actualizar Deportista" : "Crear Deportista"}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AthleteModal;
