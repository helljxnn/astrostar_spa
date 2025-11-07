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
        name: "",
    };
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Función de validación
    const validate = (currentValues) => {
        const newErrors = {};
        if (!currentValues.name || currentValues.name.trim() === "") {
            newErrors.name = "El nombre del material es obligatorio.";
        }
        return newErrors;
    };

    // Limpiar el formulario cuando el modal se cierra
    useEffect(() => {
        if (!isOpen) {
            setValues(initialValues);
            setTouched({});
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(validate(values)); // Validar en el evento onBlur
    };

    const handleSubmit = () => {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        setTouched({ name: true }); // Marcar todos los campos como tocados

        // Si no hay errores, proceder a guardar
        if (Object.keys(validationErrors).length === 0) {
            onSave?.(values);
        }
    };

    return (
        <Form isOpen={isOpen} title="Crear Nuevo Material Deportivo" submitText="Crear" onClose={onClose} onSubmit={handleSubmit} >
            <FormField
                label="Nombre del Material"
                name="name" type="text"
                placeholder="Ej: Balón de fútbol"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.name}
                error={errors.name}
                required
            />
        </Form>
    );
};

export default FormCreate;
