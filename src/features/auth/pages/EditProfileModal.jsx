import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaCamera } from "react-icons/fa";
import { FormField } from "../../../shared/components/FormField";
import { useFormUserValidation, userValidationRules } from "../../dashboard/pages/Admin/pages/Users/hooks/useFormUserValidation";
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "../../../shared/utils/alerts";
import ChangePasswordModal from "./ChangePasswordModal";

const documentTypes = [
    { value: "CC", label: "Cédula de ciudadanía" },
    { value: "TI", label: "Tarjeta de identidad" },
    { value: "CE", label: "Cédula de extranjería" },
    { value: "PAS", label: "Pasaporte" },
];

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAllFields,
        resetForm,
        setValues,
    } = useFormUserValidation(
        {
            nombre: "",
            apellido: "",
            tipoDocumento: "",
            identificacion: "",
            rol: "",
            correo: "",
            telefono: "",
            estado: "",
        },
        userValidationRules
    );

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && user) {
            setValues({
                nombre: user.nombre || "",
                apellido: user.apellido || "",
                tipoDocumento: user.tipoDocumento || "",
                identificacion: user.identificacion || "",
                rol: user.rol || "",
                correo: user.correo || "",
                telefono: user.telefono || "",
                estado: user.estado || "Activo", // El estado del perfil propio suele ser Activo
            });
            setAvatarPreview(user.avatar || null);
        }
    }, [isOpen, user, setValues]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(user.avatar || null);
        }
    };

    const handleOpenChangePasswordModal = () => {
        setIsChangePasswordModalOpen(true);
    };

    const handleClose = () => {
        resetForm();
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    const handleSubmit = async () => {
        if (!validateAllFields()) {
            showErrorAlert("Error de validación", "Por favor, revisa los campos del formulario.");
            return;
        }

        const confirmResult = await showConfirmAlert(
            "¿Actualizar tu perfil?",
            "Tus datos serán modificados."
        );

        if (confirmResult.isConfirmed) {
            try {
                // Excluimos 'rol' y 'estado' de los datos a guardar, ya que no deberían ser editables por el usuario.
                const { rol, estado, ...dataToSave } = values;
                // Si hay una nueva vista previa que no es la original, la guardamos.
                // En una app real, aquí subirías la imagen y obtendrías una URL.
                // Para esta simulación, guardamos la URL en base64.
                if (avatarPreview && avatarPreview !== user.avatar) {
                    dataToSave.avatar = avatarPreview;
                }
                await onSave({ ...user, ...dataToSave });
                showSuccessAlert("¡Perfil Actualizado!", "Tu información ha sido guardada correctamente.");
                handleClose();
            } catch (error) {
                console.error("Error al actualizar el perfil:", error);
                showErrorAlert("Error", "No se pudo actualizar tu perfil. Inténtalo de nuevo.");
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
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
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                        Editar Perfil
                    </h2>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <img
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.nombre?.[0] || 'U'}&background=random&size=128`}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-primary-blue text-white p-3 rounded-full shadow-md hover:bg-primary-purple transition-colors"
                                aria-label="Cambiar foto de perfil"
                            >
                                <FaCamera />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            className="hidden"
                            accept="image/png, image/jpeg, image/gif"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Nombre"
                            name="nombre"
                            type="text"
                            placeholder="Tu nombre"
                            value={values.nombre}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.nombre}
                            touched={touched.nombre}
                            required
                        />
                        <FormField
                            label="Apellido"
                            name="apellido"
                            type="text"
                            placeholder="Tu apellido"
                            value={values.apellido}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.apellido}
                            touched={touched.apellido}
                            required
                        />
                        <FormField
                            label="Tipo de documento"
                            name="tipoDocumento"
                            type="select"
                            options={documentTypes}
                            value={values.tipoDocumento}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.tipoDocumento}
                            touched={touched.tipoDocumento}
                            required
                        />
                        <FormField
                            label="Número de documento"
                            name="identificacion"
                            type="text"
                            placeholder="Tu número de documento"
                            value={values.identificacion}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.identificacion}
                            touched={touched.identificacion}
                            required
                        />
                        <FormField
                            label="Correo Electrónico"
                            name="correo"
                            type="email"
                            placeholder="tu.correo@ejemplo.com"
                            value={values.correo}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.correo}
                            touched={touched.correo}
                            required
                        />
                        <FormField
                            label="Número Telefónico"
                            name="telefono"
                            type="text"
                            placeholder="Tu número de teléfono"
                            value={values.telefono}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.telefono}
                            touched={touched.telefono}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleOpenChangePasswordModal}
                            className="w-full h-10 rounded-xl bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold shadow-md hover:scale-[1.02] transition-transform"
                        >
                            Cambiar Contraseña</button>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4 flex justify-between">
                    <motion.button
                        type="button"
                        onClick={handleClose}
                        className="px-8 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Cancelar
                    </motion.button>
                    <motion.button
                        onClick={handleSubmit}
                        className="px-8 py-2.5 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl font-medium shadow-lg"
                        whileHover={{ scale: 1.02, boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Guardar Cambios
                    </motion.button>
                </div>
                <ChangePasswordModal
                    isOpen={isChangePasswordModalOpen}
                    onClose={() => setIsChangePasswordModalOpen(false)}
                    email={values.correo} // Pasamos el correo del usuario al modal
                />

            </motion.div>
        </motion.div>
    );
};

export default EditProfileModal;