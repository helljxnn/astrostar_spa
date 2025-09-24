
// ================================
// 2. Table.jsx (CORREGIDO)
// ================================
import { useState } from "react";
import Thead from "./Thead";
import Tbody from "./Tbody";
import Pagination from "../../../../../../../../../shared/components/Table/Pagination";

const Table = ({
  thead,
  tbody,
  rowsPerPage = 10,
  paginationFrom = 10,
  onEdit,
  onDelete,
  onView,
  onList,
}) => {
  /* =====================
        Estado de la página
  ===================== */
  const [currentPage, setCurrentPage] = useState(1);

  const allData = tbody.data || [];
  const totalRows = allData.length;

  /* =====================
        Si no hay datos
  ===================== */
  if (totalRows === 0) {
    return (
      <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden max-w-full">
        <div className="p-8 text-center text-gray-400 italic">
          No hay datos para mostrar.
        </div>
      </div>
    );
  }

  /* =====================
        Paginación
  ===================== */
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const showPagination = totalRows > paginationFrom && totalPages > 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = allData.slice(startIndex, startIndex + rowsPerPage);

  /* =====================
        Render
  ===================== */
  return (
    <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden max-w-full">
      {/* ==== Tabla (desktop) ==== */}
      <div className="overflow-x-auto hidden sm:block w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full border-collapse text-sm font-monserrat">
          {/* ✅ THEAD - mantiene estructura original */}
          <Thead options={{ thead }} />
          
          {/* ✅ TBODY - CORREGIDO: Props directas */}
          <Tbody 
            data={paginatedData}
            dataPropertys={tbody.dataPropertys}
            state={tbody.state}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onList={onList}
          />
        </table>
      </div>

      {/* ==== Tarjetas (móvil) ==== */}
      <div className="block sm:hidden p-3 space-y-4">
        {paginatedData.map((item, index) => (
          <div
            key={index}
            className="border rounded-xl shadow-sm p-4 bg-gray-50 text-gray-700"
          >
            {tbody.dataPropertys.map((property, i) => (
              <p key={i} className="text-sm mb-1">
                <span className="font-semibold">{thead.titles[i]}:</span>{" "}
                {item[property] ?? "-"}
              </p>
            ))}

            {/* Estado */}
            {tbody.state && (
              <p className="mt-1 text-sm font-medium">
                <span className="font-semibold">Estado: </span>
                <span
                  className={
                    (item.Estado || "").toLowerCase() === "activo"
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  {item.Estado ?? "Sin estado"}
                </span>
              </p>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {onEdit && (
                <button
                  onClick={() => onEdit(item)}
                  className="px-3 py-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-xs"
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(item)}
                  className="px-3 py-1 rounded-lg bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs"
                >
                  Eliminar
                </button>
              )}
              {onView && (
                <button
                  onClick={() => onView(item)}
                  className="px-3 py-1 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors text-xs"
                >
                  Ver
                </button>
              )}
              {onList && (
                <button
                  onClick={() => onList(item)}
                  className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-600 hover:text-white transition-colors text-xs"
                >
                  Lista Detallada
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ==== Paginación ==== */}
      {showPagination && (
        <div className="w-full border-t border-gray-100 bg-gray-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            startIndex={startIndex}
          />
        </div>
      )}
    </div>
  );
};

export default Table;