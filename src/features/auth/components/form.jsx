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
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full">
                {/* Contenedor principal del formulario */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white mb-1">Iniciar Sesión</h1>
                        <p className="text-indigo-100 text-xs">Accede a tu cuenta</p>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 space-y-4">
                        {/* Campo Email */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="text-xs font-medium text-gray-700 block">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white hover:bg-white transition-all duration-200"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                        </div>

                        {/* Campo Contraseña */}
                        <div className="space-y-1">
                            <label htmlFor="password" className="text-xs font-medium text-gray-700 block">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 bg-gray-50 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white hover:bg-white transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Recordar contraseña */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-3 h-3 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                                />
                                <span className="ml-2 text-xs text-gray-600">Recordarme</span>
                            </label>
                            <button
                                type="button"
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* Botón de submit */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl transition-all duration-200 transform"
                        >
                            Entrar
                        </button>
                    </div>

                    {/* Footer simplificado */}
                    <div className="px-6 pb-4 text-center">
                        <p className="text-xs text-gray-600">
                            ¿No tienes cuenta?{' '}
                            <button className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                                Regístrate
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Form;