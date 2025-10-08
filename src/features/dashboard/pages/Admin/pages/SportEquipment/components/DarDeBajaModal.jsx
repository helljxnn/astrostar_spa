import React, { useState, useEffect, useMemo } from 'react';
import Form from '../../../../../../../shared/components/form';
import { FaTimes, FaImage } from 'react-icons/fa';
import { showErrorAlert } from '../../../../../../../shared/utils/alerts';

/**
 * Modal para dar de baja material deportivo.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función que se ejecuta al guardar la baja.
 * @param {Array} props.equipmentList - Lista de materiales deportivos disponibles.
 */
const DarDeBajaModal = ({ isOpen, onClose, onSave, equipmentList = [] }) => {
    const getInitialState = () => ({
        equipmentId: '',
        equipmentName: '', // Guardar el nombre para mostrar en la alerta de éxito
        quantity: 1,
        reason: '',
        images: [],
        observations: '',
    });

    const [formData, setFormData] = useState(getInitialState());
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setSearchTerm('');
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    const filteredEquipment = useMemo(() => {
        if (!searchTerm.trim()) return equipmentList;
        const lowerCaseTerm = searchTerm.toLowerCase();
        return equipmentList.filter(eq => eq.NombreMaterial.toLowerCase().includes(lowerCaseTerm));
    }, [searchTerm, equipmentList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'equipmentSearch') {
            setSearchTerm(value);
            setFormData(prev => ({ ...prev, equipmentId: '', equipmentName: '' }));
            setIsDropdownOpen(true);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectEquipment = (equipment) => {
        setFormData(prev => ({
            ...prev,
            equipmentId: equipment.id,
            equipmentName: equipment.NombreMaterial
        }));
        setSearchTerm(equipment.NombreMaterial);
        setIsDropdownOpen(false);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const filePromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ name: file.name, url: reader.result });
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises).then(newImages => {
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        });
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleFormSubmit = () => {
        if (!formData.equipmentId) {
            showErrorAlert("Error de Validación", "Debe seleccionar un material.");
            return;
        }
        if (formData.quantity <= 0) {
            showErrorAlert("Error de Validación", "La cantidad a dar de baja debe ser mayor que cero.");
            return;
        }
        if (!formData.reason.trim()) {
            showErrorAlert("Error de Validación", "Debe seleccionar un motivo para la baja.");
            return;
        }
        onSave(formData);
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
                {/* Selección de Material */}
                <div className="relative z-10">
                    <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-1">
                        Material Deportivo <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="equipment"
                        name="equipmentSearch"
                        type="text"
                        value={searchTerm}
                        onChange={handleChange}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        placeholder="Buscar material..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                        autoComplete="off"
                    />
                    {isDropdownOpen && (
                        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredEquipment.length > 0 ? (
                                filteredEquipment.map(eq => (
                                    <div
                                        key={eq.id}
                                        onClick={() => handleSelectEquipment(eq)}
                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-primary-purple/10 cursor-pointer"
                                    >
                                        {eq.NombreMaterial} (Disponible: {eq.Total})
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500 italic">
                                    No se encontraron materiales que coincidan.
                                </div>
                            )}
                        </div>
                    )}
                    {formData.equipmentId === "" && searchTerm.trim() !== "" && !isDropdownOpen && (
                        <p className="text-red-500 text-xs mt-1">Debe seleccionar un material válido de la lista.</p>
                    )}
                </div>

                {/* Cantidad y Motivo */}
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
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                        />
                    </div>

                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Motivo de la Baja <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="reason"
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                        >
                            <option value="">Seleccione el motivo</option>
                            <option value="Dañado">Dañado o Roto</option>
                            <option value="Extraviado">Extraviado</option>
                            <option value="Hurto">Hurto</option>
                            <option value="Obsoleto">Obsoleto</option>
                            <option value="Otro">Otro (especificar en observaciones)</option>
                        </select>
                    </div>
                </div>

                {/* Observaciones */}
                <div>
                    <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1 ">
                        Observaciones
                    </label>
                    <textarea
                        id="observations"
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                        placeholder="Detalles adicionales sobre la baja del material..."
                        rows="3"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
                    />
                </div>

                {/* Carga de Imágenes de evidencia */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imágenes de Evidencia (Opcional)
                    </label>
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
                    {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {formData.images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img src={image.url} alt={`preview ${index}`} className="h-24 w-full object-cover rounded-md shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Form>
    );
};

export default DarDeBajaModal;