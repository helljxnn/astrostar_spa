import React, { useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../shared/components/FormField";
import { useFormValidation, equipmentValidationRules } from "../hooks/useEquipmentValidation";
import { showErrorAlert } from "../../../../../../../shared/utils/Alerts";

/**
 * Modal con el formulario para crear un nuevo material deportivo.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función que se ejecuta al guardar el nuevo material.
 */
const FormCreate = ({ isOpen, onClose, onSave }) => {
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAllFields,
        resetForm
    } = useFormValidation({
        nombre: "",
        cantidadReal: "",
        estado: "",
    }, equipmentValidationRules);

    // Resetea el formulario cuando el modal se cierra
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen, resetForm]);

    const handleFormSubmit = () => {
        if (validateAllFields()) {
            if (onSave) {
                onSave(values);
            }
        } else {
            showErrorAlert("Error de validación", "Por favor, corrige los campos marcados en rojo.");
        }
    };

    return (
        <Form
            isOpen={isOpen}
            title="Crear Nuevo Material"
            submitText="Crear"
            onClose={onClose}
            onSubmit={handleFormSubmit}
        >
            <FormField label="Nombre del Material" name="nombre" type="text" placeholder="Ej: Balón de fútbol" value={values.nombre} onChange={handleChange} onBlur={handleBlur} error={errors.nombre} touched={touched.nombre} required />
            <FormField label="Cantidad Actual" name="cantidadReal" type="number" placeholder="0" value={values.cantidadReal} onChange={handleChange} onBlur={handleBlur} error={errors.cantidadReal} touched={touched.cantidadReal} required min="0" />
            <FormField
                label="Estado"
                name="estado"
                type="select"
                placeholder="Seleccionar estado"
                value={values.estado}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.estado}
                touched={touched.estado}
                options={[
                    { value: "Activo", label: "Activo" },
                    { value: "Inactivo", label: "Inactivo" },
                ]}
                required
            />
        </Form>
    );
};

export default FormCreate;