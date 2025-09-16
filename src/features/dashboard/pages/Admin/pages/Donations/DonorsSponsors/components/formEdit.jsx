import React, { useState, useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../../shared/components/FormField";

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
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, donorData]);

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
        <Form isOpen={isOpen} title="Editar Donante o Patrocinador" submitText="Guardar Cambios" onClose={onClose} onSubmit={handleFormSubmit} >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Identificación (C.C. o NIT)" name="identificacion" type="text" placeholder="Ej: 900.123.456-7" value={values.identificacion} onChange={handleChange} />
                <FormField label="Nombre / Razón Social" name="nombre" type="text" placeholder="Ej: Empresa Solidaria S.A.S." value={values.nombre} onChange={handleChange} />
            </div>
            <FormField label="Persona de Contacto" name="personaContacto" type="text" placeholder="Ej: Ana García" value={values.personaContacto} onChange={handleChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Tipo" name="tipo" type="select" value={values.tipo} onChange={handleChange} options={[{ value: "Donante", label: "Donante" }, { value: "Patrocinador", label: "Patrocinador" }]} />
                <FormField label="Tipo de Persona" name="tipoPersona" type="select" value={values.tipoPersona} onChange={handleChange} options={[{ value: "Natural", label: "Natural" }, { value: "Jurídica", label: "Jurídica" }]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Teléfono de Contacto" name="telefono" type="tel" placeholder="Ej: 3101234567" value={values.telefono} onChange={handleChange} />
                <FormField label="Correo Electrónico" name="correo" type="email" placeholder="Ej: contacto@empresa.com" value={values.correo} onChange={handleChange} />
            </div>
            <FormField label="Dirección" name="direccion" type="text" placeholder="Ej: Calle 100 # 20-30, Bogotá" value={values.direccion} onChange={handleChange} />
            <FormField label="Estado" name="estado" type="select" value={values.estado} onChange={handleChange} options={[{ value: "Activo", label: "Activo" }, { value: "Inactivo", label: "Inactivo" }]} />
        </Form>
    );
};

export default FormEdit;