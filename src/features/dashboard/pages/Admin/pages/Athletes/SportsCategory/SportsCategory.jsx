import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

/* ========================================================== */
/* IMPORTS - COMPONENTES */
/* ========================================================== */
import Table from "./components/Table/Table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import Pagination from "../../../../../../../shared/components/Table/Pagination";
import SportsCategoryModal from "./components/SportsCategoryModal";
import SportsCategoryDetailModal from "./components/SportsCategoryDetailModal";
import AthletesListModal from "./components/AthletesListModal";

/* ========================================================== */
/* IMPORTS - HOOKS */
/* ========================================================== */
import { useSportsCategories } from "./hooks/useSportsCategories";

/* ========================================================== */
/* IMPORTS - UTILIDADES */
/* ========================================================== */
import {
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/Alerts";

/* ========================================================== */
/* COMPONENTE PRINCIPAL */
/* ========================================================== */
const SportsCategory = () => {
  /* ========================================================== */
  /* HOOKS Y ESTADO */
  /* ========================================================== */
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

  // Estados de búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Estados del modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isNew, setIsNew] = useState(true);

  // Estados del modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  // Estados del modal de atletas
  const [isAthletesModalOpen, setIsAthletesModalOpen] = useState(false);
  const [categoryForAthletes, setCategoryForAthletes] = useState(null);
  const [athletesData, setAthletesData] = useState([]);

  /* ========================================================== */
  /* EFECTOS */
  /* ========================================================== */
  
  // Cargar categorías al cambiar página, búsqueda o límite
  useEffect(() => {
    fetchSportsCategories({
      page: currentPage,
      limit: rowsPerPage,
      search: searchTerm,
    });
  }, [currentPage, rowsPerPage, searchTerm, fetchSportsCategories]);

  // Resetear página al buscar
  useEffect(() => {
    if (currentPage !== 1 && searchTerm) setCurrentPage(1);
  }, [searchTerm]);

  /* ========================================================== */
  /* VARIABLES CALCULADAS */
  /* ========================================================== */
  const totalRows = pagination.total || 0;
  const totalPages = pagination.pages || 0;
  const startIndex = (currentPage - 1) * rowsPerPage;

  /* ========================================================== */
  /* HANDLERS - MODAL CREAR/EDITAR */
  /* ========================================================== */
  
  /**
   * Abre el modal para crear una nueva categoría
   */
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsNew(true);
    setIsModalOpen(true);
  };

  /**
   * Abre el modal para editar una categoría existente
   */
  const handleEdit = (item) => {
    setSelectedCategory(item);
    setIsNew(false);
    setIsModalOpen(true);
  };

  /**
   * Guarda la categoría (crear o actualizar)
   * Las alertas de éxito/error se manejan en useSportsCategories
   */
  const handleSave = async (formData) => {
    try {
      const params = { 
        page: currentPage, 
        limit: rowsPerPage, 
        search: searchTerm 
      };

      if (isNew) {
        // Crear nueva categoría
        await createSportsCategory(formData, params);
        
        // Volver a página 1 para ver la nueva categoría
        setCurrentPage(1);
      } else {
        // Actualizar categoría existente
        await updateSportsCategory(selectedCategory.id, formData, params);
      }

      // Cerrar modal solo si fue exitoso
      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      // El error ya se maneja en useSportsCategories o SportsCategoryModal
      // No mostrar alerta duplicada aquí
    }
  };

  /* ========================================================== */
  /* HANDLERS - ELIMINAR */
  /* ========================================================== */
  
  /**
   * Elimina una categoría con confirmación
   */
  const handleDelete = async (item) => {
    const params = { 
      page: currentPage, 
      limit: rowsPerPage, 
      search: searchTerm 
    };
    
    // deleteSportsCategory ya maneja la confirmación y alertas
    await deleteSportsCategory(item.id, params);
  };

  /* ========================================================== */
  /* HANDLERS - VER DETALLE */
  /* ========================================================== */
  
  /**
   * Abre el modal con los detalles de una categoría
   */
  const handleView = async (item) => {
    try {
      const details = await getSportsCategoryById(item.id);
      setCategoryToView(details);
      setIsDetailModalOpen(true);
    } catch {
      showErrorAlert("Error", "No se pudieron cargar los detalles");
    }
  };

  /* ========================================================== */
  /* HANDLERS - LISTAR ATLETAS */
  /* ========================================================== */
  
  /**
   * Abre el modal con los atletas de una categoría
   */
  const handleList = async (item) => {
    try {
      const athletes = await getAthletesByCategory(item.id);
      setCategoryForAthletes(item);
      setAthletesData(athletes || []);
      setIsAthletesModalOpen(true);
    } catch {
      showErrorAlert("Error", "No se pudieron cargar los atletas");
    }
  };

  /* ========================================================== */
  /* HANDLERS - BÚSQUEDA */
  /* ========================================================== */
  
  /**
   * Maneja el cambio en el campo de búsqueda
   */
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  /**
   * Limpia la búsqueda y resetea la página
   */
  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  /* ========================================================== */
  /* RENDERIZADO */
  /* ========================================================== */
  return (
    <div className="p-6 font-questrial">
      {/* ============================================ */}
      {/* HEADER CON BÚSQUEDA Y BOTONES */}
      {/* ============================================ */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categorías Deportivas{" "}
          {!loading && totalRows > 0 && (
            <span className="text-sm text-gray-600 ml-2">({totalRows})</span>
          )}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscador */}
          <div className="sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar categoría..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Botón de reportes */}
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

            {/* Botón crear categoría */}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus /> Crear Categoría
            </button>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MENSAJE DE ERROR */}
      {/* ============================================ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">⚠ Error al cargar categorías</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* LOADING SPINNER */}
      {/* ============================================ */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando categorías...</p>
        </div>
      )}

      {/* ============================================ */}
      {/* MENSAJE: NO HAY RESULTADOS DE BÚSQUEDA */}
      {/* ============================================ */}
      {!loading && totalRows === 0 && searchTerm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-700 font-medium mb-2">No se encontraron categorías</p>
          <p className="text-gray-600 mb-4">
            No hay resultados para "{searchTerm}"
          </p>
          <button
            onClick={handleClearSearch}
            className="text-primary-purple hover:text-primary-blue font-medium underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* MENSAJE: NO HAY CATEGORÍAS REGISTRADAS */}
      {/* ============================================ */}
      {!loading && totalRows === 0 && !searchTerm && (
        <div className="text-center py-12 text-gray-500">
          <p>No hay categorías registradas.</p>
        </div>
      )}

      {/* ============================================ */}
      {/* TABLA DE CATEGORÍAS */}
      {/* ============================================ */}
      {!loading && totalRows > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <Table
              thead={{ 
                titles: ["Nombre", "Descripción", "Edad mínima", "Edad máxima"] 
              }}
              tbody={{
                data: sportsCategories,
                dataPropertys: ["nombre", "descripcion", "edadMinima", "edadMaxima"],
                state: true,
                stateProperty: "estado",
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onList={handleList}
            />
          </div>

          {/* Paginación */}
          <div className="mt-6">
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
      )}

      {/* ============================================ */}
      {/* MODALES */}
      {/* ============================================ */}
      
      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <SportsCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          category={selectedCategory}
          isNew={isNew}
        />
      )}

      {/* Modal Detalle */}
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

      {/* Modal Atletas */}
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