import { useEffect } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import {
  useFormEmployeeValidation,
  employeeValidationRules,
} from "../hooks/useFormEmployeeValidation";
import {
  showSuccessAlert,
  showConfirmAlert,
  showErrorAlert,
} from "../../../../../../../../shared/utils/alerts";

const EmployeeModal = ({
  isOpen,
  onClose,
  onSave,
  employee,
  mode = "create",
  referenceData = { roles: [], documentTypes: [] },
}) => {
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    setValues: setFormData,
  } = useFormEmployeeValidation(
    {
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
      age: "",
      identification: "",
      documentTypeId: "",
      roleId: "",
      status: "Active",
    },
    employeeValidationRules
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
    if (name === "birthDate") {
      const age = calculateAge(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        age: age,
      }));
    } else {
      handleChange(name, value);
    }
  };

  // Cargar datos si es edición o vista, o limpiar si es creación
  useEffect(() => {
    if (employee && (mode === "edit" || mode === "view")) {
      // Mapear datos del backend al formato del formulario
      const birthDate = employee.user?.birthDate
        ? employee.user.birthDate.split("T")[0]
        : "";
      setFormData({
        firstName: employee.user?.firstName || "",
        middleName: employee.user?.middleName || "",
        lastName: employee.user?.lastName || "",
        secondLastName: employee.user?.secondLastName || "",
        email: employee.user?.email || "",
        phoneNumber: employee.user?.phoneNumber || "",
        address: employee.user?.address || "",
        birthDate: birthDate,
        age: calculateAge(birthDate),
        identification: employee.user?.identification || "",
        documentTypeId: employee.user?.documentTypeId || "",
        roleId: employee.user?.roleId || "",
        status: employee.status || "Active",
      });
    } else {
      // Limpiar formulario para creación
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        secondLastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        birthDate: "",
        age: "",
        identification: "",
        documentTypeId: "",
        roleId: "",
        status: "Active",
      });
    }
  }, [employee, setFormData, mode, isOpen]);

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
          "¿Estás seguro de actualizar este empleado?",
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
          firstName: "",
          middleName: "",
          lastName: "",
          secondLastName: "",
          email: "",
          phoneNumber: "",
          address: "",
          birthDate: "",
          age: "",
          identification: "",
          documentTypeId: "",
          roleId: "",
          status: "Active",
        });

        onClose();
      }
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      showErrorAlert(
        "Error al guardar",
        "No se pudo guardar el empleado. Intenta de nuevo."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-container bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] relative flex flex-col overflow-hidden"
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
              ? "Ver Empleado"
              : mode === "edit"
              ? "Editar Empleado"
              : "Crear Empleado"}
          </h2>
        </div>

        {/* Body */}
        <div className="modal-body flex-1 overflow-y-auto p-3 relative">
          <div className="form-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
            {/* Tipo Documento */}
            <FormField
              label="Tipo de Documento"
              name="documentTypeId"
              type="select"
              placeholder="Seleccionar tipo de documento"
              required={mode !== "view"}
              disabled={mode === "view"}
              options={referenceData.documentTypes.map((type) => ({
                value: type.id,
                label: type.name,
              }))}
              value={formData.documentTypeId}
              error={errors.documentTypeId}
              touched={touched.documentTypeId}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.1}
            />

            {/* Identificación */}
            <FormField
              label="Número de Documento"
              name="identification"
              type="text"
              placeholder="Número de documento del empleado"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.identification}
              error={errors.identification}
              touched={touched.identification}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.2}
            />

            {/* Primer Nombre */}
            <FormField
              label="Primer Nombre"
              name="firstName"
              type="text"
              placeholder="Primer nombre del empleado"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.firstName}
              error={errors.firstName}
              touched={touched.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.3}
            />

            {/* Segundo Nombre */}
            <FormField
              label="Segundo Nombre"
              name="middleName"
              type="text"
              placeholder="Segundo nombre (opcional)"
              required={false}
              disabled={mode === "view"}
              value={formData.middleName}
              error={errors.middleName}
              touched={touched.middleName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.35}
            />

            {/* Primer Apellido */}
            <FormField
              label="Primer Apellido"
              name="lastName"
              type="text"
              placeholder="Primer apellido del empleado"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.lastName}
              error={errors.lastName}
              touched={touched.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.4}
            />

            {/* Segundo Apellido */}
            <FormField
              label="Segundo Apellido"
              name="secondLastName"
              type="text"
              placeholder="Segundo apellido (opcional)"
              required={false}
              disabled={mode === "view"}
              value={formData.secondLastName}
              error={errors.secondLastName}
              touched={touched.secondLastName}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.45}
            />

            {/* Correo */}
            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.email}
              error={errors.email}
              touched={touched.email}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.5}
            />

            {/* Teléfono */}
            <FormField
              label="Número Telefónico"
              name="phoneNumber"
              type="text"
              placeholder="300 123 4567"
              required={false}
              disabled={mode === "view"}
              value={formData.phoneNumber}
              error={errors.phoneNumber}
              touched={touched.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.55}
            />

            {/* Dirección */}
            <FormField
              label="Dirección"
              name="address"
              type="text"
              placeholder="Dirección de residencia (opcional)"
              required={false}
              disabled={mode === "view"}
              value={formData.address}
              error={errors.address}
              touched={touched.address}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.6}
            />

            {/* Fecha de Nacimiento */}
            <FormField
              label="Fecha de Nacimiento"
              name="birthDate"
              type="date"
              placeholder="Fecha de nacimiento"
              required={mode !== "view"}
              disabled={mode === "view"}
              value={formData.birthDate}
              error={errors.birthDate}
              touched={touched.birthDate}
              onChange={handleCustomChange}
              onBlur={handleBlur}
              delay={0.65}
            />

            {/* Edad (calculada automáticamente) */}
            <FormField
              label="Edad"
              name="age"
              type="text"
              placeholder="Se calcula automáticamente"
              required={false}
              disabled={true}
              value={formData.age ? `${formData.age} años` : ""}
              delay={0.67}
            />

            {/* Rol */}
            <FormField
              label="Rol"
              name="roleId"
              type="select"
              placeholder="Seleccione el rol"
              required={mode !== "view"}
              disabled={mode === "view"}
              options={referenceData.roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              value={formData.roleId}
              error={errors.roleId}
              touched={touched.roleId}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.75}
            />

            {/* Estado */}
            <FormField
              label="Estado"
              name="status"
              type="select"
              placeholder="Seleccionar estado"
              required={mode !== "view"}
              disabled={mode === "view"}
              options={[
                { value: "Active", label: "Activo" },
                { value: "Disabled", label: "Deshabilitado" },
                { value: "OnVacation", label: "En Vacaciones" },
                { value: "Retired", label: "Retirado" },
              ]}
              value={formData.status}
              error={errors.status}
              touched={touched.status}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.8}
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
                {mode === "edit" ? "Guardar Cambios" : "Crear Empleado"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeModal;
