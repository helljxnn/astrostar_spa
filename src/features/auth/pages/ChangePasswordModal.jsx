import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { showSuccessAlert, showErrorAlert } from '../../../shared/utils/alerts';

const ChangePasswordModal = ({ isOpen, onClose, email }) => {
    const [code, setCode] = useState('');
    const [step, setStep] = useState('verify'); // 'verify' o 'reset'
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Paso 1: Verificar el código
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!code) {
            showErrorAlert('Error', 'Por favor, ingresa el código de verificación.');
            return;
        }
        setIsLoading(true);

        // Simulación de la llamada a la API para verificar el código
        const fakeVerification = new Promise((resolve, reject) => {
            setTimeout(() => {
                if (code === "123456") {
                    resolve();
                } else {
                    reject();
                }
            }, 2000);
        });

        try {
            await fakeVerification;
            setIsLoading(false);
            setStep('reset'); // Avanza al siguiente paso
        } catch {
            setIsLoading(false);
            showErrorAlert('Error', 'El código de verificación es incorrecto.');
        }
    };

    // Paso 2: Cambiar la contraseña
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            showErrorAlert('Error', 'Por favor, complete todos los campos.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showErrorAlert('Error', 'Las contraseñas no coinciden.');
            return;
        }
        // Aquí podrías agregar validación de fortaleza de contraseña

        setIsLoading(true);

        // Simulación de la llamada a la API para cambiar la contraseña
        const fakePasswordChange = new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });

        try {
            await fakePasswordChange;
            setIsLoading(false);
            showSuccessAlert('¡Contraseña Cambiada!', 'Tu contraseña ha sido cambiada exitosamente.');
            onClose();
        } catch {
            setIsLoading(false);
            showErrorAlert('Error', 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
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
                        {step === 'verify' ? 'Verificar Código' : 'Nueva Contraseña'}
                    </h2>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        onClick={onClose}
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                {step === 'verify' ? (
                    <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
                        <p className="text-center text-gray-600">Hemos enviado un código a tu correo. Por favor, ingrésalo a continuación.</p>
                        <label className="text-gray-700">
                            Código de Verificación:
                            <input
                                type="text"
                                className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                                placeholder="Ingresa el código de 6 dígitos"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                            {isLoading ? 'Verificando...' : 'Verificar Código'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                        <p className="text-center text-gray-600">¡Código verificado! Ahora puedes establecer tu nueva contraseña.</p>
                        <label className="text-gray-700">
                            Nueva Contraseña:
                            <input
                                type="password"
                                className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                                placeholder="Nueva contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </label>
                        <label className="text-gray-700">
                            Confirmar Contraseña:
                            <input
                                type="password"
                                className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                                placeholder="Confirma la nueva contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ChangePasswordModal;