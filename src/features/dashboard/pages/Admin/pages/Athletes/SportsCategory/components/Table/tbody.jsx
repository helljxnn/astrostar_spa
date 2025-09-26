import React from "react";
import { motion } from "framer-motion";
import { FaEye, FaRegEdit, FaTrash, FaList } from "react-icons/fa";

/* --- Animación de filas --- */
const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
};

const Tbody = ({
  data = [],
  dataPropertys = [],
  state = false,
  onEdit,
  onDelete,
  onView,
  onList,
}) => {
  const hasActions = onEdit || onDelete || onView || onList;

  /* 🔹 Sin datos */
  if (!data || data.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan="100%" className="p-6 text-center text-gray-400 italic">
            No hay datos para mostrar.
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody id="tbody" className="divide-y divide-gray-200">
      {data.map((item, index) => {
        // Estado seguro en string
        const estadoOriginal = item.Estado ?? item.estado ?? "";
        const estado = String(estadoOriginal).trim().toLowerCase();

        // 🎨 Colores personalizados
        let estadoColorClass =
          estado === "activo"
            ? "text-primary-purple"
            : estado === "inactivo"
            ? "text-primary-blue"
            : "text-gray-400";

        return (
          <motion.tr
            key={index}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            className={`${
              index % 2 === 0 ? "bg-white" : "bg-purple-50"
            } hover:bg-purple-100 transition`}
          >
            {/* 🔹 Columnas dinámicas */}
            {dataPropertys.map((property, i) => (
              <td
                key={i}
                className="px-6 py-4 whitespace-nowrap text-gray-700 text-sm"
              >
                {item[property] ?? "-"}
              </td>
            ))}

            {/* 🔹 Estado */}
            {state && (
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={estadoColorClass}>{estadoOriginal}</span>
              </td>
            )}

            {/* 🔹 Acciones */}
            {hasActions && (
              <td className="px-6 py-4 flex items-center justify-center gap-2">
                {onView && (
                  <button
                    onClick={() => onView(item)}
                    className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white transition"
                    title="Ver Detalle"
                  >
                    <FaEye />
                  </button>
                )}
                {onList && (
                  <button
                    onClick={() => onList(item)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition"
                    title="Ver Lista"
                  >
                    <FaList />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                    title="Editar"
                  >
                    <FaRegEdit />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                )}
              </td>
            )}
          </motion.tr>
        );
      })}
    </tbody>
  );
};

export default Tbody;