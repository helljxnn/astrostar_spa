import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiArrowLeft } from 'react-icons/fi';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css"; // Importar los estilos del glow

const VerifyCode = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const inputRefs = [
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
        React.useRef(null),
        React.useRef(null)
    ];

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Auto-focus en el primer input al cargar
    useEffect(() => {
        if (inputRefs[0].current) {
            inputRefs[0].current.focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Solo permite números
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus al siguiente input
        if (value && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace: borrar y volver al anterior
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
        // Arrow keys para navegación
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs[index - 1].current?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...code];
        
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        
        setCode(newCode);
        
        // Focus en el último input con valor o el primero vacío
        const nextEmptyIndex = newCode.findIndex(digit => !digit);
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs[focusIndex].current?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join('');
        
        if (fullCode.length !== 6) {
            Toast.fire({ icon: 'error', title: 'Por favor, completa los 6 dígitos.' });
            return;
        }
        
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/verify-reset-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: fullCode }),
            });

            const data = await response.json();

            if (data.success) {
                navigate('/reset-password', { state: { token: fullCode, email: data.data.email } });
            } else {
                Toast.fire({ icon: 'error', title: data.message || 'El código ingresado es incorrecto.' });
                // Limpiar inputs en caso de error
                setCode(['', '', '', '', '', '']);
                inputRefs[0].current?.focus();
            }
        } catch (_error) {
            Toast.fire({ icon: 'error', title: 'Error al conectar con el servidor.' });
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
                <div className="login-box">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-primary-purple bg-clip-text text-transparent">
                            Verifica tu Identidad
                        </h1>
                        <p className="mt-2 text-gray-800 text-sm">
                            Ingresa el código de 6 dígitos que enviamos a <span className="font-semibold text-black">{email}</span>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Contenedor de inputs de código */}
                        <div className="flex justify-center gap-1 sm:gap-1">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={inputRefs[index]}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold 
                                             rounded-xl border-2 border-primary-purple/30
                                             bg-white/90 backdrop-blur-sm
                                             focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20
                                             transition-all duration-200
                                             hover:border-primary-purple/50
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             shadow-sm hover:shadow-md"
                                    disabled={isLoading}
                                    style={{
                                        background: digit 
                                            ? 'linear-gradient(135deg, rgba(181, 149, 255, 0.1) 0%, rgba(155, 233, 255, 0.1) 100%)'
                                            : 'rgba(255, 255, 255, 0.9)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Indicador de progreso */}
                        <div className="flex justify-center gap-1">
                            {code.map((digit, index) => (
                                <div
                                    key={index}
                                    className={`h-1 w-8 rounded-full transition-all duration-300 ${
                                        digit 
                                            ? 'bg-gradient-to-r from-black to-primary-purple' 
                                            : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.join('').length !== 6}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-black to-primary-purple 
                                     text-white font-semibold shadow-lg 
                                     hover:scale-[1.02] hover:shadow-xl
                                     transition-all duration-200
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                                'Verificar Código'
                            )}
                        </button>

                        {/* Mensaje de ayuda */}
                        <p className="text-center text-xs text-gray-800">
                            💡 Puedes pegar el código completo desde tu correo
                        </p>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black hover:underline">
                            <FiArrowLeft />
                            Volver
                        </Link>
                        <p className="text-xs text-gray-800">
                            ¿No recibiste el código? Revisa tu carpeta de spam o{' '}
                            <button
                                onClick={() => navigate('/forgot-password')}
                                className="text-black font-semibold hover:underline"
                            >
                                solicita uno nuevo
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyCode;
