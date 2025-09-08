import React from "react";

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
 */
const Form = ({ isOpen, title, children, onClose, onSubmit, submitText = "Guardar" }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
        >
            {/* Backdrop: Fondo oscuro. No tiene onClick para evitar que se cierre desde afuera. */}
            <div className="absolute inset-0 bg-black bg-opacity-60">

                {/* Contenedor del Formulario con animación */}
                <div
                    className={`w-full h-full flex items-center justify-center transform transition-all duration-300 ease-in-out ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                >
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8 w-2/5  flex flex-col gap-6">
                        {/* Header */}
                        <div className="border-b border-gray-200 pb-4 w-full">
                            <h2 className="text-2xl font-questrial text-primary-purple">{title}</h2>
                        </div>

                        {/* Body: Contenido dinámico que se pasa como children */}
                        <div className="space-y-4 w-full">
                            {children}
                        </div>

                        {/* Footer: Botones de acción */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 w-full">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-blue to-primary-purple text-white font-bold hover:opacity-90 transition-opacity">
                                {submitText}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Form;