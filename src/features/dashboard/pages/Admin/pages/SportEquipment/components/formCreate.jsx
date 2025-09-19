import React, { useState, useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../shared/components/FormField";

/**
 * Modal con el formulario para crear un nuevo material deportivo.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función para guardar el nuevo material.
 */
const FormCreate = ({ isOpen, onClose, onSave }) => {
    const initialValues = {
        nombre: "",
        estado: "",
    };
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});

    // Limpiar el formulario cuando el modal se cierra
    useEffect(() => {
        if (!isOpen) {
            setValues(initialValues);
            setTouched({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSubmit = () => {
        const isNombreValid = values.nombre && values.nombre.trim() !== "";
        const isEstadoValid = values.estado && values.estado.trim() !== "";

        if (isNombreValid && isEstadoValid) {
            if (onSave) {
                onSave(values);
            }
        } else {
            // Marcar todos los campos como "tocados" para mostrar errores
            setTouched({
                nombre: true,
                estado: true,
            });
        }
    };

    return (
        <Form isOpen={isOpen} title="Crear Nuevo Material Deportivo" submitText="Crear" onClose={onClose} onSubmit={handleSubmit} >
            <FormField
                label="Nombre del Material"
                name="nombre" type="text"
                placeholder="Ej: Balón de fútbol"
                value={values.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.nombre}
                required
            />
            <FormField
                label="Estado" name="estado" type="select"
                value={values.estado} onChange={handleChange}
                onBlur={handleBlur} touched={touched.estado}
                required
                options={[{ value: "Disponible", label: "Disponible" }, { value: "Agotado", label: "Agotado" }, { value: "En Mantenimiento", label: "En Mantenimiento" }]}
            />
        </Form>
    );
};

export default FormCreate;
