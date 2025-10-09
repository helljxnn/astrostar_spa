import React, { useState } from "react";
import { motion } from "framer-motion";
import Swal from 'sweetalert2';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext.jsx";
import logo from "../../../../public/assets/images/astrostar.png";
import "../Syles/LoginGlow.css";

const Form = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      Toast.fire({ icon: 'error', title: 'Por favor, ingresa tu correo y contraseña.' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const success = login({ email, password });
      if (success) {
        Toast.fire({ icon: 'success', title: '¡Bienvenido de nuevo!' });
        navigate('/dashboard');
      } else {
        Toast.fire({ icon: 'error', title: 'Correo o contraseña incorrectos.' });
      }
    }, 1500);
  }

  return (
    <div className="w-full h-screen flex items-center justify-center relative">
      {/* Contenedor con efecto de luz animada */}
      <div className="glow-container">
        <div className="login-box">
          {/* Logo con animación infinita */}
          <motion.img
            src={logo}
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Título */}
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-black to-primary-purple bg-clip-text text-transparent mb-6">
            Iniciar Sesión
          </h1>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              className="w-full h-11 px-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
              type="text"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full h-11 px-4 rounded-xl border border-primary-blue/50 focus:outline-none focus:ring-2 focus:ring-primary-purple bg-white/90"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-black to-primary-purple text-white font-semibold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {isLoading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              ¿Olvidaste tu contraseña?{" "}
              <Link to="/forgot-password" className="text-black cursor-pointer hover:underline font-semibold">
                Restaúrala aquí
              </Link>
            </p>
            {/* <p className="mt-2">
              ¿No tienes cuenta?{" "}
              <span className="text-black cursor-pointer hover:underline">
                Regístrate gratis
              </span>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
