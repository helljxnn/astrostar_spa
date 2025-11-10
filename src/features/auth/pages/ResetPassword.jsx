import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css"; // Importar los estilos del glow
import apiClient from '../../../shared/services/apiClient';

// 1. Mover Toast fuera para evitar bucles de renderizado.
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
});

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Para el envío del formulario
    const [isVerifying, setIsVerifying] = useState(true); // Para la verificación inicial del token
    const [isTokenValid, setIsTokenValid] = useState(false); // Para saber si el token es válido
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // 2. Hook para leer parámetros de la URL.
    const token = searchParams.get('token'); // 3. Obtener el token de la URL (?token=...).

    // 4. Verificar el token en la BD al cargar la página.
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                Toast.fire({ icon: 'error', title: 'No se proporcionó un token.' });
                navigate('/forgot-password', { replace: true });
                return;
            }

            try {
                // Llamamos al endpoint para verificar si el token es válido y no ha expirado.
                await apiClient.post('/auth/verify-code', { token });
                // Si la llamada es exitosa (no lanza error), el token es válido.
                setIsTokenValid(true);
            } catch (error) {
                // Si el backend devuelve un error (400 o 500), el token es inválido.
                Toast.fire({ icon: 'error', title: error.message || 'El enlace de recuperación es inválido o ha expirado.' });
                navigate('/forgot-password', { replace: true });
            } finally {
                // Terminamos el estado de verificación.
                setIsVerifying(false);
            }
        }

        verifyToken();
    }, [token, navigate]); // Se ejecuta si el token o navigate cambian.

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            Toast.fire({ icon: 'error', title: 'La contraseña debe tener al menos 6 caracteres.' });
            return;
        }
        if (password !== confirmPassword) {
            Toast.fire({ icon: 'error', title: 'Las contraseñas no coinciden.' });
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await apiClient.post('/auth/reset-password', { token, password });

            if (response.success) {
                Toast.fire({ icon: 'success', title: response.message });
                navigate('/login'); // Redirige al login
            }
        } catch (error) {
            Toast.fire({ icon: 'error', title: error.message || 'No se pudo restaurar la contraseña.' });
        } finally {
            setIsSubmitting(false);
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
                    {/* Mostramos un estado de carga mientras se verifica el token */}
                    {isVerifying ? (
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-700">Verificando enlace...</h1>
                            <p className="mt-2 text-gray-500">Por favor, espera un momento.</p>
                        </div>
                    ) : isTokenValid && (
                        // Si la verificación fue exitosa, mostramos el formulario
                        <>
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
                                    disabled={isSubmitting}
                                    className="w-full h-11 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Restaurando...' : 'Restaurar Contraseña'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;