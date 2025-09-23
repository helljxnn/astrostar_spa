import React, { useState } from "react";
import Form from "../../../../../../../../shared/components/form";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

const FormCreate = ({ isOpen, onClose, onSave }) => {
    const getInitialState = () => ({
        identificacion: "",
        nombre: "",
        personaContacto: "",
        tipo: "Donante",
        tipoPersona: "Natural",
        telefono: "",
        correo: "",
        direccion: "",
        estado: "Activo",
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({}); // Almacena los mensajes de error por campo
    const [touched, setTouched] = useState({}); // Rastrea si un campo ha sido "tocado" (onBlur)

    // Función auxiliar para validar un campo específico
    const validateField = (name, value) => {
        let error = '';
        if (name === 'identificacion' && !value.trim()) {
            error = "La identificación es requerida.";
        } else if (name === 'nombre' && !value.trim()) {
            error = "El nombre es requerido.";
        } else if (name === 'telefono' && !value.trim()) {
            error = "El teléfono es requerido.";
        } else if (name === 'correo') {
            if (!value.trim()) {
                error = "El correo es requerido.";
            } else if (!/\S+@\S+\.\S+/.test(value.trim())) {
                error = "El formato del correo no es válido.";
            }
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar el error inmediatamente al empezar a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true })); // Marcar el campo como tocado
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const newErrors = {};
        // Validar todos los campos obligatorios al intentar enviar
        ['identificacion', 'nombre', 'telefono', 'correo'].forEach(name => {
            const error = validateField(name, formData[name]);
            if (error) newErrors[name] = error; // Solo añadir si hay un error real
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            onSave(formData);
        } else {
            // Si hay errores, marcar todos los campos obligatorios como tocados para mostrar los errores
            setTouched({ identificacion: true, nombre: true, telefono: true, correo: true });
            showErrorAlert("Error de Validación", "Por favor, complete todos los campos obligatorios.");
        }
    };

    // Limpiar el formulario cuando se cierra el modal
    const handleClose = () => {
        setFormData(getInitialState());
        setTouched({}); // Limpiar el estado de "tocado"
        setErrors({});
        onClose();
    };

    return (
        <Form
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleFormSubmit}
            title="Crear Donante / Patrocinador"
            submitText="Crear"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700 mb-1">Identificación (NIT/Cédula) <span className="text-red-500">*</span></label>
                    <input type="text" id="identificacion" name="identificacion" value={formData.identificacion} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: 123456789-0" />
                    {touched.identificacion && errors.identificacion && <p className="text-red-500 text-xs mt-1">{errors.identificacion}</p>}
                </div>

                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social <span className="text-red-500">*</span></label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Juan Pérez o Empresa S.A.S." />
                    {touched.nombre && errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="personaContacto" className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
                    <input type="text" id="personaContacto" name="personaContacto" value={formData.personaContacto} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Ana García (Opcional)" />
                </div>

                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Donante">Donante</option>
                        <option value="Patrocinador">Patrocinador</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="tipoPersona" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Persona</label>
                    <select id="tipoPersona" name="tipoPersona" value={formData.tipoPersona} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Natural">Natural</option>
                        <option value="Jurídica">Jurídica</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                    <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: 3001234567" />
                    {touched.telefono && errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                </div>

                <div>
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="ejemplo@correo.com" />
                    {touched.correo && errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Calle 10 # 20-30 (Opcional)" />
                </div>

                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select id="estado" name="estado" value={formData.estado} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            </div>
        </Form>
    );
};

export default FormCreate;