import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "../../hooks/useModal";

/**
 * Componente Modal reutilizable con z-index correcto
 * @param {boolean} isOpen - Estado del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {ReactNode} children - Contenido del modal
 * @param {string} modalType - Tipo de modal ('default', 'event', 'alert')
 * @param {string} maxWidth - Ancho máximo del modal
 * @param {boolean} closeOnBackdropClick - Permitir cerrar al hacer clic en el backdrop
 * @param {object} backdropProps - Props adicionales para el backdrop
 * @param {object} contentProps - Props adicionales para el contenido
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  modalType = "default",
  maxWidth = "max-w-4xl",
  closeOnBackdropClick = true,
  backdropProps = {},
  contentProps = {},
}) => {
  const { backdropStyles, contentStyles, backdropClasses, contentClasses } =
    useModal(isOpen, modalType);

  // Manejar clic en el backdrop
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Contenido del modal
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={backdropClasses}
          style={backdropStyles}
          onClick={handleBackdropClick}
          {...backdropProps}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`${contentClasses} ${maxWidth}`}
            style={contentStyles}
            onClick={(e) => e.stopPropagation()}
            {...contentProps}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Renderizar usando Portal para evitar problemas de z-index
  return createPortal(modalContent, document.body);
};

export default Modal;
