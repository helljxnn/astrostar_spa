import React, { useState, useEffect } from "react";
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
        <Form isOpen={isOpen} title="Crear Nuevo Material Deportivo" submitText="Crear" onClose={onClose} onSubmit={handleFormSubmit} >
            <FormField label="Nombre del Material" name="nombre" type="text" placeholder="Ej: Balón de fútbol" value={values.nombre} onChange={handleChange} />
            <FormField label="Cantidad Inicial" name="cantidadReal" type="number" placeholder="Ej: 10" value={values.cantidadReal} onChange={handleChange} />
            <FormField label="Estado" name="estado" type="select" value={values.estado} onChange={handleChange} options={[{ value: "Disponible", label: "Disponible" }, { value: "Agotado", label: "Agotado" }, { value: "En Mantenimiento", label: "En Mantenimiento" }]} />
        </Form>
    );
};

export default FormCreate;
