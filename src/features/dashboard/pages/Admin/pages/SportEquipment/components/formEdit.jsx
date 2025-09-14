import React, { useState, useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../shared/components/FormField";
import { useFormValidation, equipmentValidationRules } from "../hooks/useEquipmentValidation";
import { showErrorAlert } from "../../../../../../../shared/utils/Alerts";
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
    const {
        values,
        errors,
        touched,
        setValues,
        handleChange,
        handleBlur,
        validateAllFields,
        resetForm
    } = useFormValidation({
        nombre: "",
        cantidadReal: "",
        estado: "",
    }, equipmentValidationRules);

    // Cuando el modal se abre o los datos del equipo cambian, llenamos el formulario.
    useEffect(() => {
        if (isOpen && equipmentData) {
            setValues({
                nombre: equipmentData.NombreMaterial || "",
                cantidadReal: equipmentData.Total || 0,
                estado: equipmentData.estado || "",
            });
        } else if (!isOpen) {
            resetForm();
        }
    }, [isOpen, equipmentData, setValues, resetForm]);

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
            title="Editar Material Deportivo"
            submitText="Guardar Cambios"
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

export default FormEdit;