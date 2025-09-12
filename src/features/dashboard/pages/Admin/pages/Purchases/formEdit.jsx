import React, { useState, useEffect } from "react";
import Form from "../../../../../../../shared/components/form";
import HandleOnChange from "../../../../../../../shared/hooks/handleChange";

const FormEdit = ({ isOpen, onClose, donationData, onSave }) => {
    const [formData, setFormData] = useState({
        NombrePatrocinador: "", Tipo: "", FechaDonacion: "",
        Monto: "", Descripcion: "", estado: "",
    });

    useEffect(() => {
        if (donationData) {
            setFormData({
                NombrePatrocinador: donationData.NombrePatrocinador || "",
                Tipo: donationData.Tipo || "Empresa",
                FechaDonacion: donationData.FechaDonacion || "",
                Monto: donationData.Monto || 0,
                Descripcion: donationData.Descripcion || "",
                estado: donationData.estado || "Activo",
            });
        }
    }, [donationData]);

    const SaveData = (e) => {
        HandleOnChange(formData, e, setFormData);
    };

    const handleFormSubmit = (dataFromForm) => {
        if (onSave) {
            onSave(dataFromForm);
        }
    };

    return (
        <Form
            isOpen={isOpen}
            title="Editar Patrocinador"
            submitText="Guardar Cambios"
            onClose={onClose}
            onSubmit={handleFormSubmit}
            formData={formData}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="NombrePatrocinador" className="block text-sm font-medium text-gray-700 mb-1">Nombre Patrocinador</label><input type="text" id="NombrePatrocinador" name="NombrePatrocinador" value={formData.NombrePatrocinador} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div><label htmlFor="Tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label><select id="Tipo" name="Tipo" value={formData.Tipo} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"><option value="Empresa">Empresa</option><option value="Persona">Persona</option></select></div>
                <div><label htmlFor="FechaDonacion" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Donación</label><input type="date" id="FechaDonacion" name="FechaDonacion" value={formData.FechaDonacion} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div><label htmlFor="Monto" className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label><input type="number" id="Monto" name="Monto" value={formData.Monto} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div className="md:col-span-2"><label htmlFor="Descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label><textarea id="Descripcion" name="Descripcion" value={formData.Descripcion} onChange={SaveData} rows="3" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"></textarea></div>
                <div><label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label><select id="estado" name="estado" value={formData.estado} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></div>
            </div>
        </Form>
    );
};

export default FormEdit;