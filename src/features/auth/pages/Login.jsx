import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { showSuccessAlert, showErrorAlert } from '../../../shared/utils/Alerts';
import { useAuth } from '../../../shared/contexts/authContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Limpia el error al escribir de nuevo
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos

    const success = await login(credentials);

    if (success) {
      showSuccessAlert("¡Bienvenido!", "Has iniciado sesión correctamente.")
        .then(() => {
          navigate('/dashboard'); // Redirige al dashboard en caso de éxito
        });
    } else {
      const errorMessage = "Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.";
      setError(errorMessage);
      showErrorAlert("Error de inicio de sesión", "Las credenciales proporcionadas son incorrectas.");
    }
  };

  return (
    <div id="login-page-wrapper" className="relative min-h-screen w-full flex items-center justify-center bg-gray-200 p-4 overflow-hidden">

      {/* Contenedor de Fondo con división inclinada */}
      <div id="background-container" className="absolute inset-0 flex w-full h-full">
        <div
          id="background-left-column"
          className="w-1/2 h-full bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/about_image.jpg')",
            clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)'
          }}
        ></div>
        <div
          id="background-right-column"
          className="w-1/2 h-full bg-gray-200"
        ></div>
      </div>

      {/* Contenedor de Frente (panel de login) */}
      <div id="foreground-container" className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row">
        {/* Columna Izquierda del Frente (Imagen) */}
        <div id="foreground-left-column" className="hidden md:flex w-1/2 items-center justify-center p-2">
          <img
            src="/assets/images/about_image.jpg"
            alt="Beach"
            className="w-full h-full object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Columna Derecha del Frente (Formulario) */}
        <div id="foreground-right-column" className="w-full md:w-1/2 p-6 flex flex-col justify-center">
          <h1 id="login-title" className="text-3xl font-bold mb-2 text-primary-purple">Iniciar sesion</h1>
          <p id="login-subtitle" className="text-gray-500 mb-8">Bienvenido a AstroStar</p>

          <form id="login-form" onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:outline-none transition"
                required
              />
            </div>
            <div>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:outline-none transition"
                required
              />
              <div id="forgot-password-container" className="text-right mt-1">
                <a id="forgot-password-link" href="#" className="text-sm text-primary-blue hover:underline">
                  Olvidaste la contraseña?
                </a>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Entrar
            </button>
          </form>
          {/* Redes Sociales */}
          <div id="social-links" className="flex justify-center space-x-6 mt-8 text-gray-500">
            <a id="facebook-link" href="#" className="hover:text-primary-purple transition-colors">
              <FaFacebookF />
            </a>
            <a id="twitter-link" href="#" className="hover:text-primary-purple transition-colors">
              <FaTwitter />
            </a>
            <a id="linkedin-link" href="#" className="hover:text-primary-purple transition-colors">
              <FaLinkedinIn />
            </a>
            <a id="instagram-link" href="#" className="hover:text-primary-purple transition-colors">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;