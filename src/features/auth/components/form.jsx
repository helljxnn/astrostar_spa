import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

const Form = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simplemente llamar a onLogin sin validaciones
        if (onLogin) {
            onLogin(formData);
        }
    };

    return (
      <div className="w-full h-auto m-auto grid grid-rows-3 gap-4" id="Form">
        {/* Contenedor de formulario */}
        <div className="w-ful h-5" id="headerForm">
            {/* Contenedor de cabecera de formulario */}
            <h1 className="text-4xl font-semibold text-center leading-tight bg-primary-blue bg-clip-text text-transparent text-stroke text-stroke-1 text-stroke-black">Iniciar</h1>
            <h1 className="text-4xl font-semibold text-center leading-tight bg-primary-purple bg-clip-text text-transparent text-stroke text-stroke-1 text-stroke-black">Sesion</h1>
        </div>
        <div className="w-full h-auto grid grid-cols-1 grid-rows-3 gap-4 justify-items-center" id="bodyForm">
            {/* Contenedor de cuerpo de formulario */}
            <div className="w-full h-auto" id="formLabel">
                <label htmlFor="email"/>
                <input className="w-full h-10 p-4 bg-primary-purple border-2 rounded-lg border-primary-blue placeholder-white" type="text" name="email" id="inputEmail" placeholder="Correo" />
            </div>
            <div className="w-full h-auto" id="formLabel">
                <label htmlFor="" />
                <input className="w-full h-10 p-4 bg-primary-purple border-2 rounded-lg border-primary-blue placeholder-white" type="text" name="password" id="inputPassword" placeholder="Contraseña" />
            </div>
            <div className="w-full h-auto flex flex-row" id="moreInfo">
                <p className="m-1">¿Olvidaste la contraseña?</p><p className="m-1 text-white">Restaura la contraseña!</p>
            </div>
        </div>
        <div className="w-full h-auto justify-items-center" id="footerForm">
            {/* Contenedor de pie de formulario */}
            <button className="w-full h-10 rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple" id="buttonLogin">Entrar</button>
        </div>
      </div> 
    );
};

export default Form;