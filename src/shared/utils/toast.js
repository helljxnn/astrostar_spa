// Simple toast utility
export const toast = {
  success: (message) => {
    console.log("✅ Success:", message);
    // Aquí podrías integrar con una librería de notificaciones
    alert(`✅ ${message}`);
  },
  error: (message) => {
    console.error("❌ Error:", message);
    // Aquí podrías integrar con una librería de notificaciones
    alert(`❌ ${message}`);
  },
  info: (message) => {
    console.info("ℹ️ Info:", message);
    alert(`ℹ️ ${message}`);
  },
  warning: (message) => {
    console.warn("⚠️ Warning:", message);
    alert(`⚠️ ${message}`);
  },
};

export default toast;
