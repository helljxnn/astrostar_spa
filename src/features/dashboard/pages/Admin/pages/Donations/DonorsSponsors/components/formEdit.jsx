import React, { useState, useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

const FormEdit = ({ isOpen, onClose, donorData, onSave }) => {
    const initialValues = {
        nombre: "",
        personaContacto: "",
        tipo: "",
        tipoPersona: "",
        identificacion: "",
        telefono: "",
        correo: "",
        direccion: "",
        estado: "",
    };
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({}); // Rastrea si un campo ha sido "tocado" (onBlur)

    useEffect(() => {
        if (isOpen && donorData) {
            setValues({
                nombre: donorData.nombre || "",
                personaContacto: donorData.personaContacto || "",
                tipo: donorData.tipo || "",
                tipoPersona: donorData.tipoPersona || "",
                identificacion: donorData.identificacion || "",
                telefono: donorData.telefono || "",
                correo: donorData.correo || "",
                direccion: donorData.direccion || "",
                estado: donorData.estado || "",
            });
        } else if (!isOpen) {
            setValues(initialValues);
            setTouched({}); // Limpiar el estado de "tocado"
            setErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, donorData]);

    // Función auxiliar para validar un campo específico
    const validateField = (name, value) => {
        let error = '';
        if (name === 'identificacion' && !value.trim()) {
            error = "La identificación es requerida.";
        } else if (name === 'nombre' && !value.trim()) {
            error = "El nombre es requerido.";
        } else if (name === 'telefono' && !value.trim()) {
            error = "El teléfono es requerido.";
        } else if (name === 'correo') {
            if (!value.trim()) {
                error = "El correo es requerido.";
            } else if (!/\S+@\S+\.\S+/.test(value.trim())) {
                error = "El formato del correo no es válido.";
            }
        }
        return error;
    };

    const validateForm = () => {
        const newErrors = {};
        // Validar todos los campos obligatorios al intentar enviar
        ['identificacion', 'nombre', 'telefono', 'correo'].forEach(name => {
            const error = validateField(name, values[name]);
            if (error) newErrors[name] = error; // Solo añadir si hay un error real
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'telefono') {
            // Permite solo números y un string vacío
            if (/^[0-9]*$/.test(value)) {
                setValues(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setValues(prev => ({ ...prev, [name]: value }));
        }
        // Limpiar el error inmediatamente al empezar a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true })); // Marcar el campo como tocado
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            onSave(values);
        } else {
            // Si hay errores, marcar todos los campos obligatorios como tocados para mostrar los errores
            setTouched({ identificacion: true, nombre: true, telefono: true, correo: true });
            showErrorAlert("Error de Validación", "Por favor, complete los campos obligatorios.");
        }
    };

    return (
        <Form isOpen={isOpen} title="Editar Donante o Patrocinador" submitText="Guardar Cambios" onClose={onClose} onSubmit={handleFormSubmit} >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Identificación (C.C. o NIT)" name="identificacion" type="text" placeholder="Ej: 900.123.456-7" value={values.identificacion} onChange={handleChange} onBlur={handleBlur} error={touched.identificacion && errors.identificacion} required />
                <FormField label="Nombre / Razón Social" name="nombre" type="text" placeholder="Ej: Empresa Solidaria S.A.S." value={values.nombre} onChange={handleChange} onBlur={handleBlur} error={touched.nombre && errors.nombre} required />
            </div>
            <FormField label="Persona de Contacto" name="personaContacto" type="text" placeholder="Ej: Ana García (Opcional)" value={values.personaContacto} onChange={handleChange} onBlur={handleBlur} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Tipo" name="tipo" type="select" value={values.tipo} onChange={handleChange} onBlur={handleBlur} options={[{ value: "Donante", label: "Donante" }, { value: "Patrocinador", label: "Patrocinador" }]} />
                <FormField label="Tipo de Persona" name="tipoPersona" type="select" value={values.tipoPersona} onChange={handleChange} onBlur={handleBlur} options={[{ value: "Natural", label: "Natural" }, { value: "Jurídica", label: "Jurídica" }]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Teléfono de Contacto" name="telefono" type="tel" placeholder="Ej: 3101234567" value={values.telefono} onChange={handleChange} onBlur={handleBlur} error={touched.telefono && errors.telefono} required />
                <FormField label="Correo Electrónico" name="correo" type="email" placeholder="Ej: contacto@empresa.com" value={values.correo} onChange={handleChange} onBlur={handleBlur} error={touched.correo && errors.correo} required />
            </div>
            <FormField label="Dirección" name="direccion" type="text" placeholder="Ej: Calle 100 # 20-30, Bogotá (Opcional)" value={values.direccion} onChange={handleChange} onBlur={handleBlur} />
            <FormField label="Estado" name="estado" type="select" value={values.estado} onChange={handleChange} onBlur={handleBlur} options={[{ value: "Activo", label: "Activo" }, { value: "Inactivo", label: "Inactivo" }]} />
        </Form>
    );
};

export default FormEdit;