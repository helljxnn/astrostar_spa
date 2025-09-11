import React, { useState, useMemo } from "react";
import Table from "../../../../../../shared/components/Table/table";
import RoleModal from "./components/RoleModal";
import rolesData from "../../../../../../shared/models/RolesData";
import { FaPlus } from "react-icons/fa";
import SearchInput from "../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../shared/components/Table/Pagination";

const Roles = () => {
  const [data, setData] = useState(rolesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrar por búsqueda
  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  // Calcular datos de paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSave = (newRole) => {
    setData([...data, newRole]);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header con buscador y botón Crear */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Roles</h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscador */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reiniciar paginación en búsqueda
            }}
            placeholder="Buscar rol..."
          />

          {/* Botón Crear */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
          >
            <FaPlus /> Crear
          </button>
        </div>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: ["Nombre", "Descripción"],
          state: true,
        }}
        tbody={{
          data: paginatedData,
          dataPropertys: ["nombre", "descripcion"],
          state: true,
        }}
      />

      {/* Paginador */}
      {totalRows > rowsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          startIndex={startIndex}
        />
      )}

      {/* Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Roles;
