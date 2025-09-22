import React, { useState, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import Table from "../../../../../../../shared/components/Table/table.jsx";
import Pagination from "../../../../../../../shared/components/Table/Pagination.jsx";
import SearchInput from "../../../../../../../shared/components/SearchInput.jsx";
import guardiansData from "./GuardiansData.js";

const Guardians = ({ onSelectGuardian }) => {
  const [data, setData] = useState(guardiansData || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter((g) =>
      [g.nombreCompleto, g.identificacion, g.correo, g.telefono]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [data, searchTerm]);

  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleEdit = (g) => {
    // lógica editar...
  };
  const handleView = (g) => {
    // lógica ver...
  };
  const handleDelete = (g) => {
    // lógica eliminar...
  };

  return (
    <div className="p-6 w-full max-w-full font-questrial">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Acudientes</h1>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar acudiente..."
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition">
              <FaPlus /> Crear Acudiente
            </button>
          </div>
        </div>
      </div>

      {totalRows > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <Table
              thead={{
                titles: ["Nombre", "Identificación", "Correo", "Teléfono", "Deportistas"],
                state: true,
                actions: true,
              }}
              tbody={{
                data: paginatedData.map((g) => ({ ...g })),
                dataPropertys: ["nombreCompleto", "identificacion", "correo", "telefono", "deportistasCount"],
                state: true,
                stateMap: {
                  Activo: "bg-green-100 text-green-800",
                  Inactivo: "bg-red-100 text-red-800",
                },
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onSelect={onSelectGuardian}
            />
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              startIndex={startIndex}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay acudientes registrados todavía.
        </div>
      )}
    </div>
  );
};

export default Guardians;
