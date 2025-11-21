import React, { useState, useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../shared/components/FormField";

const FormEdit = ({ isOpen, onClose, equipmentData, onSave }) => {
    const initialValues = {
        name: "",
        status: "",
    };
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (isOpen && equipmentData) {
            setValues({
                name: equipmentData.name || "",
                status: equipmentData.status || "",
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
        const isNameValid = values.name && values.name.trim() !== "";
        const isStatusValid = values.status && values.status.trim() !== "";

        if (isNameValid && isStatusValid) {
            if (onSave) {
                onSave(values);
            }
        } else {
            // Mark all fields as touched to show errors on submit
            setTouched({
                name: true,
                status: true,
            });
        }
    };

    return (
        <Form isOpen={isOpen} title="Editar Material Deportivo" submitText="Guardar Cambios" onClose={onClose} onSubmit={handleFormSubmit} >
            <FormField
                label="Nombre del Material"
                name="name" type="text"
                placeholder="Ej: Balón de fútbol"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.name}
                required
            />
            <FormField
                label="Estado"
                name="status"
                type="select"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
                touched={touched.status}
                required
                options={[{ value: "Active", label: "Activado" }, { value: "Inactive", label: "Desactivado" }, { value: "SoldOut", label: "Agotado" }]}
            />
        </Form>
    );
};

export default FormEdit;