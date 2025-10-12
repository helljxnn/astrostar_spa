import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { FiLock } from 'react-icons/fi';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css"; // Importar los estilos del glow

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Recibe el email desde la página anterior

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });

    // Si no hay email, significa que el usuario no pasó por el flujo correcto.
    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password.length < 6) {
            Toast.fire({ icon: 'error', title: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        if (password !== confirmPassword) {
            Toast.fire({ icon: 'error', title: 'Las contraseñas no coinciden.' });
            return;
        }
        setIsLoading(true);
        // Aquí iría la lógica para llamar a tu API con el email y la nueva contraseña.
        console.log('Email para restaurar:', email);
        console.log('Nueva Contraseña:', password);

        // Simulamos una respuesta exitosa después de 2 segundos.
        setTimeout(() => {
            setIsLoading(false);
            navigate('/login'); // Redirige al login
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
                            Restaurar Contraseña
                        </h1>
                        <p className="mt-2 text-gray-600 text-sm">
                            Ingresa tu nueva contraseña.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <input
                            className="w-full h-11 px-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            placeholder="Nueva contraseña"
                            required
                        />
                        <input
                            className="w-full h-11 px-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                            }}
                            placeholder="Confirmar nueva contraseña"
                            required
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                            {isLoading ? 'Restaurando...' : 'Restaurar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;