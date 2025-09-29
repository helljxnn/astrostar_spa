import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal genérico y mejorado para mostrar detalles de un registro.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.data - El objeto con los datos a mostrar.
 * @param {Array<{label: string, key: string, format?: function}>} props.detailConfig - Configuración para mostrar los datos.
 * @param {string} props.title - Título del modal.
 */
const ViewDetails = ({ isOpen, onClose, data, detailConfig, title }) => {
    if (!data) return null;

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0, y: 50 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2 } },
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        onClick={onClose}
                    />
                    <motion.div
                        variants={modalVariants}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">✕</button>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">{title}</h2>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-5 flex-grow">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 ">
                                {detailConfig.map(({ label, key, format }) => {
                                    const value = data[key];
                                    const formattedValue = format ? format(value) : value;

                                    return (
                                        <div key={key} className="py-2">
                                            <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
                                            <p className="text-base text-gray-800 break-words">
                                                {formattedValue !== null && formattedValue !== undefined && formattedValue !== '' ? formattedValue : 'N/A'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6 flex justify-end">
                            <button type="button" onClick={onClose} className="px-8 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium">Cerrar</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ViewDetails;