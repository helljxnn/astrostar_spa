import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { PAGINATION_CONFIG } from "../../constants/paginationConfig";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRows,
  rowsPerPage,
  startIndex,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (page) => {
    if (page !== currentPage) onPageChange(page);
  };

  //  Evitar NaN
  const safeTotalRows = totalRows || 0;
  const safeRowsPerPage = rowsPerPage || PAGINATION_CONFIG.ROWS_PER_PAGE;
  const safeStartIndex = startIndex >= 0 ? startIndex : 0;

  const startItem = safeTotalRows === 0 ? 0 : safeStartIndex + 1;
  const endItem =
    safeTotalRows === 0
      ? 0
      : Math.min(safeStartIndex + safeRowsPerPage, safeTotalRows);

  // Generar páginas (máximo 7 visibles)
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Máximo 7 páginas visibles

    if (totalPages <= maxVisiblePages) {
      // Si hay 7 o menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);

      // Calcular rango de páginas a mostrar
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      // Ajustar si estamos cerca del inicio
      if (currentPage <= 4) {
        endPage = 5;
      }

      // Ajustar si estamos cerca del final
      if (currentPage >= totalPages - 3) {
        startPage = totalPages - 4;
      }

      // Agregar "..." si hay páginas ocultas al inicio
      if (startPage > 2) {
        pages.push("...");
      }

      // Agregar páginas del rango
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Agregar "..." si hay páginas ocultas al final
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Siempre mostrar la última página
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-3">
      {/* Info resultados */}
      <div className="text-xs sm:text-sm text-gray-500">
        Mostrando{" "}
        <span className="font-semibold text-gray-700">
          {startItem}
        </span>
        {" "}–{" "}
        <span className="font-semibold text-gray-700">
          {endItem}
        </span>
        {" "}de{" "}
        <span className="font-semibold text-gray-700">{safeTotalRows}</span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2">
        {/* Botón anterior */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1 || safeTotalRows === 0}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FaChevronLeft size={12} />
        </button>

        {/* Números */}
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-all ${
                page === currentPage
                  ? "bg-gradient-to-r from-primary-purple to-primary-blue text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Botón siguiente */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || safeTotalRows === 0}
          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

