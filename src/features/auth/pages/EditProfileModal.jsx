import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { FormField } from "../../../shared/components/FormField";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../../../shared/utils/alerts.js";
import ChangePasswordModal from "./ChangePasswordModal";
import EmailVerificationModal from "./EmailVerificationModal";
import apiClient from "../../../shared/services/apiClient";

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    correo: "",
    telefono: "",
    direccion: "",
  });
  const [originalEmail, setOriginalEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] =
    useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      const email = user.email || user.correo || "";
      setFormData({
        correo: email,
        telefono: user.phoneNumber || user.telefono || "",
        direccion: user.address || user.direccion || "",
      });
      setOriginalEmail(email);
      setErrors({});
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar correo
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Correo electrónico inválido";
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^\d{7,10}$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Teléfono inválido (7-10 dígitos)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleClose = () => {
    setFormData({
      correo: "",
      telefono: "",
      direccion: "",
    });
    setErrors({});
    onClose();
  };

  const handleRequestEmailChange = async (newEmail) => {
    try {
      const response = await apiClient.post("/auth/request-email-change", {
        newEmail,
      });

      if (!response.success) {
        showErrorAlert(
          "Error",
          response.message || "No se pudo enviar el código de verificación.",
        );
        return false;
      }

      // Mostrar modal de verificación
      setPendingEmail(newEmail);
      setIsEmailVerificationModalOpen(true);
      return true;
    } catch (error) {
      showErrorAlert(
        "Error",
        error.message || "No se pudo enviar el código. Inténtalo de nuevo.",
      );
      return false;
    }
  };

  const handleVerifyEmailCode = async (code) => {
    try {
      const verifyResponse = await apiClient.post("/auth/verify-email-change", {
        token: code,
      });

      if (!verifyResponse.success) {
        throw new Error(verifyResponse.message || "Código inválido o expirado");
      }

      // Actualizar usuario en el contexto
      if (verifyResponse.data) {
        await onSave(verifyResponse.data);
      }

      // Cerrar modal de verificación
      setIsEmailVerificationModalOpen(false);

      // Actualizar teléfono y dirección si es necesario
      try {
        await apiClient.put("/auth/profile", {
          phoneNumber: formData.telefono,
          address: formData.direccion || null,
        });
      } catch (_error) {
      }

      showSuccessAlert(
        "¡Email Actualizado!",
        "Tu correo electrónico ha sido cambiado exitosamente.",
      );
      handleClose();
    } catch (error) {
      throw error; // Re-lanzar para que el modal lo maneje
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showErrorAlert(
        "Error de validación",
        "Por favor, revisa los campos del formulario.",
      );
      return;
    }

    const emailChanged = formData.correo !== originalEmail;

    if (emailChanged) {
      // Si el email cambió, solicitar verificación
      const confirmResult = await showConfirmAlert(
        "¿Cambiar correo electrónico?",
        "Se enviará un código de verificación a tu nuevo correo.",
      );

      if (confirmResult.isConfirmed) {
        await handleRequestEmailChange(formData.correo);
      }
    } else {
      // Si el email no cambió, actualizar solo teléfono y dirección
      const confirmResult = await showConfirmAlert(
        "¿Actualizar tu perfil?",
        "Tus datos serán modificados.",
      );

      if (confirmResult.isConfirmed) {
        try {
          const response = await apiClient.put("/auth/profile", {
            phoneNumber: formData.telefono,
            address: formData.direccion || null,
          });

          if (response.success) {
            await onSave(response.data);
            showSuccessAlert(
              "¡Perfil Actualizado!",
              "Tu información ha sido guardada correctamente.",
            );
            handleClose();
          } else {
            showErrorAlert(
              "Error",
              response.message || "No se pudo actualizar tu perfil.",
            );
          }
        } catch (error) {
          showErrorAlert(
            "Error",
            error.message ||
              "No se pudo actualizar tu perfil. Inténtalo de nuevo.",
          );
        }
      }
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-4 sm:p-6 z-10">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={handleClose}
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
            Editar Perfil
          </h2>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {/* Información del usuario (solo lectura) */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Nombre Completo</p>
                <p className="text-sm font-medium text-gray-800">
                  {`${user?.firstName || ""} ${user?.middleName || ""} ${user?.lastName || ""} ${user?.secondLastName || ""}`
                    .replace(/\s+/g, " ")
                    .trim()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo de Documento</p>
                <p className="text-sm font-medium text-gray-800">
                  {user?.documentType?.name || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Número de Documento</p>
                <p className="text-sm font-medium text-gray-800">
                  {user?.identification || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rol</p>
                <p className="text-sm font-medium text-gray-800">
                  {user?.role?.name
                    ?.split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ") || "No especificado"}
                </p>
              </div>
            </div>
          </div>

          {/* Campos editables */}
          <div className="space-y-4">
            <FormField
              label="Correo Electrónico"
              name="correo"
              type="email"
              placeholder="tu.correo@ejemplo.com"
              value={formData.correo}
              onChange={handleChange}
              error={errors.correo}
              touched={true}
              required
            />
            <FormField
              label="Número Telefónico"
              name="telefono"
              type="text"
              placeholder="Tu número de teléfono"
              value={formData.telefono}
              onChange={handleChange}
              error={errors.telefono}
              touched={true}
              required
            />
            <FormField
              label="Dirección"
              name="direccion"
              type="text"
              placeholder="Tu dirección (opcional)"
              value={formData.direccion}
              onChange={handleChange}
              error={errors.direccion}
              touched={true}
            />
          </div>

          <div className="pt-6">
            <button
              onClick={handleOpenChangePasswordModal}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold shadow-md hover:scale-[1.02] transition-transform"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row justify-between gap-3">
          <motion.button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 bg-primary-purple text-white rounded-xl font-medium shadow-md hover:bg-primary-blue transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Guardar Cambios
          </motion.button>
        </div>
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          email={formData.correo}
        />

        <EmailVerificationModal
          isOpen={isEmailVerificationModalOpen}
          onClose={() => setIsEmailVerificationModalOpen(false)}
          newEmail={pendingEmail}
          onVerify={handleVerifyEmailCode}
        />
      </motion.div>
    </motion.div>
  );
};

export default EditProfileModal;

