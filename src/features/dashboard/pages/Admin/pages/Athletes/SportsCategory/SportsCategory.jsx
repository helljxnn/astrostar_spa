// SportsCategory.jsx
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

import Table from "./components/Table/Table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import SportsCategoryModal from "./components/SportsCategoryModal";
import SportsCategoryDetailModal from "./components/SportsCategoryDetailModal";
import AthletesListModal from "./components/AthletesListModal";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";

import { useSportsCategories } from "./hooks/useSportsCategories";
import { showErrorAlert, showConfirmAlert } from "../../../../../../../shared/utils/Alerts";
import { useMemo } from "react";

const SportsCategory = () => {
  const {
    sportsCategories,
    loading,
    error,
    pagination,
    fetchSportsCategories,
    createSportsCategory,
    updateSportsCategory,
    deleteSportsCategory,
    getSportsCategoryById,
    getAthletesByCategory,
  } = useSportsCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isNew, setIsNew] = useState(true);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  const [isAthletesModalOpen, setIsAthletesModalOpen] = useState(false);
  const [categoryForAthletes, setCategoryForAthletes] = useState(null);
  const [athletesData, setAthletesData] = useState([]);

  const reportData = sportsCategories.map((cat) => ({
    nombre: cat.nombre || "",
    descripcion: cat.descripcion || "",
    edadMinima: cat.edadMinima ?? "",
    edadMaxima: cat.edadMaxima ?? "",
    estado: cat.estado || "",
    publicar: cat.publicar ? "Si" : "No",
    archivo: cat.archivo || "",
    fechaCreacion: cat.createdAt || "",
    fechaActualizacion: cat.updatedAt || "",
  }));

  const reportColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Descripción", accessor: "descripcion" },
    { header: "Edad mínima", accessor: "edadMinima" },
    { header: "Edad máxima", accessor: "edadMaxima" },
    { header: "Estado", accessor: "estado" },
    { header: "Publicar", accessor: "publicar" },
    { header: "Imagen/Archivo", accessor: "archivo" },
    { header: "Fecha creación", accessor: "fechaCreacion" },
    { header: "Fecha actualización", accessor: "fechaActualizacion" },
  ];

  // fetch inicial
  useEffect(() => {
    fetchSportsCategories({
      page: currentPage,
      limit: (searchTerm || "").trim() ? 1000 : rowsPerPage, // si hay búsqueda, traer más para filtrar local
      search: searchTerm?.trim() || "",
    }).catch((err) => console.error("fetch error:", err));
  }, [currentPage, rowsPerPage, searchTerm, fetchSportsCategories]);

  useEffect(() => {
    if (searchTerm) setCurrentPage(1);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) return sportsCategories;
    return sportsCategories.filter((cat) => {
      const name = (cat.nombre || cat.name || "").toString().toLowerCase();
      const desc = (cat.descripcion || cat.description || "").toString().toLowerCase();
      const estado = (cat.estado || cat.status || "").toString().toLowerCase();
      return (
        name.includes(term) ||
        desc.includes(term) ||
        estado.includes(term)
      );
    });
  }, [sportsCategories, searchTerm]);

  const displayData = filteredData;
  const totalRows = displayData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalRows);

  const handleCreate = () => {
    if (!hasPermission(MODULE_NAME, "Crear")) {
      showErrorAlert("Sin permisos", "No tienes permisos para crear categorías deportivas");
      return;
    }
    setSelectedCategory(null);
    setIsNew(true);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    if (!hasPermission(MODULE_NAME, "Editar")) {
      showErrorAlert("Sin permisos", "No tienes permisos para editar categorías deportivas");
      return;
    }
    setSelectedCategory(item);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    fetchSportsCategories({ page: currentPage, limit: rowsPerPage, search: searchTerm }).catch(() => {});
  };

  const handleDelete = async (item) => {
    try {
      const result = await showConfirmAlert("¿Eliminar categoría?", `Se eliminará la categoría "${item.nombre ?? item.name}".`, {
        confirmButtonText: "Sí, eliminar",
      });
      if (!result.isConfirmed) return;

      await deleteSportsCategory(item.id, {
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      });
    } catch (err) {
      console.error("delete error:", err);
    }
  };

  const handleView = async (item) => {
    if (!hasPermission(MODULE_NAME, "Ver")) {
      showErrorAlert("Sin permisos", "No tienes permisos para ver detalles de categorías deportivas");
      return;
    }
    try {
      const details = await getSportsCategoryById(item.id);
      setCategoryToView(details);
      setIsDetailModalOpen(true);
    } catch (err) {
      showErrorAlert("Error", "No se pudieron cargar los detalles");
    }
  };

  const handleList = async (item) => {
    if (!hasPermission(MODULE_NAME, "Listar")) {
      showErrorAlert("Sin permisos", "No tienes permisos para listar atletas de categorías deportivas");
      return;
    }
    try {
      const athletes = await getAthletesByCategory(item.id);
      setCategoryForAthletes(item);
      setAthletesData(athletes || []);
      setIsAthletesModalOpen(true);
    } catch (err) {
      showErrorAlert("Error", "No se pudieron cargar los atletas");
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="p-6 font-questrial">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categorías Deportivas{" "}
          {!loading && totalRows > 0 && (
            <span className="text-sm text-gray-600 ml-2">({totalRows})</span>
          )}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar categoría..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <ReportButton
              data={reportData}
              fileName="CategoriasDeportivas"
              columns={reportColumns}
            />

            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus /> Crear Categoría
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">⚠ Error al cargar categorías</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando categorías...</p>
        </div>
      )}

      {!loading && totalRows === 0 && searchTerm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-700 font-medium mb-2">No se encontraron categorías</p>
          <p className="text-gray-600 mb-4">No hay resultados para "{searchTerm}"</p>
          <button
            onClick={handleClearSearch}
            className="text-primary-purple hover:text-primary-blue font-medium underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {!loading && totalRows === 0 && !searchTerm && (
        <div className="text-center py-12 text-gray-500">
          <p>No hay categorías registradas.</p>
        </div>
      )}

      {!loading && totalRows > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table
              thead={{
                titles: [
                  "Nombre",
                  "Descripción",
                  "Edad mínima",
                  "Edad máxima",
                ],
              }}
              tbody={{
                data: displayData,
                dataPropertys: [
                  "nombre",
                  "descripcion",
                  "edadMinima",
                  "edadMaxima",
                ],
                state: true,
                stateProperty: "estado",
              }}
              rowsPerPage={rowsPerPage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onList={handleList}
            />
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        </>
      )}

      {isModalOpen && (
        <SportsCategoryModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          category={selectedCategory}
          isNew={isNew}
        />
      )}

      {isDetailModalOpen && categoryToView && (
        <SportsCategoryDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setCategoryToView(null);
          }}
          category={categoryToView}
        />
      )}

      {isAthletesModalOpen && categoryForAthletes && (
        <AthletesListModal
          isOpen={isAthletesModalOpen}
          onClose={() => {
            setIsAthletesModalOpen(false);
            setCategoryForAthletes(null);
            setAthletesData([]);
          }}
          category={categoryForAthletes}
          athletes={athletesData}
        />
      )}
    </div>
  );
};

export default SportsCategory;
