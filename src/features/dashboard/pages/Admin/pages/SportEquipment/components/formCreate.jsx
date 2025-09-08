import React from "react";
import Form from "../../../../../../../shared/components/form";

/**
 * Modal con el formulario para crear un nuevo material deportivo.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSubmit - Función que se ejecuta al enviar el formulario.
 */
const FormCreate = ({ isOpen, onClose, onSubmit }) => {
    return (
        <Form
            isOpen={isOpen}
            title="Crear Nuevo Material"
            submitText="Crear"
            onClose={onClose}
            onSubmit={onSubmit}
        >
            {/* Estos son los 'children' del formulario */}
            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" id="nombre" name="nombre" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Balón de fútbol" />
                </div>
                <div>
                    <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                    <input type="number" id="cantidad" name="cantidad" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="0" />
                </div>
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea id="descripcion" name="descripcion" rows="3" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Describe el material..."></textarea>
                </div>
                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select id="estado" name="estado" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            </div>
        </Form>
    );
};

export default FormCreate;