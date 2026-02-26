// Toast utility con notificaciones temporales
const createToast = (message, type = "info", duration = 3000) => {
  // Crear elemento de toast
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Estilos inline para el toast
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "16px 24px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: "10000",
    animation: "slideInBottom 0.3s ease-out",
    minWidth: "250px",
    maxWidth: "400px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  // Colores según el tipo
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b",
  };
  toast.style.backgroundColor = colors[type] || colors.info;

  // Iconos según el tipo
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠",
  };

  // Agregar icono y mensaje
  const icon = document.createElement("span");
  icon.textContent = icons[type] || icons.info;
  icon.style.fontSize = "18px";
  icon.style.fontWeight = "bold";

  const text = document.createElement("span");
  text.textContent = message;

  toast.appendChild(icon);
  toast.appendChild(text);

  // Agregar animación CSS si no existe
  if (!document.getElementById("toast-animations")) {
    const style = document.createElement("style");
    style.id = "toast-animations";
    style.textContent = `
      @keyframes slideInBottom {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes slideOutBottom {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Agregar al DOM
  document.body.appendChild(toast);

  // Remover después de la duración especificada
  setTimeout(() => {
    toast.style.animation = "slideOutBottom 0.3s ease-in";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
};

export const toast = {
  success: (message, options = {}) => {
    const duration = options.duration || 3000;
    createToast(message, "success", duration);
  },
  error: (message, options = {}) => {
    const duration = options.duration || 4000;
    createToast(message, "error", duration);
  },
  info: (message, options = {}) => {
    const duration = options.duration || 3000;
    createToast(message, "info", duration);
  },
  warning: (message, options = {}) => {
    const duration = options.duration || 3000;
    createToast(message, "warning", duration);
  },
};

export default toast;
