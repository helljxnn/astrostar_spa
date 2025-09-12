import React from 'react';

/**
 * Modal genérico para mostrar detalles de un item en modo solo lectura.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.data - El objeto de datos a mostrar.
 * @param {Array<{label: string, key: string}>} props.detailConfig - Configuración para mapear claves de datos a etiquetas.
 * @param {string} props.title - Título del modal.
 */
const ViewDetails = ({ isOpen, onClose, data, detailConfig, title }) => {
    if (!isOpen || !data) return null;

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className={`w-full h-full flex items-center justify-center transform transition-all duration-300 ease-in-out ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg flex flex-col gap-6">
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-4 w-full">
                        <h2 className="text-2xl font-questrial text-primary-purple">{title}</h2>
                    </div>
                    {/* Body */}
                    <div className="space-y-3">
                        {detailConfig.map(item => (
                            <div key={item.key} className="grid grid-cols-2 gap-4 items-center border-b border-gray-100 pb-2">
                                <p className="font-semibold text-gray-700">{item.label}:</p>
                                <p className="text-gray-600 text-right">{data[item.key]}</p>
                            </div>
                        ))}
                    </div>
                    {/* Footer */}
                    <div className="flex justify-end pt-4 w-full">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-primary-blue text-white font-bold hover:opacity-90 transition-opacity">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewDetails;