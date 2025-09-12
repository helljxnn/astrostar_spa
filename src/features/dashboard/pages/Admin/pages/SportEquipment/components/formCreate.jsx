import React from "react";
import { useState } from "react";
import Form from "../../../../../../../shared/components/form";
import { showErrorAlert, showSuccessAlert } from "../../../../../../../shared/utils/Alerts";
import HandleOnChange from "../../../../../../../shared/hooks/handleChange";

/**
 * Modal con el formulario para crear un nuevo material deportivo.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 */
const FormCreate = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        cantidad: "",
        descripcion: "",
        estado: ""
    });
    const SaveData = (e) => {
        HandleOnChange(formData, e, setFormData);
    }
    const HandleForm = (newFormData) => {
        try {
            const data = localStorage.getItem("formData");
            let items = data ? JSON.parse(data) : [];

            if (!Array.isArray(items)) {
                items = [];
            }

            items.push(newFormData);
            localStorage.setItem("formData", JSON.stringify(items));

            onClose();
            setFormData({ nombre: "", cantidad: "", descripcion: "", estado: "" });
            showSuccessAlert("Registrado exitosamente", "Material deportivo guardado exitosamente");
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            showErrorAlert("No se guardaron los datos", "Error al intentar guardar los datos.");
        }
    }

    return (
        <Form
            isOpen={isOpen}
            title="Crear Nuevo Material"
            submitText="Crear"
            onClose={onClose}
            onSubmit={HandleForm}
            formData={formData}
        >
            {/* Estos son los 'children' del formulario */}
            <div className="flex flex-col gap-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Balón de fútbol" />
                </div>
                <div>
                    <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                    <input type="number" id="cantidad" name="cantidad" value={formData.cantidad} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="0" />
                </div>
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={SaveData} rows="3" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Describe el material..."></textarea>
                </div>
                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select id="estado" name="estado" value={formData.estado} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="" disabled>Seleccionar estado</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
            </div>
        </Form>
    );
};

export default FormCreate;