// Table.jsx
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
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const allData = tbody.data || [];
  const totalRows = allData.length;

  // Si no hay datos, no hacemos nada más.
  if (totalRows === 0) {
    return (
      <div className="overflow-x-auto shadow-lg rounded-2xl bg-white border border-gray-200">
        <table id="table" className="w-full border-collapse text-sm font-questrial">
          <Thead options={{ thead }} />
          <Tbody options={{ tbody }} />
        </table>
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

  // Pasamos las funciones de acción al componente Tbody a través de sus props
  const tbodyProps = {
    ...tbody,
    data: paginatedData,
    onEdit,
    onDelete,
  };

  return (
    <div className="shadow-lg rounded-2xl bg-white flex flex-col border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table id="table" className="w-full border-collapse text-sm font-questrial">
          <Thead options={{ thead }} />
          <Tbody options={{ tbody: tbodyProps }} />
        </table>
      </div>
      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          startIndex={startIndex}
        />
      )}
    </div>
  );
};

export default Table;
