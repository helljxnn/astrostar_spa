import React, { useState, useMemo } from "react";
import Table from "../../../../../../../shared/components/Table/table";
import TemporaryWorkerModal from "./components/TemporaryWorkerModal";
import temporaryWorkersData from "../../../../../../../shared/models/TemporaryWorkersData";
import { FaPlus } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import { showDeleteAlert, showSuccessAlert, showErrorAlert } from "../../../../../../../shared/utils/Alerts";

const TemporaryWorkers = () => {
  const [data, setData] = useState(temporaryWorkersData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create", "edit", "view"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filtrar por búsqueda general en cualquier campo del objeto
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.values(item).some(
        (value) => String(value).toLowerCase() === searchTerm.toLowerCase()
      )
    );
  }, [data, searchTerm]);

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const reportColumns = [
    { key: "tipoPersona", label: "Tipo de Persona" },
    { key: "nombre", label: "Nombre" },
    { key: "identificacion", label: "Identificación" },
    { key: "categoria", label: "Categoría" },
    { key: "edad", label: "Edad" },
    { key: "estado", label: "Estado" },
  ];

  // Guardar nuevo o editado
  const handleSave = (workerData) => {
    if (editingWorker) {
      // Editar
      setData((prev) =>
        prev.map((item) =>
          item.identificacion === editingWorker.identificacion
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
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Ver persona temporal
  const handleView = (worker) => {
    setEditingWorker(worker);
    setModalMode("view");
    setIsModalOpen(true);
  };

  // Eliminar persona temporal
  const handleDelete = async (worker) => {
    try {
      const result = await showDeleteAlert(
        "¿Eliminar persona temporal?",
        `Se eliminará permanentemente a: ${worker.nombre}`
      );

      if (result.isConfirmed) {
        setData((prev) => prev.filter((item) => item.identificacion !== worker.identificacion));
        showSuccessAlert(
          "Persona eliminada",
          `${worker.nombre} ha sido eliminado correctamente.`
        );
      }
    } catch (error) {
      console.error("Error al eliminar persona temporal:", error);
      showErrorAlert(
        "Error al eliminar",
        "No se pudo eliminar la persona temporal. Intenta de nuevo."
      );
    }
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
            placeholder="Buscar rol..."
          />
          <div className="flex items-center gap-3">
            <ReportButton
              data={filteredData}
              columns={reportColumns}
              fileName="Personas_Temporales"
            />
            <button
              onClick={() => {
                setEditingWorker(null);
                setModalMode("create");
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
        onDelete={handleDelete}
        onView={handleView}
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
          setModalMode("create");
        }}
        onSave={handleSave}
        worker={editingWorker}
        mode={modalMode}
      />
    </div>
  );
};

export default TemporaryWorkers;
