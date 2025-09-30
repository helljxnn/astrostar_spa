import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiKey, FiArrowLeft } from 'react-icons/fi';
import { showSuccessAlert, showErrorAlert } from '../../../shared/utils/alerts';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css"; // Importar los estilos del glow

const VerifyCode = () => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Recibe el email desde la página anterior

    // Si no hay email, redirige al inicio del proceso
    useEffect(() => {
        if (!email) {
            showErrorAlert('Error', 'No se ha proporcionado un correo. Por favor, inicia el proceso de nuevo.');
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code.length !== 6) {
            showErrorAlert('Error', 'El código debe tener 6 dígitos.');
            return;
        }
        setIsLoading(true);

        // --- Lógica de Verificación ---
        // En una app real, aquí llamarías a tu API para verificar el código.
        // Para simular, usaremos un código fijo "123456".
        setTimeout(() => {
            setIsLoading(false);
            if (code === '123456') {
                showSuccessAlert('¡Código Correcto!', 'Ahora puedes crear tu nueva contraseña.').then(() => {
                    // Pasa el email a la siguiente página para saber a qué usuario cambiar la contraseña
                    navigate('/reset-password', { state: { email } });
                });
            } else {
                showErrorAlert('Error', 'El código ingresado es incorrecto.');
            }
        }, 1500);
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
                        <p className="mt-2 text-gray-600 text-sm">
                            Ingresa el código de 6 dígitos que enviamos a <span className="font-semibold text-primary-purple">{email}</span>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            className="w-full h-11 px-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90 tracking-[0.5em] text-center"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Solo permite números
                            placeholder="Código de 6 dígitos"
                            maxLength="6"
                            required
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                            {isLoading ? 'Verificando...' : 'Verificar Código'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black hover:underline">
                            <FiArrowLeft />
                            Volver
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyCode;