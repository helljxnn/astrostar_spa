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
    state = false, // ⚡ activa colores para Estado
    onEdit,
    onDelete,
    onView,
    onList,
    customActions, // ✅ AGREGADO: acciones personalizadas
  } = options.tbody || {};

  const hasActions = onEdit || onDelete || onView || onList || customActions; // ✅ MODIFICADO

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

        /* Colores unificados (igual que en mobile) */
        let estadoClass = "text-gray-500";
        if (estado === "activo") estadoClass = "text-primary-purple";
        else if (estado === "inactivo") estadoClass = "text-primary-blue";

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
                    <span className={`font-semibold ${estadoClass}`}>
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

            {/* 🔹 Estado extra (si no está en dataPropertys) */}
            {state &&
              !dataPropertys.map((p) => p.toLowerCase()).includes("estado") && (
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  <span className={`font-semibold ${estadoClass}`}>
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
                    className="p-2 rounded-full bg-primary-blue/10 text-primary-blue hover:bg-primary-purple hover:text-white transition-colors"
                    title="Editar"
                  >
                    <FaRegEdit />
                  </button>
                )}

                {onDelete && (() => {
                  const isActive = item.estado && item.estado.toLowerCase() === "activo";
                  return (
                    <button
                      onClick={() => !isActive && onDelete(item)}
                      className={`p-2 rounded-full transition-colors ${
                        isActive 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                          : "bg-red-100 text-red-500 hover:bg-red-500 hover:text-white"
                      }`}
                      title={isActive ? "No se puede eliminar empleado activo" : "Eliminar"}
                      disabled={isActive}
                    >
                      <FaTrash />
                    </button>
                  );
                })()}

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

                {/* ✅ NUEVO: Acciones personalizadas */}
                {customActions && (
                  typeof customActions === 'function'
                    ? customActions(item)
                    : customActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => action.onClick(item)}
                          className={action.className}
                          title={action.title}
                        >
                          {action.label}
                        </button>
                      ))
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