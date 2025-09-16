import React, { useState, useEffect } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FaTrash, FaPlus } from 'react-icons/fa';

/**
 * Modal con el formulario para registrar una nueva compra.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSubmit - Función que se ejecuta al enviar el formulario.
 * @param {Array} props.equipmentList - Lista de materiales deportivos disponibles.
 */
const FormCreate = ({ isOpen, onClose, onSubmit, equipmentList = [] }) => {
    const getInitialState = () => ({
        numeroFactura: "",
        proveedor: "",
        fechaCompra: "",
        fechaRegistro: new Date().toISOString().split('T')[0],
        productos: [],
        subtotal: 0,
        total: 0,
    });

    const [invoiceData, setInvoiceData] = useState(getInitialState());
    const [productToAdd, setProductToAdd] = useState({
        id: "",
        nombre: "",
        cantidad: 1,
        precioUnitario: "",
    });

    useEffect(() => {
        const newSubtotal = invoiceData.productos.reduce((acc, prod) => acc + (prod.cantidad * prod.precioUnitario), 0);
        setInvoiceData(prev => ({ ...prev, subtotal: newSubtotal, total: newSubtotal }));
    }, [invoiceData.productos]);

    useEffect(() => {
        if (isOpen) {
            setInvoiceData(getInitialState());
        }
    }, [isOpen]);

    const handleInvoiceChange = (e) => {
        const { name, value } = e.target;
        setInvoiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        if (name === "id") {
            const selectedEquipment = equipmentList.find(eq => eq.id === Number(value));
            setProductToAdd(prev => ({
                ...prev,
                id: value,
                nombre: selectedEquipment ? selectedEquipment.NombreMaterial : ""
            }));
        } else {
            setProductToAdd(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddProduct = () => {
        if (!productToAdd.id || !productToAdd.cantidad || !productToAdd.precioUnitario) {
            alert("Por favor, complete todos los campos del producto.");
            return;
        }
        const newProduct = {
            id: Number(productToAdd.id),
            nombre: productToAdd.nombre,
            cantidad: Number(productToAdd.cantidad),
            precioUnitario: Number(productToAdd.precioUnitario),
        };
        setInvoiceData(prev => ({
            ...prev,
            productos: [...prev.productos, newProduct]
        }));
        setProductToAdd({ id: "", nombre: "", cantidad: 1, precioUnitario: "" });
    };

    const handleDeleteProduct = (indexToDelete) => {
        setInvoiceData(prev => ({
            ...prev,
            productos: prev.productos.filter((_, index) => index !== indexToDelete)
        }));
    };

    const handleFormSubmit = () => {
        if (!invoiceData.numeroFactura || !invoiceData.proveedor || !invoiceData.fechaCompra) {
            alert("Por favor, complete los detalles de la factura.");
            return;
        }
        if (invoiceData.productos.length === 0) {
            alert("Debe agregar al menos un producto a la compra.");
            return;
        }
        if (onSubmit) {
            onSubmit(invoiceData);
        }
        setInvoiceData(getInitialState());
    };

    return (
        <Form
            isOpen={isOpen}
            title="Registrar Nueva Compra"
            submitText="Registrar Compra"
            onClose={onClose}
            onSubmit={handleFormSubmit}
        >
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la Factura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="numeroFactura" className="block text-sm font-medium text-gray-700 mb-1">Número de Factura</label><input type="text" id="numeroFactura" name="numeroFactura" value={invoiceData.numeroFactura} onChange={handleInvoiceChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: FV-00123" /></div>
                    <div><label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label><input type="text" id="proveedor" name="proveedor" value={invoiceData.proveedor} onChange={handleInvoiceChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: Deportes El Campeón" /></div>
                    <div><label htmlFor="fechaCompra" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label><input type="date" id="fechaCompra" name="fechaCompra" value={invoiceData.fechaCompra} onChange={handleInvoiceChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                    <div><label htmlFor="fechaRegistro" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label><input type="date" id="fechaRegistro" name="fechaRegistro" value={invoiceData.fechaRegistro} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none" /></div>
                </div>
            </div>

            <div className="pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Productos</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="md:col-span-4"><label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-1">Producto</label><select id="product-select" name="id" value={productToAdd.id} onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"><option value="" disabled>Seleccionar...</option>{equipmentList.map((eq) => (<option key={eq.id} value={eq.id}>{eq.NombreMaterial}</option>))}</select></div>
                    <div className="md:col-span-2"><label htmlFor="product-cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label><input type="number" id="product-cantidad" name="cantidad" value={productToAdd.cantidad} onChange={handleProductChange} min="1" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                    <div className="md:col-span-3"><label htmlFor="product-precio" className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario</label><input type="number" id="product-precio" name="precioUnitario" value={productToAdd.precioUnitario} onChange={handleProductChange} min="0" placeholder="0" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                    <div className="md:col-span-3"><button type="button" onClick={handleAddProduct} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-md shadow hover:bg-primary-purple transition-colors font-semibold"><FaPlus size={14} /> Agregar</button></div>
                </div>

                <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-gray-700 uppercase bg-gray-100"><tr><th className="px-4 py-2">Producto</th><th className="px-4 py-2">Cantidad</th><th className="px-4 py-2">Precio Unit.</th><th className="px-4 py-2">Subtotal</th><th className="px-4 py-2 text-center">Acción</th></tr></thead><tbody>
                    {invoiceData.productos.length > 0 ? (invoiceData.productos.map((prod, index) => (<tr key={index} className="bg-white border-b">
                        <td className="px-4 py-2 font-medium text-gray-900">{prod.nombre}</td>
                        <td className="px-4 py-2">{prod.cantidad}</td>
                        <td className="px-4 py-2">${prod.precioUnitario.toLocaleString('es-CO')}</td>
                        <td className="px-4 py-2">${(prod.cantidad * prod.precioUnitario).toLocaleString('es-CO')}</td>
                        <td className="px-4 py-2 text-center"><button type="button" onClick={() => handleDeleteProduct(index)} className="text-red-500 hover:text-red-700"><FaTrash /></button></td>
                    </tr>))) : (<tr><td colSpan="5" className="text-center py-4 text-gray-500 italic">No hay productos agregados.</td></tr>)}
                </tbody></table></div>

                <div className="flex justify-end mt-6">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span className="font-medium">${invoiceData.subtotal.toLocaleString('es-CO')}</span></div>
                        <div className="flex justify-between text-gray-900 font-bold text-lg border-t pt-2"><span>Total:</span><span>${invoiceData.total.toLocaleString('es-CO')}</span></div>
                    </div>
                </div>
            </div>
        </Form>
    );
};

export default FormCreate;