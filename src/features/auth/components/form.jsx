import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import Requests from "../../../shared/hooks/requests";
import { useNavigate } from "react-router-dom";

const Form = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Aquí iría la lógica de autenticación con el backend.
        // Por ahora, navegamos directamente al dashboard.
        navigate("/dashboard");
    }

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
                        <input className="w-full h-10 p-4 bg-primary-purple border-2 rounded-lg border-primary-blue placeholder-white focus:outline-none focus:ring-0 text-white" type="text" name="email" id="inputEmail" placeholder="Correo" />
                    </div>
                    <div className="w-full h-auto" id="formLabel">
                        <label htmlFor="" />
                        <input className="w-full h-10 p-4 bg-primary-purple border-2 rounded-lg border-primary-blue placeholder-white focus:outline-none focus:ring-0 text-white" type="text" name="password" id="inputPassword" placeholder="Contraseña" />
                    </div>
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