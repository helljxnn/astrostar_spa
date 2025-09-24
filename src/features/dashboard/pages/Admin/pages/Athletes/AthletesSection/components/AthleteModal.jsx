// src/features/dashboard/pages/Admin/pages/Athletes/components/AthleteModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserShield, FaPlus, FaSearch, FaEye, FaTimes } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts";
import {
  useFormAthleteValidation,
  athleteValidationRules,
} from "../hooks/useFormAthleteValidation";

const documentTypes = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PA", label: "Pasaporte" },
];

const categories = [
  { value: "Infantil", label: "Infantil (5-12 años)" },
  { value: "Sub 15", label: "Sub 15 (13-15 años)" },
  { value: "Juvenil", label: "Juvenil (16-18 años)" },
];

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const inscriptionStates = [
  { value: "Vigente", label: "Vigente" },
  { value: "Vencida", label: "Vencida" },
  { value: "Cancelada", label: "Cancelada" },
];

// Rango de edades para asignación automática
const AGE_CATEGORY_RANGES = [
  { value: "Infantil", min: 5, max: 12 },
  { value: "Sub 15", min: 13, max: 15 },
  { value: "Juvenil", min: 16, max: 18 },
];

// Helpers
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const b = new Date(birthDate);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) {
    age--;
  }
  return age;
};

const getCategoryByAge = (age) => {
  if (age === null || age === undefined) return "";
  const found = AGE_CATEGORY_RANGES.find((r) => age >= r.min && age <= r.max);
  return found ? found.value : "";
};
const validateAge = (age) => {
  return age >= 5 && age <= 18;
};

const todayISO = () => new Date().toISOString().split("T")[0];

const AthleteModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  athleteToEdit = null,
  guardians = [],
  mode = athleteToEdit ? "edit" : "create",
  onCreateGuardian,
  onViewGuardian,
}) => {
  const isEditing = mode === "edit" || athleteToEdit !== null;
  const [showGuardianSearch, setShowGuardianSearch] = useState(false);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");

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
  } = useFormAthleteValidation(
    {
      nombres: "",
      apellidos: "",
      tipoDocumento: "",
      numeroDocumento: "",
      correo: "",
      telefono: "",
      fechaNacimiento: "",
      categoria: "",
      estado: "",
      acudiente: "",
      // Campos de inscripción para crear deportista
      estadoInscripcion: "",
      conceptoInscripcion: "",
      fechaConcepto: todayISO(),
      fechaInscripcion: todayISO(),
    },
    athleteValidationRules
  );

  useEffect(() => {
    if (isOpen && isEditing && athleteToEdit) {
      // Para edición, NO incluir datos de inscripción
      setValues({
        nombres: athleteToEdit.nombres || "",
        apellidos: athleteToEdit.apellidos || "",
        tipoDocumento: athleteToEdit.tipoDocumento || "",
        numeroDocumento: athleteToEdit.numeroDocumento || "",
        correo: athleteToEdit.correo || "",
        telefono: athleteToEdit.telefono || "",
        fechaNacimiento: athleteToEdit.fechaNacimiento || "",
        categoria: athleteToEdit.categoria || "",
        estado: athleteToEdit.estado || "",
        acudiente: athleteToEdit.acudiente?.toString() || "",
      });
    } else if (isOpen && !isEditing) {
      // Para crear, incluir campos de inscripción inicial
      setValues({
        nombres: "",
        apellidos: "",
        tipoDocumento: "",
        numeroDocumento: "",
        correo: "",
        telefono: "",
        fechaNacimiento: "",
        categoria: "",
        estado: "",
        acudiente: "",
        estadoInscripcion: "",
        conceptoInscripcion: "",
        fechaConcepto: todayISO(),
        fechaInscripcion: todayISO(),
      });
    }
  }, [isOpen, isEditing, athleteToEdit, setValues]);

  // Actualizar categoría automáticamente al cambiar fecha de nacimiento
  useEffect(() => {
  if (values && values.fechaNacimiento) {
    const age = calculateAge(values.fechaNacimiento);
    
    // Validar que la edad esté en el rango permitido
    if (age !== null && !validateAge(age)) {
      showErrorAlert(
        "Edad fuera de rango",
        `La edad calculada (${age} años) está fuera del rango permitido para la fundación (5-18 años).`
      );
      return;
    }
    
    const autoCategory = getCategoryByAge(age);
    if (autoCategory && autoCategory !== values.categoria) {
      setValues((prev) => ({ ...prev, categoria: autoCategory }));
    }
  }
}, [values?.fechaNacimiento]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return phone;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (cleanPhone.startsWith("+57") || cleanPhone.startsWith("57")) return phone;
    if (/^\d{7,10}$/.test(cleanPhone)) return `+57 ${cleanPhone}`;
    return phone;
  };

  const filteredGuardians = guardians.filter(
    (guardian) =>
      guardian.nombreCompleto
        ?.toLowerCase()
        .includes(guardianSearchTerm.toLowerCase()) ||
      guardian.identificacion?.includes(guardianSearchTerm)
  );

  const selectedGuardian = guardians.find(
    (g) => g.id === parseInt(values.acudiente)
  );

  const handleSubmit = async () => {
    const allTouched = {};
    Object.keys(athleteValidationRules).forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (!validateAllFields()) {
      return;
    }

    // Validación acudiente obligatorio
    if (!values.acudiente || values.acudiente === "") {
      showErrorAlert("Campo requerido", "Debes seleccionar un acudiente para el deportista.");
      return;
    }
     // Validación de edad:
  if (values.fechaNacimiento) {
    const age = calculateAge(values.fechaNacimiento);
    if (age !== null && !validateAge(age)) {
      showErrorAlert(
        "Edad no válida",
        `El deportista debe tener entre 5 y 18 años para inscribirse en la fundación. Edad actual: ${age} años.`
      );
      return;
    }
  }

    // Validación inscripción SOLO al crear
    if (!isEditing) {
      if (!values.conceptoInscripcion?.trim()) {
        showErrorAlert(
          "Campo requerido",
          "Debes completar el concepto de inscripción inicial."
        );
        return;
      }
    }

    if (isEditing) {
      const confirmResult = await showConfirmAlert(
        "¿Estás seguro?",
        `¿Deseas actualizar la información del deportista ${athleteToEdit.nombres} ${athleteToEdit.apellidos}?`,
        {
          confirmButtonText: "Sí, actualizar",
          cancelButtonText: "Cancelar",
        }
      );
      if (!confirmResult.isConfirmed) {
        return;
      }
    }

    try {
      const athleteData = {
        nombres: values.nombres,
        apellidos: values.apellidos,
        tipoDocumento: values.tipoDocumento,
        numeroDocumento: values.numeroDocumento,
        correo: values.correo,
        telefono: formatPhoneNumber(values.telefono),
        fechaNacimiento: values.fechaNacimiento,
        categoria: values.categoria,
        estado: values.estado,
        acudiente: parseInt(values.acudiente) || null,
      };

      if (isEditing) {
        const updatedAthleteData = { ...athleteData, id: athleteToEdit.id };
        await onUpdate(updatedAthleteData);
        showSuccessAlert(
          "Deportista actualizado",
          `Los datos de ${values.nombres} ${values.apellidos} han sido actualizados exitosamente.`
        );
      } else {
        // Para crear deportista con inscripción inicial
        const newAthlete = {
          ...athleteData,
          // Los campos de inscripción se pasarán separadamente
          inscriptionData: {
            estado: values.estadoInscripcion,
            concepto: values.conceptoInscripcion,
            fechaConcepto: values.fechaConcepto,
            fechaInscripcion: values.fechaInscripcion,
          }
        };

        await onSave(newAthlete);
        showSuccessAlert("Deportista creado", "El deportista ha sido creado exitosamente.");
      }

      resetForm();
      onClose();
    } catch (error) {
      console.error(`Error al ${isEditing ? "actualizar" : "crear"} deportista:`, error);
      showErrorAlert(
        "Error",
        error.message || `Ocurrió un error al ${isEditing ? "actualizar" : "crear"} el deportista`
      );
    }
  };

  const handleCreateGuardian = () => {
    if (onCreateGuardian) {
      onCreateGuardian();
    }
  };

  const handleViewGuardian = () => {
    if (selectedGuardian && onViewGuardian) {
      onViewGuardian(selectedGuardian);
    }
  };

  const handleSelectGuardianFromSearch = (guardian) => {
    handleChange({
      target: { name: "acudiente", value: guardian.id.toString() },
    });
    setGuardianSearchTerm("");
    setShowGuardianSearch(false);
  };

  const handleClose = () => {
    resetForm();
    setShowGuardianSearch(false);
    setGuardianSearchTerm("");
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"
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
            <FaTimes size={18} />
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Deportista" : "Crear Deportista"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando información de:{" "}
              <span className="font-semibold text-primary-purple">
                {athleteToEdit.nombres} {athleteToEdit.apellidos}
              </span>
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información Personal */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Nombres"
                name="nombres"
                type="text"
                placeholder="Nombres del deportista"
                value={values.nombres}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nombres}
                touched={touched.nombres}
                delay={0.1}
                required
              />
              <FormField
                label="Apellidos"
                name="apellidos"
                type="text"
                placeholder="Apellidos del deportista"
                value={values.apellidos}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.apellidos}
                touched={touched.apellidos}
                delay={0.15}
                required
              />
              <FormField
                label="Tipo de Documento"
                name="tipoDocumento"
                type="select"
                placeholder="Selecciona el tipo de documento"
                options={documentTypes}
                value={values.tipoDocumento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.tipoDocumento}
                touched={touched.tipoDocumento}
                delay={0.2}
                required
              />
              <FormField
                label="Número de Documento"
                name="numeroDocumento"
                type="text"
                placeholder="Número de identificación"
                value={values.numeroDocumento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.numeroDocumento}
                touched={touched.numeroDocumento}
                delay={0.25}
                required
              />
              <FormField
                label="Correo Electrónico"
                name="correo"
                type="email"
                placeholder="correo@ejemplo.com"
                value={values.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.correo}
                touched={touched.correo}
                delay={0.3}
                required
              />
              <FormField
                label="Número Telefónico"
                name="telefono"
                type="text"
                placeholder="3001234567 o 6012345678"
                value={values.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.telefono}
                touched={touched.telefono}
                delay={0.35}
                required
              />
              <FormField
                label="Fecha de Nacimiento"
                name="fechaNacimiento"
                type="date"
                placeholder="Selecciona la fecha"
                value={values.fechaNacimiento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fechaNacimiento}
                touched={touched.fechaNacimiento}
                delay={0.4}
                required
              />
              <FormField
                label="Categoría"
                name="categoria"
                type="select"
                placeholder="Selecciona la categoría"
                options={categories}
                value={values.categoria}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.categoria}
                touched={touched.categoria}
                delay={0.5}
                required
              />
              <FormField
                label="Estado"
                name="estado"
                type="select"
                placeholder="Selecciona el estado"
                options={states}
                value={values.estado}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.estado}
                touched={touched.estado}
                delay={0.55}
                required
              />
            </div>
          </div>

