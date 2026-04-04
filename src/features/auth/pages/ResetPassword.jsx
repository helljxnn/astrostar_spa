import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css";
import logo from "../../../../public/assets/images/astrostar.png";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const token = location.state?.token;

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    useEffect(() => {
        if (!token) {
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    // Validación en tiempo real
    useEffect(() => {
        if (password) {
            const validation = validatePassword(password);
            setPasswordValidation(validation);
        } else {
            setPasswordValidation(null);
        }
    }, [password]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (password.length < 8) {
            Toast.fire({ icon: 'error', title: 'La contraseña debe tener al menos 8 caracteres.' });
            return;
        }

        if (!passwordValidation?.isValid) {
            Toast.fire({ icon: 'error', title: 'La contraseña no cumple con todos los requisitos.' });
            return;
        }

        if (password !== confirmPassword) {
            Toast.fire({ icon: 'error', title: 'Las contraseñas no coinciden.' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();

            if (data.success) {
                Toast.fire({ 
                    icon: 'success', 
                    title: 'Contraseña restablecida exitosamente.' 
                });
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                Toast.fire({ 
                    icon: 'error', 
                    title: data.message || 'Error al restablecer la contraseña.' 
                });
            }
        } catch (_error) {
            Toast.fire({ 
                icon: 'error', 
                title: 'Error al conectar con el servidor.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            {/* Fondo con imagen + blur */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 backdrop-blur-xs bg-black/20" />

            {/* Contenedor con efecto de luz animada */}
            <div className="glow-container">
                <div className="login-box max-w-md">
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="AstroStar Logo" className="w-20 h-20" />
                    </div>

                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-primary-purple bg-clip-text text-transparent">
                            Nueva Contraseña
                        </h1>
                        <p className="mt-2 text-gray-600 text-sm">
                            Crea una contraseña segura para tu cuenta
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Campo de Nueva Contraseña */}
                        <div>
                            <div className="relative">
                                <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                <input
                                    className="w-full h-12 pl-10 pr-12 rounded-xl border-2 border-primary-purple/30 focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 bg-white/90 transition-all"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nueva contraseña"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-primary-purple transition-colors"
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
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
                                    <div className="grid grid-cols-1 gap-1 mt-3 p-3 bg-gray-50 rounded-lg">
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

                        {/* Campo de Confirmar Contraseña */}
                        <div>
                            <div className="relative">
                                <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                                <input
                                    className={`w-full h-12 pl-10 pr-12 rounded-xl border-2 focus:outline-none focus:ring-2 bg-white/90 transition-all ${
                                        confirmPassword && password !== confirmPassword
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                            : confirmPassword && password === confirmPassword
                                            ? 'border-green-400 focus:border-green-500 focus:ring-green-200'
                                            : 'border-primary-purple/30 focus:border-primary-purple focus:ring-primary-purple/20'
                                    }`}
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirmar contraseña"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-primary-purple transition-colors"
                                >
                                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                            
                            {/* Mensaje de coincidencia */}
                            {confirmPassword && (
                                <p className={`text-xs mt-2 flex items-center gap-1 ${
                                    password === confirmPassword ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {password === confirmPassword ? (
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

                        <button
                            type="submit"
                            disabled={isLoading || !passwordValidation?.isValid || password !== confirmPassword}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Restaurando...
                                </span>
                            ) : (
                                'Restaurar Contraseña'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Componente auxiliar para mostrar requisitos
const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors ${
        met ? 'text-green-600' : 'text-gray-500'
    }`}>
        {met ? (
            <FiCheck className="flex-shrink-0" size={14} />
        ) : (
            <FiX className="flex-shrink-0" size={14} />
        )}
        <span>{text}</span>
    </div>
);

export default ResetPassword;
