import React, { useState, useMemo } from "react";
import { FaPlus, FaList } from "react-icons/fa";

/* ---------- Componentes ---------- */
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import SportsCategoryModal from "./components/SportsCategoryModal";
import SportsCategoryDetailModal from "./components/SportsCategoryDetailModal";
import AthletesListModal from "./components/AthletesListModal";

/* ---------- Datos ---------- */
import SportsCategoryData from "../../../../../../../shared/models/sportsCategoryData";
import MockAthletesData from "../../../../../../../shared/models/AthletesListModalCategory";

/* ---------- Utilidades ---------- */
import {
  showSuccessAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts";

const SportsCategory = () => {
  /* ==================== ESTADOS ==================== */
  const [data, setData] = useState(SportsCategoryData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isNew, setIsNew] = useState(true);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  const [isAthletesModalOpen, setIsAthletesModalOpen] = useState(false);
  const [categoryForAthletes, setCategoryForAthletes] = useState(null);
  const [athletesData] = useState(MockAthletesData);

  /* ==================== FILTRADO ==================== */
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      Object.entries(item).some(([key, value]) => {
        const stringValue = String(value).trim();
        
        // Búsqueda EXACTA para el campo "estado"
        if (key.toLowerCase() === "estado") {
          return stringValue.toLowerCase() === searchTerm.toLowerCase();
        }

        // Búsqueda PARCIAL para todos los demás campos
        return stringValue.toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm]);

  // Paginación
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => setCurrentPage(page);

  /* ==================== CRUD ==================== */
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsNew(true);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedCategory(item);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (item) => {
    const result = await showDeleteAlert(
      "¿Eliminar categoría?",
      `¿Estás seguro de eliminar "${item.Nombre}"?`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" }
    );

    if (result.isConfirmed) {
      setData((prev) => prev.filter((cat) => cat.id !== item.id));
      await showSuccessAlert(
        "Categoría eliminada",
        `"${item.Nombre}" ha sido eliminada.`
      );
    }
  };

  const handleSave = async (categoryData) => {
    if (isNew) {
      setData((prev) => [...prev, { ...categoryData, id: Date.now() }]);
      await showSuccessAlert("Categoría creada", "Se ha registrado la categoría.");
    } else {
      setData((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategory?.id
            ? { ...categoryData, id: cat.id }
            : cat
        )
      );
      await showSuccessAlert(
        "Categoría actualizada",
        "Se ha actualizado la categoría."
      );
    }
    setIsModalOpen(false);
  };

  /* ==================== VISTAS / LISTADOS ==================== */
  const handleView = (item) => {
    setCategoryToView(item);
    setIsDetailModalOpen(true);
  };

  const handleList = (item) => {
    setCategoryForAthletes(item);
    setIsAthletesModalOpen(true);
  };

  const getAthletesByCategory = (categoryName) =>
    athletesData.filter(
      (athlete) =>
        athlete.categoria &&
        athlete.categoria.toLowerCase() === categoryName?.toLowerCase()
    );

  /* ==================== RENDER ==================== */
  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categoría Deportiva
          {totalRows !== data.length && (
            <span className="text-sm text-gray-600 ml-2">
              ({totalRows} de {data.length})
            </span>
          )}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={filteredData}
              fileName="CategoriasDeportivas"
              columns={[
                { header: "Nombre", accessor: "Nombre" },
                { header: "Descripción", accessor: "Descripcion" },
                { header: "Edad Mínima", accessor: "EdadMinima" },
                { header: "Edad Máxima", accessor: "EdadMaxima" },
                { header: "Estado", accessor: "Estado" },
              ]}
            />
            
            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
            >
              <FaPlus /> Crear Categoría
            </button>
          </div>
        </div>
      </div>

      {totalRows === 0 && searchTerm && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <p className="text-gray-600">
            No se encontraron categorías que coincidan con "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-primary-purple hover:text-primary-blue mt-2 font-medium"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {totalRows > 0 && (
        <>
          <Table
            thead={{
              titles: ["Nombre", "Descripción", "Edad mínima", "Edad máxima"],
              state: true,
              actions: true,
            }}
            tbody={{
              data: paginatedData,
              dataPropertys: ["Nombre", "Descripcion", "EdadMinima", "EdadMaxima"],
              state: true,
              stateMap: {
                Activo: "bg-green-100 text-green-800",
                Inactivo: "bg-red-100 text-red-800",
              },
              customActions: (item) => (
                <button
                  onClick={() => handleList(item)}
                  className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                  title="Ver Lista de Deportistas"
                >
                  <FaList />
                </button>
              ),
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            startIndex={startIndex}
          />
        </>
      )}

      {/* ---------- MODALES ---------- */}
      {isModalOpen && (
        <SportsCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          category={selectedCategory}
          isNew={isNew}
        />
      )}

      {isDetailModalOpen && (
        <SportsCategoryDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          category={categoryToView}
        />
      )}

      {isAthletesModalOpen && (
        <AthletesListModal
          isOpen={isAthletesModalOpen}
          onClose={() => setIsAthletesModalOpen(false)}
          category={categoryForAthletes}
          athletes={getAthletesByCategory(categoryForAthletes?.Nombre)}
        />
      )}
    </div>
  );
};

export default SportsCategory;
