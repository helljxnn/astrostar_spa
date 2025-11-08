import { useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  useFormTempWorkerValidation,
  tempWorkerValidationRules,
} from "../hooks/useFormTempWorkerValidation";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";

const TemporaryWorkerModal = ({
  isOpen,
  onClose,
  onSave,
  worker,
  mode = "create",
  referenceData = { documentTypes: [] },
}) => {
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues: setFormData,
  } = useFormTempWorkerValidation(
    {
      tipoPersona: "",
      nombre: "",
      apellido: "",
      tipoDocumento: "",
      identificacion: "",
      telefono: "",
      fechaNacimiento: "",
      edad: "",
      email: "",
      address: "",
      organization: "",
      estado: "Activo",
      documentTypeId: "",
    },
    tempWorkerValidationRules
  );

  // Función para calcular la edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return "";

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age.toString() : "";
  };

  // Función personalizada para manejar cambios
  const handleCustomChange = (name, value) => {
    if (name === "fechaNacimiento") {
      const age = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        edad: age,
      }));
    } else {
      handleChange(name, value);
    }
  };

  // Cargar datos si es edición o vista, o limpiar si es creación
  useEffect(() => {
    if (worker && (mode === "edit" || mode === "view")) {
      setFormData({
        tipoPersona: worker.tipoPersona || "",
        nombre: worker.nombre || "",
        apellido: "", // Se maneja en nombre completo
        tipoDocumento: worker.tipoDocumento || "",
        identificacion: worker.identificacion || "",
        telefono: worker.telefono || "",
        fechaNacimiento: worker.fechaNacimiento || "",
        edad: worker.edad?.toString() || "",
        email: worker.email || "",
        address: worker.address || "",
        organization: worker.organization || "",
        estado: worker.estado || "Activo",
        documentTypeId: worker.documentTypeId?.toString() || "",
      });
    } else {
      // Limpiar formulario para creación
      setFormData({
        tipoPersona: "",
        nombre: "",
        apellido: "",
        tipoDocumento: "",
        identificacion: "",
        telefono: "",
        fechaNacimiento: "",
        edad: "",
        email: "",
        address: "",
        organization: "",
        estado: "Activo",
        documentTypeId: "",
      });
    }
  }, [worker, setFormData, mode, isOpen]);

  const handleSubmit = async () => {
    try {
      const isValid = validateAllFields();
      if (!isValid) {
        showErrorAlert(
          "Campos incompletos",
          "Por favor, complete todos los campos obligatorios antes de continuar."
        );
        return;
      }

      // Confirmación solo al editar
      if (mode === "edit") {
        const result = await showConfirmAlert(
          "¿Estás seguro de actualizar esta persona temporal?",
          "Los cambios se guardarán y no se podrán deshacer fácilmente."
        );
        if (!result.isConfirmed) return;
      }

      // Llamar onSave y esperar el resultado
      const success = await onSave(formData);

      // Solo cerrar el modal si la operación fue exitosa
      if (success) {
        // Limpiar formulario
        setFormData({
          tipoPersona: "",
          nombre: "",
          apellido: "",
          tipoDocumento: "",
          identificacion: "",
          telefono: "",
          fechaNacimiento: "",
          edad: "",
          email: "",
          address: "",
          organization: "",
          estado: "Activo",
          documentTypeId: "",
        });

        onClose();
      }
    } catch (error) {
      console.error("Error al guardar persona temporal:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar la persona temporal. Intenta de nuevo."
      );
    }
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
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 p-3 relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {mode === "view"
              ? "Ver Persona Temporal"
              : mode === "edit"
              ? "Editar Persona Temporal"
              : "Crear Persona Temporal"}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Tipo Documento */}
            <FormField
              label="Tipo de Documento"
              name="documentTypeId"
              type="select"
              required={mode !== "view"}
              disabled={mode === "view"}
              options={referenceData.documentTypes.map((type) => ({
                value: type.id.toString(),
                label: type.name,
              }))}
              value={formData.documentTypeId}
              error={errors.documentTypeId}
              touched={touched.documentTypeId}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Identificación */}
            <FormField
              label="Número de Documento"
              name="identificacion"
              type="text"
              placeholder="Número de documento"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.identificacion}
              error={errors.identificacion}
              touched={touched.identificacion}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Tipo Persona */}
            <FormField
              label="Tipo de Persona"
              name="tipoPersona"
              type="select"
              required={mode !== "view"}
              disabled={mode === "view"}
              options={[
                { value: "Deportista", label: "Deportista" },
                { value: "Entrenador", label: "Entrenador" },
                { value: "Participante", label: "Participante" },
              ]}
              value={formData.tipoPersona}
              error={errors.tipoPersona}
              touched={touched.tipoPersona}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Nombre Completo */}
            <FormField
              label="Nombre Completo"
              name="nombre"
              type="text"
              placeholder="Nombre completo"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.nombre}
              error={errors.nombre}
              touched={touched.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Email */}
            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required={false}
              disabled={mode === "view"}
              value={formData.email}
              error={errors.email}
              touched={touched.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Teléfono */}
            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="Número de teléfono"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.telefono}
              error={errors.telefono}
              touched={touched.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Fecha Nacimiento */}
            <FormField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              required={false}
              disabled={mode === "view"}
              value={formData.fechaNacimiento}
              error={errors.fechaNacimiento}
              touched={touched.fechaNacimiento}
              onChange={handleCustomChange}
              onBlur={handleBlur}
            />

            {/* Edad */}
            <FormField
              label="Edad"
              name="edad"
              type="number"
              placeholder="Edad"
              required={false}
              disabled={true}
              value={formData.edad}
              error={errors.edad}
              touched={touched.edad}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Dirección */}
            <FormField
              label="Dirección"
              name="address"
              type="text"
              placeholder="Dirección"
              required={false}
              disabled={mode === "view"}
              value={formData.address}
              error={errors.address}
              touched={touched.address}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Organización */}
            <FormField
              label="Organización"
              name="organization"
              type="text"
              placeholder="Organización"
              required={false}
              disabled={mode === "view"}
              value={formData.organization}
              error={errors.organization}
              touched={touched.organization}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Estado */}
            <FormField
              label="Estado"
              name="estado"
              type="select"
              options={[
                { value: "Activo", label: "Activo" },
                { value: "Inactivo", label: "Inactivo" },
              ]}
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.estado}
              error={errors.estado}
              touched={touched.estado}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          {mode === "view" ? (
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-all duration-200 font-medium shadow-lg"
              >
                {mode === "edit" ? "Guardar Cambios" : "Crear Persona Temporal"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemporaryWorkerModal;