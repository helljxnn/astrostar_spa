import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ViewInvoiceDetails = ({ isOpen, onClose, invoiceData }) => {
    if (!invoiceData) return null;

    const isCancelled = invoiceData.status === 'Cancelled';

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const statusStyles = {
        'Cancelled': 'bg-red-100 text-red-800',
        'Received': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'default': 'bg-gray-100 text-gray-800',
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
                                Purchase Details: <span className="text-primary-purple">{invoiceData.purchaseNumber}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Provider: {invoiceData.provider?.businessName || 'N/A'}</p>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Purchase Date</p>
                                    <p className="text-gray-800">{new Date(invoiceData.purchaseDate).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Delivery Date</p>
                                    <p className="text-gray-800">{invoiceData.deliveryDate ? new Date(invoiceData.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-semibold text-gray-600">Status</p>
                                    <span className={`px-2.5 py-1 font-semibold leading-tight rounded-full text-xs ${statusStyles[invoiceData.status] || statusStyles.default}`}>
                                        {invoiceData.status}
                                    </span>
                                </div>
                            </div>

                            {invoiceData.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-blue-800">Notes</h4>
                                    <p className="text-sm text-blue-700 mt-1">{invoiceData.notes}</p>
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchased Items</h3>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3">Product</th>
                                            <th className="px-4 py-3 text-right">Quantity</th>
                                            <th className="px-4 py-3 text-right">Unit Price</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceData.items.map(item => (
                                            <tr key={item.id} className="bg-white border-b last:border-b-0">
                                                <td className="px-4 py-3 font-medium text-gray-900">{item.sportsEquipment.name}</td>
                                                <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right">${parseFloat(item.unitPrice).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-semibold">${parseFloat(item.subtotal).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t border-gray-200 p-6 flex justify-between items-center">
                            <div className="text-2xl font-bold text-gray-800">
                                Total Amount: <span className="text-primary-blue">${parseFloat(invoiceData.totalAmount).toFixed(2)}</span>
                            </div>
                            <button type="button" onClick={onClose} className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium">Close</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ViewInvoiceDetails;
