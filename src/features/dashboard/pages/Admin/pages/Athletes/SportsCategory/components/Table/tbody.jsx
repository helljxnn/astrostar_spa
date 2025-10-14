import React from "react";
import { FaEdit, FaTrash, FaEye, FaListUl } from "react-icons/fa";

/*
🎨 COLORES según tus referencias:
-----------------------------------
Fondo base: blanco
Fila hover: #f7f4ff
Texto Activo: #b5a8ff (morado pastel)
Texto Inactivo: #9eeaff (celeste pastel)
Botones:
  Editar: bg-[#e7f9ff] / icon-[#7ad7ff]
  Eliminar: bg-[#ffeaea] / icon-[#ff8b8b]
  Ver: bg-[#f7edff] / icon-[#bdaaff]
  Listar: bg-[#f1f5f9] / icon-[#9aa9b6]
*/

const Tbody = ({ data, dataPropertys, onEdit, onDelete, onView, onList }) => {
  return (
    <tbody className="bg-white">
      {data.map((item, index) => {
        const estadoOriginal = item.Estado ?? item.estado ?? "";
        const estadoNormalizado = String(estadoOriginal).trim().toLowerCase();

        const estadoColorClass =
          estadoNormalizado === "activo" || estadoNormalizado === "registrado"
            ? "text-[#b5a8ff]"
            : estadoNormalizado === "inactivo" || estadoNormalizado === "anulado"
            ? "text-[#9eeaff]"
            : "text-gray-400";

        return (
          <tr
            key={item.id ?? index}
            className={`transition-colors ${
              index % 2 === 0 ? "bg-white" : "bg-white"
            } hover:bg-[#f7f4ff]`}
          >
            {dataPropertys.map((property, i) => (
              <td key={i} className="px-6 py-4 text-sm text-gray-700">
                {item[property] ?? "-"}
              </td>
            ))}

            {/* Columna: Estado */}
            <td className="px-6 py-4 text-sm text-center font-medium">
              <span className={`${estadoColorClass}`}>{estadoOriginal}</span>
            </td>

            {/* Columna: Acciones */}
            <td className="px-6 py-4 text-center">
              <div className="flex flex-row items-center justify-center gap-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="bg-[#e7f9ff] text-[#7ad7ff] p-2 rounded-full hover:scale-105 transition"
                    title="Editar"
                  >
                    <FaEdit />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    className="bg-[#ffeaea] text-[#ff8b8b] p-2 rounded-full hover:scale-105 transition"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                )}
                {onView && (
                  <button
                    onClick={() => onView(item)}
                    className="bg-[#f7edff] text-[#bdaaff] p-2 rounded-full hover:scale-105 transition"
                    title="Ver"
                  >
                    <FaEye />
                  </button>
                )}
                {onList && (
                  <button
                    onClick={() => onList(item)}
                    className="bg-[#f1f5f9] text-[#9aa9b6] p-2 rounded-full hover:scale-105 transition"
                    title="Listar Detallado"
                  >
                    <FaListUl />
                  </button>
                )}
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default Tbody;
