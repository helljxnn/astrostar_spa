import React, { useState, useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import HandleOnChange from "../../../../../../../shared/hooks/handleChange";

/**
 * Modal con el formulario para editar un material deportivo existente.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.equipmentData - Los datos del material a editar.
 * @param {function} props.onSave - Función que se ejecuta al guardar los cambios. Recibe los datos actualizados.
 */
const FormEdit = ({ isOpen, onClose, equipmentData, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        comprado: "",
        donado: "",
        estado: ""
    });

    // Cuando el modal se abre o los datos del equipo cambian, llenamos el formulario.
    useEffect(() => {
        if (equipmentData) {
            setFormData({
                nombre: equipmentData.NombreMaterial || "",
                comprado: equipmentData.CantidadComprado || 0,
                donado: equipmentData.CantidadDonado || 0,
                estado: equipmentData.estado || ""
            });
        }
    }, [equipmentData]);

    const SaveData = (e) => {
        HandleOnChange(formData, e, setFormData);
    };

    const handleFormSubmit = (dataFromForm) => {
        if (onSave) {
            onSave(dataFromForm);
        }
    };

    return (
        <Form
            isOpen={isOpen}
            title="Editar Material"
            submitText="Guardar Cambios"
            onClose={onClose}
            onSubmit={handleFormSubmit}
            formData={formData}
        >
            {/* Estos son los 'children' del formulario */}
            <div className="flex flex-col gap-4">
                <div><label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label><input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Balón de fútbol" /></div>
                <div><label htmlFor="comprado" className="block text-sm font-medium text-gray-700 mb-1">Cantidad Comprada</label><input type="number" id="comprado" name="comprado" value={formData.comprado} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="0" /></div>
                <div><label htmlFor="donado" className="block text-sm font-medium text-gray-700 mb-1">Cantidad Donada</label><input type="number" id="donado" name="donado" value={formData.donado} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="0" /></div>
                <div><label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label><select id="estado" name="estado" value={formData.estado} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"><option value="" disabled>Seleccionar estado</option><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></div>
            </div>
        </Form>
    );
};

export default FormEdit;