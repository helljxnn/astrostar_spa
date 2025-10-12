import React, { useState, useEffect, useMemo } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FaTrash, FaPlus, FaUserPlus, FaBoxOpen, FaImage, FaTimes } from 'react-icons/fa';
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
        observaciones: "",
        imagenes: [], // Nuevo campo para las imágenes
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
    // Estados para la búsqueda de productos
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);


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

    const filteredEquipment = useMemo(() => {
        if (!productSearchTerm.trim()) return equipmentList;

        const searchTermLower = productSearchTerm.toLowerCase();
        return equipmentList.filter(eq =>
            eq.NombreMaterial.toLowerCase().includes(searchTermLower)
        );
    }, [productSearchTerm, equipmentList]);


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
        if (name === "producto") { // Input de búsqueda de producto
            setProductSearchTerm(value);
            setProductToAdd(prev => ({ ...prev, id: "", nombre: "" })); // Limpiar selección si se escribe
            setIsProductDropdownOpen(true);
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

    const handleSelectProduct = (equipment) => {
        setProductToAdd(prev => ({
            ...prev,
            id: equipment.id,
            nombre: equipment.NombreMaterial
        }));
        setProductSearchTerm(equipment.NombreMaterial);
        setIsProductDropdownOpen(false);
    };

    const handleNavigateToCreateProvider = () => {
        // Navega a la sección de proveedores
        navigate('../providers/', { state: { openCreateModal: true } });
        onClose(); // Cierra el modal de compra actual para una mejor experiencia de usuario
    };

    const handleNavigateToCreateEquipment = () => {
        // Navega a la sección de material deportivo y le indica que abra el modal de creación
        navigate('../sportsEquipment', { state: { openCreateModal: true } });
        onClose(); // Cierra el modal de compra actual
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
        setProductToAdd({ id: "", nombre: "", cantidad: 1, precioUnitario: "" }); // Resetear campos del producto
        setProductSearchTerm(""); // Resetear campo de búsqueda del producto
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Convertir archivos a Base64 para poder guardarlos en el estado y localStorage
        const filePromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve({ name: file.name, url: reader.result });
                reader.onerror = error => reject(error);
            });
        });

        Promise.all(filePromises)
            .then(newImages => {
                setInvoiceData(prev => ({
                    ...prev,
                    // Evitar duplicados si el usuario selecciona el mismo archivo de nuevo
                    imagenes: [...prev.imagenes, ...newImages.filter(img => !prev.imagenes.some(pi => pi.name === img.name))]
                }));
            })
            .catch(error => {
                console.error("Error al procesar las imágenes:", error);
                showErrorAlert("Error", "Hubo un problema al cargar las imágenes.");
            });

        // Resetear el input para permitir seleccionar el mismo archivo después de eliminarlo
        e.target.value = null;
    };

    const handleRemoveImage = (indexToRemove) => {
        setInvoiceData(prev => ({
            ...prev,
            imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
        }));
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
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes de la Factura</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-purple hover:text-primary-blue focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-purple">
                                        <span>Sube los archivos</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <p className="pl-1">o arrástralos aquí</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                            </div>
                        </div>
                        {invoiceData.imagenes.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {invoiceData.imagenes.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img src={image.url} alt={`preview ${index}`} className="h-24 w-full object-cover rounded-md shadow-md" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        ><FaTimes /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Productos</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="md:col-span-4">
                        <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">Producto <span className="text-red-500">*</span></label>
                        <div className="flex items-center gap-2 relative">
                            <input
                                type="text"
                                id="producto"
                                name="producto"
                                value={productSearchTerm}
                                onChange={handleProductChange}
                                onFocus={() => setIsProductDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsProductDropdownOpen(false), 200)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                                placeholder="Buscar material deportivo..."
                                autoComplete="off"
                            />
                            {isProductDropdownOpen && (
                                <div className="absolute top-full z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {filteredEquipment.length > 0 ? (
                                        filteredEquipment.map(eq => (<div key={eq.id} onClick={() => handleSelectProduct(eq)} className="px-4 py-2 text-sm text-gray-700 hover:bg-primary-purple/10 cursor-pointer">{eq.NombreMaterial}</div>))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500 italic">No se encontraron materiales.</div>
                                    )}
                                </div>
                            )}
                            <button type="button" onClick={handleNavigateToCreateEquipment} className="p-2.5 bg-gray-200 text-gray-600 rounded-md hover:bg-primary-purple hover:text-white transition-colors" title="Crear nuevo material">
                                <FaBoxOpen />
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2"><label htmlFor="product-cantidad" className="block text-sm font-medium text-gray-700 mb-1">Cantidad <span className="text-red-500">*</span></label><input type="number" id="product-cantidad" name="cantidad" value={productToAdd.cantidad} onChange={handleProductChange} min="1" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
                    <div className="md:col-span-3"><label htmlFor="product-precio" className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario <span className="text-red-500">*</span></label><input type="number" id="product-precio" name="precioUnitario" value={productToAdd.precioUnitario} onChange={handleProductChange} min="0" placeholder="0" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" /></div>
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

                {/* Campo de Observaciones movido aquí */}
                <div className="mt-6">
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea id="observaciones" name="observaciones" value={invoiceData.observaciones} onChange={handleInvoiceChange} rows="3" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Añade cualquier nota adicional sobre la compra..."></textarea>
                </div>
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