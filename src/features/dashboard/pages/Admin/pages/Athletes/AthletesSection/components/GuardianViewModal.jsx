"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { FaTimes, FaEdit, FaEye, FaTrash } from "react-icons/fa"
import { FormField } from "../../../../../../../../shared/components/FormField"
import { DocumentField } from "../../../../../../../../shared/components/DocumentField"
import { showSuccessAlert, showErrorAlert, showDeleteAlert } from "../../../../../../../../shared/utils/alerts.js"
import { useFormGuardianValidation, guardianValidationRules } from "../hooks/useFormGuardianValidation"
import { calculateAge } from "../../../../../../../../shared/utils/dateUtils"
import GuardiansService from "../services/GuardiansService"

// Mapeo de parentesco del backend (inglés) al frontend (español)
const parentescoBackendToFrontend = {
  'Mother': 'Madre',
  'Father': 'Padre',
  'Grandparent': 'Abuelo/a',
  'Uncle_Aunt': 'Tío/a',
  'Sibling': 'Hermano/a',
  'Cousin': 'Primo/a',
  'Legal_Guardian': 'Tutor/a Legal',
  'Neighbor': 'Vecino/a',
  'Family_Friend': 'Amigo/a de la familia',
  'Other': 'Otro'
};

// Función para convertir parentesco
const convertirParentesco = (parentesco) => {
  if (!parentesco) return "N/A";
  return parentescoBackendToFrontend[parentesco] || parentesco;
};

