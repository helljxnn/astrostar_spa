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
    state = false, // activa colores para Estado
    onEdit,
    onDelete,
    onView,
    onList,
    customActions, //  acciones personalizadas
    customRenderers = {}, // renderizadores personalizados
    buttonConfig = {}, // configuración de botones
  } = options.tbody || {};

  const hasActions = onEdit || onDelete || onView || onList || customActions; 

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
        let estadoClass = "text-primary-blue"; // Por defecto azul para todos los estados
        if (estado === "activo") estadoClass = "text-primary-purple"; // Solo activo en morado

        return (
          <motion.tr
            key={index}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            className="hover:bg-primary-purple-light/30 transition-colors"
          >
            {/*  Columnas dinámicas */}
            {dataPropertys.map((property, i) => {
              // Usar custom renderer si existe
              if (customRenderers[property]) {
                return (
                  <td key={i} className="px-6 py-4 whitespace-nowrap">
                    {customRenderers[property](item[property], item)}
                  </td>
                );
              }

              //  Si la columna es Estado → render especial con color
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

            {/*  Estado extra (si no está en dataPropertys) */}
            {state &&
              !dataPropertys.map((p) => p.toLowerCase()).includes("estado") && (
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  <span className={`font-semibold ${estadoClass}`}>
                    {estadoOriginal}
                  </span>
                </td>
              )}

            {/*  Acciones dinámicas */}
            {hasActions && (
              <td className="px-6 py-4 flex items-center justify-center gap-3">
                {onEdit && (() => {
                  const config = buttonConfig.edit ? buttonConfig.edit(item) : {};
                  const shouldShow = config.show !== false;
                  const isDisabled = config.disabled || false;
                  const customClass = config.className || '';
                  const title = config.title || 'Editar';

                  if (!shouldShow) return null;

                  return (
                    <button
                      onClick={() => !isDisabled && onEdit(item)}
                      className={`p-2 rounded-full transition-colors ${
                        isDisabled 
                          ? `bg-gray-100 text-gray-400 cursor-not-allowed ${customClass}` 
                          : `bg-primary-blue/10 text-primary-blue hover:bg-primary-purple hover:text-white ${customClass}`
                      }`}
                      title={title}
                      disabled={isDisabled}
                    >
                      <FaRegEdit />
                    </button>
                  );
                })()}

                {onDelete && (() => {
                  const config = buttonConfig.delete ? buttonConfig.delete(item) : {};
                  const shouldShow = config.show !== false;
                  const isDisabled = config.disabled || false;
                  const customClass = config.className || '';
                  const title = config.title || 'Eliminar';

                  if (!shouldShow) return null;

                  return (
                    <button
                      onClick={() => !isDisabled && onDelete(item)}
                      className={`p-2 rounded-full transition-colors ${
                        isDisabled 
                          ? `bg-gray-100 text-gray-400 cursor-not-allowed ${customClass}` 
                          : `bg-red-100 text-red-500 hover:bg-red-500 hover:text-white ${customClass}`
                      }`}
                      title={title}
                      disabled={isDisabled}
                    >
                      <FaTrash />
                    </button>
                  );
                })()}

                {onView && (() => {
                  const config = buttonConfig.view ? buttonConfig.view(item) : {};
                  const shouldShow = config.show !== false;
                  const isDisabled = config.disabled || false;
                  const customClass = config.className || '';
                  const title = config.title || 'Ver Detalle';

                  if (!shouldShow) return null;

                  return (
                    <button
                      onClick={() => !isDisabled && onView(item)}
                      className={`p-2 rounded-full transition-colors ${
                        isDisabled 
                          ? `bg-gray-100 text-gray-400 cursor-not-allowed ${customClass}` 
                          : `bg-primary-purple/10 text-primary-purple hover:bg-primary-purple hover:text-white ${customClass}`
                      }`}
                      title={title}
                      disabled={isDisabled}
                    >
                      <FaEye />
                    </button>
                  );
                })()}

                {onList && (
                  <button
                    onClick={() => onList(item)}
                    className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                    title="Ver Lista"
                  >
                    <FaList />
                  </button>
                )}

                {/* Acciones personalizadas */}
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