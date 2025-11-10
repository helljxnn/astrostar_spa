import React, { useState, useEffect, useRef } from 'react';
import Form from '../../../../../../../shared/components/form';
import { showErrorAlert } from '../../../../../../../shared/utils/alerts';
import { FaImage, FaTimes, FaSearch, } from 'react-icons/fa';
import sportsEquipmentService from '../../../../../../../shared/services/sportsEquipmentService';

/**
 * Modal for decommissioning sports equipment.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSave - Function executed when saving the disposal.
 * @param {object} props.equipment - The specific piece of equipment to be decommissioned.
 */
const Disposals = ({ isOpen, onClose, onSave }) => {
    const getInitialState = () => ({
        equipmentId: '', // ID del material seleccionado
        quantity: 1,
        reason: 'other',
        observation: '',
        images: [], // Estado para los archivos de imagen
    });

    const [formData, setFormData] = useState(getInitialState());
    const [equipmentList, setEquipmentList] = useState([]); // Lista de todos los materiales
    const [selectedEquipment, setSelectedEquipment] = useState(null); // Material seleccionado
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const fetchEquipment = async () => {
                try {
                    // Obtenemos todos los materiales sin paginación
                    const response = await sportsEquipmentService.getAll({ limit: 1000 });
                    if (response.success) {
                        setEquipmentList(response.data);
                    }
                } catch (error) {
                    showErrorAlert("Error", "Could not fetch sports equipment list.");
                }
            };

            fetchEquipment();
            setFormData(getInitialState());
            setSelectedEquipment(null);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Limpiar input de archivo
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Si se cambia el material, actualizamos el objeto seleccionado
        if (name === 'equipmentId') {
            const selected = equipmentList.find(eq => eq.id === parseInt(value));
            setSelectedEquipment(selected || null);
            setFormData(prev => ({ ...prev, quantity: 1 })); // Reseteamos la cantidad
        }
    };

    const handleFormSubmit = () => {
        const quantity = parseInt(formData.quantity);

        if (!selectedEquipment) {
            showErrorAlert("Error de Validación", "Debes seleccionar un material deportivo.");
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            showErrorAlert("Error de Validación", "La cantidad a dar de baja debe ser mayor a cero.");
            return;
        }
        if (quantity > selectedEquipment.quantityTotal) {
            showErrorAlert("Error de Validación", `La cantidad no puede ser mayor al total disponible de ${selectedEquipment.quantityTotal}.`);
            return;
        }
        if (!formData.reason) {
            showErrorAlert("Error de Validación", "Debes seleccionar una razón para la baja.");
            return;
        }

        onSave({
            equipmentId: formData.equipmentId,
            quantity: quantity,
            reason: formData.reason,
            observation: formData.observation,
            images: formData.images, // Pasar los archivos de imagen
        });
    };

    return (
        <Form
            isOpen={isOpen}
            title="Dar de Baja Material Deportivo"
            submitText="Confirmar Baja"
            onClose={onClose}
            onSubmit={handleFormSubmit}
        >
            <div className="space-y-6">
                {/* Equipment Selection */}
                <div>
                    <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-1">
                        Material a dar de baja <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <select
                            id="equipmentId"
                            name="equipmentId"
                            value={formData.equipmentId}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                        >
                            <option value="">Selecciona un material...</option>
                            {equipmentList.map(eq => (
                                <option key={eq.id} value={eq.id}>
                                    {eq.name} (Disponible: {eq.quantityTotal})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Quantity and Reason */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad a dar de baja <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            max={selectedEquipment?.quantityTotal || 1}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                        />
                    </div>

                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Razón de la baja <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                        >
                            <option value="">Selecciona una razón</option>
                            <option value="damaged">Dañado o Roto</option>
                            <option value="lost">Perdido</option>
                            <option value="stolen">Robado</option>
                            <option value="obsolete">Obsoleto</option>
                            <option value="other">Otro (especificar en observaciones)</option>
                        </select>
                    </div>
                </div>

                {/* Observations */}
                <div>
                    <label htmlFor="observation" className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                    </label>
                    <textarea
                        id="observation"
                        name="observation"
                        value={formData.observation}
                        onChange={handleChange}
                        placeholder="Detalles adicionales sobre la baja..."
                        rows="3"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evidencia (Imágenes)
                    </label>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-purple hover:text-primary-blue focus-within:outline-none"
                                >
                                    <span>Sube tus archivos</span>
                                    <input id="file-upload" name="images" type="file" className="sr-only" multiple accept="image/*" onChange={(e) => setFormData(prev => ({ ...prev, images: [...prev.images, ...Array.from(e.target.files)] }))} ref={fileInputRef} />
                                </label>
                                <p className="pl-1">o arrástralos aquí</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                        </div>
                    </div>
                </div>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {formData.images.map((file, index) => (
                            <div key={index} className="relative group">
                                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="h-24 w-24 object-cover rounded-md" onLoad={e => URL.revokeObjectURL(e.target.src)} />
                                <button onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Form>
    );
};

export default Disposals;
