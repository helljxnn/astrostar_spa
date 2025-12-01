import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEnvelope } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import { showSuccessAlert, showErrorAlert } from '../../../shared/utils/alerts';

const EmailVerificationModal = ({ isOpen, onClose, newEmail, onVerify }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [canResend, setCanResend] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setCode(['', '', '', '', '', '']);
            setError('');
            setCanResend(false);
            setResendTimer(60);
            
            // Iniciar temporizador
            startResendTimer();
            
            // Focus en el primer input cuando se abre el modal
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        } else {
            // Limpiar temporizador al cerrar
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isOpen]);

    const startResendTimer = () => {
        setCanResend(false);
        setResendTimer(60);
        
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleChange = (index, value) => {
        // Solo permitir números
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus al siguiente input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace: ir al input anterior
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        // Enter: verificar código
        if (e.key === 'Enter' && code.every(digit => digit !== '')) {
            handleVerify();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        
        // Verificar que sean 6 dígitos
        if (/^\d{6}$/.test(pastedData)) {
            const newCode = pastedData.split('');
            setCode(newCode);
            setError('');
            // Focus en el último input
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        
        if (fullCode.length !== 6) {
            setError('Por favor, ingresa los 6 dígitos del código');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await onVerify(fullCode);
        } catch (err) {
            setError(err.message || 'Código inválido o expirado');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/auth/request-email-change`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newEmail })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                showErrorAlert('Error', data.message || 'No se pudo reenviar el código.');
                return;
            }

            showSuccessAlert('¡Código Reenviado!', 'Hemos enviado un nuevo código a tu correo.');
            setCode(['', '', '', '', '', '']);
            setError('');
            inputRefs.current[0]?.focus();
            startResendTimer();

        } catch (error) {
            console.error('Error reenviando código:', error);
            showErrorAlert('Error', 'No se pudo reenviar el código. Inténtalo de nuevo.');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {/* Header */}
                    <button
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        onClick={onClose}
                    >
                        <FaTimes size={18} />
                    </button>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center">
                            <FiMail className="text-white" size={32} />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent mb-2">
                        Verificación de Email
                    </h2>

                    {/* Description */}
                    <p className="text-center text-gray-600 mb-2">
                        Hemos enviado un código de verificación a:
                    </p>
                    <p className="text-center font-semibold text-primary-purple mb-6 break-all px-4">
                        {newEmail}
                    </p>

                    {/* Code Inputs */}
                    <div className="flex justify-center gap-2 mb-6">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={index === 0 ? handlePaste : undefined}
                                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                                    error
                                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : digit
                                        ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                                        : 'border-gray-300 focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20'
                                }`}
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm text-center mb-4"
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Info */}
                    <p className="text-xs text-center text-gray-500 mb-6">
                        El código expirará en 15 minutos
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleVerify}
                            disabled={isLoading || code.some(digit => digit === '')}
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Verificando...
                                </span>
                            ) : (
                                'Verificar'
                            )}
                        </button>
                    </div>

                    {/* Resend Code */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿No recibiste el código?{' '}
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    className="text-primary-purple font-semibold hover:underline transition-colors"
                                    disabled={isLoading}
                                >
                                    Reenviar código
                                </button>
                            ) : (
                                <span className="text-gray-500 font-medium">
                                    Reenviar en {resendTimer}s
                                </span>
                            )}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmailVerificationModal;
