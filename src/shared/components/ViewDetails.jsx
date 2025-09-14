import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0, y: 50 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                when: "beforeChildren", // Asegura que el modal aparezca antes que los hijos
                staggerChildren: 0.07, // Anima los hijos con un pequeño retraso
            },
        },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <AnimatePresence>
            {isOpen && data && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        onClick={onClose}
                    />

                    {/* Contenedor del Modal */}
                    <motion.div
                        variants={modalVariants}
                        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6"
                    >
                        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full z-10">✕</button>

                        <motion.div variants={itemVariants} className="border-b border-gray-200 pb-4 w-full">
                            <h2 className="text-2xl font-questrial text-primary-purple">{title}</h2>
                        </motion.div>

                        <div className="space-y-3">
                            {detailConfig.map((item) => (
                                <motion.div key={item.key} variants={itemVariants} className="grid grid-cols-2 gap-4 items-center border-b border-gray-100 pb-2">
                                    <p className="font-semibold text-gray-700">{item.label}:</p>
                                    <p className="text-gray-600 text-right">{data[item.key]}</p>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div variants={itemVariants} className="flex justify-end pt-4 w-full">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-primary-blue text-white font-bold hover:opacity-90 transition-opacity">Cerrar</button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ViewDetails;