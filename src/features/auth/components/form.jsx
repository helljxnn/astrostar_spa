import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/authContext.jsx";

const Form = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(false); // Limpiar el error anterior

    const success = login({ email, password });
    if (success) {
      console.log('Login exitoso, redirigiendo...');
      navigate("/dashboard");
    } else {
      setLoginError(true);
      console.log('Credenciales incorrectas');
    }
  };

  return (
    <div className="w-full h-auto" id="Form">
      {/* Contenedor de formulario */}
      <form onSubmit={handleLogin} className="w-full h-auto m-auto grid grid-rows-3 gap-4">
        <div className="w-ful h-5" id="headerForm">
          {/* Contenedor de cabecera de formulario */}
          <h1 className="text-4xl font-semibold text-center leading-tight bg-primary-blue bg-clip-text text-transparent text-stroke text-stroke-1 text-stroke-black">Iniciar</h1>
          <h1 className="text-4xl font-semibold text-center leading-tight bg-primary-purple bg-clip-text text-transparent text-stroke text-stroke-1 text-stroke-black">Sesion</h1>
        </div>
        <div className="w-full h-auto grid grid-cols-1 grid-rows-3 gap-4 justify-items-center" id="bodyForm">
          {/* Contenedor de cuerpo de formulario */}
          <div className="w-full h-auto" id="formLabel">
            <label htmlFor="email" />
            <input
              className="w-full h-10 p-4 bg-primary-purple border-2 rounded-lg border-primary-blue placeholder-white focus:outline-none focus:ring-0 text-white"
              type="text"
              name="email"
              id="inputEmail"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="w-full h-auto" id="formLabel">
            <label htmlFor="password" />
            <input
              className="w-full h-10 p-4 bg-primary-purple border-2 rounded-lg border-primary-blue placeholder-white focus:outline-none focus:ring-0 text-white"
              type="password"
              name="password"
              id="inputPassword"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {loginError && <p className="text-red-500 text-center">Correo o contraseña incorrectos.</p>}
          <div className="w-full h-auto flex flex-row" id="moreInfo">
            <p className="m-1">¿Olvidaste la contraseña?</p><p className="m-1 text-white">Restaura la contraseña!</p>
          </div>
        </div>
        <div className="w-full h-auto justify-items-center" id="footerForm">
          {/* Contenedor de pie de formulario */}
          <button type="submit" className="w-full h-10 rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple" id="buttonLogin">Entrar</button>
        </div>
      </form>
    </div>
  );
};

export default Form;
