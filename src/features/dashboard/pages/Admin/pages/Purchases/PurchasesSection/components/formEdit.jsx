import React, { useState, useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import HandleOnChange from "../../../../../../../../shared/hooks/handleChange";


/**
 * Modal con el formulario para editar una compra existente.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.purchaseData - Los datos de la compra a editar.
 * @param {function} props.onSave - Función que se ejecuta al guardar los cambios.
 */
const FormEdit = ({ isOpen, onClose, purchaseData, onSave }) => {
    const [formData, setFormData] = useState({
        NombreProducto: "", Proveedor: "", FechaCompra: "",
        Cantidad: "", PrecioUnitario: "", estado: "",
    });

    // Cuando el modal se abre o los datos cambian, llenamos el formulario.
    useEffect(() => {
        if (purchaseData) {
            setFormData({
                NombreProducto: purchaseData.NombreProducto || "",
                Proveedor: purchaseData.Proveedor || "",
                FechaCompra: purchaseData.FechaCompra || "",
                Cantidad: purchaseData.Cantidad || 0,
                PrecioUnitario: purchaseData.PrecioUnitario || 0,
                estado: purchaseData.estado || "",
            });
        }
    }, [purchaseData]);

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
            title="Editar Compra"
            submitText="Guardar Cambios"
            onClose={onClose}
            onSubmit={handleFormSubmit}
            formData={formData}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="NombreProducto" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label><input type="text" id="NombreProducto" name="NombreProducto" value={formData.NombreProducto} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div><label htmlFor="Proveedor" className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label><input type="text" id="Proveedor" name="Proveedor" value={formData.Proveedor} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div><label htmlFor="FechaCompra" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label><input type="date" id="FechaCompra" name="FechaCompra" value={formData.FechaCompra} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div><label htmlFor="Cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label><input type="number" id="Cantidad" name="Cantidad" value={formData.Cantidad} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div><label htmlFor="PrecioUnitario" className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario ($)</label><input type="number" id="PrecioUnitario" name="PrecioUnitario" value={formData.PrecioUnitario} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                <div><label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label><select id="estado" name="estado" value={formData.estado} onChange={SaveData} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"><option value="" disabled>Seleccionar estado</option><option value="Pendiente">Pendiente</option><option value="Recibido">Recibido</option><option value="Cancelado">Cancelado</option></select></div>
            </div>
        </Form>
    );
};

export default FormEdit;