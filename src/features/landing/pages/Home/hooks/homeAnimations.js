// ===============================
// Animaciones generales
// ===============================

// Texto principal del héroe
export const heroTextAnim = {
  initial: { opacity: 0, y: -40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 1 },
  viewport: { once: true },
};

// Fecha en el héroe
export const heroDateAnim = {
  initial: { opacity: 0, y: -15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 15 },
  transition: { duration: 0.8, ease: "easeOut" },
};

// Animaciones de la sección fundador/a
export const founderTextAnim = {
  initial: { opacity: 0, x: -100 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 1 },
  viewport: { once: true },
};

export const founderImgAnim = {
  initial: { opacity: 0, x: 100 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 1 },
  viewport: { once: true },
};

// Estadísticas (contador y items)
export const statAnim = {
  header: {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
    viewport: { once: false, amount: 0.5 },
  },
  item: (i) => ({
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: i * 0.2 },
    viewport: { once: false, amount: 0.5 },
  }),
};

// Sección de donaciones
export const donationImgAnim = {
  section: {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 90, damping: 12 },
    viewport: { once: true },
  },
  img: {
    initial: { x: -100, opacity: 0 },
    whileInView: { x: 0, opacity: 1 },
    transition: { duration: 1 },
    viewport: { once: true },
  },
};

export const donationTextAnim = {
  initial: { x: 100, opacity: 0 },
  whileInView: { x: 0, opacity: 1 },
  transition: { duration: 1 },
  viewport: { once: true },
};

export const donationBtnAnim = {
  initial: { scale: 0.8, opacity: 0 },
  whileInView: { scale: 1, opacity: 1 },
  whileHover: {
    scale: 1.1,
    boxShadow: "0px 0px 20px rgba(181,149,255,0.7)",
  },
  transition: { type: "spring", stiffness: 120, damping: 10 },
  viewport: { once: true },
};

// ===============================
// Animación para imágenes del carrusel (cross-fade suave)
// ===============================
export const carouselImgAnim = {
  initial: { opacity: 0, scale: 1.02 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0.6, scale: 1.01 },
  transition: {
    duration: 2,
    ease: [0.45, 0.05, 0.55, 0.95],
  },
};
