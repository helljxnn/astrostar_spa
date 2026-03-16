/**
 * Configuración centralizada de z-index para evitar conflictos
 * Los valores están organizados por capas lógicas
 */

export const Z_INDEX_LAYERS = {
  // Elementos base (0-9)
  BASE: 0,
  CONTENT: 1, // Contenido principal del dashboard

  // Elementos elevados (10-49)
  ELEVATED: 10,
  TOPBAR: 10, // TopBar sticky
  DROPDOWN: 20,
  SIDEBAR_OVERLAY: 25, // Overlay del sidebar en móvil
  SIDEBAR: 30, // Sidebar (reducido de 50 a 30)
  TOOLTIP: 35,
  STICKY_HEADER: 40,

  // Elementos de navegación (50-99)
  NAVBAR: 60,

  // Overlays y modales (100-999)
  OVERLAY: 100,
  MODAL_BACKDROP: 500,
  MODAL_CONTENT: 600,

  // Elementos críticos (1000+)
  TOAST: 1000,
  ALERT: 2000,

  // Modales de eventos (casos especiales)
  EVENT_MODAL_BACKDROP: 999999,
  EVENT_MODAL_CONTENT: 1000000,

  // Elementos de máxima prioridad
  EMERGENCY: 9999999,
};

/**
 * Utilidades para trabajar con z-index
 */
export const zIndexUtils = {
  /**
   * Obtiene el z-index para una capa específica
   * @param {string} layer - Nombre de la capa
   * @returns {number} - Valor de z-index
   */
  get: (layer) => Z_INDEX_LAYERS[layer] || Z_INDEX_LAYERS.BASE,

  /**
   * Obtiene el z-index como string para CSS
   * @param {string} layer - Nombre de la capa
   * @returns {string} - Valor de z-index como string
   */
  getCss: (layer) => String(Z_INDEX_LAYERS[layer] || Z_INDEX_LAYERS.BASE),

  /**
   * Verifica si una capa está por encima de otra
   * @param {string} layer1 - Primera capa
   * @param {string} layer2 - Segunda capa
   * @returns {boolean} - true si layer1 está por encima de layer2
   */
  isAbove: (layer1, layer2) => {
    return (Z_INDEX_LAYERS[layer1] || 0) > (Z_INDEX_LAYERS[layer2] || 0);
  },
};

/**
 * Clases CSS predefinidas para z-index
 */
export const Z_INDEX_CLASSES = {
  sidebar: `z-[${Z_INDEX_LAYERS.SIDEBAR}]`,
  navbar: `z-[${Z_INDEX_LAYERS.NAVBAR}]`,
  modal: `z-[${Z_INDEX_LAYERS.MODAL_CONTENT}]`,
  modalBackdrop: `z-[${Z_INDEX_LAYERS.MODAL_BACKDROP}]`,
  eventModal: `z-[${Z_INDEX_LAYERS.EVENT_MODAL_CONTENT}]`,
  eventModalBackdrop: `z-[${Z_INDEX_LAYERS.EVENT_MODAL_BACKDROP}]`,
  toast: `z-[${Z_INDEX_LAYERS.TOAST}]`,
  alert: `z-[${Z_INDEX_LAYERS.ALERT}]`,
  tooltip: `z-[${Z_INDEX_LAYERS.TOOLTIP}]`,
  dropdown: `z-[${Z_INDEX_LAYERS.DROPDOWN}]`,
};

export default Z_INDEX_LAYERS;

