import React, { useState, useEffect, useMemo } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FaTrash, FaPlus, FaUserPlus } from 'react-icons/fa';
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import { useNavigate } from 'react-router-dom';

/**
 * Modal con el formulario para registrar una nueva compra.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSubmit - Función que se ejecuta al enviar el formulario.
 * @param {Array} props.equipmentList - Lista de materiales deportivos disponibles.
 * @param {Array} props.providerList - Lista de proveedores disponibles.
 */
const FormCreate = ({ isOpen, onClose, onSubmit, equipmentList = [], providerList = [] }) => {
    const navigate = useNavigate();

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
    // Estados para la búsqueda de proveedores
    const [providerSearchTerm, setProviderSearchTerm] = useState("");
    const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);

    useEffect(() => {
        const newSubtotal = invoiceData.productos.reduce((acc, prod) => acc + (prod.cantidad * prod.precioUnitario), 0);
        setInvoiceData(prev => ({ ...prev, subtotal: newSubtotal, total: newSubtotal }));
    }, [invoiceData.productos]);

    useEffect(() => {
        if (isOpen) {
            // Cuando se abre el modal, reseteamos todo
            setInvoiceData(getInitialState());
            setProviderSearchTerm("");
        }
    }, [isOpen]);

    const filteredProviders = useMemo(() => {
        // Si el término de búsqueda está vacío, muestra todos los proveedores.
        if (!providerSearchTerm.trim()) return providerList;

        const searchTermLower = providerSearchTerm.toLowerCase();
        return providerList.filter(p =>
            (p.razonSocial && p.razonSocial.toLowerCase().includes(searchTermLower)) ||
            (p.nit && p.nit.toString().toLowerCase().includes(searchTermLower))
        );
    }, [providerSearchTerm, providerList]);

    const handleInvoiceChange = (e) => {
        const { name, value } = e.target;
        if (name === "proveedor") { // Este es el input para el término de búsqueda
            setProviderSearchTerm(value);
            // Limpia el proveedor seleccionado de invoiceData si el usuario empieza a escribir de nuevo
            setInvoiceData(prev => ({ ...prev, proveedor: "" }));
            setIsProviderDropdownOpen(true); // Siempre abre el dropdown al escribir
        } else {
            setInvoiceData(prev => ({ ...prev, [name]: value }));
        }
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

    const handleSelectProvider = (provider) => {
        // Cuando se selecciona un proveedor, actualiza el proveedor real en invoiceData
        // y también establece el término de búsqueda al nombre del proveedor seleccionado
        // para que aparezca en el campo de entrada.
        setInvoiceData(prev => ({ ...prev, proveedor: provider.razonSocial }));
        setProviderSearchTerm(provider.razonSocial);
        setIsProviderDropdownOpen(false);
    };

    const handleNavigateToCreateProvider = () => {
        // Navega a la sección de proveedores
        navigate('../providers/');
        onClose(); // Cierra el modal de compra actual para una mejor experiencia de usuario
    };

    const handleAddProduct = () => {
        if (!productToAdd.id || !productToAdd.cantidad || !productToAdd.precioUnitario) {
            showErrorAlert("Campos incompletos", "Por favor, complete todos los campos del producto.");
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
        if (!invoiceData.numeroFactura.trim()) {
            showErrorAlert("Error de Validación", "El número de factura es requerido.");
            return;
        }
        if (!invoiceData.proveedor.trim()) {
            showErrorAlert("Error de Validación", "Debe seleccionar un proveedor de la lista.");
            return;
        }
        if (invoiceData.productos.length === 0) {
            showErrorAlert("Error de Validación", "Debe agregar al menos un producto a la compra.");
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
                    <div><label htmlFor="numeroFactura" className="block text-sm font-medium text-gray-700 mb-1">Número de Factura <span className="text-red-500">*</span></label><input type="text" id="numeroFactura" name="numeroFactura" value={invoiceData.numeroFactura} onChange={handleInvoiceChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Ej: FV-00123" required /></div>
                    <div className="relative">
                        <label htmlFor="proveedor" className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                id="proveedor"
                                name="proveedor"
                                value={providerSearchTerm} // El input ahora muestra el término de búsqueda
                                onChange={handleInvoiceChange}
                                onFocus={() => setIsProviderDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsProviderDropdownOpen(false), 200)} // Delay para permitir click en dropdown
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                                placeholder="Buscar por nombre o NIT..."
                                autoComplete="off"
                            />
                            <button type="button" onClick={handleNavigateToCreateProvider} className="p-2.5 bg-gray-200 text-gray-600 rounded-md hover:bg-primary-purple hover:text-white transition-colors" title="Crear nuevo proveedor">
                                <FaUserPlus />
                            </button>
                        </div>
                        {isProviderDropdownOpen && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredProviders.length > 0 ? (
                                    filteredProviders.map(provider => (
                                        <div key={provider.id} onClick={() => handleSelectProvider(provider)} className="px-4 py-2 text-sm text-gray-700 hover:bg-primary-purple/10 cursor-pointer">
                                            <p className="font-semibold">{provider.razonSocial}</p><p className="text-xs text-gray-500">NIT: {provider.nit}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-sm text-gray-500 italic">No se encontraron proveedores.</div>
                                )}
                            </div>
                        )}
                        {invoiceData.proveedor === "" && providerSearchTerm.trim() !== "" && !isProviderDropdownOpen && (
                            <p className="text-red-500 text-xs mt-1">Debe seleccionar un proveedor de la lista.</p>
                        )}
                        {invoiceData.proveedor === "" && providerSearchTerm.trim() === "" && !isProviderDropdownOpen && (
                            <p className="text-red-500 text-xs mt-1">El proveedor es requerido.</p>
                        )}
                    </div>
                    <div><label htmlFor="fechaCompra" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra <span className="text-red-500">*</span></label><input type="date" id="fechaCompra" name="fechaCompra" value={invoiceData.fechaCompra} onChange={handleInvoiceChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple" required /></div>
                    <div><label htmlFor="fechaRegistro" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label><input type="date" id="fechaRegistro" name="fechaRegistro" value={invoiceData.fechaRegistro} readOnly className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none" /></div>
                </div>
            </div>

            <div className="pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Productos</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="md:col-span-4"><label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-1">Producto <span className="text-red-500">*</span></label><select id="product-select" name="id" value={productToAdd.id} onChange={handleProductChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"><option value="" disabled>Seleccionar...</option>{equipmentList.map((eq) => (<option key={eq.id} value={eq.id}>{eq.NombreMaterial}</option>))}</select></div>
                    <div className="md:col-span-2"><label htmlFor="product-cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad <span className="text-red-500">*</span></label><input type="number" id="product-cantidad" name="cantidad" value={productToAdd.cantidad} onChange={handleProductChange} min="1" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"/></div>
                    <div className="md:col-span-3"><label htmlFor="product-precio" className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario <span className="text-red-500">*</span></label><input type="number" id="product-precio" name="precioUnitario" value={productToAdd.precioUnitario} onChange={handleProductChange} min="0" placeholder="0" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"/></div>
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