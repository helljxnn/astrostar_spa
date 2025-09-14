import React, { useState, useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../shared/components/FormField";

const FormCreate = ({ isOpen, onClose, onSave }) => {
    const initialValues = {
        nombre: "",
        cantidadReal: "",
        estado: "Disponible", // Valor por defecto
    };
    const [values, setValues] = useState(initialValues);

    useEffect(() => {
        if (!isOpen) {
            setValues(initialValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = () => {
        if (onSave) {
            onSave(values);
        }
    };

    return (
        <Form isOpen={isOpen} title="Crear Nuevo Material Deportivo" submitText="Crear" onClose={onClose} onSubmit={handleFormSubmit} >
            <FormField label="Nombre del Material" name="nombre" type="text" placeholder="Ej: Balón de fútbol" value={values.nombre} onChange={handleChange} />
            <FormField label="Cantidad Inicial" name="cantidadReal" type="number" placeholder="Ej: 10" value={values.cantidadReal} onChange={handleChange} />
            <FormField label="Estado" name="estado" type="select" value={values.estado} onChange={handleChange} options={[{ value: "Disponible", label: "Disponible" }, { value: "Agotado", label: "Agotado" }, { value: "En Mantenimiento", label: "En Mantenimiento" }]} />
        </Form>
    );
};

export default FormCreate;