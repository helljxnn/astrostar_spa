import React, { useState } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom"; // Importar useNavigate y Link
import { useAuth } from "../../../shared/contexts/authContext"; // Importar el hook de autenticación
import logo from "../../../../public/assets/images/astrostar.png";
import "../Syles/LoginGlow.css";
import { FiLock, FiMail } from "react-icons/fi";

const Form = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { Login } = useAuth();

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Pasamos la función navigate al contexto
    const result = await Login({ email, password });

    setIsLoading(false);

    if (result.success) {
      Toast.fire({
        icon: 'success',
        title: result.message
      });
    } else {
      Toast.fire({
        icon: 'error',
        title: result.message || "Error al iniciar sesión"
      });
    }
  };

  return (
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
  );
};

export default Form;
