import React, { useState, useEffect, useMemo } from "react";
import Form from "../../../../../../../../shared/components/form";
import { FaTrash, FaPlus } from 'react-icons/fa';
import { showErrorAlert } from "../../../../../../../../shared/utils/alerts";

const getInitialState = () => ({
    providerId: "",
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: "",
    items: [],
});

/**
 * Form for creating a new purchase.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSubmit - Function executed on form submission.
 * @param {Array} props.equipmentList - List of available sports equipment.
 * @param {Array} props.providerList - List of available providers.
 */
const FormCreate = ({ isOpen, onClose, onSubmit, equipmentList = [], providerList = [] }) => {
    const [purchaseData, setPurchaseData] = useState(getInitialState());

    useEffect(() => {
        if (isOpen) {
            setPurchaseData(getInitialState());
        }
    }, [isOpen]);

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setPurchaseData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...purchaseData.items];
        const selectedEquipment = equipmentList.find(eq => eq.id === parseInt(value));

        if (name === "sportsEquipmentId") {
            newItems[index].sportsEquipmentId = value;
            newItems[index].productName = selectedEquipment ? selectedEquipment.name : "";
        } else {
            newItems[index][name] = value;
        }
        setPurchaseData(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        setPurchaseData(prev => ({
            ...prev,
            items: [...prev.items, { sportsEquipmentId: "", productName: "", quantity: 1, unitPrice: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        const newItems = purchaseData.items.filter((_, i) => i !== index);
        setPurchaseData(prev => ({ ...prev, items: newItems }));
    };

    const handleFormSubmit = () => {
        if (!purchaseData.providerId) {
            showErrorAlert("Validation Error", "You must select a provider.");
            return;
        }
        if (purchaseData.items.length === 0) {
            showErrorAlert("Validation Error", "You must add at least one item to the purchase.");
            return;
        }
        for (const item of purchaseData.items) {
            if (!item.sportsEquipmentId || item.quantity <= 0 || item.unitPrice < 0) {
                showErrorAlert("Validation Error", "Please ensure all items have a selected product, a valid quantity, and a valid unit price.");
                return;
            }
        }
        onSubmit(purchaseData);
    };

    const totalAmount = useMemo(() => {
        return purchaseData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    }, [purchaseData.items]);

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
                        <select id="providerId" name="providerId" value={purchaseData.providerId} onChange={handleHeaderChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple" required>
                            <option value="">Select a provider</option>
                            {providerList.map(provider => (
                                <option key={provider.id} value={provider.id}>{provider.businessName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">Purchase Date <span className="text-red-500">*</span></label>
                        <input type="date" id="purchaseDate" name="purchaseDate" value={purchaseData.purchaseDate} onChange={handleHeaderChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple" required />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea id="notes" name="notes" value={purchaseData.notes} onChange={handleHeaderChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple" placeholder="Additional notes about the purchase..."></textarea>
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
                                <select name="sportsEquipmentId" value={item.sportsEquipmentId} onChange={(e) => handleItemChange(index, e)} className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple">
                                    <option value="">Select equipment</option>
                                    {equipmentList.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                                    ))}
                                </select>
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
