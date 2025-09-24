import React, { useState } from "react";
import Thead from "./thead";
import Tbody from "./tbody";
import Pagination from "./Pagination";

const Table = ({
  thead,
  tbody,
  rowsPerPage = 10,
  paginationFrom = 10,
  onEdit,
  onDelete,
  onView, // agregado para vista detallada
  customActions, // agregado para botones personalizados como inscripciones
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const allData = tbody.data || [];
  const totalRows = allData.length;

  // Si no hay datos
  if (totalRows === 0) {
    return (
      <div className="p-4 text-center text-gray-400 italic">
        No hay datos para mostrar.
      </div>
    );
  }

  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const showPagination = totalRows > paginationFrom && totalPages > 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = allData.slice(startIndex, startIndex + rowsPerPage);

  const tbodyProps = {
    ...tbody,
    data: paginatedData,
    onEdit,
    onDelete,
    onView, // agregado para vista detallada
    customActions, // agregado para botones personalizados
  };

  return (
    <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden max-w-full">

      <div className="overflow-x-auto hidden sm:block w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table
          id="table"
          className="w-full border-collapse text-sm font-monserrat"
        >
          <Thead options={{ thead }} />
          <Tbody options={{ tbody: tbodyProps }} />
        </table>
      </div>

      {/*Vista en tarjetas para móviles */}
      <div className="block sm:hidden p-3 space-y-4">
        {tbodyProps.data.map((item, index) => (
          <div
            key={index}
            className="border rounded-xl shadow-sm p-4 bg-gray-50 text-gray-700"
          >
            {/* Mapeo dinámico de las propiedades */}
            {tbody.dataPropertys.map((property, i) => (
              <p key={i} className="text-sm mb-1">
                <span className="font-semibold">{thead.titles[i]}:</span>{" "}
                {item[property]}
              </p>
            ))}

            {/* Estado */}
            {tbody.state && (
              <p className="mt-1 text-sm font-medium">
                <span className="font-semibold">Estado: </span>
                <span
                  className={
                    item.estado === "Activo"
                      ? "text-primary-purple"
                      : "text-primary-blue"
                  }
                >
                  {item.estado}
                </span>
              </p>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => tbodyProps.onEdit && tbodyProps.onEdit(item)}
                className="px-3 py-1 rounded-lg bg-primary-blue/10 text-primary-blue hover:bg-primary-blue hover:text-white transition-colors text-xs"
              >
                Editar
              </button>
              <button
                onClick={() => tbodyProps.onDelete && tbodyProps.onDelete(item)}
                className="px-3 py-1 rounded-lg bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs"
              >
                Eliminar
              </button>
              {tbodyProps.onView && (
                <button
                  onClick={() => tbodyProps.onView(item)}
                  className="px-3 py-1 rounded-lg bg-primary-purple/10 text-primary-purple hover:bg-primary-purple hover:text-white transition-colors text-xs"
                >
                  Ver
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/*  Paginación abajo */}
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
