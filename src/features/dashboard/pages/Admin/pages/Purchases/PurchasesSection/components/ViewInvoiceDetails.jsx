import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ViewInvoiceDetails = ({ isOpen, onClose, invoiceData }) => {
    if (!invoiceData) return null;

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Fecha de Compra</p>
                                    <p className="text-gray-800">{invoiceData.fechaCompra}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Fecha de Registro</p>
                                    <p className="text-gray-800">{invoiceData.fechaRegistro}</p>
                                </div>
                            </div>

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
        </AnimatePresence>
    );
};

export default ViewInvoiceDetails;