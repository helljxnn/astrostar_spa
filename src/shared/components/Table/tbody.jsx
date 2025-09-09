// Tbody.jsx
import React from "react";
import { motion } from "framer-motion";
import { FaEye, FaRegEdit, FaTrash } from "react-icons/fa";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
};

const Tbody = ({ options }) => {
  const { onEdit, onDelete } = options.tbody;

  return (
    <tbody id="tbody" className="divide-y divide-gray-200">
      {options.tbody.data && options.tbody.data.length > 0 ? (
        options.tbody.data.map((item, index) => {
          const { estado } = item;
          return (
            <motion.tr
              key={index}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              className="hover:bg-primary-purple-light/30 transition-colors"
            >
              {options.tbody.dataPropertys.map((property, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {item[property]}
                </td>
              ))}

              {options.tbody.state && (
                <td
                  className={`px-6 py-4 font-medium ${estado === "Activo"
                      ? "text-primary-blue"
                      : "text-primary-purple"
                    }`}
                >
                  {estado}
                </td>
              )}

              <td className="px-6 py-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => onEdit && onEdit(item)}
                  className="p-2 rounded-full bg-primary-blue/10 text-primary-blue hover:bg-primary-blue hover:text-white transition-colors"
                  aria-label={`Editar ${item.NombreMaterial}`}
                >
                  <FaRegEdit />
                </button>
                <button
                  onClick={() => onDelete && onDelete(item)}
                  className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  aria-label={`Eliminar ${item.NombreMaterial}`}
                >
                  <FaTrash />
                </button>
                <button className="p-2 rounded-full bg-primary-purple/10 text-primary-purple hover:bg-primary-purple hover:bg-primary-purple hover:text-white transition-colors">
                  <FaEye />
                </button>
              </td>
            </motion.tr>
          );
        })
      ) : (
        <tr>
          <td
            colSpan="100%"
            className="p-6 text-center text-gray-400 italic"
          >
            No hay datos para mostrar.
          </td>
        </tr>
      )}
    </tbody>
  );
};

export default Tbody;
