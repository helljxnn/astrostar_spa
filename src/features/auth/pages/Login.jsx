import React from 'react';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import bgImage from "../../../../public/assets/images/loginB.jpg";
import Form from '../components/form';

function Login() {
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
      <Form />
    </div>
  );
}

export default Login;
