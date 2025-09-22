// TemporaryTeamModal.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts";
import {
  useFormTemporaryTeamsValidation,
  temporaryTeamsValidationRules,
} from "../hooks/useFormTemporaryTeamsValidation";

// helpers to load trainers and athletes from localStorage (fall back to samples)
const sampleTrainers = [
  { id: "t1", name: "Carolina Bran" },
  { id: "t2", name: "Héctor Vanegas" },
  { id: "t3", name: "Luis Enrique" },
];

const sampleAthletes = [
  { id: "a1", name: "Juana Pérez" },
  { id: "a2", name: "María Gómez" },
  { id: "a3", name: "Andrea Mazo" },
  { id: "a4", name: "Luisa Fernández" },
];

const getTrainersFromStorage = () => {
  try {
    const raw = localStorage.getItem("trainers") || localStorage.getItem("employees");
    if (!raw) return sampleTrainers;
    const parsed = JSON.parse(raw);
    // map to {id, name}
    if (Array.isArray(parsed)) {
      return parsed.map((p, i) => ({ id: p.id || `t${i}`, name: p.name || p.nombre || `${p.firstName || ""} ${p.lastName || ""}`.trim() }));
    }
    return sampleTrainers;
  } catch (e) {
    return sampleTrainers;
  }
};

const getAthletesFromStorage = () => {
  try {
    const raw = localStorage.getItem("athletes");
    if (!raw) return sampleAthletes;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((a, i) => ({ id: a.id || `a${i}`, name: a.nombre || a.name || `${a.firstName || ""} ${a.lastName || ""}`.trim() }));
    }
    return sampleAthletes;
  } catch (e) {
    return sampleAthletes;
  }
};

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const TemporaryTeamModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  teamToEdit = null,
  mode = teamToEdit ? "edit" : "create",
}) => {
  const isEditing = mode === "edit" || teamToEdit !== null;
  const trainers = getTrainersFromStorage();
  const athletes = getAthletesFromStorage();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    setTouched,
    setValues,
  } = useFormTemporaryTeamsValidation(
    {
      nombreEquipo: "",
      telefono: "",
      entrenador: "",
      jugadoras: [], // array of {id, name}
      estado: "Activo",
      descripcion: "",
    },
    temporaryTeamsValidationRules
  );

  // cargar datos para edición
  useEffect(() => {
    if (isOpen && isEditing && teamToEdit) {
      setValues({
        nombreEquipo: teamToEdit.nombre || "",
        telefono: teamToEdit.telefono || "",
        entrenador: teamToEdit.entrenador || "",
        // if stored jugadoras as objects or ids:
        jugadoras: Array.isArray(teamToEdit.jugadoras)
          ? teamToEdit.jugadoras
          : (teamToEdit.jugadorasIds || []).map((id) => {
              const match = athletes.find((a) => a.id === id);
              return { id, name: match ? match.name : id };
            }),
        estado: teamToEdit.estado || "Activo",
        descripcion: teamToEdit.descripcion || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditing, teamToEdit]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const handleSubmit = async () => {
    // marcar todos como touched
    const allTouched = {};
    Object.keys(temporaryTeamsValidationRules).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (!validateAllFields()) {
      if (isEditing) {
        showErrorAlert(
          "Campos incompletos",
          "Por favor completa todos los campos correctamente antes de continuar."
        );
      }
      return;
    }

    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del equipo ${teamToEdit?.nombre || values.nombreEquipo}?`,
        { confirmButtonText: "Sí, actualizar", cancelButtonText: "Cancelar" }
      );
      if (!confirmResult.isConfirmed) return;
    }

    try {
      const teamData = {
        nombre: values.nombreEquipo,
        telefono: formatPhoneNumber(values.telefono),
        entrenador: values.entrenador,
        jugadoras: values.jugadoras, // array of {id,name}
        jugadorasIds: (values.jugadoras || []).map((j) => j.id || j),
        cantidadJugadoras: (values.jugadoras || []).length,
        estado: values.estado,
        descripcion: values.descripcion,
      };

      if (isEditing) {
        const updatedTeamData = { ...teamData, id: teamToEdit.id };
        await onUpdate(updatedTeamData);
        showSuccessAlert("Equipo actualizado", `Los datos de ${teamData.nombre} han sido actualizados.`);
      } else {
        await onSave(teamData);
        showSuccessAlert("Equipo creado", "El equipo ha sido creado exitosamente.");
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      showErrorAlert("Error", error.message || "Ocurrió un error al guardar el equipo");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // handler for multi select <select multiple> -> convert to array of objects
  const handleJugadorasChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => {
      const athlete = athletes.find((a) => a.id === opt.value);
      return { id: opt.value, name: athlete ? athlete.name : opt.label };
    });
    handleChange("jugadoras", selected);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Equipo" : "Crear Equipo"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando: <span className="font-semibold text-primary-purple">{teamToEdit?.nombre}</span>
            </p>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre"
              name="nombreEquipo"
              type="text"
              placeholder="Nombre de equipo"
              value={values.nombreEquipo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombreEquipo}
              touched={touched.nombreEquipo}
              delay={0.15}
              required
            />

            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="Número Telefónico de contacto"
              value={values.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.telefono}
              touched={touched.telefono}
              delay={0.2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entrenador</label>
              <select
                name="entrenador"
                value={values.entrenador}
                onChange={(e) => handleChange("entrenador", e.target.value)}
                onBlur={handleBlur}
                className={`w-full rounded-md border px-3 py-2 transition ${
                  touched.entrenador && errors.entrenador ? "border-red-400" : "border-gray-300"
                }`}
              >
                <option value="">Seleccione el entrenador</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
              {touched.entrenador && errors.entrenador && (
                <p className="text-sm text-red-500 mt-1">{errors.entrenador}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jugadoras</label>
              <div className="flex gap-2 items-center">
                <select
                  multiple
                  name="jugadoras"
                  value={(values.jugadoras || []).map((j) => j.id || j)}
                  onChange={handleJugadorasChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-md border px-3 py-2 transition h-40 ${touched.jugadoras && errors.jugadoras ? "border-red-400" : "border-gray-300"}`}
                >
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              {touched.jugadoras && errors.jugadoras && (
                <p className="text-sm text-red-500 mt-1">{errors.jugadoras}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Seleccionadas: <span className="font-medium">{(values.jugadoras || []).length}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado equipo</label>
              <select
                name="estado"
                value={values.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                onBlur={handleBlur}
                className={`w-full rounded-md border px-3 py-2 transition ${touched.estado && errors.estado ? "border-red-400" : "border-gray-300"}`}
              >
                {states.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {touched.estado && errors.estado && <p className="text-sm text-red-500 mt-1">{errors.estado}</p>}
            </div>

            <div>
              <FormField
                label="Descripción"
                name="descripcion"
                type="textarea"
                placeholder="Descripción (opcional)"
                value={values.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.descripcion}
                touched={touched.descripcion}
                rows={4}
                delay={0.4}
              />
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <motion.button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>

            <motion.button
              onClick={handleSubmit}
              className="px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isEditing ? "Actualizar Equipo" : "Crear Equipo"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryTeamModal;
