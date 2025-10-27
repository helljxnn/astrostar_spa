import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserShield, FaPlus, FaSearch, FaEye, FaTimes, FaInfoCircle, FaExclamationCircle } from "react-icons/fa";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";
import {
  useFormAthleteValidation,
  athleteValidationRules,
} from "../hooks/useFormAthleteValidation";

const documentTypes = [
  { value: "cedula", label: "Cédula de Ciudadanía" },
  { value: "tarjeta_identidad", label: "Tarjeta de Identidad" },
  { value: "cedula_extranjeria", label: "Cédula de Extranjería" },
  { value: "pasaporte", label: "Pasaporte" },
];

const categories = [
  { value: "Infantil", label: "Infantil" },
  { value: "Sub 15", label: "Sub-15" },
  { value: "Juvenil", label: "Juvenil" },
];

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

const parentescoOptions = [
  { value: "Madre", label: "Madre" },
  { value: "Padre", label: "Padre" },
  { value: "Abuelo/a", label: "Abuelo/a" },
  { value: "Tío/a", label: "Tío/a" },
  { value: "Hermano/a", label: "Hermano/a" },
  { value: "Primo/a", label: "Primo/a" },
  { value: "Tutor/a Legal", label: "Tutor/a Legal" },
  { value: "Vecino/a", label: "Vecino/a" },
  { value: "Amigo/a de la familia", label: "Amigo/a de la familia" },
  { value: "Otro", label: "Otro (especificar)" },
];

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
  newlyCreatedGuardianId = null,
}) => {
  const isEditing = mode === "edit" || athleteToEdit !== null;
  const [showGuardianSearch, setShowGuardianSearch] = useState(false);
  const [guardianSearchTerm, setGuardianSearchTerm] = useState("");
  const [currentAge, setCurrentAge] = useState(null);
  const [otroParentesco, setOtroParentesco] = useState("");
  const [hasDateOfBirth, setHasDateOfBirth] = useState(false);

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
      estado: "Activo",
      acudiente: "",
      parentesco: "",
    },
    athleteValidationRules
  );

  useEffect(() => {
    if (values.fechaNacimiento) {
      const age = calculateAge(values.fechaNacimiento);
      setCurrentAge(age);
      setHasDateOfBirth(true);
    } else {
      setCurrentAge(null);
      setHasDateOfBirth(false);
    }
  }, [values.fechaNacimiento]);

  useEffect(() => {
    if (newlyCreatedGuardianId && guardians.length > 0 && !isEditing) {
      const guardianExists = guardians.find(g => g.id === newlyCreatedGuardianId);
      if (guardianExists) {
        handleChange({
          target: { 
            name: "acudiente", 
            value: newlyCreatedGuardianId.toString() 
          },
        });
      }
    }
  }, [newlyCreatedGuardianId, guardians, isEditing]);

  useEffect(() => {
    if (isOpen && isEditing && athleteToEdit) {
      const fechaNacimiento = athleteToEdit.fechaNacimiento || "";
      
      setValues({
        nombres: athleteToEdit.nombres || "",
        apellidos: athleteToEdit.apellidos || "",
        tipoDocumento: athleteToEdit.tipoDocumento || "",
        numeroDocumento: athleteToEdit.numeroDocumento || "",
        correo: athleteToEdit.correo || "",
        telefono: athleteToEdit.telefono || "",
        fechaNacimiento: fechaNacimiento,
        categoria: athleteToEdit.categoria || "",
        estado: athleteToEdit.estado || "Activo",
        acudiente: athleteToEdit.acudiente?.toString() || "",
        parentesco: athleteToEdit.parentesco || "",
      });
      
      setHasDateOfBirth(!!fechaNacimiento);
      
      if (athleteToEdit.parentesco && !parentescoOptions.some(opt => opt.value === athleteToEdit.parentesco)) {
        setOtroParentesco(athleteToEdit.parentesco);
      }
    } else if (isOpen && !isEditing) {
      setValues({
        nombres: "",
        apellidos: "",
        tipoDocumento: "",
        numeroDocumento: "",
        correo: "",
        telefono: "",
        fechaNacimiento: "",
        categoria: "",
        estado: "Activo",
        acudiente: "",
        parentesco: "",
      });
      setOtroParentesco("");
      setHasDateOfBirth(false);
    }
  }, [isOpen, isEditing, athleteToEdit, setValues]);

  const handleParentescoChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    handleBlur(e);
    
    if (value !== "Otro") {
      setOtroParentesco("");
    }
  };

  const handleFechaNacimientoChange = (e) => {
    handleChange(e);
    handleBlur(e);
  };

  useEffect(() => {
    if (values.fechaNacimiento && !isEditing) {
      const age = calculateAge(values.fechaNacimiento);
      let newCategory = "";

      if (age >= 5 && age <= 12) {
        newCategory = "Infantil";
      } else if (age >= 13 && age <= 15) {
        newCategory = "Sub 15";
      } else if (age >= 16 && age <= 18) {
        newCategory = "Juvenil";
      }

      if (newCategory && newCategory !== values.categoria) {
        handleChange({ target: { name: "categoria", value: newCategory } });
      }
    }
  }, [values.fechaNacimiento, handleChange, values.categoria, isEditing]);

  const filteredGuardians = guardians.filter(
    (guardian) =>
      guardian.nombreCompleto
        ?.toLowerCase()
        .includes(guardianSearchTerm.toLowerCase()) ||
      guardian.identificacion?.includes(guardianSearchTerm)
  );

  const selectedGuardian = guardians.find(
    (g) => g.id?.toString() === values.acudiente?.toString()
  );

  const isMinor = currentAge !== null && currentAge < 18;
  const isAcudienteRequired = hasDateOfBirth && isMinor;

  const getFinalParentesco = () => {
    if (values.parentesco === "Otro" && otroParentesco.trim()) {
      return otroParentesco.trim();
    }
    return values.parentesco;
  };

  const getAcudienteOptions = () => {
    const baseOptions = guardians.map((g) => ({
      value: g.id.toString(),
      label: `${g.nombreCompleto} - ${g.identificacion}`,
    }));

    if (hasDateOfBirth && !isAcudienteRequired) {
      return [
        { value: "", label: "Sin acudiente" },
        ...baseOptions
      ];
    }

    return baseOptions;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Marcar todos los campos como tocados para mostrar errores
    const allTouched = {};
    Object.keys(athleteValidationRules).forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);

    if (!validateAllFields()) {
      return;
    }

    if (isAcudienteRequired && !values.acudiente) {
      showErrorAlert(
        "Acudiente requerido",
        "Los menores de edad deben tener un acudiente asignado."
      );
      return;
    }

    if (values.acudiente && !values.parentesco) {
      showErrorAlert(
        "Parentesco requerido",
        "Debes especificar el parentesco con el acudiente."
      );
      return;
    }

    if (values.acudiente && values.parentesco === "Otro" && !otroParentesco.trim()) {
      showErrorAlert(
        "Parentesco requerido",
        "Debes especificar el tipo de parentesco en el campo 'Especificar parentesco'."
      );
      return;
    }

    try {
      const finalParentesco = getFinalParentesco();
      
      const athleteData = {
        nombres: values.nombres.trim(),
        apellidos: values.apellidos.trim(),
        tipoDocumento: values.tipoDocumento,
        numeroDocumento: values.numeroDocumento.trim(),
        correo: values.correo.trim(),
        telefono: values.telefono,
        fechaNacimiento: values.fechaNacimiento,
        categoria: values.categoria,
        estado: values.estado,
        acudiente: values.acudiente || null,
        parentesco: values.acudiente ? finalParentesco : null,
      };

      if (isEditing) {
        const updateData = {
          ...athleteData,
          id: athleteToEdit.id,
          shouldUpdateInscription:
            values.estado === "Inactivo" &&
            athleteToEdit.estado !== "Inactivo",
        };
        await onUpdate(updateData);
      } else {
        await onSave(athleteData);
      }

      resetForm();
      setOtroParentesco("");
      setHasDateOfBirth(false);
      onClose();
    } catch (error) {
      console.error("❌ Error en submit:", error);
      showErrorAlert("Error", error.message);
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
    setOtroParentesco("");
    setHasDateOfBirth(false);
    setShowGuardianSearch(false);
    setGuardianSearchTerm("");
    setCurrentAge(null);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            <FaTimes size={16} />
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
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

        <div className="flex-1 overflow-y-auto p-3">
          {hasDateOfBirth && currentAge !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-3 p-3 rounded-lg border ${
                isMinor
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <FaInfoCircle
                  className={isMinor ? "text-blue-600" : "text-green-600"}
                  size={18}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Edad: {currentAge} años - {isMinor ? "Menor de edad" : "Mayor de edad"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
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
                  required
                  delay={0.1}
                />
              </div>

              <div>
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
                  required
                  delay={0.2}
                />
              </div>

              <div>
                <FormField
                  label="Nombres"
                  name="nombres"
                  type="text"
                  placeholder="Nombres de la deportista"
                  value={values.nombres}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.nombres}
                  touched={touched.nombres}
                  required
                  delay={0.3}
                />
              </div>

              <div>
                <FormField
                  label="Apellidos"
                  name="apellidos"
                  type="text"
                  placeholder="Apellidos de la deportista"
                  value={values.apellidos}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.apellidos}
                  touched={touched.apellidos}
                  required
                  delay={0.4}
                />
              </div>

              <div>
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
                  required
                  delay={0.5}
                />
              </div>

              <div>
                <FormField
                  label="Número Telefónico"
                  name="telefono"
                  type="text"
                  placeholder="Número de Teléfono"
                  value={values.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.telefono}
                  touched={touched.telefono}
                  required
                  delay={0.6}
                />
              </div>

              <div>
                <FormField
                  label="Fecha de Nacimiento"
                  name="fechaNacimiento"
                  type="date"
                  placeholder="Selecciona la fecha"
                  value={values.fechaNacimiento}
                  onChange={handleFechaNacimientoChange}
                  onBlur={handleBlur}
                  error={errors.fechaNacimiento}
                  touched={touched.fechaNacimiento}
                  required
                  helperText={
                    currentAge !== null
                      ? `Edad: ${currentAge} años ${isMinor ? "(Menor)" : "(Mayor)"}`
                      : "Ingresa la fecha para determinar si requiere acudiente"
                  }
                  delay={0.7}
                />
              </div>

              <div>
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
                  required
                  helperText={!isEditing ? "Se calcula automáticamente según la edad" : ""}
                  delay={0.8}
                />
              </div>

              <div>
                <FormField
                  label="Estado de la Deportista"
                  name="estado"
                  type="select"
                  placeholder="Selecciona el estado"
                  options={states}
                  value={values.estado}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.estado}
                  touched={touched.estado}
                  required
                  helperText={
                    values.estado === "Activo"
                      ? "Participa normalmente en actividades"
                      : "⚠️ Al marcar como Inactivo, la inscripción se suspenderá"
                  }
                  delay={0.9}
                />
              </div>
            </div>
          </div>

          <motion.div
            className={`rounded-lg p-3 border mb-3 ${
              !hasDateOfBirth
                ? "bg-gray-50 border-gray-200"
                : isAcudienteRequired
                ? "bg-blue-50 border-blue-200"
                : values.acudiente
                ? "bg-purple-50 border-purple-200"
                : "bg-green-50 border-green-200"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaUserShield className="text-primary-purple" />
                Información del Acudiente
                {!hasDateOfBirth && (
                  <span className="text-xs bg-gray-500 text-white px-2 py-0.5 rounded-full">
                    PENDIENTE
                  </span>
                )}
                {hasDateOfBirth && isAcudienteRequired && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    OBLIGATORIO
                  </span>
                )}
                {hasDateOfBirth && !isAcudienteRequired && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    OPCIONAL
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuardianSearch(!showGuardianSearch)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium"
                >
                  <FaSearch size={12} />
                  {showGuardianSearch ? "Ocultar" : "Buscar"}
                </button>
                <button
                  type="button"
                  onClick={handleCreateGuardian}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  <FaPlus size={12} />
                  Crear Nuevo
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showGuardianSearch && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar acudiente por nombre o documento..."
                      value={guardianSearchTerm}
                      onChange={(e) => setGuardianSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple transition-all duration-200 text-sm"
                    />
                    <FaSearch
                      className="absolute right-3 top-3 text-gray-400"
                      size={12}
                    />
                  </div>
                  {guardianSearchTerm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      {filteredGuardians.length > 0 ? (
                        filteredGuardians.map((guardian) => (
                          <button
                            key={guardian.id}
                            type="button"
                            onClick={() =>
                              handleSelectGuardianFromSearch(guardian)
                            }
                            className="w-full px-3 py-2 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150 text-sm"
                          >
                            <div className="font-medium text-gray-800">
                              {guardian.nombreCompleto}
                            </div>
                            <div className="text-xs text-gray-600">
                              {guardian.tipoDocumento}: {guardian.identificacion}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-gray-500 text-center text-sm">
                          <FaUserShield
                            size={20}
                            className="mx-auto mb-1 text-gray-300"
                          />
                          <p>No se encontraron acudientes</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <FormField
                  label="Seleccionar Acudiente"
                  name="acudiente"
                  type="select"
                  placeholder={
                    !hasDateOfBirth 
                      ? "Primero ingresa la fecha de nacimiento" 
                      : isAcudienteRequired
                      ? "Selecciona un acudiente"
                      : "Selecciona un acudiente (Opcional)"
                  }
                  options={getAcudienteOptions()} 
                  value={values.acudiente}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.acudiente}
                  touched={touched.acudiente}
                  required={isAcudienteRequired}
                  disabled={!hasDateOfBirth}
                />
              </div>

              {values.acudiente && (
                <div className="space-y-2">
                  <div>
                    <FormField
                      label="Parentesco"
                      name="parentesco"
                      type="select"
                      placeholder="Selecciona el parentesco"
                      options={parentescoOptions}
                      value={values.parentesco}
                      onChange={handleParentescoChange}
                      onBlur={handleBlur}
                      error={errors.parentesco}
                      touched={touched.parentesco}
                      required
                      helperText="Relación del acudiente con el deportista"
                    />
                    {errors.parentesco && touched.parentesco && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded"
                      >
                        <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" size={12} />
                        <p className="text-red-600 text-xs">{errors.parentesco}</p>
                      </motion.div>
                    )}
                  </div>

                  {values.parentesco === "Otro" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1"
                    >
                      <label className="block text-sm font-medium text-gray-700">
                        Especificar parentesco *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Vecino, Amigo de la familia, Conocido..."
                        value={otroParentesco}
                        onChange={(e) => setOtroParentesco(e.target.value)}
                        onBlur={handleBlur}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-primary-purple transition-all duration-200 text-sm"
                        required
                      />
                      {otroParentesco === "" && touched.parentesco && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 flex items-start gap-1 p-2 bg-red-50 border border-red-200 rounded"
                        >
                          <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" size={12} />
                          <p className="text-red-600 text-xs">Debes especificar el tipo de parentesco</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence>
              {selectedGuardian && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-xs flex-1">
                      <div>
                        <strong>Nombre:</strong> {selectedGuardian.nombreCompleto}
                      </div>
                      <div>
                        <strong>Documento:</strong> {selectedGuardian.tipoDocumento} -{" "}
                        {selectedGuardian.identificacion}
                      </div>
                      <div>
                        <strong>Teléfono:</strong> {selectedGuardian.telefono}
                      </div>
                      <div>
                        <strong>Correo:</strong> {selectedGuardian.correo}
                      </div>
                      {values.parentesco && (
                        <div>
                          <strong>Parentesco:</strong>{" "}
                          <span className="text-primary-purple font-semibold">
                            {getFinalParentesco()}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleViewGuardian}
                      className="ml-3 flex items-center gap-1 px-2 py-1 bg-primary-purple text-white rounded hover:bg-purple-700 transition-colors text-xs font-medium"
                    >
                      <FaEye size={10} />
                      Ver
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasDateOfBirth && !isAcudienteRequired && !values.acudiente && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800"
              >
                Este deportista es mayor de edad. El acudiente es opcional pero puede ser asignado si es necesario.
              </motion.div>
            )}
          </motion.div>

          {!isEditing && (
            <motion.div
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1 text-sm">
                    Inscripción automática
                  </h4>
                  <p className="text-sm text-blue-700">
                    Al crear la deportista, se generará automáticamente una
                    inscripción inicial con estado "Vigente". Si seleccionas "Inactivo", la inscripción se
                    creará con estado "Suspendida".
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(event) => handleSubmit(event)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              {isEditing ? "Actualizar Deportista" : "Crear Deportista"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AthleteModal;