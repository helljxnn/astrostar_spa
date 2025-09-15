import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ currentPage, totalPages, onPageChange, totalRows, rowsPerPage, startIndex }) => {
    const handlePrevious = () => {
        onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        onPageChange(currentPage + 1);
    };

    // ✅ Aseguramos que no salgan NaN
    const safeTotalRows = totalRows || 0;
    const safeRowsPerPage = rowsPerPage || 1; 
    const safeStartIndex = startIndex >= 0 ? startIndex : 0;

    const startItem = safeTotalRows === 0 ? 0 : safeStartIndex + 1;
    const endItem = safeTotalRows === 0 ? 0 : Math.min(safeStartIndex + safeRowsPerPage, safeTotalRows);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white shadow-sm rounded-b-xl">
            {/* Info de filas */}
            <div className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold text-gray-900">{startItem}</span> a{" "}
                <span className="font-semibold text-gray-900">{endItem}</span> de{" "}
                <span className="font-semibold text-gray-900">{safeTotalRows}</span> resultados
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1 || safeTotalRows === 0}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 hover:text-primary-purple transition disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Página anterior"
                >
                    <FaChevronLeft size={14} />
                </button>

                <span className="text-sm text-gray-700">
                    Página{" "}
                    <span className="px-2 py-1 rounded-md bg-indigo-50 text-primary-purple font-semibold">
                        {safeTotalRows === 0 ? 0 : currentPage}
                    </span>{" "}
                    de <span className="font-semibold">{safeTotalRows === 0 ? 0 : totalPages}</span>
                </span>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages || safeTotalRows === 0}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 hover:text-primary-purple transition disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Página siguiente"
                >
                    <FaChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
