import React, { useState, useEffect, useMemo } from "react";
import AsyncSelect from 'react-select/async';
import Form from "../../../../../../../../shared/components/form";
import { FaTrash, FaPlus } from 'react-icons/fa';
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";
import apiClient from "../../../../../../../../shared/services/apiClient";

const getInitialState = () => ({
    provider: null, // Cambiado a objeto para react-select
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: "",
    items: [],
    images: [], // Añadido para manejar las imágenes
});

/**
 * Form for creating a new purchase.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSubmit - Function executed on form submission.
 * @param {Array} props.equipmentList - List of available sports equipment.
 */
const FormCreate = ({ isOpen, onClose, onSubmit }) => {
    const [purchaseData, setPurchaseData] = useState(getInitialState());
    const [imageFiles, setImageFiles] = useState([]); // Estado para los archivos de imagen

    useEffect(() => {
        if (isOpen) {
            setPurchaseData(getInitialState());
        }
    }, [isOpen]);

    const handleHeaderChange = (e, fieldName) => {
        const value = e?.target ? e.target.value : e;
        setPurchaseData(prev => ({ ...prev, [fieldName || e.target.name]: value }));
    };

    const handleImageChange = (e) => {
        // Guardamos los archivos seleccionados para poder enviarlos
        setImageFiles(Array.from(e.target.files));
    };

    const handleItemChange = (index, e, fieldName) => {
        const name = fieldName || e.target.name;
        const value = e?.target ? e.target.value : e;
        const newItems = [...purchaseData.items];

        if (name === "equipment") {
            newItems[index].equipment = value; // Guardar el objeto completo
        } else {
            newItems[index][name] = value;
        }
        setPurchaseData(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        setPurchaseData(prev => ({
            ...prev,
            items: [...prev.items, { equipment: null, quantity: 1, unitPrice: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        const newItems = purchaseData.items.filter((_, i) => i !== index);
        setPurchaseData(prev => ({ ...prev, items: newItems }));
    };

    const handleFormSubmit = () => {
        if (!purchaseData.provider) {
            showErrorAlert("Validation Error", "You must select a provider.");
            return;
        }
        if (purchaseData.items.length === 0) {
            showErrorAlert("Validation Error", "You must add at least one item to the purchase.");
            return;
        }
        for (const item of purchaseData.items) {
            if (!item.equipment || item.quantity <= 0 || item.unitPrice < 0) {
                showErrorAlert("Validation Error", "Please ensure all items have a selected product, a valid quantity, and a valid unit price.");
                return;
            }
        }

        // Creamos el objeto FormData para enviar al backend
        const formData = new FormData();
        formData.append('providerId', purchaseData.provider.value); // Enviar solo el ID
        formData.append('purchaseDate', purchaseData.purchaseDate);
        formData.append('notes', purchaseData.notes);
        // Mapear items para enviar solo los datos necesarios
        const itemsToSubmit = purchaseData.items.map(item => ({
            sportsEquipmentId: item.equipment.value,
            productName: item.equipment.label,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        }));
        formData.append('items', JSON.stringify(itemsToSubmit));
        imageFiles.forEach(file => formData.append('images', file)); // Añadimos cada imagen

        onSubmit(formData);
    };

    const totalAmount = useMemo(() => {
        return purchaseData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }, [purchaseData.items]);

    // Funciones para cargar opciones en los AsyncSelect
    const loadProviders = async (inputValue) => {
        try {
            const response = await apiClient.get('/purchases/providers', { search: inputValue, limit: 10 });
            if (response.success) {
                return response.data.map(provider => ({
                    value: provider.id,
                    label: provider.businessName,
                }));
            }
        } catch (error) { console.error(error); }
        return [];
    };

    const loadEquipment = async (inputValue) => {
        try {
            const response = await apiClient.get('/purchases/sports-equipment', { search: inputValue, limit: 10 });
            if (response.success) {
                return response.data.map(eq => ({
                    value: eq.id,
                    label: eq.name,
                }));
            }
        } catch (error) { console.error(error); }
        return [];
    };

    return (
        <Form
            isOpen={isOpen}
            title="Register New Purchase"
            submitText="Register Purchase"
            onClose={onClose}
            onSubmit={handleFormSubmit}
        >
            <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="providerId" className="block text-sm font-medium text-gray-700 mb-1">Provider <span className="text-red-500">*</span></label>
                        <AsyncSelect
                            id="provider"
                            name="provider"
                            cacheOptions
                            defaultOptions
                            loadOptions={loadProviders}
                            value={purchaseData.provider}
                            onChange={(e) => handleHeaderChange(e, 'provider')}
                            placeholder="Search for a provider..."
                            classNamePrefix="react-select"
                        />
                    </div>
                    <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">Purchase Date <span className="text-red-500">*</span></label>
                        <input type="date" id="purchaseDate" name="purchaseDate" value={purchaseData.purchaseDate} onChange={handleHeaderChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple" required />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea id="notes" name="notes" value={purchaseData.notes} onChange={handleHeaderChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Additional notes about the purchase..."></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">Invoice Images (up to 5)</label>
                        <input type="file" id="images" name="images" onChange={handleImageChange} multiple accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-purple/10 file:text-primary-purple hover:file:bg-primary-purple/20" />
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Items</h3>
                <div className="space-y-4">
                    {purchaseData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                            <div className="col-span-5">
                                <label className="block text-xs font-medium text-gray-600">Product</label>
                                <AsyncSelect
                                    name="equipment"
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadEquipment}
                                    value={item.equipment}
                                    onChange={(e) => handleItemChange(index, e, 'equipment')}
                                    placeholder="Search product..."
                                    classNamePrefix="react-select-sm"
                                    className="text-sm"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600">Qty</label>
                                <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} min="1" className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-xs font-medium text-gray-600">Unit Price</label>
                                <input type="number" name="unitPrice" value={item.unitPrice} onChange={(e) => handleItemChange(index, e)} min="0" step="0.01" className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div className="col-span-2 flex items-end h-full">
                                <button type="button" onClick={() => handleRemoveItem(index)} className="w-full flex items-center justify-center gap-2 px-2 py-1.5 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition-colors text-sm"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={handleAddItem} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 transition-colors font-semibold"><FaPlus size={14} /> Add Item</button>

                <div className="flex justify-end mt-6">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-gray-900 font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Form>
    );
};

export default FormCreate;
