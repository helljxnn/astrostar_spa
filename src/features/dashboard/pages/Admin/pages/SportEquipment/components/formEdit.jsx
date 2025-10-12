import React, { useState, useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../shared/components/FormField";

const FormEdit = ({ isOpen, onClose, equipmentData, onSave }) => {
    const initialValues = {
        nombre: "",
        estado: "",
    };
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (isOpen && equipmentData) {
            setValues({
                nombre: equipmentData.NombreMaterial || "",
                estado: equipmentData.estado || "",
            });
        } else if (!isOpen) {
            setValues(initialValues);
            setTouched({}); // Reset touched state on close
        }
    }, [isOpen, equipmentData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleFormSubmit = () => {
        const isNombreValid = values.nombre && values.nombre.trim() !== "";
        const isEstadoValid = values.estado && values.estado.trim() !== "";

        if (isNombreValid && isEstadoValid) {
            if (onSave) {
                onSave(values);
            }
        } else {
            // Mark all fields as touched to show errors on submit
            setTouched({
                nombre: true,
                estado: true,
            });
        }
    };

    return (
        <Form isOpen={isOpen} title="Editar Material Deportivo" submitText="Guardar Cambios" onClose={onClose} onSubmit={handleFormSubmit} >
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
                label="Estado"
                name="estado"
                type="select"
                value={values.estado}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.estado}
                required
                options={[{ value: "Disponible", label: "Disponible" }, { value: "Agotado", label: "Agotado" }, { value: "En Mantenimiento", label: "En Mantenimiento" }]}
            />
        </Form>
    );
};

export default FormEdit;