// SportsCategory.jsx
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

/* ---------- Componentes ---------- */
import Table from "./components/Table/Table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import SportsCategoryModal from "./components/SportsCategoryModal";
import SportsCategoryDetailModal from "./components/SportsCategoryDetailModal";
import AthletesListModal from "./components/AthletesListModal";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";

/* ---------- Hooks ---------- */
import { useSportsCategories } from "./hooks/useSportsCategories";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";

/* ---------- Utilidades ---------- */
import { showErrorAlert, showSuccessAlert } from "../../../../../../../shared/utils/Alerts";

const SportsCategory = () => {
  /* ==================== HOOKS PERSONALIZADOS ==================== */
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

  const { hasPermission } = usePermissions();
  
  // Nombre del módulo en el sistema de permisos
  const MODULE_NAME = "sportsCategory";

  /* ==================== ESTADOS LOCALES ==================== */
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

  /* ==================== EFECTOS ==================== */
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm,
    };
    fetchSportsCategories(params);
  }, [currentPage, rowsPerPage, searchTerm, fetchSportsCategories]);

  useEffect(() => {
    if (currentPage !== 1 && searchTerm) setCurrentPage(1);
  }, [searchTerm]);

  /* ==================== PAGINACIÓN ==================== */
  const totalRows = pagination.total || 0;
  const totalPages = pagination.pages || 0;
  const startIndex = (currentPage - 1) * rowsPerPage;

  const handlePageChange = (page) => setCurrentPage(page);

  /* ==================== OPERACIONES CRUD ==================== */
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

  const handleDelete = async (item) => {
    if (!hasPermission(MODULE_NAME, "Eliminar")) {
      showErrorAlert("Sin permisos", "No tienes permisos para eliminar categorías deportivas");
      return;
    }
    const currentParams = { page: currentPage, limit: rowsPerPage, search: searchTerm };
    await deleteSportsCategory(item, currentParams);
  };

  const handleSave = async (categoryData) => {
    try {
      const currentParams = { page: currentPage, limit: rowsPerPage, search: searchTerm };

      if (isNew) {
        if (!hasPermission(MODULE_NAME, "Crear")) {
          showErrorAlert("Sin permisos", "No tienes permisos para crear categorías deportivas");
          return;
        }
        await createSportsCategory(categoryData, currentParams);
        showSuccessAlert("✅ Categoría creada con éxito");
      } else {
        if (!hasPermission(MODULE_NAME, "Editar")) {
          showErrorAlert("Sin permisos", "No tienes permisos para editar categorías deportivas");
          return;
        }
        await updateSportsCategory(selectedCategory.id, categoryData, currentParams);
        showSuccessAlert("✅ Categoría actualizada con éxito");
      }

      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("❌ Error al guardar categoría:", error);
      const msg = error.response?.data?.message || error.message || "No se pudo guardar la categoría";
      showErrorAlert("Error al guardar", msg);
    }
  };

  /* ==================== ACCIONES DE VISUALIZACIÓN ==================== */
  const handleView = async (item) => {
    if (!hasPermission(MODULE_NAME, "Ver")) {
      showErrorAlert("Sin permisos", "No tienes permisos para ver detalles de categorías deportivas");
      return;
    }
    try {
      const categoryDetails = await getSportsCategoryById(item.id);
      setCategoryToView(categoryDetails);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      showErrorAlert("Error", "No se pudieron cargar los detalles de la categoría");
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
    } catch (error) {
      console.error("Error al cargar atletas:", error);
      showErrorAlert("Error", "No se pudieron cargar los atletas de esta categoría");
    }
  };

  /* ==================== BÚSQUEDA ==================== */
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  /* ==================== RENDERIZADO ==================== */
  return (
    <div className="p-6 font-questrial">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categorías Deportivas
          {!loading && totalRows > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              ({totalRows} {totalRows === 1 ? 'categoría' : 'categorías'})
            </span>
          )}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar categoría..."
              className="w-full"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PermissionGuard module={MODULE_NAME} action="Ver">
              <ReportButton
                data={sportsCategories}
                fileName="CategoriasDeportivas"
                columns={[
                  { header: "Nombre", accessor: "nombre" },
                  { header: "Descripción", accessor: "descripcion" },
                  { header: "Edad Mínima", accessor: "edadMinima" },
                  { header: "Edad Máxima", accessor: "edadMaxima" },
                  { header: "Estado", accessor: "estado" },
                ]}
              />
            </PermissionGuard>

            <PermissionGuard module={MODULE_NAME} action="Crear">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPlus /> Crear Categoría
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Estados especiales */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">⚠ Error al cargar las categorías</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-purple border-r-transparent"></div>
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
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-700 font-medium mb-2">No hay categorías deportivas registradas</p>
          <p className="text-gray-600 mb-6">Comienza creando tu primera categoría deportiva</p>
          <PermissionGuard module={MODULE_NAME} action="Crear">
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-purple text-white rounded-lg hover:opacity-90 transition"
            >
              <FaPlus /> Crear primera categoría
            </button>
          </PermissionGuard>
        </div>
      )}

      {!loading && totalRows > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table
              thead={{ titles: ["Nombre", "Descripción", "Edad mínima", "Edad máxima"] }}
              tbody={{
                data: sportsCategories,
                dataPropertys: ["nombre", "descripcion", "edadMinima", "edadMaxima"],
                state: true,
                stateProperty: "estado",
              }}
              onEdit={hasPermission(MODULE_NAME, "Editar") ? handleEdit : null}
              onDelete={hasPermission(MODULE_NAME, "Eliminar") ? handleDelete : null}
              onView={hasPermission(MODULE_NAME, "Ver") ? handleView : null}
              onList={hasPermission(MODULE_NAME, "Listar") ? handleList : null}
              buttonConfig={{
                edit: () => ({
                  show: hasPermission(MODULE_NAME, "Editar"),
                  disabled: false,
                  title: "Editar categoría",
                }),
                delete: (item) => ({
                  show: hasPermission(MODULE_NAME, "Eliminar"),
                  disabled: item.estado === "Activo",
                  title: item.estado === "Activo" 
                    ? "No se puede eliminar una categoría activa" 
                    : "Eliminar categoría",
                }),
                view: () => ({
                  show: hasPermission(MODULE_NAME, "Ver"),
                  disabled: false,
                  title: "Ver detalles",
                }),
                list: () => ({
                  show: hasPermission(MODULE_NAME, "Listar"),
                  disabled: false,
                  title: "Ver atletas",
                }),
              }}
            />
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              startIndex={startIndex}
            />
          </div>
        </>
      )}

      {/* Modales */}
      {isModalOpen && (
        <SportsCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
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