const GuardianViewModal = ({ isOpen, onClose, guardian, athletes, onEdit, onDelete, onRemove, currentAthleteId, referenceData = { documentTypes: [] } }) => {
  const [activeTab, setActiveTab] = useState("view")
  const [isProcessing, setIsProcessing] = useState(false)
  const [asyncErrors, setAsyncErrors] = useState({})
  const [checkingDocument, setCheckingDocument] = useState(false)
  
  // Log para debuggear los datos del guardian
  useEffect(() => {
    if (guardian && isOpen) {
      console.log('🔍🔍🔍 [GuardianViewModal] Guardian recibido:', guardian);
      console.log('🔍🔍🔍 [GuardianViewModal] birthDate:', guardian.birthDate);
      console.log('🔍🔍🔍 [GuardianViewModal] fechaNacimiento:', guardian.fechaNacimiento);
      console.log('🔍🔍🔍 [GuardianViewModal] Todas las propiedades:', Object.keys(guardian));
    }
  }, [guardian, isOpen]);
  
  // Hook de validación
  const { 
    values, 
    errors, 
    touched, 
    handleChange: hookHandleChange, 
    handleBlur, 
    validateAllFields, 
    setValues, 
    setTouched, 
    setErrors 
  } = useFormGuardianValidation(
    {
      nombreCompleto: "",
      documentTypeId: "",
      identification: "",
      email: "",
      phoneNumber: "",
      address: "",
      fechaNacimiento: "",
    },
    guardianValidationRules
  )

  // Wrapper para asegurar que siempre se llame con 2 parámetros
  const handleChange = (nameOrEvent, value) => {
    console.log('🎯🎯🎯 [GuardianViewModal.handleChange] nameOrEvent:', nameOrEvent, 'value:', value);
    
    if (typeof nameOrEvent === 'string') {
      // Llamada directa: handleChange('field', 'value')
      console.log('🎯 [GuardianViewModal] Llamada directa:', nameOrEvent, value);
      hookHandleChange(nameOrEvent, value);
    } else if (nameOrEvent?.target) {
      // Llamada desde evento: handleChange(event)
      const { name, value: val } = nameOrEvent.target;
      console.log('🎯 [GuardianViewModal] Llamada desde evento:', name, val);
      hookHandleChange(name, val);
    }
  }

  // Función para obtener el nombre del tipo de documento
  const getDocumentTypeName = () => {
    if (!guardian) return "N/A";
    
    // Si tiene documentTypeId, buscar en referenceData
    const docTypeId = guardian.documentTypeId || guardian.tipoDocumento;
    if (docTypeId && referenceData.documentTypes) {
      const docType = referenceData.documentTypes.find(dt => dt.id === docTypeId);
      if (docType) {
        return docType.name || docType.label;
      }
    }
    
    // Fallback: si tiene tipoDocumento como string
    if (guardian.tipoDocumento) {
      const typeMap = {
        "cedula": "Cédula de Ciudadanía",
        "tarjeta_identidad": "Tarjeta de Identidad",
        "cedula_extranjeria": "Cédula de Extranjería",
        "pasaporte": "Pasaporte"
      };
      return typeMap[guardian.tipoDocumento] || guardian.tipoDocumento;
    }
    
    // ⚠️ TEMPORAL: El backend no está enviando documentTypeId
    // Mostrar "N/A" hasta que el backend lo incluya
    return "N/A (Pendiente del backend)";
  };

  // Calcular edad del deportista actual
  const getCurrentAthleteAge = () => {
    if (!currentAthleteId || !athletes) return null;
    const currentAthlete = athletes.find(a => a.id === currentAthleteId);
    if (!currentAthlete) return null;
    
    // Buscar la fecha de nacimiento en diferentes campos posibles
    const birthDateStr = currentAthlete.birthDate || currentAthlete.fechaNacimiento;
    if (!birthDateStr) return null;
    
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Calcular si el deportista actual es menor de edad
  const isCurrentAthleteMinor = () => {
    const age = getCurrentAthleteAge();
    if (age === null) return false;
    
    console.log('🔍 [GuardianViewModal] Verificando edad:', {
      athleteId: currentAthleteId,
      age,
      isMinor: age < 18
    });
    
    return age < 18;
  };

  // Determinar si mostrar "Eliminar" o "Remover"
  const shouldShowRemove = athletes && athletes.length > 1;
  const shouldShowDelete = athletes && athletes.length === 1;

  // Validación instantánea de documento
  useEffect(() => {
    const checkDocument = async () => {
      if (!values.identification || values.identification.length < 6) {
        setAsyncErrors(prev => ({ ...prev, identification: null }));
        return;
      }

      setCheckingDocument(true);
      try {
        const result = await GuardiansService.getAll();
        
        if (result.success) {
          const existingGuardian = result.data.find(g => {
            const guardianId = g.identificacion || g.identification;
            const isSameDocument = guardianId && guardianId.toLowerCase() === values.identification.toLowerCase();
            const isDifferentGuardian = g.id !== guardian?.id;
            return isSameDocument && isDifferentGuardian;
          });

          if (existingGuardian) {
            const errorMsg = `Este documento ya está registrado`;
            setAsyncErrors(prev => ({ ...prev, identification: errorMsg }));
            setErrors(prev => ({ ...prev, identification: errorMsg }));
            setTouched(prev => ({ ...prev, identification: true }));
          } else {
            setAsyncErrors(prev => ({ ...prev, identification: null }));
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

    const timeoutId = setTimeout(checkDocument, 500);
    return () => clearTimeout(timeoutId);
  }, [values.identification, guardian?.id, setErrors, setTouched]);

  // Validación instantánea de edad del acudiente
  useEffect(() => {
    if (!values.fechaNacimiento) {
      setAsyncErrors(prev => ({ ...prev, fechaNacimiento: null }));
      return;
    }

    setTouched(prev => ({ ...prev, fechaNacimiento: true }));

    const age = calculateAge(values.fechaNacimiento);

    if (age !== null && age < 18) {
      const errorMsg = "El acudiente debe ser mayor de 18 años";
      setAsyncErrors(prev => ({ ...prev, fechaNacimiento: errorMsg }));
      setErrors(prev => ({ ...prev, fechaNacimiento: errorMsg }));
    } else {
      setAsyncErrors(prev => ({ ...prev, fechaNacimiento: null }));
      setErrors(prev => {
        if (prev.fechaNacimiento && prev.fechaNacimiento.includes('18 años')) {
          const { fechaNacimiento, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
  }, [values.fechaNacimiento, setErrors, setTouched]);

  useEffect(() => {
    if (guardian && isOpen && referenceData.documentTypes) {
      console.log('🔍 [GuardianViewModal] Cargando datos del guardian:', guardian);
      
      const nombreCompleto = guardian.nombreCompleto || 
        (guardian.firstName && guardian.lastName 
          ? `${guardian.firstName} ${guardian.lastName}`.trim() 
          : "");
      
      let documentTypeId = guardian.tipoDocumento || guardian.documentTypeId || "";
      
      if (documentTypeId && isNaN(documentTypeId)) {
        const docType = referenceData.documentTypes.find(
          dt => dt.name?.toLowerCase() === documentTypeId.toLowerCase() ||
                dt.label?.toLowerCase() === documentTypeId.toLowerCase()
        );
        if (docType) {
          documentTypeId = docType.id;
        }
      }
      
      // Obtener fecha de nacimiento - mejorado
      const birthDateRaw = guardian.fechaNacimiento || guardian.birthDate || "";
      console.log('📅 [GuardianViewModal] Fecha de nacimiento raw:', birthDateRaw);
      
      let birthDate = "";
      if (birthDateRaw) {
        try {
          // Convertir a formato YYYY-MM-DD para el input date
          const date = new Date(birthDateRaw);
          if (!isNaN(date.getTime())) {
            birthDate = date.toISOString().split('T')[0];
            console.log('📅 [GuardianViewModal] Fecha convertida:', birthDate);
          }
        } catch (error) {
          console.error('❌ Error convirtiendo fecha:', error);
        }
      }
      
      const newValues = {
        nombreCompleto: nombreCompleto,
        documentTypeId: documentTypeId,
        identification: guardian.identificacion || guardian.identification || "",
        email: guardian.correo || guardian.email || "",
        phoneNumber: guardian.telefono || guardian.phone || "",
        address: guardian.direccion || guardian.address || "",
        fechaNacimiento: birthDate,
      };
      
      console.log('✅ [GuardianViewModal] Valores cargados:', newValues);
      
      setValues(newValues);
      setAsyncErrors({});
      setErrors({});
      setTouched({});
    }
  }, [guardian, isOpen, referenceData.documentTypes, setValues, setErrors, setTouched])

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("view")
      setIsProcessing(false)
      setAsyncErrors({})
    }
  }, [isOpen])

  const handleSaveEdit = async () => {
    // Marcar todos los campos como touched
    const allTouched = {};
    Object.keys(guardianValidationRules).forEach((f) => (allTouched[f] = true));
    setTouched(allTouched);
    
    // Validar todos los campos
    const isValid = validateAllFields();
    
    // Verificar si hay errores asíncronos
    const hasAsyncErrors = Object.values(asyncErrors).some(error => error !== null && error !== '');
    
    if (!isValid || hasAsyncErrors) {
      console.log("❌ [GuardianViewModal] Validación falló");
      console.log("❌ Errores:", errors);
      console.log("❌ Errores asíncronos:", asyncErrors);
      console.log("❌ Valores actuales:", values);
      console.log("❌ isValid:", isValid);
      console.log("❌ hasAsyncErrors:", hasAsyncErrors);
      
      // Mostrar cada error específicamente
      Object.keys(errors).forEach(key => {
        if (errors[key]) {
          console.log(`❌ Error en ${key}:`, errors[key]);
        }
      });
      Object.keys(asyncErrors).forEach(key => {
        if (asyncErrors[key]) {
          console.log(`❌ Error asíncrono en ${key}:`, asyncErrors[key]);
        }
      });
      
      return;
    }

    setIsProcessing(true)
    try {
      const nameParts = values.nombreCompleto.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const updatedData = { 
        id: guardian.id,
        firstName: firstName,
        lastName: lastName,
        documentTypeId: parseInt(values.documentTypeId),
        identification: values.identification,
        phone: values.phoneNumber,
        email: values.email,
        address: values.address,
        birthDate: values.fechaNacimiento ? new Date(values.fechaNacimiento).toISOString() : null,
      };
      
      console.log('📝 [GuardianViewModal] Enviando datos al backend:', updatedData);
      
      await onEdit(updatedData)
      showSuccessAlert("Acudiente actualizado", "Los cambios se guardaron correctamente")
      setActiveTab("view")
    } catch (error) {
      console.error('❌ [GuardianViewModal] Error al guardar:', error);
      showErrorAlert("Error", error.message || "No se pudo actualizar el acudiente")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteGuardian = async () => {
    const isMinor = isCurrentAthleteMinor();
    
    // Si es menor de edad, no permitir eliminar (solo cambiar)
    if (isMinor) {
      showErrorAlert(
        "No se puede eliminar",
        "Esta deportista es menor de edad. Use 'Remover Acudiente' para cambiar a otro acudiente."
      );
      return;
    }
    
    // Si es mayor de edad, eliminar directamente
    const result = await showDeleteAlert(
      "¿Eliminar acudiente?",
      `Se eliminará a ${guardian.nombreCompleto}. Esta acción no se puede deshacer.`
    );
    
    if (result.isConfirmed) {
      setIsProcessing(true);
      try {
        await onDelete(guardian, false);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRemoveGuardian = async () => {
    const isMinor = isCurrentAthleteMinor();
    
    if (isMinor) {
      const result = await showDeleteAlert(
        "Cambiar acudiente",
        "Esta deportista es menor de edad. ¿Desea cambiar su acudiente?",
        { 
          confirmButtonText: "Sí, cambiar acudiente",
          cancelButtonText: "Cancelar"
        }
      );
      
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          await onRemove(guardian, currentAthleteId, true);
        } catch (error) {
          console.error('❌ Error cambiando acudiente:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    } else {
      const result = await showDeleteAlert(
        "¿Remover acudiente?",
        `Se removerá a ${guardian.nombreCompleto} de esta deportista. El acudiente seguirá asignado a otras deportistas.`
      );
      
      if (result.isConfirmed) {
        setIsProcessing(true);
        try {
          await onRemove(guardian, currentAthleteId, false);
        } finally {
          setIsProcessing(false);
        }
      }
    }
  };

  if (!isOpen || !guardian) return null

  const modalContent = (
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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            disabled={isProcessing}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center mb-3">
            Gestión de Acudiente
          </h2>
          <p className="text-center text-gray-600">
            <span className="font-semibold text-gray-800">{guardian.nombreCompleto}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex justify-center gap-2 p-3">
            <motion.button
              onClick={() => setActiveTab("view")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "view"
                  ? "bg-primary-blue text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
              disabled={isProcessing}
              whileHover={{ scale: activeTab === "view" ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEye size={16} />
              Ver Detalles
            </motion.button>

            <motion.button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "edit"
                  ? "bg-primary-blue text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
              disabled={isProcessing}
              whileHover={{ scale: activeTab === "edit" ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaEdit size={16} />
              Editar Acudiente
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${activeTab === "view" ? "overflow-y-auto" : ""}`}>
          <div className={`${activeTab === "view" ? "p-6" : "p-4"} space-y-4`}>
            {activeTab === "view" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Nombre Completo */}
                <motion.div
                  className="space-y-2 md:col-span-2 lg:col-span-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.nombreCompleto || 
                     (guardian.firstName && guardian.lastName 
                       ? `${guardian.firstName} ${guardian.lastName}`.trim() 
                       : "N/A")}
                  </p>
                </motion.div>

                {/* Tipo de Documento */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Tipo de Documento</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {getDocumentTypeName()}
                  </p>
                </motion.div>

                {/* Identificación */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Número de Documento</label>
                  <p className="text-gray-900 font-mono p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.identificacion || guardian.identification || "N/A"}
                  </p>
                </motion.div>

                {/* Parentesco */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Parentesco</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {athletes && athletes.length > 0 
                      ? convertirParentesco(athletes[0].parentesco)
                      : "N/A"}
                  </p>
                </motion.div>

                {/* Teléfono */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.telefono || guardian.phone || "N/A"}
                  </p>
                </motion.div>

                {/* Correo */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px] break-all">
                    {guardian.correo || guardian.email || "N/A"}
                  </p>
                </motion.div>

                {/* Dirección */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Dirección</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.direccion || guardian.address || "N/A"}
                  </p>
                </motion.div>

                {/* Fecha de Nacimiento */}
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[42px]">
                    {guardian.fechaNacimiento || guardian.birthDate 
                      ? new Date(guardian.fechaNacimiento || guardian.birthDate).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })
                      : "N/A"}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "edit" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
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
                    />
                  </div>

                  <FormField
                    label="Tipo de Documento"
                    name="documentTypeId"
                    type="select"
                    placeholder="Seleccionar tipo de documento"
                    options={referenceData.documentTypes.map((type) => ({
                      value: type.id,
                      label: type.name || type.label,
                    }))}
                    value={values.documentTypeId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.documentTypeId}
                    touched={touched.documentTypeId}
                    required
                  />

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
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-200">
                  <motion.button
                    onClick={handleSaveEdit}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? "Guardando..." : "Guardar Cambios"}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Información del Sistema */}
        {activeTab === "view" && (guardian.createdAt || guardian.updatedAt) && (
          <motion.div
            className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Información del Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {guardian.createdAt && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Fecha de Creación:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(guardian.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              )}
              {guardian.updatedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Última Actualización:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(guardian.updatedAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              )}
              {guardian.statusAssignedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Estado Asignado:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(guardian.statusAssignedAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>

    {/* Footer */}
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-between items-center">
        {/* Botón Eliminar/Remover */}
        <div>
          {shouldShowDelete && (
            <div className="relative group">
              <motion.button
                onClick={handleDeleteGuardian}
                disabled={isProcessing || (currentAthleteId && isCurrentAthleteMinor())}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isProcessing || (currentAthleteId && isCurrentAthleteMinor())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-400 text-white hover:bg-red-500'
                }`}
                whileHover={!(isProcessing || (currentAthleteId && isCurrentAthleteMinor())) ? { scale: 1.02 } : {}}
                whileTap={!(isProcessing || (currentAthleteId && isCurrentAthleteMinor())) ? { scale: 0.98 } : {}}
              >
                <FaTrash size={14} />
                {isProcessing ? "Procesando..." : "Eliminar Acudiente"}
              </motion.button>
              {currentAthleteId && isCurrentAthleteMinor() && (
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-max px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                  No se puede eliminar porque la deportista es menor de edad
                  <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          )}
          {shouldShowRemove && (
            <motion.button
              onClick={handleRemoveGuardian}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-400 text-white hover:bg-orange-500'
              }`}
              whileHover={!isProcessing ? { scale: 1.02 } : {}}
              whileTap={!isProcessing ? { scale: 0.98 } : {}}
            >
              <FaTrash size={14} />
              {isProcessing ? "Procesando..." : "Remover Acudiente"}
            </motion.button>
          )}
        </div>

        {/* Botón Cerrar */}
        <motion.button
          onClick={onClose}
          disabled={isProcessing}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Cerrar
        </motion.button>
      </div>
    </div>
  </motion.div>
</motion.div>
  )

  return createPortal(modalContent, document.body)
}

export default GuardianViewModal