{/* Información de Inscripción - Mostrar en ambos modos */}
<div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-blue-200 pb-2">
    Inscripción
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <FormField
      label="Estado de Inscripción"
      name="estadoInscripcion"
      type="select"
      placeholder="Selecciona el estado"
      options={inscriptionStates}
      value={values.estadoInscripcion}
      onChange={handleChange}
      onBlur={handleBlur}
      error={errors.estadoInscripcion}
      touched={touched.estadoInscripcion}
      delay={0.6}
      helperText="Por defecto es 'Vigente'"
      // 🔓 editable en crear y editar
    />

    <FormField
      label="Concepto de Inscripción"
      name="conceptoInscripcion"
      type="text"
      placeholder={`Ej. Inscripción inicial ${new Date().getFullYear()}`}
      value={values.conceptoInscripcion}
      onChange={handleChange}
      onBlur={handleBlur}
      error={errors.conceptoInscripcion}
      touched={touched.conceptoInscripcion}
      delay={0.65}
      required
      // 🔓 editable en crear y editar
    />

    <FormField
      label="Fecha de Inscripción"
      name="fechaInscripcion"
      type="date"
      value={values.fechaInscripcion}
      disabled   // ❌ nunca editable
      delay={0.7}
      helperText="Fecha actual automática (no modificable)"
    />

    <FormField
      label="Fecha Concepto"
      name="fechaConcepto"
      type="date"
      value={values.fechaConcepto}
      onChange={handleChange}
      onBlur={handleBlur}
      error={errors.fechaConcepto}
      touched={touched.fechaConcepto}
      delay={0.75}
      // 🔓 editable en crear y editar
    />
  </div>
