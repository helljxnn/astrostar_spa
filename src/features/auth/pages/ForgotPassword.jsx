import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom"; // 1. Importar useNavigate
import Swal from 'sweetalert2';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css";
import logo from "../../../../public/assets/images/astrostar.png";
import apiClient from '../../../shared/services/apiClient'; // 2. Importar apiClient

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Eliminamos emailSent, ahora la navegación se encargará de mostrar la siguiente vista.
  const navigate = useNavigate(); // 3. Instanciar useNavigate

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleSubmit = async (e) => { // 4. Convertir a async
    e.preventDefault();
    if (!email) {
      Toast.fire({ icon: 'error', title: 'Por favor, ingresa tu correo electrónico.' });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.fire({ icon: 'error', title: 'Por favor, ingresa un correo válido.' });
      return;
    }

    setIsLoading(true);

    try {
      // 5. Llamar al endpoint del backend
      const response = await apiClient.post('/auth/forgot-password', { email });

      if (response.success) {
        Toast.fire({ icon: 'success', title: response.message });
        // No redirigimos. El usuario ahora debe ir a su correo electrónico.
        // Opcional: podrías deshabilitar el formulario o mostrar un mensaje más permanente.
      }
    } catch (error) {
      // El apiClient ya maneja los errores y los lanza, aquí los atrapamos.
      Toast.fire({ icon: 'error', title: error.message || 'No se pudo procesar la solicitud.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative w-screen h-screen flex items-center justify-center">
      {/* Fondo con imagen + blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 backdrop-blur-xs bg-black/20" />

      {/* Botón regresar */}
      <Link
        to="/login"
        className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-primary-purple/70 
                   text-black font-semibold shadow-md 
                   hover:bg-primary-blue/70 hover:scale-105 transition"
      >
        ← Regresar
      </Link>

      {/* Contenedor del formulario */}
      <div className="glow-container">
        <div className="login-box">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="AstroStar Logo" className="w-24 h-24" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-black to-primary-purple bg-clip-text text-transparent">
              Recuperar Contraseña
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <FiMail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-black hover:underline"
              >
                ¿Recordaste tu contraseña? Iniciar sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;