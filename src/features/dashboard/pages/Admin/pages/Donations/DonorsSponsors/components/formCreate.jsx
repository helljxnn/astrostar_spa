import React, { useState } from "react";
import Form from "../../../../../../../../shared/components/form";

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // Aquí podrías agregar validaciones más robustas
        if (!formData.identificacion || !formData.nombre || !formData.correo) {
            alert("Por favor, completa los campos obligatorios: Identificación, Nombre y Correo.");
            return;
        }
        onSave(formData);
        setFormData(getInitialState()); // Limpiar el formulario
    };

    // Limpiar el formulario cuando se cierra el modal
    const handleClose = () => {
        setFormData(getInitialState());
        onClose();
    };

    return (
        <Form
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Crear Donante / Patrocinador"
            submitText="Crear"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700 mb-1">Identificación (NIT/Cédula)</label>
                    <input type="text" id="identificacion" name="identificacion" value={formData.identificacion} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: 123456789-0" />
                </div>

                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Juan Pérez o Empresa S.A.S." />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="personaContacto" className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
                    <input type="text" id="personaContacto" name="personaContacto" value={formData.personaContacto} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Ana García" />
                </div>

                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Donante">Donante</option>
                        <option value="Patrocinador">Patrocinador</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="tipoPersona" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Persona</label>
                    <select id="tipoPersona" name="tipoPersona" value={formData.tipoPersona} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Natural">Natural</option>
                        <option value="Jurídica">Jurídica</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: 3001234567" />
                </div>

                <div>
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="ejemplo@correo.com" />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Calle 10 # 20-30" />
                </div>

                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            </div>
        </Form>
    );
};

export default FormCreate;