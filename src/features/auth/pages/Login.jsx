import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { FiMail, FiLock } from 'react-icons/fi';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import "../Syles/LoginGlow.css";
import logo from "../../../../public/assets/images/astrostar.png"; // Importar el logo

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      Toast.fire({ icon: 'error', title: 'Por favor, ingresa tu correo y contraseña.' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'admin@astrostar.com' && password === 'admin123') {
        Toast.fire({ icon: 'success', title: '¡Bienvenido de nuevo!' });
        navigate('/dashboard');
      } else {
        Toast.fire({ icon: 'error', title: 'Correo o contraseña incorrectos.' });
      }
    }, 1500);
  };

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
        to="/"
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
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              Bienvenido de nuevo.
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

            <div className="relative">
              <FiLock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />
            </div>

            <div className="text-right -mt-2">
              <Link to="/forgot-password" className="text-sm font-medium text-black hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50">
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
