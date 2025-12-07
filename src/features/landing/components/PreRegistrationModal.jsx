import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { FormField } from "../../../shared/components/FormField";
import InscriptionsService from "../../dashboard/pages/Admin/pages/Athletes/Enrollments/services/InscriptionsService";

const PreRegistrationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    numeroDocumento: "",
    fechaNacimiento: "",
    telefono: "",
    correo: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newEmailError, setNewEmailError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  // Validaciones
  const validateField = (name, value) => {
    switch (name) {
      case "nombres":
        if (!value?.trim()) return "Los nombres son obligatorios";
        if (value.length < 2) return "Los nombres deben tener al menos 2 caracteres";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value)) return "Solo se permiten letras";
        return "";

      case "apellidos":
        if (!value?.trim()) return "Los apellidos son obligatorios";
        if (value.length < 2) return "Los apellidos deben tener al menos 2 caracteres";
        if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(value)) return "Solo se permiten letras";
        return "";

      case "numeroDocumento":
        if (!value?.trim()) return "El número de documento es obligatorio";
        if (value.length < 6) return "El documento debe tener al menos 6 caracteres";
        if (value.length > 20) return "El documento no puede exceder 20 caracteres";
        if (!/^[0-9A-Za-z\-]+$/.test(value)) return "Solo números, letras y guiones";
        return "";

      case "fechaNacimiento":
        if (!value) return "La fecha de nacimiento es obligatoria";
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 5) return "Debe tener al menos 5 años";
        return "";

      case "telefono":
        if (!value?.trim()) return "El teléfono es obligatorio";
        const phoneWithCode = /^\+57\s?\d{10}$/;
        const phoneWithoutCode = /^\d{10}$/;
        if (!phoneWithCode.test(value) && !phoneWithoutCode.test(value)) {
          return "Ingrese un número válido: 10 dígitos (ej: 3225658901) o con indicativo (ej: +57 3225658901)";
        }
        return "";

      case "correo":
        if (!value?.trim()) return "El correo es obligatorio";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Formato de correo inválido";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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

    // Marcar todos los campos como tocados
    const allTouched = {
      nombres: true,
      apellidos: true,
      fechaNacimiento: true,
      telefono: true,
      correo: true,
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
      const result = await InscriptionsService.create(formData);

      if (result.success) {
        setSentEmail(formData.correo);
        setShowSuccess(true);
        // Limpiar formulario
        setFormData({
          nombres: "",
          apellidos: "",
          fechaNacimiento: "",
          telefono: "",
          correo: "",
        });
        setErrors({});
        setTouched({});
      } else {
        showNotification("error", "Error al enviar la inscripción. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("error", "Error al enviar la inscripción. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewEmailChange = (value) => {
    setNewEmail(value);
    // Validar en tiempo real
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setNewEmailError("Formato de correo inválido");
    } else {
      setNewEmailError("");
    }
  };

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

    setIsResending(true);
    setNewEmailError("");

    try {
      const result = await InscriptionsService.resendEmail(newEmail);

      if (result.success) {
        setSentEmail(newEmail);
        setNewEmail("");
        showNotification("success", "¡Correo reenviado exitosamente!");
      } else {
        showNotification("error", result.error || "Error al reenviar el correo. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("error", "Error al reenviar el correo. Por favor intenta de nuevo.");
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
      nombres: "",
      apellidos: "",
      fechaNacimiento: "",
      telefono: "",
      correo: "",
    });
    setErrors({});
    setTouched({});
    setShowSuccess(false);
    setSentEmail("");
    setNewEmail("");
    setNewEmailError("");
    setNotification({ show: false, type: "", message: "" });
  };

  // Efecto para limpiar cuando se cierra el modal
  if (!isOpen) {
    // Limpiar después de que la animación de salida termine
    if (formData.nombres || formData.apellidos || formData.fechaNacimiento || formData.telefono || formData.correo || Object.keys(errors).length > 0) {
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative flex flex-col"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {!showSuccess ? (
            <>
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

              {/* Body */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6"
              >
                <div className="space-y-4">
                  <FormField
                    label="Nombres Completos"
                    name="nombres"
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => handleChange("nombres", e.target.value)}
                    onBlur={() => handleBlur("nombres")}
                    error={errors.nombres}
                    touched={touched.nombres}
                    required
                    placeholder="Ingresa tus nombres completos"
                  />

                  <FormField
                    label="Apellidos Completos"
                    name="apellidos"
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => handleChange("apellidos", e.target.value)}
                    onBlur={() => handleBlur("apellidos")}
                    error={errors.apellidos}
                    touched={touched.apellidos}
                    required
                    placeholder="Ingresa tus apellidos completos"
                  />

                  <FormField
                    label="Número de Documento"
                    name="numeroDocumento"
                    type="text"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleChange("numeroDocumento", e.target.value)}
                    onBlur={() => handleBlur("numeroDocumento")}
                    error={errors.numeroDocumento}
                    touched={touched.numeroDocumento}
                    required
                    placeholder="Ingresa tu número de documento"
                  />

                  <FormField
                    label="Fecha de Nacimiento"
                    name="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) =>
                      handleChange("fechaNacimiento", e.target.value)
                    }
                    onBlur={() => handleBlur("fechaNacimiento")}
                    error={errors.fechaNacimiento}
                    touched={touched.fechaNacimiento}
                    required
                  />

                  <FormField
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleChange("telefono", e.target.value)}
                    onBlur={() => handleBlur("telefono")}
                    error={errors.telefono}
                    touched={touched.telefono}
                    required
                    placeholder="Ej: 3001234567"
                  />

                  <FormField
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => handleChange("correo", e.target.value)}
                    onBlur={() => handleBlur("correo")}
                    error={errors.correo}
                    touched={touched.correo}
                    required
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </form>

              {/* Footer Minimalista */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#B595FF] text-white rounded-lg hover:bg-[#9b70ff] transition-all font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    "Enviar Inscripción"
                  )}
                </button>
              </div>
            </>
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
                  Hemos enviado un correo a <strong className="text-[#B595FF]">{sentEmail}</strong> con toda la información necesaria.
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
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => handleNewEmailChange(e.target.value)}
                      placeholder="Ingresa el correo correcto"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                        newEmailError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-[#B595FF]"
                      }`}
                    />
                    <button
                      onClick={handleResendEmail}
                      disabled={isResending}
                      className="px-4 py-2 bg-[#B595FF] text-white rounded-lg hover:bg-[#9b70ff] transition-all text-sm font-medium disabled:opacity-50 whitespace-nowrap"
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
