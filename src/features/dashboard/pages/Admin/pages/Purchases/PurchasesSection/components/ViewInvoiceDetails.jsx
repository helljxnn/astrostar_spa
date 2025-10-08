import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ViewInvoiceDetails = ({ isOpen, onClose, invoiceData }) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!invoiceData) return null;

    const isCancelled = invoiceData.estado === 'Cancelado';

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const statusStyles = {
        'Cancelado': 'bg-red-100 text-red-800',
        'default': 'bg-gray-100 text-gray-800',
    };

    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0, y: 50 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2 } },
    };

    const openImageModal = (index) => {
        setCurrentImageIndex(index);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
    };

    const navigateImages = (direction) => {
        const newIndex = (currentImageIndex + direction + invoiceData.imagenes.length) % invoiceData.imagenes.length;
        setCurrentImageIndex(newIndex);
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
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">✕</button>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Detalles de la Factura: <span className="text-primary-purple">{invoiceData.numeroFactura}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Proveedor: {invoiceData.proveedor}</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Fecha de Compra</p>
                                    <p className="text-gray-800">{invoiceData.fechaCompra}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Fecha de Registro</p>
                                    <p className="text-gray-800">{invoiceData.fechaRegistro}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Estado de la Compra</p>
                                    <span className={`px-2.5 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[invoiceData.estado] || statusStyles.default}`}>
                                        {invoiceData.estado}
                                    </span>
                                </div>
                            </div>

                            {isCancelled && invoiceData.cancelReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <FaInfoCircle className="text-xl text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-red-800">Motivo de Anulación</h4>
                                            <p className="text-sm text-red-700 mt-1">{invoiceData.cancelReason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Incluidos</h3>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3">Producto</th>
                                            <th className="px-4 py-3 text-right">Cantidad</th>
                                            <th className="px-4 py-3 text-right">Precio Unitario</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceData.productos.map(prod => (
                                            <tr key={prod.id} className="bg-white border-b last:border-b-0">
                                                <td className="px-4 py-3 font-medium text-gray-900">{prod.concepto}</td>
                                                <td className="px-4 py-3 text-right">{prod.cantidad}</td>
                                                <td className="px-4 py-3 text-right">${prod.precioUnitario.toLocaleString('es-CO')}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{prod.monto}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {invoiceData.imagenes && invoiceData.imagenes.length > 0 && (
                            <div className="px-6 pb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Imágenes Adjuntas</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                    {invoiceData.imagenes.map((image, index) => (
                                        <div key={index} className="relative group cursor-pointer" onClick={() => openImageModal(index)}>
                                            <img src={image.url} alt={`Factura ${index + 1}`} className="h-24 w-full object-cover rounded-md shadow-md transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                                <p className="text-white text-xs font-bold">Ver</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6 flex justify-between items-center">
                            <div className="text-2xl font-bold text-gray-800">
                                Total Factura: <span className="text-primary-blue">${invoiceData.total.toLocaleString('es-CO')}</span>
                            </div>
                            <button type="button" onClick={onClose} className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium">Cerrar</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            {showImageModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" onClick={closeImageModal}>
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImages(-1); }}
                        className="absolute left-4 text-white bg-black/30 p-3 rounded-full hover:bg-black/50 transition-colors"
                    >
                        <FaChevronLeft size={24} />
                    </button>
                    <motion.img
                        key={currentImageIndex}
                        src={invoiceData.imagenes[currentImageIndex].url}
                        alt={`Imagen ${currentImageIndex + 1}`}
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

export default ViewInvoiceDetails;