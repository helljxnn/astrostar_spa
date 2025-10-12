import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import 'moment/locale/es';
import { FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';

/**
 * Modal genérico y mejorado para mostrar detalles de un registro.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.data - El objeto con los datos a mostrar.
 * @param {Array<{label: string, key: string, type?: string, format?: function}>} props.detailConfig - Configuración para mostrar los datos.
 * @param {string} props.title - Título del modal.
 */
const ViewDetails = ({ isOpen, onClose, data, detailConfig, title }) => {
    const [imageViewer, setImageViewer] = useState({ open: false, images: [], index: 0 });

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

    const openImageViewer = (images, index = 0) => {
        if (images && images.length > 0) {
            setImageViewer({ open: true, images, index });
        }
    };

    const closeImageViewer = () => {
        setImageViewer({ open: false, images: [], index: 0 });
    };

    const navigateImages = (direction) => {
        setImageViewer(prev => ({
            ...prev,
            index: (prev.index + direction + prev.images.length) % prev.images.length,
        }));
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
                            <div className="space-y-6">
                                {detailConfig.map(({ label, key, type, format }) => {
                                    const value = data[key];

                                    if (type === 'history' && Array.isArray(value) && value.length > 0) {
                                        return (
                                            <div key={key} className="col-span-1 sm:col-span-2">
                                                <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
                                                <div className="border rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Fecha</th>
                                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Cantidad</th>
                                                                <th className="px-4 py-2 text-left font-medium text-gray-600">Motivo</th>
                                                                <th className="px-4 py-2 text-center font-medium text-gray-600">Evidencia</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {value.map((entry, index) => (
                                                                <tr key={index}>
                                                                    <td className="px-4 py-2 text-gray-700">{moment(entry.date).format('DD/MM/YYYY')}</td>
                                                                    <td className="px-4 py-2 text-red-600 font-semibold">-{entry.quantity}</td>
                                                                    <td className="px-4 py-2 text-gray-700 break-words">{entry.reason}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        {entry.images && entry.images.length > 0 ? (
                                                                            <button onClick={() => openImageViewer(entry.images)} className="text-primary-purple hover:text-primary-blue">
                                                                                <FaImage />
                                                                            </button>
                                                                        ) : 'N/A'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    } else if (type === 'history') {
                                        return null; // No mostrar nada si no hay historial
                                    }

                                    const formattedValue = format ? format(value) : String(value);

                                    return (
                                        <div key={key} className="py-2 border-b last:border-b-0"><p className="text-sm font-semibold text-gray-500 mb-1">{label}</p><p className="text-base text-gray-800 break-words">{formattedValue !== null && formattedValue !== undefined && formattedValue !== '' ? formattedValue : 'N/A'}</p></div>
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
            {imageViewer.open && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={closeImageViewer}>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImages(-1); }}
                        className="absolute left-4 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 transition-colors"
                    >
                        <FaChevronLeft size={24} />
                    </button>
                    <motion.img
                        key={imageViewer.index}
                        src={imageViewer.images[imageViewer.index].url}
                        alt={`Evidencia ${imageViewer.index + 1}`}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    />
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImages(1); }}
                        className="absolute right-4 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 transition-colors"
                    >
                        <FaChevronRight size={24} />
                    </button>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ViewDetails;