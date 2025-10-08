import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css"; // Importar los estilos del glow

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    const isValidEmail = (email) => {
        // Basic email format validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            Toast.fire({ icon: 'error', title: 'Por favor, ingresa tu correo electrónico.' });
            return;
        }
        if (!isValidEmail(email)) {
            Toast.fire({ icon: 'error', title: 'Por favor, ingresa un correo electrónico válido.' });
            return;
        }
        setIsLoading(true);

        // --- Lógica de Envío de Código ---
        // En una app real, aquí llamarías a tu API para generar y enviar un código por correo.
        // Para simular, mostraremos el código en consola y redirigiremos.
        const fakeCode = "123456"; // Este es el código que el usuario deberá ingresar.
        console.log(`Código de recuperación para ${email}: ${fakeCode}`);

        setTimeout(() => {
            setIsLoading(false);
            // Redirige a la página de verificación, pasando el email en el estado.
            navigate('/verify-code', { state: { email } });
        }, 2000);
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
                            Recuperar Contraseña
                        </h1>
                        <p className="mt-2 text-gray-600 text-sm">
                            Ingresa tu correo y te enviaremos un código.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            className="w-full h-11 px-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                            type="text"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            placeholder="Tu correo electrónico"
                            required
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Código'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black hover:underline">
                            <FiArrowLeft />
                            Volver a Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;