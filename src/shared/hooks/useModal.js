import { useEffect } from "react";
import { Z_INDEX_LAYERS } from "../constants/zIndexLayers";

/**
 * Hook personalizado para manejar modales con z-index correcto
 * @param {boolean} isOpen - Estado del modal
 * @param {string} modalType - Tipo de modal ('default', 'event', 'alert')
 * @returns {object} - Estilos y utilidades para el modal
 */
export const useModal = (isOpen, modalType = "default") => {
  // Manejar scroll del body
  useEffect(() => {
    if (isOpen) {
      // Bloquear scroll del body
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      // Restaurar scroll del body
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    }

    // Cleanup al desmontar
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Obtener z-index según el tipo de modal
  const getZIndex = () => {
    switch (modalType) {
      case "event":
        return {
          backdrop: Z_INDEX_LAYERS.EVENT_MODAL_BACKDROP,
          content: Z_INDEX_LAYERS.EVENT_MODAL_CONTENT,
        };
      case "alert":
        return {
          backdrop: Z_INDEX_LAYERS.ALERT,
          content: Z_INDEX_LAYERS.ALERT + 1,
        };
      default:
        return {
          backdrop: Z_INDEX_LAYERS.MODAL_BACKDROP,
          content: Z_INDEX_LAYERS.MODAL_CONTENT,
        };
    }
  };

  const zIndex = getZIndex();

  // Estilos para el backdrop
  const backdropStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    zIndex: zIndex.backdrop,
    overflow: "auto",
  };

  // Estilos para el contenido del modal
  const contentStyles = {
    position: "relative",
    zIndex: zIndex.content,
    margin: "auto",
    maxHeight: "90vh",
    width: "100%",
  };

  // Clases CSS para el backdrop
  const backdropClasses = [
    "fixed",
    "inset-0",
    "bg-black/60",
    "backdrop-blur-sm",
    "flex",
    "items-center",
    "justify-center",
    "p-4",
    "overflow-y-auto",
    "modal-overlay",
  ].join(" ");

  // Clases CSS para el contenido
  const contentClasses = [
    "bg-white",
    "rounded-2xl",
    "shadow-2xl",
    "w-full",
    "max-h-[90vh]",
    "overflow-hidden",
    "flex",
    "flex-col",
    "modal-content",
  ].join(" ");

  return {
    backdropStyles,
    contentStyles,
    backdropClasses,
    contentClasses,
    zIndex,
  };
};

export default useModal;
