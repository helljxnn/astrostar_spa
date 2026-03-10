import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { showSuccessAlert, showErrorAlert } from '../../../shared/utils/alerts.js';
import apiClient from '../../../shared/services/apiClient';

const ChangePasswordModal = ({ isOpen, onClose, email }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState(null);

    // Validación en tiempo real
    useEffect(() => {
        if (newPassword) {
            const validation = validatePassword(newPassword);
            setPasswordValidation(validation);
        } else {
            setPasswordValidation(null);
        }
    }, [newPassword]);

    const validatePassword = (pwd) => {
        const criteria = {
            minLength: pwd.length >= 8,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
        };

        const strength = Object.values(criteria).filter(Boolean).length;
        
        const strengthText = 
            strength <= 2 ? 'Muy débil' :
            strength === 3 ? 'Débil' :
            strength === 4 ? 'Regular' :
            strength === 5 ? 'Fuerte' : 'Muy débil';

        const strengthColor = 
            strength <= 2 ? 'bg-red-500' :
            strength === 3 ? 'bg-orange-500' :
            strength === 4 ? 'bg-yellow-500' :
            strength === 5 ? 'bg-green-500' : 'bg-red-500';

        return {
            criteria,
            strength,
            strengthText,
            strengthColor,
            isValid: pwd.length >= 8 && Object.values(criteria).every(Boolean)
        };
    };

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordValidation(null);
        onClose();
    };

    // Cambiar la contraseña
    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showErrorAlert('Error', 'Por favor, complete todos los campos.');
            return;
        }

        if (newPassword.length < 8) {
            showErrorAlert('Error', 'La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (!passwordValidation?.isValid) {
            showErrorAlert('Error', 'La contraseña no cumple con todos los requisitos.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showErrorAlert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.post('/auth/change-password', {
                currentPassword,
                newPassword
            });

            setIsLoading(false);
            
            if (response.success) {
                showSuccessAlert('¡Contraseña Cambiada!', 'Tu contraseña ha sido cambiada exitosamente.');
                handleClose();
            } else {
                showErrorAlert('Error', response.message || 'No se pudo cambiar la contraseña.');
            }
        } catch (error) {
            setIsLoading(false);
            // Manejar errores específicos
            if (error.message.includes('incorrecta') || error.message.includes('actual')) {
                showErrorAlert('Error', 'La contraseña actual es incorrecta.');
            } else {
                showErrorAlert('Error', error.message || 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
                        Cambiar Contraseña
                    </h2>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        onClick={handleClose}
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                    <p className="text-center text-gray-600 text-sm mb-2">
                        Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
                    </p>
                    
                    {/* Contraseña Actual */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">
                            Contraseña Actual:
                        </label>
                        <div className="relative mt-1">
                            <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                className="w-full h-11 pl-10 pr-12 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 bg-white/90 transition-all"
                                placeholder="Tu contraseña actual"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-primary-purple transition-colors"
                            >
                                {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Nueva Contraseña */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">
                            Nueva Contraseña:
                        </label>
                        <div className="relative mt-1">
                            <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                className="w-full h-11 pl-10 pr-12 rounded-xl border-2 border-gray-300 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 bg-white/90 transition-all"
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-primary-purple transition-colors"
                            >
                                {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>

                        {/* Indicador de Fortaleza */}
                        {passwordValidation && (
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-600">
                                        Fortaleza:
                                    </span>
                                    <span className={`text-xs font-bold ${
                                        passwordValidation.strength <= 2 ? 'text-red-500' :
                                        passwordValidation.strength === 3 ? 'text-orange-500' :
                                        passwordValidation.strength === 4 ? 'text-yellow-500' :
                                        'text-green-500'
                                    }`}>
                                        {passwordValidation.strengthText}
                                    </span>
                                </div>
                                
                                {/* Barra de progreso */}
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${passwordValidation.strengthColor}`}
                                        style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                                    />
                                </div>

                                {/* Requisitos */}
                                <div className="grid grid-cols-1 gap-1 mt-2 p-2 bg-gray-50 rounded-lg">
                                    <RequirementItem 
                                        met={passwordValidation.criteria.minLength}
                                        text="Mínimo 8 caracteres"
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.criteria.hasUppercase}
                                        text="Una letra mayúscula"
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.criteria.hasLowercase}
                                        text="Una letra minúscula"
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.criteria.hasNumber}
                                        text="Un número"
                                    />
                                    <RequirementItem 
                                        met={passwordValidation.criteria.hasSpecialChar}
                                        text="Un carácter especial (!@#$%^&*)"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Confirmar Nueva Contraseña */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">
                            Confirmar Nueva Contraseña:
                        </label>
                        <div className="relative mt-1">
                            <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className={`w-full h-11 pl-10 pr-12 rounded-xl border-2 focus:outline-none focus:ring-2 bg-white/90 transition-all ${
                                    confirmPassword && newPassword !== confirmPassword
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                        : confirmPassword && newPassword === confirmPassword
                                        ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                                        : 'border-gray-300 focus:border-primary-purple focus:ring-primary-purple/20'
                                }`}
                                placeholder="Confirma la nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-primary-purple transition-colors"
                            >
                                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        
                        {/* Mensaje de coincidencia */}
                        {confirmPassword && (
                            <p className={`text-xs mt-2 flex items-center gap-1 ${
                                newPassword === confirmPassword ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {newPassword === confirmPassword ? (
                                    <>
                                        <FiCheck size={14} />
                                        Las contraseñas coinciden
                                    </>
                                ) : (
                                    <>
                                        <FiX size={14} />
                                        Las contraseñas no coinciden
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex gap-3 mt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !passwordValidation?.isValid || newPassword !== confirmPassword}
                            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// Componente auxiliar para mostrar requisitos
const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${
        met ? 'text-green-600' : 'text-gray-500'
    }`}>
        {met ? (
            <FiCheck className="flex-shrink-0" size={12} />
        ) : (
            <FiX className="flex-shrink-0" size={12} />
        )}
        <span>{text}</span>
    </div>
);

export default ChangePasswordModal;