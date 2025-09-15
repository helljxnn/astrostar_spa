import React, { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import TemporaryWorkerModal from "./components/TemporaryWorkerModal";
import temporaryWorkersData from "../../../../../../../shared/models/TemporaryWorkersData";
import { FaPlus } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";

const TemporaryWorkers = () => {
  const [data, setData] = useState(temporaryWorkersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrar por búsqueda
  const filteredData = useMemo(
    () =>
      data.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.identificacion.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [data, searchTerm]
  );

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Guardar nuevo o editado
  const handleSave = (workerData, workerToEdit) => {
    if (workerToEdit) {
      // Editar
      setData((prev) =>
        prev.map((item) =>
          item.identificacion === workerToEdit.identificacion
            ? { ...workerData }
            : item
        )
      );
      setEditingWorker(null);
    } else {
      // Crear
      setData([...data, workerData]);
    }
    setIsModalOpen(false);
  };

  // Abrir modal en modo edición
  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Personas Temporales
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar persona..."
          />
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
              <IoMdDownload size={22} className="text-primary-purple" />
              Generar reporte
            </button>
            <button
              onClick={() => {
                setEditingWorker(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: [
            "Tipo de Persona",
            "Nombre",
            "Identificación",
            "Categoría",
            "Edad",
            "Estado",
          ],
          state: true,
        }}
        tbody={{
          data: paginatedData,
          dataPropertys: [
            "tipoPersona",
            "nombre",
            "identificacion",
            "categoria",
            "edad",
            "estado",
          ],
          state: true,
        }}
        onEdit={handleEdit} 
      />

      {/* Paginación */}
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
      <TemporaryWorkerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWorker(null);
        }}
        onSave={handleSave}
        worker={editingWorker}
      />
    </div>
  );
};

export default TemporaryWorkers;
