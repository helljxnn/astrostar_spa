import React, { useState, useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FormField } from "../../../../../../../../shared/components/FormField";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

const FormEdit = ({ isOpen, onClose, donorData, onSave }) => {
    const initialValues = {
        name: "",
        contactPerson: "",
        type: "",
        personType: "",
        identification: "",
        phone: "",
        email: "",
        address: "",
        status: "",
    };
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({}); // Rastrea si un campo ha sido "tocado" (onBlur)

    useEffect(() => {
        if (isOpen && donorData) {
            setValues({
                name: donorData.name || "",
                contactPerson: donorData.contactPerson || "",
                type: donorData.type || "",
                personType: donorData.personType || "",
                identification: donorData.identification || "",
                phone: donorData.phone || "",
                email: donorData.email || "",
                address: donorData.address || "",
                status: donorData.status || "",
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
        if (name === 'identification' && !value.trim()) {
            error = "Identification is required.";
        } else if (name === 'name' && !value.trim()) {
            error = "Name is required.";
        } else if (name === 'phone' && !value.trim()) {
            error = "Phone is required.";
        } else if (name === 'email') {
            if (!value.trim()) {
                error = "Email is required.";
            } else if (!/\S+@\S+\.\S+/.test(value.trim())) {
                error = "Invalid email format.";
            }
        }
        return error;
    };

    const validateForm = () => {
        const newErrors = {};
        // Validar todos los campos obligatorios al intentar enviar
        ['identification', 'name', 'phone', 'email'].forEach(name => {
            const error = validateField(name, values[name]);
            if (error) newErrors[name] = error; // Solo añadir si hay un error real
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
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
            setTouched({ identification: true, name: true, phone: true, email: true });
            showErrorAlert("Validation Error", "Please complete all required fields.");
        }
    };

    return (
        <Form isOpen={isOpen} title="Edit Donor or Sponsor" submitText="Save Changes" onClose={onClose} onSubmit={handleFormSubmit} >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Identification (NIT/ID)" name="identification" type="text" placeholder="e.g., 900.123.456-7" value={values.identification} onChange={handleChange} onBlur={handleBlur} error={touched.identification && errors.identification} required />
                <FormField label="Name / Company Name" name="name" type="text" placeholder="e.g., Solidarity Corp S.A.S." value={values.name} onChange={handleChange} onBlur={handleBlur} error={touched.name && errors.name} required />
            </div>
            <FormField label="Contact Person" name="contactPerson" type="text" placeholder="e.g., Jane Doe (Optional)" value={values.contactPerson} onChange={handleChange} onBlur={handleBlur} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Type" name="type" type="select" value={values.type} onChange={handleChange} onBlur={handleBlur} options={[{ value: "Donor", label: "Donor" }, { value: "Sponsor", label: "Sponsor" }]} />
                <FormField label="Person Type" name="personType" type="select" value={values.personType} onChange={handleChange} onBlur={handleBlur} options={[{ value: "Natural", label: "Natural" }, { value: "Legal", label: "Legal" }]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Contact Phone" name="phone" type="tel" placeholder="e.g., 3101234567" value={values.phone} onChange={handleChange} onBlur={handleBlur} error={touched.phone && errors.phone} required />
                <FormField label="Email" name="email" type="email" placeholder="e.g., contact@company.com" value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email && errors.email} required />
            </div>
            <FormField label="Address" name="address" type="text" placeholder="e.g., 123 Main St, City (Optional)" value={values.address} onChange={handleChange} onBlur={handleBlur} />
            <FormField label="Status" name="status" type="select" value={values.status} onChange={handleChange} onBlur={handleBlur} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
        </Form>
    );
};

export default FormEdit;