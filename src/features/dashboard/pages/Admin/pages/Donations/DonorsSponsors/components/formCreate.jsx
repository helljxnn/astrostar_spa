import React, { useState } from "react";
import Form from "../../../../../../../../shared/components/form";
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

const FormCreate = ({ isOpen, onClose, onSave }) => {
    const getInitialState = () => ({
        identification: "",
        name: "",
        contactPerson: "",
        type: "Donor",
        personType: "Natural",
        phone: "",
        email: "",
        address: "",
        status: "Active",
    });

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({}); // Almacena los mensajes de error por campo
    const [touched, setTouched] = useState({}); // Rastrea si un campo ha sido "tocado" (onBlur)

    // Función auxiliar para validar un campo específico
    const validateField = (name, value) => {
        let error = '';
        if (name === 'identification' && !(value || '').trim()) {
            error = "Identification is required.";
        } else if (name === 'name' && !(value || '').trim()) {
            error = "Name is required.";
        } else if (name === 'phone' && !(value || '').trim()) {
            error = "Phone is required.";
        } else if (name === 'email') {
            if (!(value || '').trim()) {
                error = "Email is required.";
            } else if (!/\S+@\S+\.\S+/.test((value || '').trim())) {
                error = "El formato del correo no es válido.";
            }
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // Permite solo números y un string vacío
            if (/^[0-9]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
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

    const validateForm = () => {
        const newErrors = {};
        // Validar todos los campos obligatorios al intentar enviar
        ['identification', 'name', 'phone', 'email'].forEach(name => {
            const error = validateField(name, formData[name]);
            if (error) newErrors[name] = error; // Solo añadir si hay un error real
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = () => {
        if (validateForm()) {
            onSave(formData);
        } else {
            // Si hay errores, marcar todos los campos obligatorios como tocados para mostrar los errores
            setTouched({ identification: true, name: true, phone: true, email: true });
            showErrorAlert("Validation Error", "Please complete all required fields.");
        }
    };

    // Limpiar el formulario cuando se cierra el modal
    const handleClose = () => {
        setFormData(getInitialState());
        setTouched({}); // Limpiar el estado de "tocado"
        setErrors({});
        onClose();
    };

    return (
        <Form
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleFormSubmit}
            title="Create Donor / Sponsor"
            submitText="Create"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="identification" className="block text-sm font-medium text-gray-700 mb-1">Identification (NIT/ID) <span className="text-red-500">*</span></label>
                    <input type="text" id="identification" name="identification" value={formData.identification} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="e.g., 123456789-0" />
                    {touched.identification && errors.identification && <p className="text-red-500 text-xs mt-1">{errors.identification}</p>}
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name / Company Name <span className="text-red-500">*</span></label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="e.g., John Doe or Company Inc." />
                    {touched.name && errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="e.g., Jane Smith (Optional)" />
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Donor">Donor</option>
                        <option value="Sponsor">Sponsor</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="personType" className="block text-sm font-medium text-gray-700 mb-1">Person Type</label>
                    <select id="personType" name="personType" value={formData.personType} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Natural">Natural</option>
                        <option value="Legal">Legal</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="e.g., 3001234567" />
                    {touched.phone && errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="example@email.com" />
                    {touched.email && errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="e.g., 123 Main St (Optional)" />
                </div>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} onBlur={handleBlur} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>
        </Form>
    );
};

export default FormCreate;