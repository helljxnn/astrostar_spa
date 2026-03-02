import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { DocumentField } from "../../../../../../../../shared/components/DocumentField";
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "../../../../../../../../shared/utils/alerts";
import { useFormGuardianValidation, guardianValidationRules } from "../hooks/useFormGuardianValidation";
import GuardiansService from "../services/GuardiansService";
import { toDateInputFormat, toISOString, calculateAge } from "../../../../../../../../shared/utils/dateUtils";

const states = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

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
  const [guardianAge, setGuardianAge] = useState(null);

  // ELIMINADA: Función calculateAge local - ahora se usa desde dateUtils

  
  const { values, errors, touched, handleChange: hookHandleChange, handleBlur, validateAllFields, resetForm, setTouched, setValues, setErrors } =
    useFormGuardianValidation(
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
      guardianValidationRules
    );

  // Wrapper para asegurar que siempre se llame con 2 parámetros - V3 FINAL
  const handleChange = function(nameOrEvent, value) {
    console.log('✅✅✅ WRAPPER V3 EJECUTÁNDOSE', nameOrEvent, value);
    if (typeof nameOrEvent === 'string') {
      // Ya viene con 2 parámetros
      hookHandleChange(nameOrEvent, value);
    } else if (nameOrEvent?.target) {
      // Es un evento, extraer name y value
      const { name, value: val } = nameOrEvent.target;
      hookHandleChange(name, val);
    }
  };
  
  console.log('🎯🎯🎯 handleChange.length:', handleChange.length);



  // Validación instantánea de documento
  useEffect(() => {
    const checkDocument = async () => {
      if (!values.identification || values.identification.length < 6) {
        setAsyncErrors(prev => ({ ...prev, identification: null }));
        return;
      }

      setCheckingDocument(true);
      try {
        // Obtener todos los acudientes
        const result = await GuardiansService.getAll();
        
        if (result.success) {
          // Buscar si existe un acudiente con el mismo documento
          const existingGuardian = result.data.find(g => {
            const guardianId = g.identificacion || g.identification;
            const isSameDocument = guardianId && guardianId.toLowerCase() === values.identification.toLowerCase();
            const isDifferentGuardian = !isEditing || g.id !== guardianToEdit?.id;
            return isSameDocument && isDifferentGuardian;
          });

          if (existingGuardian) {
            const errorMsg = `Este documento ya está registrado`;
            setAsyncErrors(prev => ({ ...prev, identification: errorMsg }));
            setErrors(prev => ({ ...prev, identification: errorMsg }));
            setTouched(prev => ({ ...prev, identification: true }));
          } else {
            setAsyncErrors(prev => ({ ...prev, identification: null }));
            // Solo limpiar el error si es un error de duplicado
            setErrors(prev => {
              if (prev.identification && prev.identification.includes('ya está registrado')) {
                const { identification, ...rest } = prev;
                return rest;
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Error verificando documento:', error);
      } finally {
        setCheckingDocument(false);
      }
    };

    // Debounce de 500ms
    const timeoutId = setTimeout(checkDocument, 500);
    return () => clearTimeout(timeoutId);
  }, [values.identification, isEditing, guardianToEdit?.id]); // ✅ Removidas dependencias problemáticas

  // ❌ VALIDACIÓN DE EMAIL ELIMINADA PARA ACUDIENTES
  // Los acudientes pueden compartir email con deportistas o entre ellos
  // porque no tienen credenciales de acceso al sistema

  // Validación instantánea de edad del acudiente (debe ser mayor de 18 años)
  useEffect(() => {
    if (!values.fechaNacimiento) {
      setGuardianAge(null);
      setAsyncErrors(prev => ({ ...prev, fechaNacimiento: null }));
      return;
    }

    // Marcar como touched INMEDIATAMENTE cuando hay una fecha
    setTouched(prev => ({ ...prev, fechaNacimiento: true }));

    const age = calculateAge(values.fechaNacimiento);
    setGuardianAge(age);

    if (age !== null && age < 18) {
      const errorMsg = "El acudiente debe ser mayor de 18 años";
      setAsyncErrors(prev => ({ ...prev, fechaNacimiento: errorMsg }));
      setErrors(prev => ({ ...prev, fechaNacimiento: errorMsg }));
    } else {
      setAsyncErrors(prev => ({ ...prev, fechaNacimiento: null }));
      // Solo limpiar el error si es un error de edad
      setErrors(prev => {
        if (prev.fechaNacimiento && prev.fechaNacimiento.includes('18 años')) {
          const { fechaNacimiento, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
  }, [values.fechaNacimiento]); // ✅ Removida dependencia problemática

  useEffect(() => {
    if (isOpen && isEditing && guardianToEdit) {
      const birthDateRaw = guardianToEdit.fechaNacimiento || guardianToEdit.birthDate || "";
      const birthDate = toDateInputFormat(birthDateRaw);
      
      const newValues = {
        nombreCompleto: guardianToEdit.nombreCompleto || "",
        documentTypeId: guardianToEdit.documentTypeId || "",
        identification: guardianToEdit.identificacion || guardianToEdit.identification || "",
        email: guardianToEdit.correo || guardianToEdit.email || "",
        phoneNumber: guardianToEdit.telefono || guardianToEdit.phoneNumber || "",
        address: guardianToEdit.address || guardianToEdit.direccion || "",
        fechaNacimiento: birthDate,
        estado: guardianToEdit.estado || "Activo",
      };
      
      // Calcular errores iniciales con los valores cargados
      const initialErrors = {};
      Object.keys(guardianValidationRules).forEach((fieldName) => {
        const rules = guardianValidationRules[fieldName];
        if (rules) {
          for (const rule of rules) {
            const error = rule(newValues[fieldName], newValues);
            if (error) {
              initialErrors[fieldName] = error;
              break;
            }
          }
        }
      });
      
      // Establecer valores, touched y errores AL MISMO TIEMPO
      setValues(newValues);
      setTouched({
        nombreCompleto: true,
        documentTypeId: true,
        identification: true,
        email: true,
        phoneNumber: true,
        address: true,
        fechaNacimiento: true,
        estado: true,
      });
      setErrors(initialErrors);
      
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
      setErrors({});
      setTouched({});
    }
  }, [isOpen, isEditing, guardianToEdit, setValues, setTouched, setErrors]);

  const handleSubmit = async () => {
    console.log("🔵 [GuardianModal] handleSubmit ejecutado");
    console.log("🔵 [GuardianModal] Valores actuales:", values);
    
    const allTouched = {};
    Object.keys(guardianValidationRules).forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    
    const isValid = validateAllFields();
    console.log("🔵 [GuardianModal] Validación:", isValid);
    console.log("🔵 [GuardianModal] Errores:", JSON.stringify(errors, null, 2));
    console.log("🔵 [GuardianModal] Errores asíncronos:", JSON.stringify(asyncErrors, null, 2));
    
    // Verificar si hay errores asíncronos
    const hasAsyncErrors = Object.values(asyncErrors).some(error => error !== null && error !== '');
    
    if (!isValid || hasAsyncErrors) {
      console.log("❌ [GuardianModal] Validación falló, no se puede guardar");
      console.log("❌ [GuardianModal] Campos con error:");
      Object.keys(errors).forEach(key => {
        if (errors[key]) {
          console.log(`  - ${key}: ${errors[key]}`);
        }
      });
      if (hasAsyncErrors) {
        console.log("❌ [GuardianModal] Errores de duplicados:");
        Object.keys(asyncErrors).forEach(key => {
          if (asyncErrors[key]) {
            console.log(`  - ${key}: ${asyncErrors[key]}`);
          }
        });
      }
      return;
    }
    
    console.log("✅ [GuardianModal] Validación exitosa, procediendo a guardar...");

    if (isEditing) {
      const confirm = await showConfirmAlert(
        "¿Actualizar?",
        `Actualizar datos de ${guardianToEdit.nombreCompleto}`,
        { confirmButtonText: "Sí, actualizar", cancelButtonText: "Cancelar" }
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
        birthDate: toISOString(values.fechaNacimiento), // ✅ Convertir a ISO para el backend
      };
      
      console.log('📤 Datos a enviar:', JSON.stringify(dataToSend, null, 2));
      console.log('📅 Fecha de nacimiento:', values.fechaNacimiento);
      console.log('📋 Todos los valores:', JSON.stringify(values, null, 2));

      if (isEditing) {
        const updated = await onUpdate({ ...dataToSend, id: guardianToEdit.id });
        if (updated) {
          showSuccessAlert("Actualizado", "Acudiente actualizado exitosamente.");
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
  console.log("VERSIÓN NUEVA", guardianToEdit, mode);

  console.log("🟢 [GuardianModal] Modal abierto, mode:", mode, "isEditing:", isEditing);
  console.log("🟢 [GuardianModal] onSave existe?", typeof onSave);
  console.log("🟢 [GuardianModal] referenceData:", referenceData);

  const modalContent = (
    <motion.div
      key={`guardian-modal-${isEditing ? guardianToEdit?.id || 'edit' : 'create'}`} 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
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
                  (dt) => dt.id === parseInt(values.documentTypeId)
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
              error={errors.email}
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
              error={errors.fechaNacimiento || asyncErrors.fechaNacimiento}
              touched={touched.fechaNacimiento}
              required
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
                console.log("🟡 [GuardianModal] Botón clickeado!");
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

  return createPortal(modalContent, document.body);
};

export default GuardianModal;