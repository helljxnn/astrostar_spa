import { motion } from "framer-motion";
import { FaQuestionCircle } from "react-icons/fa";

const HelpLauncher = ({ onOpen }) => (
  <motion.button
    type="button"
    onClick={onOpen}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.98 }}
    className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[1100] inline-flex items-center gap-2 rounded-full border border-primary-purple/30 bg-white px-4 py-2.5 shadow-lg text-sm font-semibold text-primary-purple hover:bg-primary-purple/5 focus:outline-none focus:ring-2 focus:ring-primary-purple/30"
    aria-label="Abrir ayuda contextual"
  >
    <FaQuestionCircle size={14} />
    Ayuda rápida
  </motion.button>
);

export default HelpLauncher;
