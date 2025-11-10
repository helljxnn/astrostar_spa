import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // 1. Importar useNavigate
import { FaTimes, FaCamera } from "react-icons/fa";
import { FormField } from "../../../shared/components/FormField";
import { useFormUserValidation, userValidationRules } from "../../dashboard/pages/Admin/pages/Users/hooks/useFormUserValidation";
import apiClient from "../../../shared/services/apiClient";
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from "../../../shared/utils/alerts";
import { useAuth } from "../../../shared/contexts/authContext"; // Importamos el hook de autenticación
const EditProfileModal = ({ isOpen, onClose, onSave }) => {
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
        { // Campos alineados con el backend
            firstName: "",
            middleName: "",
            lastName: "",
            secondLastName: "",
            email: "",
            phoneNumber: "",
            address: "",
            birthDate: "",
            identification: "",
            documentType: "",
            age: "",
            rol: "", // Se mantiene para evitar errores, pero no se envía
            estado: "", // Se mantiene para evitar errores, pero no se envía
        },
        userValidationRules
    );

    const { user } = useAuth(); // Obtenemos el usuario directamente del contexto
    const [documentTypes, setDocumentTypes] = useState([]);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate(); // 2. Instanciar useNavigate

    useEffect(() => {
        // Ahora el efecto depende del 'user' del contexto y de 'isOpen'
        // Se ejecutará cada vez que el modal se abra o los datos del usuario cambien.
        if (isOpen && user) {
            const fetchDocumentTypes = async () => {
                try {
                    const response = await apiClient.get('/auth/documentType');
                    if (response.success && Array.isArray(response.data)) {
                        const formattedTypes = response.data.map(doc => ({
                            value: doc.id, // Asumiendo que el backend devuelve 'id'
                            label: doc.name, // Asumiendo que el backend devuelve 'name'
                        }));
                        setDocumentTypes(formattedTypes);
                    }
                } catch (error) {
                    console.error("Error al cargar los tipos de documento:", error);
                    showErrorAlert("Error", "No se pudieron cargar los tipos de documento.");
                }
            };

            fetchDocumentTypes();

            // Mapeo de los datos del usuario a los campos del formulario
            setValues({
                firstName: user?.firstName || "",
                middleName: user?.middleName || "",
                lastName: user?.lastName || "",
                secondLastName: user?.secondLastName || "",
                email: user?.email || "",
                phoneNumber: user?.phoneNumber || "",
                address: user?.address || "",
                birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
                identification: user?.identification || "",
                documentType: user?.documentType?.id || "",
                age: user?.age || "",
                rol: user?.role?.name || "",
                estado: user?.status || "Activo",
            });
            setAvatarPreview(user?.avatar || null);
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

    const handleRequestPasswordChange = () => {
        onClose(); // Cerramos el modal actual
        navigate('/forgot-password'); // 3. Redirigimos al usuario
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
                // Excluimos campos que el usuario no debería poder editar directamente.
                const { rol, estado, age, ...dataToSave } = values;

                // Lógica para el avatar (simulada, adaptar a tu backend de subida de archivos)
                if (avatarPreview && avatarPreview !== user.avatar) {
                    dataToSave.avatar = avatarPreview;
                }

                // Llamada a la API para actualizar el perfil
                const response = await apiClient.put(`/auth/updateProfile/${user.id}`, dataToSave);

                if (response.success) {
                    showSuccessAlert("¡Perfil Actualizado!", "Tu información ha sido guardada correctamente.");
                    if (onSave) onSave({ ...user, ...dataToSave }); // Opcional: notificar al componente padre
                } else {
                    showErrorAlert("Error", response.message || "No se pudo actualizar tu perfil.");
                }
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
                                src={avatarPreview || `https://ui-avatars.com/api/?name=${user?.firstName?.[0] || 'U'}&background=random&size=128`}
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
                            name="firstName"
                            type="text"
                            placeholder="Tu nombre"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.firstName}
                            touched={touched.firstName}
                            required
                        />
                        <FormField
                            label="Segundo Nombre"
                            name="middleName"
                            type="text"
                            placeholder="Tu segundo nombre (opcional)"
                            value={values.middleName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.middleName}
                            touched={touched.middleName}
                        />
                        <FormField
                            label="Primer Apellido"
                            name="lastName"
                            type="text"
                            placeholder="Tu apellido"
                            value={values.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.lastName}
                            touched={touched.lastName}
                            required
                        />
                        <FormField
                            label="Segundo Apellido"
                            name="secondLastName"
                            type="text"
                            placeholder="Tu segundo apellido (opcional)"
                            value={values.secondLastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.secondLastName}
                            touched={touched.secondLastName}
                        />
                        <FormField
                            label="Tipo de documento"
                            name="documentType"
                            type="select"
                            options={documentTypes}
                            value={values.documentType}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.documentType}
                            touched={touched.documentType}
                            required
                        />
                        <FormField
                            label="Número de documento"
                            name="identification"
                            type="text"
                            placeholder="Tu número de documento"
                            value={values.identification}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.identification}
                            touched={touched.identification}
                            required
                        />
                        <FormField
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            placeholder="tu.correo@ejemplo.com"
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
                            placeholder="Tu número de teléfono"
                            value={values.phoneNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.phoneNumber}
                            touched={touched.phoneNumber}
                            required
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleRequestPasswordChange} // 4. Usar el nuevo manejador
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
            </motion.div>
        </motion.div>
    );
};

export default EditProfileModal;