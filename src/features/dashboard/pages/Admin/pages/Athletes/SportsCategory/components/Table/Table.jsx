import React, { useState, useEffect, useMemo } from "react";
import Thead from "./thead";
import Tbody from "./tbody";

const Table = ({ thead, tbody, rowsPerPage = 5, onEdit, onDelete, onView, onList }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const allData = tbody?.data || [];
  const totalRows = allData.length;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRows / rowsPerPage)),
    [totalRows, rowsPerPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = useMemo(
    () => allData.slice(startIndex, startIndex + rowsPerPage),
    [allData, startIndex, rowsPerPage]
  );

  const columnCount = thead?.titles?.length || 0;

  return (
    <div className="shadow-lg rounded-2xl bg-white border border-gray-100 overflow-hidden">
      {totalRows > 0 ? (
        <div className="overflow-x-auto hidden sm:block w-full">
          <table
            className="w-full border-collapse text-sm font-monserrat"
            style={{ minWidth: columnCount > 5 ? `${columnCount * 150}px` : "100%" }}
          >
            <Thead options={{ thead }} />
            <Tbody
              data={paginatedData}
              dataPropertys={tbody.dataPropertys}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onList={onList}
            />
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-400 italic hidden sm:block">
          No hay datos para mostrar.
        </div>
      )}
    </div>
  );
};

export default Table;
