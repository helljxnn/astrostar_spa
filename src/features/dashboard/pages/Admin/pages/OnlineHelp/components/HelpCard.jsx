import { motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";

const HelpCard = ({ item, onSelect }) => (
  <motion.button
    type="button"
    onClick={() => onSelect(item.actionId)}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.99 }}
    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-primary-purple/30 focus:outline-none focus:ring-2 focus:ring-primary-purple/30"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
        <p className="mt-1 text-xs text-slate-500">{item.description}</p>
      </div>
      <FaChevronRight className="mt-1 text-slate-400" size={12} />
    </div>
  </motion.button>
);

export default HelpCard;
