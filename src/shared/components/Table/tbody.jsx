// src/pages/components/Table/Tbody.jsx
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

const Tbody = ({ options }) => {
  const {
    data = [],
    dataPropertys = [],
    state = false, // ⚡ controla si pintamos Estado
    onEdit,
    onDelete,
    onView,
    onList,
  } = options.tbody || {};

  const hasActions = onEdit || onDelete || onView || onList;

  /* --- Si no hay datos --- */
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
        /* Normalizar estado */
        const estadoOriginal = item.Estado || item.estado || "";
        const estado = estadoOriginal.toLowerCase();

        /* Estilo según estado */
        let estadoClass = "bg-gray-200 text-gray-800";
        if (estado === "activo") estadoClass = "bg-green-100 text-green-600";
        else if (estado === "inactivo") estadoClass = "bg-red-100 text-red-600";
        else if (estado === "pendiente") estadoClass = "bg-yellow-100 text-yellow-600";

        return (
          <motion.tr
            key={index}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            className="hover:bg-primary-purple-light/30 transition-colors"
          >
            {/* 🔹 Columnas dinámicas */}
            {dataPropertys.map((property, i) => {
              // 👀 Si la columna es Estado → render especial con color
              if (state && property.toLowerCase() === "estado") {
                return (
                  <td
                    key={i}
                    className="px-6 py-4 whitespace-nowrap font-medium"
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoClass}`}
                    >
                      {estadoOriginal}
                    </span>
                  </td>
                );
              }

              return (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {item[property] ?? "-"}
                </td>
              );
            })}

            {/* 🔹 Estado extra (si no está incluido en dataPropertys) */}
            {state && !dataPropertys.map(p => p.toLowerCase()).includes("estado") && (
              <td className="px-6 py-4 whitespace-nowrap font-medium">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoClass}`}
                >
                  {estadoOriginal}
                </span>
              </td>
            )}

            {/* 🔹 Acciones dinámicas */}
            {hasActions && (
              <td className="px-6 py-4 flex items-center justify-center gap-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-full bg-primary-blue/10 text-primary-blue hover:bg-primary-blue hover:text-white transition-colors"
                    title="Editar"
                  >
                    <FaRegEdit />
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                )}

                {onView && (
                  <button
                    onClick={() => onView(item)}
                    className="p-2 rounded-full bg-primary-purple/10 text-primary-purple hover:bg-primary-purple hover:text-white transition-colors"
                    title="Ver Detalle"
                  >
                    <FaEye />
                  </button>
                )}

                {onList && (
                  <button
                    onClick={() => onList(item)}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                    title="Ver Lista"
                  >
                    <FaList />
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