</div>



          {/* Sección de Acudiente */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaUserShield className="text-primary-purple" />
                Información del Acudiente
              </h3>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  onClick={() => setShowGuardianSearch(!showGuardianSearch)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaSearch size={12} />
                  {showGuardianSearch ? "Ocultar" : "Buscar"}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleCreateGuardian}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaPlus size={12} />
                  Crear Nuevo
                </motion.button>
              </div>
            </div>

            {/* Búsqueda de Acudientes */}
            <AnimatePresence>
              {showGuardianSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar acudiente por nombre o documento..."
                      value={guardianSearchTerm}
                      onChange={(e) => setGuardianSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple transition-all duration-200"
                    />
                    <FaSearch className="absolute right-3 top-4 text-gray-400" size={14} />
                  </div>
                  {guardianSearchTerm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      {filteredGuardians.length > 0 ? (
                        filteredGuardians.map((guardian) => (
                          <motion.button
                            key={guardian.id}
                            type="button"
                            onClick={() => handleSelectGuardianFromSearch(guardian)}
                            className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                            whileHover={{ backgroundColor: "#faf5ff" }}
                          >
                            <div className="font-medium text-gray-800">{guardian.nombreCompleto}</div>
                            <div className="text-sm text-gray-600">
                              {guardian.tipoDocumento}: {guardian.identificacion}
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-gray-500 text-center">
                          <FaUserShield size={24} className="mx-auto mb-2 text-gray-300" />
                          <p>No se encontraron acudientes</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selector de Acudiente */}
            <FormField
              label="Seleccionar Acudiente"
              name="acudiente"
              type="select"
              placeholder="Selecciona un acudiente"
              options={guardians.map((g) => ({
                value: g.id.toString(),
                label: `${g.nombreCompleto} - ${g.identificacion}`,
              }))}
              value={values.acudiente}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.acudiente}
              touched={touched.acudiente}
              delay={0.75}
              required
            />

            {/* Información del Acudiente Seleccionado */}
            <AnimatePresence>
              {selectedGuardian && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-sm flex-1">
                      <div>
                        <strong>Nombre:</strong> {selectedGuardian.nombreCompleto}
                      </div>
                      <div>
                        <strong>Documento:</strong> {selectedGuardian.tipoDocumento} - {selectedGuardian.identificacion}
                      </div>
                      <div>
                        <strong>Teléfono:</strong> {selectedGuardian.telefono}
                      </div>
                      <div>
                        <strong>Correo:</strong> {selectedGuardian.correo}
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={handleViewGuardian}
                      className="ml-4 flex items-center gap-1 px-3 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaEye size={12} />
                      Ver
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-between pt-6 border-t border-gray-200"
          >
          
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
              className="px-8 py-3 text-white rounded-xl font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isEditing ? "Actualizar Deportista" : "Crear Deportista"}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AthleteModal;