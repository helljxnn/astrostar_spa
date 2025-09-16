// src/shared/utils/alerts.js
import Swal from "sweetalert2";

// Aquí está la configuración de los alertas
const alerts = {
  customClass: {
    popup: "rounded-2xl border-0 shadow-2xl font-[Questrial]",
    title: "text-2xl font-bold mb-2 font-[Questrial]",
    content: "text-gray-600 text-base font-[Questrial]",
    confirmButton:
      "px-6 py-3 rounded-lg font-semibold text-white font-[Questrial] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5",
    cancelButton:
      "px-6 py-3 rounded-lg font-semibold border-2 font-[Questrial] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 mr-3",
    actions: "gap-3 mt-6",
  },
  buttonsStyling: false,
  reverseButtons: true,
  focusConfirm: false,
  showClass: { popup: "swal2-show" },
  hideClass: { popup: "swal2-hide" },
};

// Alerta de éxito
export const showSuccessAlert = (title, text = "") => {
  return Swal.fire({
    ...alerts,
    icon: "success",
    title: `<span style="color:#B595FF;">${title}</span>`,
    text,
    confirmButtonText: "Perfecto",
    allowOutsideClick: true,
    allowEscapeKey: true,
    showCloseButton: true,
    customClass: {
      ...alerts.customClass,
      popup: `${alerts.customClass.popup} bg-gradient-to-br from-[#9BE9FF] to-[#B595FF] border-l-4 border-l-[#9BE9FF]`,
      title: `${alerts.customClass.title}`,
      confirmButton: `${alerts.customClass.confirmButton} bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] hover:opacity-90`,
    },
    background: "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%)",
  });
};

// Alerta de error
export const showErrorAlert = (title, text = "") => {
  return Swal.fire({
    ...alerts,
    icon: "error",
    title: `<span style="color:#ff4d4d;">${title}</span>`,
    text,
    confirmButtonText: "Entendido",
    allowOutsideClick: true,
    allowEscapeKey: true,
    showCloseButton: true,
    customClass: {
      ...alerts.customClass,
      popup: `${alerts.customClass.popup} bg-gradient-to-br from-[#B595FF] to-[#9BE9FF] border-l-4 border-l-[#B595FF]`,
      title: `${alerts.customClass.title}`,
      confirmButton: `${alerts.customClass.confirmButton} bg-gradient-to-r from-[#B595FF] to-[#9BE9FF] hover:opacity-90`,
    },
    background: "linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)",
  });
};

// Alerta de confirmación
export const showConfirmAlert = (title, text = "", options = {}) => {
  const defaultOptions = {
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    ...options,
  };

  return Swal.fire({
    ...alerts,
    icon: "question",
    title: `<span style="color:#B595FF;">${title}</span>`,
    text,
    showCancelButton: true,
    confirmButtonText: defaultOptions.confirmButtonText,
    cancelButtonText: defaultOptions.cancelButtonText,
    allowOutsideClick: true,
    allowEscapeKey: true,
    showCloseButton: true,
    customClass: {
      ...alerts.customClass,
      popup: `${alerts.customClass.popup} bg-gradient-to-br from-[#9BE9FF] to-[#B595FF] border-l-4 border-l-[#9BE9FF]`,
      title: `${alerts.customClass.title}`,
      confirmButton: `${alerts.customClass.confirmButton} bg-gradient-to-r from-[#9BE9FF] to-[#B595FF] hover:opacity-90`,
      cancelButton: `${alerts.customClass.cancelButton} text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50`,
    },
    background: "linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%)",
  });
};

// Alerta de eliminación (agregar al archivo alerts.js)
export const showDeleteAlert = (title, text = "", options = {}) => {
  const defaultOptions = {
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    ...options,
  };

  return Swal.fire({
    ...alerts,
    icon: "warning",
    title: `<span style="color:#dc2626;">${title}</span>`,
    text,
    showCancelButton: true,
    confirmButtonText: defaultOptions.confirmButtonText,
    cancelButtonText: defaultOptions.cancelButtonText,
    allowOutsideClick: true,
    allowEscapeKey: true,
    showCloseButton: true,
    customClass: {
      ...alerts.customClass,
      popup: `${alerts.customClass.popup} bg-white border border-gray-200`, // Fondo blanco limpio
      title: `${alerts.customClass.title}`,
      confirmButton: `${alerts.customClass.confirmButton} bg-[#dc2626] hover:bg-[#b91c1c] text-white`, // Botón rojo plano
      cancelButton: `${alerts.customClass.cancelButton} text-gray-600 border border-gray-300 hover:bg-gray-100`,
      icon: "text-[#dc2626]", 
    },
    background: "#ffffff", // Fondo blanco
  });
};
