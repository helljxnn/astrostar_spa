import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { FormField } from "../../../shared/components/FormField";
import InscriptionsService from "../../dashboard/pages/Admin/pages/Athletes/Enrollments/services/InscriptionsService";
import { useDocumentValidation } from "../../../shared/hooks/useDocumentValidation";
import { useEmailValidation } from "../../../shared/hooks/useEmailValidation";
import { useEnrollmentsContext } from "../../../shared/contexts/EnrollmentsContext";
import { toISOString } from "../../../shared/utils/dateUtils";

const PreRegistrationModal = ({ isOpen, onClose }) => {
  const { notifyNewInscription, notifyEmailUpdate } = useEnrollmentsContext();
  
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    identification: "",
    birthDate: "",
    phoneNumber: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [sentDocument, setSentDocument] = useState(""); // Guardar el documento también
  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isValidatingNewEmail, setIsValidatingNewEmail] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [cooldownTime, setCooldownTime] = useState(0);
  const [documentExists, setDocumentExists] = useState(false);

  // Hook para validación de documento en tiempo real (verifica deportistas + inscripciones)
  const {
    isChecking: isCheckingDocumentValidation,
    documentExists: documentExistsValidation,
    validationMessage: documentValidationMessage,
    validateDocumentDebounced,
    clearValidation: clearDocumentValidation,
    clearCache: clearDocumentCache,
  } = useDocumentValidation(null); // null = no excluir a nadie (es una nueva inscripción)

  // Hook para validación de email en tiempo real
  const {
    isChecking: isCheckingEmailValidation,
    emailExists: emailExistsValidation,
    validationMessage: emailValidationMessage,
    validateEmailDebounced,
    clearValidation: clearEmailValidation,
  } = useEmailValidation(null, true); // null = no excluir a nadie, true = verificar inscripciones

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        if (!value?.trim()) return "El primer nombre es obligatorio";
        if (value.length < 2) return "Debe tener al menos 2 caracteres";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "Solo se permiten letras";
        return "";

      case "middleName":
        // Segundo nombre es opcional
        if (value && value.length < 2)
          return "Debe tener al menos 2 caracteres";
        if (value && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "Solo se permiten letras";
        return "";

      case "lastName":
        if (!value?.trim()) return "El primer apellido es obligatorio";
        if (value.length < 2) return "Debe tener al menos 2 caracteres";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "Solo se permiten letras";
        return "";

      case "secondLastName":
        // Segundo apellido es opcional
        if (value && value.length < 2)
          return "Debe tener al menos 2 caracteres";
        if (value && !/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value))
          return "Solo se permiten letras";
        return "";

      case "identification":
        if (!value?.trim()) return "El número de documento es obligatorio";
        if (value.length < 6)
          return "El documento debe tener al menos 6 caracteres";
        if (value.length > 20)
          return "El documento no puede exceder 20 caracteres";
        if (!/^[0-9A-Za-z\-]+$/.test(value))
          return "Solo números, letras y guiones";
        if (documentExists) return "Este documento ya está inscrito";
        return "";

      case "birthDate":
        if (!value) return "La fecha de nacimiento es obligatoria";
        const birthDate = new Date(value);
        if (isNaN(birthDate.getTime())) {
          return "Fecha de nacimiento no válida";
        }

        const today = new Date();
        const minDate = new Date(
          today.getFullYear() - 100,
          today.getMonth(),
          today.getDate(),
        );
        const maxDate = new Date(
          today.getFullYear() - 5,
          today.getMonth(),
          today.getDate(),
        );

        if (birthDate < minDate) {
          return "La fecha de nacimiento no puede ser anterior a 100 años atrás";
        }
        if (birthDate > maxDate) {
          return "El deportista debe tener al menos 5 años de edad";
        }
        if (birthDate > today) {
          return "La fecha de nacimiento no puede ser futura";
        }
        return "";

      case "phoneNumber":
        if (!value?.trim()) return "El teléfono es obligatorio";
        const phoneWithCode = /^\+57\s?\d{10}$/;
        const phoneWithoutCode = /^\d{10}$/;
        if (!phoneWithCode.test(value) && !phoneWithoutCode.test(value)) {
          return "Ingrese un número válido: 10 dígitos (ej: 3225658901) o con indicativo (ej: +57 3225658901)";
        }
        return "";

      case "email":
        if (!value?.trim()) return "El correo es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Formato de correo inválido";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar el estado de documento existente cuando el usuario está escribiendo
    if (field === "identification") {
      setDocumentExists(false);
      clearDocumentValidation();
    }

    // Limpiar el estado de email existente cuando el usuario está escribiendo
    if (field === "email") {
      clearEmailValidation();
    }

    // Validar en tiempo real SIEMPRE (no solo cuando touched)
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));

    // Marcar como tocado automáticamente cuando el usuario empieza a escribir
    if (value && value.length > 0) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  // Limpiar caché cuando se abre el modal
  useEffect(() => {
    if (isOpen && clearDocumentCache) {
      clearDocumentCache();
    }
  }, [isOpen, clearDocumentCache]);

  // Validación en tiempo real de documento usando el hook
  useEffect(() => {
    const documento = formData.identification;

    // Solo verificar si el documento tiene al menos 6 caracteres y es válido
    if (
      documento &&
      documento.length >= 6 &&
      /^[0-9A-Za-z\-]+$/.test(documento)
    ) {
      validateDocumentDebounced(documento, 6);
    } else {
      clearDocumentValidation();
      setDocumentExists(false);
    }
  }, [
    formData.identification,
    validateDocumentDebounced,
    clearDocumentValidation,
  ]);

  // Validación en tiempo real de email usando el hook
  useEffect(() => {
    const email = formData.email;

    // Solo verificar si el email tiene formato válido
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validateEmailDebounced(email, 300);
    } else {
      clearEmailValidation();
    }
  }, [formData.email, validateEmailDebounced, clearEmailValidation]);

  // Sincronizar resultado de validación con estados locales
  useEffect(() => {
    if (documentExistsValidation) {
      setDocumentExists(true);
      const errorMessage =
        documentValidationMessage || "Este documento ya está registrado";
      setErrors((prev) => ({ ...prev, identification: errorMessage }));
      setTouched((prev) => ({ ...prev, identification: true }));
    } else if (
      !isCheckingDocumentValidation &&
      formData.identification.length >= 6
    ) {
      setDocumentExists(false);
      // Solo actualizar error si el campo ya fue tocado
      if (touched.identification) {
        const validationError = validateField(
          "identification",
          formData.identification,
        );
        setErrors((prev) => ({ ...prev, identification: validationError }));
      }
    }
  }, [
    isCheckingDocumentValidation,
    documentExistsValidation,
    documentValidationMessage,
    formData.identification,
    touched.identification,
  ]);

  // Sincronizar resultado de validación de email
  useEffect(() => {
    if (emailExistsValidation) {
      const errorMessage =
        emailValidationMessage || "Este email ya está registrado";
      setErrors((prev) => ({ ...prev, email: errorMessage }));
      setTouched((prev) => ({ ...prev, email: true }));
    } else if (
      !isCheckingEmailValidation &&
      formData.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      // Solo actualizar error si el campo ya fue tocado
      if (touched.email) {
        const validationError = validateField("email", formData.email);
        setErrors((prev) => ({ ...prev, email: validationError }));
      }
    }
  }, [
    isCheckingEmailValidation,
    emailExistsValidation,
    emailValidationMessage,
    formData.email,
    touched.email,
  ]);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // NO validar los campos identification y email en blur porque ya tienen validación en tiempo real
    // Si los validamos aquí, sobrescribe el mensaje correcto del hook
    if (field === "identification" || field === "email") {
      return; // El hook ya maneja la validación de estos campos
    }

    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar cooldown
    if (cooldownTime > 0) {
      showNotification(
        "error",
        `Por favor espera ${cooldownTime} segundos antes de enviar otra inscripción.`,
      );
      return;
    }

    // Marcar todos los campos como tocados
    const allTouched = {
      firstName: true,
      middleName: true,
      lastName: true,
      secondLastName: true,
      identification: true,
      birthDate: true,
      phoneNumber: true,
      email: true,
    };
    setTouched(allTouched);

    // Validar todos los campos
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    // Si hay errores, no enviar
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir la fecha a ISO antes de enviar
      const dataToSend = {
        ...formData,
        birthDate: toISOString(formData.birthDate),
      };
      
      const result = await InscriptionsService.create(dataToSend);

      if (result.success) {
        setSentEmail(formData.email);
        setSentDocument(formData.identification); // Guardar el documento también
        setShowSuccess(true);
        
        // 🚀 NOTIFICAR INMEDIATAMENTE: Agregar la inscripción al estado local
        // console.log("📢 [PreRegistrationModal] Nueva inscripción creada:", result.data);
        // console.log("📢 [PreRegistrationModal] Notificando al contexto...");
        
        // Asegurar que la inscripción tenga todos los campos necesarios
        const newInscription = {
          id: result.data?.id || crypto.randomUUID(),
          firstName: formData.firstName,
          middleName: formData.middleName || "",
          lastName: formData.lastName,
          secondLastName: formData.secondLastName || "",
          identification: formData.identification,
          birthDate: dataToSend.birthDate,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          status: "PENDING",
          estado: "PENDIENTE",
          createdAt: new Date().toISOString(),
          ...result.data, // Sobrescribir con datos del backend si existen
        };
        
        // console.log("📢 [PreRegistrationModal] Datos de inscripción a notificar:", newInscription);
        notifyNewInscription(newInscription);
        // console.log("✅ [PreRegistrationModal] Notificación enviada");
        
        // Iniciar cooldown de 60 segundos
        setCooldownTime(60);
        const cooldownInterval = setInterval(() => {
          setCooldownTime((prev) => {
            if (prev <= 1) {
              clearInterval(cooldownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Limpiar formulario
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          secondLastName: "",
          identification: "",
          birthDate: "",
          phoneNumber: "",
          email: "",
        });
        setErrors({});
        setTouched({});
      } else {
        showNotification(
          "error",
          "Error al enviar la inscripción. Por favor intenta de nuevo.",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        "error",
        "Error al enviar la inscripción. Por favor intenta de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewEmailChange = (value) => {
    setNewEmail(value);
    
    // Validar formato en tiempo real
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setNewEmailError("Formato de correo inválido");
      return;
    }
    
    // Limpiar error de formato si es válido
    if (!value || value.includes('@')) {
      setNewEmailError("");
    }
  };
  
  // Validación con debounce para el nuevo email
  useEffect(() => {
    if (!newEmail || !newEmail.includes('@')) {
      setIsValidatingNewEmail(false);
      return;
    }
    
    // Validar formato primero
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setIsValidatingNewEmail(false);
      return;
    }
    
    // console.log('🔍 [PreRegistrationModal] Validando nuevo email:', newEmail);
    setIsValidatingNewEmail(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        // console.log('🔍 [PreRegistrationModal] Verificando email en inscripciones y deportistas...');
        
        // Verificar en inscripciones pendientes
        const inscriptionResult = await InscriptionsService.checkEmailExists(newEmail);
        // console.log('🔍 [PreRegistrationModal] Resultado inscripciones:', inscriptionResult);
        
        if (inscriptionResult.exists) {
          console.log('❌ [PreRegistrationModal] Email ya existe en inscripciones');
          setNewEmailError("Este correo ya está en otra inscripción pendiente");
          setIsValidatingNewEmail(false);
          return;
        }
        
        // Verificar en deportistas matriculados
        const AthletesService = (await import("../../dashboard/pages/Admin/pages/Athletes/AthletesSection/services/AthletesService.js")).default;
        const athleteResult = await AthletesService.checkEmailAvailability(newEmail, null);
        // console.log('🔍 [PreRegistrationModal] Resultado deportistas:', athleteResult);
        
        if (!athleteResult.available) {
          console.log('❌ [PreRegistrationModal] Email ya existe en deportistas');
          setNewEmailError("Este correo ya está registrado como deportista");
          setIsValidatingNewEmail(false);
          return;
        }
        
        console.log('✅ [PreRegistrationModal] Email disponible');
        setNewEmailError("");
      } catch (error) {
        console.error("❌ [PreRegistrationModal] Error validando email:", error);
        console.error("❌ [PreRegistrationModal] Stack:", error.stack);
        setNewEmailError("");
      } finally {
        setIsValidatingNewEmail(false);
      }
    }, 500); // 500ms de debounce
    
    return () => {
      clearTimeout(timeoutId);
      setIsValidatingNewEmail(false);
    };
  }, [newEmail]);

  const handleResendEmail = async () => {
    // Validar nuevo email
    if (!newEmail.trim()) {
      setNewEmailError("El correo es obligatorio");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setNewEmailError("Formato de correo inválido");
      return;
    }
    
    // Validar que el email no esté duplicado antes de enviar
    try {
      // console.log('🔍 [handleResendEmail] Validando email antes de reenviar...');
      
      // Verificar en inscripciones pendientes
      const inscriptionResult = await InscriptionsService.checkEmailExists(newEmail);
      if (inscriptionResult.exists) {
        setNewEmailError("Este correo ya está en otra inscripción pendiente");
        return;
      }
      
      // Verificar en deportistas matriculados
      const AthletesService = (await import("../../dashboard/pages/Admin/pages/Athletes/AthletesSection/services/AthletesService.js")).default;
      const athleteResult = await AthletesService.checkEmailAvailability(newEmail, null);
      if (!athleteResult.available) {
        setNewEmailError("Este correo ya está registrado como deportista");
        return;
      }
    } catch (error) {
      console.error("Error validando email:", error);
      // Continuar con el envío si hay error en la validación
    }

    setIsResending(true);
    setNewEmailError("");

    try {
      // Enviar email Y documento para que el backend pueda buscar correctamente
      const result = await InscriptionsService.resendEmail(
        newEmail,
        sentDocument,
      );

      if (result.success) {
        setSentEmail(newEmail);
        setNewEmail("");
        
        // 🚀 NOTIFICAR INMEDIATAMENTE: Actualizar el email en el estado local
        console.log("📢 [PreRegistrationModal] Notificando actualización de email:", { sentDocument, newEmail });
        notifyEmailUpdate(sentDocument, newEmail);
        
        showNotification("success", "¡Correo reenviado exitosamente!");
      } else {
        showNotification(
          "error",
          result.error ||
            "Error al reenviar el correo. Por favor intenta de nuevo.",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        "error",
        "Error al reenviar el correo. Por favor intenta de nuevo.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleCloseSuccess = () => {
    resetFormData();
    onClose();
  };

  const handleClose = () => {
    resetFormData();
    onClose();
  };

  // Limpiar formulario cuando se cierra el modal
  const resetFormData = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      identification: "",
      birthDate: "",
      phoneNumber: "",
      email: "",
    });
    setErrors({});
    setTouched({});
    setShowSuccess(false);
    setSentEmail("");
    setSentDocument(""); // Limpiar también el documento
    setNewEmail("");
    setNewEmailError("");
    setNotification({ show: false, type: "", message: "" });
    setDocumentExists(false);
  };

  // Efecto para limpiar cuando se cierra el modal
  if (!isOpen) {
    // Limpiar después de que la animación de salida termine
    if (
      formData.firstName ||
      formData.middleName ||
      formData.lastName ||
      formData.secondLastName ||
      formData.identification ||
      formData.birthDate ||
      formData.phoneNumber ||
      formData.email ||
      Object.keys(errors).length > 0
    ) {
      setTimeout(resetFormData, 300);
    }
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Notificación Toast */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 z-[60] px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <FaCheckCircle size={20} className="text-green-600" />
              ) : (
                <FaTimes size={20} className="text-red-600" />
              )}
              <span className="font-medium">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative flex"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {!showSuccess ? (
            <div className="flex w-full">
              {/* Left Side - Form */}
              <div className="w-full lg:w-1/2 flex flex-col">
                {/* Header Minimalista */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                  <button
                    className="absolute top-4 right-4 text-gray-300 hover:text-gray-400 transition-colors"
                    onClick={handleClose}
                  >
                    <FaTimes size={20} />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 text-center">
                    Inscripción
                  </h2>
                </div>

                {/* Body con scroll */}
                <div className="flex-1 overflow-y-auto">
                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                      {/* Nombres y Apellidos en Grid 2x2 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Primer Nombre"
                          name="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleChange("firstName", e.target.value)
                          }
                          onBlur={() => handleBlur("firstName")}
                          error={errors.firstName}
                          touched={touched.firstName}
                          required
                        />

                        <FormField
                          label="Segundo Nombre"
                          name="middleName"
                          type="text"
                          value={formData.middleName}
                          onChange={(e) =>
                            handleChange("middleName", e.target.value)
                          }
                          onBlur={() => handleBlur("middleName")}
                          error={errors.middleName}
                          touched={touched.middleName}
                          placeholder="Opcional"
                        />

                        <FormField
                          label="Primer Apellido"
                          name="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleChange("lastName", e.target.value)
                          }
                          onBlur={() => handleBlur("lastName")}
                          error={errors.lastName}
                          touched={touched.lastName}
                          required
                        />

                        <FormField
                          label="Segundo Apellido"
                          name="secondLastName"
                          type="text"
                          value={formData.secondLastName}
                          onChange={(e) =>
                            handleChange("secondLastName", e.target.value)
                          }
                          onBlur={() => handleBlur("secondLastName")}
                          error={errors.secondLastName}
                          touched={touched.secondLastName}
                          placeholder="Opcional"
                        />
                      </div>

                      {/* Resto de campos en columna única */}
                      <FormField
                        label="Número de Documento"
                        name="identification"
                        type="text"
                        value={formData.identification}
                        onChange={(e) =>
                          handleChange("identification", e.target.value)
                        }
                        onBlur={() => handleBlur("identification")}
                        error={errors.identification}
                        touched={touched.identification}
                        required
                        isLoading={isCheckingDocumentValidation}
                      />

                      <FormField
                        label="Fecha de Nacimiento"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          handleChange("birthDate", e.target.value)
                        }
                        onBlur={() => handleBlur("birthDate")}
                        error={errors.birthDate}
                        touched={touched.birthDate}
                        required
                        minAge={5}
                        maxAge={100}
                      />

                      <FormField
                        label="Teléfono"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleChange("phoneNumber", e.target.value)
                        }
                        onBlur={() => handleBlur("phoneNumber")}
                        error={errors.phoneNumber}
                        touched={touched.phoneNumber}
                        required
                      />

                      <FormField
                        label="Correo Electrónico"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        error={errors.email}
                        touched={touched.email}
                        required
                        isLoading={isCheckingEmailValidation}
                      />
                    </div>
                  </form>
                </div>

                {/* Footer Minimalista */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      cooldownTime > 0 ||
                      documentExists ||
                      emailExistsValidation ||
                      isCheckingDocumentValidation ||
                      isCheckingEmailValidation
                    }
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B595FF] text-white rounded-lg hover:bg-[#9b70ff] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : cooldownTime > 0 ? (
                      `Espera ${cooldownTime}s para enviar otra inscripción`
                    ) : documentExists ? (
                      "Documento ya inscrito"
                    ) : emailExistsValidation ? (
                      "Email ya registrado"
                    ) : (
                      "Enviar Inscripción"
                    )}
                  </button>
                </div>
              </div>

              {/* Right Side - Image (hidden on mobile) */}
              <div className="hidden lg:block lg:w-1/2 relative">
                <img
                  src="/assets/images/Foundation/team/Eliana_Jiménez.jpg"
                  alt="Únete a la Fundación"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#B595FF]/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h3 className="text-3xl font-bold mb-2">¡Únete a Nosotros!</h3>
                  <p className="text-lg">Fundación Manuela Vanegas</p>
                </div>
              </div>
            </div>
          ) : (
            /* Success Message */
            <div className="p-8">
              <button
                className="absolute top-4 right-4 text-gray-300 hover:text-gray-400 transition-colors"
                onClick={handleCloseSuccess}
              >
                <FaTimes size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="bg-green-500 rounded-full p-4 inline-block mb-4">
                  <FaCheckCircle className="text-white" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Inscripción Exitosa!
                </h3>
                <p className="text-gray-600 mb-4">
                  Hemos enviado un correo a{" "}
                  <strong className="text-[#B595FF]">{sentEmail}</strong> con
                  toda la información necesaria.
                </p>
                <p className="text-sm text-gray-500">
                  Por favor revisa tu bandeja de entrada y spam.
                </p>
              </div>

              {/* Reenviar correo */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-3 font-medium">
                  ¿No recibiste el correo o está incorrecto?
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => handleNewEmailChange(e.target.value)}
                        placeholder="Ingresa el correo correcto"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                          newEmailError
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-[#B595FF]"
                        }`}
                      />
                      {isValidatingNewEmail && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-[#B595FF] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleResendEmail}
                      disabled={isResending || !!newEmailError || !newEmail.trim() || isValidatingNewEmail}
                      className="px-4 py-2 bg-[#B595FF] text-white rounded-lg hover:bg-[#9b70ff] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isResending ? "Enviando..." : "Reenviar"}
                    </button>
                  </div>
                  {newEmailError && (
                    <p className="text-red-500 text-xs">{newEmailError}</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
              >
                Cerrar
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PreRegistrationModal;

