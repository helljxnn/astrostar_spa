import React, { Children } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Componente de formulario dinámico y reutilizable, ideal para modales.
 *
 * @param {object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {string} props.title - El título que se mostrará en la cabecera del formulario.
 * @param {React.ReactNode} props.children - Los campos del formulario (inputs, selects, etc.) que se renderizarán en el cuerpo.
 * @param {function} props.onClose - Función que se ejecuta al hacer clic en el botón "Cancelar".
 * @param {function} props.onSubmit - Función que se ejecuta al enviar el formulario.
 * @param {string} props.submitText - El texto para el botón de envío (ej. "Crear", "Guardar Cambios").
 * @param {number} props.id - El id de un registro si para actualizar o no.
*/
const Form = ({ isOpen, title, children, onClose, onSubmit, submitText = "Guardar", id = null }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            // Ya no pasa datos, solo notifica el intento de envío.
            // La validación y los datos se manejan en el componente padre.
            onSubmit();
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { scale: 0.95, opacity: 0, y: 50 },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                when: "beforeChildren",
                staggerChildren: 0.05, // Anima los hijos con un pequeño retraso
            },
        },
        exit: { scale: 0.9, opacity: 0, y: 30, transition: { duration: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 200 } },
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
                    {/* Backdrop: Fondo oscuro con blur y cierre al hacer clic */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        variants={backdropVariants}
                        onClick={onClose}
                    />

                    {/* Contenedor del Formulario con animación */}
                    <motion.div
                        variants={modalVariants}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden"
                    >
                        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full z-10">✕</button>
                        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                            {/* Header */}
                            <motion.div variants={itemVariants} className="border-b border-gray-200 pb-4 w-full">
                                <h2 className="text-2xl font-questrial text-primary-purple">{title}</h2>
                            </motion.div>

                            {/* Body: Contenido dinámico que se pasa como children */}
                            <div className="space-y-4 w-full">
                                {Children.map(children, (child) => (
                                    <motion.div variants={itemVariants}>{child}</motion.div>
                                ))}

                                {id ? (
                                    <input type="hidden" name="id" value={id} />
                                ) : null}
                            </div>

                            {/* Footer: Botones de acción */}
                            <motion.div variants={itemVariants} className="flex justify-end gap-4 pt-4 border-t border-gray-200 w-full">
                                <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple text-white font-bold hover:opacity-90 transition-opacity">{submitText}</button>
                            </motion.div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Form;