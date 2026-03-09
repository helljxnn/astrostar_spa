import React, { useState } from "react";
import Thead from "./thead";
import Tbody from "./tbody";
import Pagination from "./Pagination";
import { PAGINATION_CONFIG } from "../../constants/paginationConfig";

const Table = ({
  thead,
  tbody,
  rowsPerPage = PAGINATION_CONFIG.ROWS_PER_PAGE,
  serverPagination = false,
  totalRows: externalTotalRows,
  currentPage: externalCurrentPage,
  onPageChange: externalOnPageChange,
  onEdit,
  onDelete,
  onView, // para vista detallada
  onList,
  customActions, // para botones personalizados
  buttonConfig = {}, // configuración de botones
  enableHorizontalScroll = true,
  tableClassName = "",
}) => {
  const [internalPage, setInternalPage] = useState(1);

  const allData = tbody.data || [];
  const totalRows = serverPagination
    ? (externalTotalRows ?? allData.length)
    : allData.length;

  const currentPage = serverPagination
    ? externalCurrentPage || 1
    : internalPage;

  // Si no hay datos
  if (totalRows === 0) {
    return (
      <div className="p-4 text-center text-gray-400 italic">
        No hay datos para mostrar.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    if (serverPagination) {
      externalOnPageChange && externalOnPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = serverPagination
    ? allData
    : allData.slice(startIndex, startIndex + rowsPerPage);

  const tbodyProps = {
    ...tbody,
    data: paginatedData,
    onEdit,
    onDelete,
    onView,
    onList,
    customActions,
    buttonConfig,
  };

  const resolveButtonConfig = (type, item) => {
    const configFn = buttonConfig?.[type];
    return typeof configFn === "function" ? configFn(item) : {};
  };

  return (
    <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden max-w-full">
      {/* Tabla desktop */}
      <div
        className={
          enableHorizontalScroll
            ? "overflow-x-auto hidden sm:block w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            : "overflow-hidden hidden sm:block w-full"
        }
      >
        <table
          id="table"
          className={`w-full border-collapse text-sm font-monserrat ${tableClassName}`}
        >
          <Thead options={{ thead }} />
          <Tbody options={{ tbody: tbodyProps }} />
        </table>
      </div>

      {/* Tarjetas móvil */}
      <div className="block sm:hidden p-3 space-y-4">
        {tbodyProps.data.map((item, index) => {
          const viewConfig = resolveButtonConfig("view", item);
          const editConfig = resolveButtonConfig("edit", item);
          const deleteConfig = resolveButtonConfig("delete", item);

          const viewVisible = tbodyProps.onView && viewConfig.show !== false;
          const editVisible = tbodyProps.onEdit && editConfig.show !== false;
          const deleteVisible =
            tbodyProps.onDelete && deleteConfig.show !== false;

          const viewDisabled = viewConfig.disabled || false;
          const editDisabled = editConfig.disabled || false;
          const deleteDisabled = deleteConfig.disabled || false;

          return (
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
                        : item.estado === "Inactivo"
                          ? "text-primary-blue"
                          : "text-gray-400"
                    }
                  >
                    {item.estado}
                  </span>
                </p>
              )}

              {/* Acciones */}
              <div className="flex items-center flex-wrap gap-3 mt-3">
                {viewVisible && (
                  <button
                    onClick={() => !viewDisabled && tbodyProps.onView(item)}
                    disabled={viewDisabled}
                    title={viewConfig.title || "Ver Detalle"}
                    className={`px-3 py-1 rounded-lg transition-colors text-xs ${
                      viewDisabled
                        ? `bg-gray-100 text-gray-400 cursor-not-allowed ${viewConfig.className || ""}`
                        : `bg-primary-purple/10 text-primary-purple hover:bg-primary-purple hover:text-white ${viewConfig.className || ""}`
                    }`}
                  >
                    Ver
                  </button>
                )}

                {editVisible && (
                  <button
                    onClick={() => !editDisabled && tbodyProps.onEdit(item)}
                    disabled={editDisabled}
                    title={editConfig.title || "Editar"}
                    className={`px-3 py-1 rounded-lg transition-colors text-xs ${
                      editDisabled
                        ? `bg-gray-100 text-gray-400 cursor-not-allowed ${editConfig.className || ""}`
                        : `bg-primary-blue/10 text-primary-blue hover:bg-primary-purple hover:text-white ${editConfig.className || ""}`
                    }`}
                  >
                    Editar
                  </button>
                )}

                {deleteVisible && (
                  <button
                    onClick={() => !deleteDisabled && tbodyProps.onDelete(item)}
                    disabled={deleteDisabled}
                    title={deleteConfig.title || "Eliminar"}
                    className={`px-3 py-1 rounded-lg transition-colors text-xs ${
                      deleteDisabled
                        ? `bg-gray-100 text-gray-400 cursor-not-allowed ${deleteConfig.className || ""}`
                        : `bg-red-100 text-red-500 hover:bg-red-500 hover:text-white ${deleteConfig.className || ""}`
                    }`}
                  >
                    Eliminar
                  </button>
                )}

                {tbodyProps.onList && (
                  <button
                    onClick={() => tbodyProps.onList(item)}
                    className="px-3 py-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-colors text-xs"
                    title="Ver Lista"
                  >
                    Lista
                  </button>
                )}

                {/* Botones personalizados */}
                {customActions &&
                  (typeof customActions === "function"
                    ? customActions(item)
                    : customActions.map((action, idx) => {
                        const shouldShow = action.show
                          ? action.show(item)
                          : true;
                        if (!shouldShow) return null;

                        // Obtener configuración de disabled y title desde buttonConfig
                        const config = buttonConfig.customActions?.[idx]
                          ? buttonConfig.customActions[idx](item)
                          : {};
                        const isDisabled = config.disabled || false;
                        const title = config.title || action.title;

                        return (
                          <button
                            key={idx}
                            onClick={() => !isDisabled && action.onClick(item)}
                            className={
                              isDisabled
                                ? "p-2 rounded-full bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed transition-colors"
                                : action.className
                            }
                            title={title}
                            disabled={isDisabled}
                          >
                            {action.label}
                          </button>
                        );
                      }))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación - Siempre visible */}
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
    </div>
  );
};

export default Table;
