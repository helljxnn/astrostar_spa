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
 * @param {string} props.encType - El tipo de codificación del formulario, ej. "multipart/form-data" para subir archivos.
*/
const Form = ({ isOpen, title, children, onClose, onSubmit, submitText = "Guardar", id = null, encType = "application/x-www-form-urlencoded" }) => {

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
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto"
                    >
                        <form onSubmit={handleSubmit} encType={encType}>
                            {/* Header */}
                            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">✕</button>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent text-center">
                                    {title}
                                </h2>
                            </div>

                            {/* Body & Footer Wrapper */}
                            <div className="p-6 space-y-6">
                                {/* Body: Contenido dinámico */}
                                <div className="space-y-6">
                                    {Children.map(children, (child) => (
                                        <motion.div variants={itemVariants}>{child}</motion.div>
                                    ))}
                                </div>

                                {id && <input type="hidden" name="id" value={id} />}

                                {/* Footer: Botones de acción */}
                                <motion.div variants={itemVariants} className="flex justify-between pt-6 border-t border-gray-200 w-full">
                                    <motion.button
                                        type="button"
                                        onClick={onClose}
                                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className="px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg bg-gradient-to-r from-primary-purple to-primary-blue hover:from-primary-purple hover:to-primary-blue"
                                        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {submitText}
                                    </motion.button>
                                </motion.div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Form;