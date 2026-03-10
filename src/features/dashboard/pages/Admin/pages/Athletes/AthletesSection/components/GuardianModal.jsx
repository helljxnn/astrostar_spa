import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { DocumentField } from "../../../../../../../../shared/components/DocumentField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../../shared/utils/alerts.js";
import {
  useFormGuardianValidation,
  guardianValidationRules,
} from "../hooks/useFormGuardianValidation";
import GuardiansService from "../services/GuardiansService";

const GuardianModal = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  guardianToEdit = null,
  mode = guardianToEdit ? "edit" : "create",
  referenceData = { documentTypes: [] },
}) => {
  const isEditing = mode === "edit" || guardianToEdit !== null;
  const [asyncErrors, setAsyncErrors] = useState({});
  const [checkingDocument, setCheckingDocument] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

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
    setErrors,
  } = useFormGuardianValidation(
    {
      nombreCompleto: "",
      documentTypeId: "",
      identification: "",
      email: "",
      phoneNumber: "",
      address: "",
      fechaNacimiento: "",
      estado: "Activo",
    },
    guardianValidationRules,
  );

  // Validación instantánea de documento
  useEffect(() => {
    const checkDocument = async () => {
      if (!values.identification || values.identification.length < 6) {
        setAsyncErrors((prev) => ({ ...prev, identification: null }));
        return;
      }

      setCheckingDocument(true);
      try {
        // Obtener todos los acudientes
        const result = await GuardiansService.getAll();

        if (result.success) {
          // Buscar si existe un acudiente con el mismo documento
          const existingGuardian = result.data.find((g) => {
            const guardianId = g.identificacion || g.identification;
            const isSameDocument =
              guardianId &&
              guardianId.toLowerCase() === values.identification.toLowerCase();
            const isDifferentGuardian =
              !isEditing || g.id !== guardianToEdit?.id;
            return isSameDocument && isDifferentGuardian;
          });

          if (existingGuardian) {
            const errorMsg = `Este documento ya está registrado`;
            setAsyncErrors((prev) => ({ ...prev, identification: errorMsg }));
            setErrors((prev) => ({ ...prev, identification: errorMsg }));
            setTouched((prev) => ({ ...prev, identification: true }));
          } else {
            setAsyncErrors((prev) => ({ ...prev, identification: null }));
            // Solo limpiar el error si es un error de duplicado
            if (
              errors.identification &&
              errors.identification.includes("ya está registrado")
            ) {
              setErrors((prev) => ({ ...prev, identification: "" }));
            }
          }
        }
      } catch (error) {
        console.error("Error verificando documento:", error);
      } finally {
        setCheckingDocument(false);
      }
    };

    // Debounce de 500ms
    const timeoutId = setTimeout(checkDocument, 500);
    return () => clearTimeout(timeoutId);
  }, [
    values.identification,
    isEditing,
    guardianToEdit?.id,
    setErrors,
    setTouched,
  ]);

  // Validación instantánea de email
  useEffect(() => {
    const checkEmail = async () => {
      if (!values.email || !values.email.includes("@")) {
        setAsyncErrors((prev) => ({ ...prev, email: null }));
        return;
      }

      // Validar formato de email primero (antes de consultar al backend)
      // Regex más estricta: solo letras, números, puntos, guiones y guiones bajos
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(values.email)) {
        // Si el formato es inválido, no hacer la consulta al backend
        // El error de formato ya lo maneja la validación síncrona
        setAsyncErrors((prev) => ({ ...prev, email: null }));
        return;
      }

      setCheckingEmail(true);
      try {
        // Obtener todos los acudientes
        const result = await GuardiansService.getAll();

        if (result.success) {
          // Buscar si existe un acudiente con el mismo email
          const existingGuardian = result.data.find((g) => {
            const guardianEmail = g.correo || g.email;
            const isSameEmail =
              guardianEmail &&
              guardianEmail.toLowerCase() === values.email.toLowerCase();
            const isDifferentGuardian =
              !isEditing || g.id !== guardianToEdit?.id;
            return isSameEmail && isDifferentGuardian;
          });

          if (existingGuardian) {
            const errorMsg = `Este email ya está registrado`;
            setAsyncErrors((prev) => ({ ...prev, email: errorMsg }));
            setErrors((prev) => ({ ...prev, email: errorMsg }));
            setTouched((prev) => ({ ...prev, email: true }));
          } else {
            setAsyncErrors((prev) => ({ ...prev, email: null }));
            // Solo limpiar el error si es un error de duplicado
            if (errors.email && errors.email.includes("ya está registrado")) {
              setErrors((prev) => ({ ...prev, email: "" }));
            }
          }
        }
      } catch (error) {
        console.error("Error verificando email:", error);
      } finally {
        setCheckingEmail(false);
      }
    };

    // Debounce de 500ms
    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [values.email, isEditing, guardianToEdit?.id, setErrors, setTouched]);

  useEffect(() => {
    if (isOpen && isEditing && guardianToEdit) {
      setValues({
        nombreCompleto: guardianToEdit.nombreCompleto || "",
        documentTypeId: guardianToEdit.documentTypeId || "",
        identification:
          guardianToEdit.identificacion || guardianToEdit.identification || "",
        email: guardianToEdit.correo || guardianToEdit.email || "",
        phoneNumber:
          guardianToEdit.telefono || guardianToEdit.phoneNumber || "",
        address: guardianToEdit.address || guardianToEdit.direccion || "",
        fechaNacimiento:
          guardianToEdit.fechaNacimiento || guardianToEdit.birthDate || "",
        estado: guardianToEdit.estado || "Activo",
      });
    } else if (isOpen && !isEditing) {
      setValues({
        nombreCompleto: "",
        documentTypeId: "",
        identification: "",
        email: "",
        phoneNumber: "",
        address: "",
        fechaNacimiento: "",
        estado: "Activo",
      });
      setAsyncErrors({});
    }
  }, [isOpen, isEditing, guardianToEdit, setValues]);

  const handleSubmit = async () => {
    console.log("🔵 [GuardianModal] Valores actuales:", values);

    const allTouched = {};
    Object.keys(guardianValidationRules).forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);

    const isValid = validateAllFields();
    console.log("🔵 [GuardianModal] Errores:", JSON.stringify(errors, null, 2));
    // Verificar si hay errores asíncronos
    const hasAsyncErrors = Object.values(asyncErrors).some(
      (error) => error !== null && error !== "",
    );

    if (!isValid || hasAsyncErrors) {
      console.log("❌ [GuardianModal] Campos con error:");
      Object.keys(errors).forEach((key) => {
        if (errors[key]) {
        }
      });
      if (hasAsyncErrors) {
        Object.keys(asyncErrors).forEach((key) => {
          if (asyncErrors[key]) {
          }
        });
      }
      return;
    }
    if (isEditing) {
      const confirm = await showConfirmAlert(
        "¿Actualizar?",
        `Actualizar datos de ${guardianToEdit.nombreCompleto}`,
        { confirmButtonText: "Sí, actualizar", cancelButtonText: "Cancelar" },
      );
      if (!confirm.isConfirmed) return;
    }

    try {
      const dataToSend = {
        nombreCompleto: values.nombreCompleto.trim(),
        documentTypeId: parseInt(values.documentTypeId), // Enviar el ID como número
        identification: values.identification.trim(), // ✅ En inglés
        email: values.email.trim(), // ✅ En inglés
        phoneNumber: values.phoneNumber, // ✅ En inglés
        address: values.address.trim(), // ✅ Dirección
        birthDate: values.fechaNacimiento, // ✅ En inglés
      };
      console.log("📅 Fecha de nacimiento:", values.fechaNacimiento);
      if (isEditing) {
        const updated = await onUpdate({
          ...dataToSend,
          id: guardianToEdit.id,
        });
        if (updated) {
          showSuccessAlert(
            "Actualizado",
            "Acudiente actualizado exitosamente.",
          );
          resetForm();
          onClose();
        }
      } else {
        const saved = await onSave(dataToSend);
        if (saved) {
          showSuccessAlert("Creado", "Acudiente creado correctamente.");
          resetForm();
          onClose();
          return saved;
        }
      }
    } catch (err) {
      console.error(err);
      showErrorAlert("Error", "Ocurrió un error al guardar el acudiente.");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;
  console.log("🟢 [GuardianModal] onSave existe?", typeof onSave);
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
            onClick={handleClose}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            {isEditing ? "Editar Acudiente" : "Crear Acudiente"}
          </h2>
          {isEditing && (
            <p className="text-center text-gray-600 mt-2">
              Modificando información de:{" "}
              <span className="font-semibold text-primary-purple">
                {guardianToEdit.nombreCompleto}
              </span>
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Tipo Documento */}
            <FormField
              label="Tipo de Documento"
              name="documentTypeId"
              type="select"
              placeholder="Seleccionar tipo de documento"
              required
              options={referenceData?.documentTypes || []}
              value={values.documentTypeId}
              error={errors.documentTypeId}
              touched={touched.documentTypeId}
              onChange={handleChange}
              onBlur={handleBlur}
              delay={0.1}
            />

            {/* Identificación con validación por tipo de documento */}
            <DocumentField
              documentType={
                (referenceData?.documentTypes || []).find(
                  (dt) => dt.id === parseInt(values.documentTypeId),
                )?.label
              }
              value={values.identification}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.identification || asyncErrors.identification}
              touched={touched.identification}
              required
              label="Número de Documento"
              name="identification"
            />

            <FormField
              label="Nombre Completo"
              name="nombreCompleto"
              type="text"
              placeholder="Nombre completo del acudiente"
              value={values.nombreCompleto}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombreCompleto}
              touched={touched.nombreCompleto}
              required
              delay={0.3}
            />

            <FormField
              label="Correo Electrónico"
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email || asyncErrors.email}
              touched={touched.email}
              required
              delay={0.4}
            />

            <FormField
              label="Número Telefónico"
              name="phoneNumber"
              type="text"
              placeholder="Número de teléfono"
              value={values.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phoneNumber}
              touched={touched.phoneNumber}
              required
              delay={0.5}
            />

            <FormField
              label="Dirección"
              name="address"
              type="text"
              placeholder="Dirección de residencia"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.address}
              touched={touched.address}
              required
              delay={0.6}
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
              required
              minAge={18}
              maxAge={100}
              delay={0.6}
            />

            {/* Estado - Solo visible en modo editar */}
            {isEditing && (
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
                required
                delay={0.7}
              />
            )}
          </div>
        </div>

        {/* Footer */}
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
              onClick={() => {
                handleSubmit();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              {isEditing ? "Actualizar Acudiente" : "Crear Acudiente"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GuardianModal;
