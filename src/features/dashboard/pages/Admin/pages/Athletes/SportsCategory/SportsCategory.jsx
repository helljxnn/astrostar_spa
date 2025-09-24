// ================================
// SportsCategory.jsx (ORGANIZADO CON MODAL DE DETALLE)
// ================================
import { useState, useMemo } from "react";
import Table from "./components/table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import SportsCategoryModal from "./components/SportsCategoryModal";
import SportsCategoryDetailModal from "./components/SportsCategoryDetailModal";
import SportsCategoryData from "../../../../../../../shared/models/sportsCategoryData";
import { showSuccessAlert, showDeleteAlert } from "../../../../../../../shared/utils/alerts";
import { FaPlus } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";

const SportsCategory = () => {
  /* =====================
        Estados
  ===================== */
  const [data, setData] = useState(SportsCategoryData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para manejo de edición
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isNew, setIsNew] = useState(true);
  
  // Estados para modal de detalle
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  const rowsPerPage = 8;

  /* =====================
        Filtrado de búsqueda
  ===================== */
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      item.Nombre.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  /* =====================
        Acciones
  ===================== */
  
  // Función para crear nueva categoría
  const handleCreate = () => {
    setSelectedCategory(null);
    setIsNew(true);
    setIsModalOpen(true);
  };

  // Función para editar categoría existente
  const handleEdit = (item) => {
    console.log("Editando categoría:", item);
    setSelectedCategory(item);
    setIsNew(false);
    setIsModalOpen(true);
  };

  // Función para eliminar con SweetAlert2 personalizado
  const handleDelete = async (item) => {
    try {
      const result = await showDeleteAlert(
        "¿Eliminar categoría?",
        `¿Estás seguro de que deseas eliminar la categoría "${item.Nombre}"? Esta acción no se puede deshacer.`,
        {
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        }
      );

      if (result.isConfirmed) {
        // Eliminar la categoría de la lista
        setData((prev) => prev.filter((cat) => {
          if (cat.id && item.id) {
            return cat.id !== item.id;
          }
          return cat.Nombre !== item.Nombre;
        }));
        
        // Mostrar mensaje de éxito
        await showSuccessAlert(
          "Categoría eliminada",
          `La categoría "${item.Nombre}" ha sido eliminada exitosamente.`
        );
        
        console.log("Categoría eliminada:", item);
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  // Función para ver detalle con modal personalizado
  const handleView = (item) => {
    console.log("Ver detalle de:", item);
    setCategoryToView(item);
    setIsDetailModalOpen(true);
  };

  // Función para lista detallada
  const handleList = (item) => {
    console.log("Ver lista detallada de:", item);
    alert(`Lista detallada de: ${item.Nombre}`);
  };

  // Función para guardar (crear o actualizar)
  const handleSave = async (categoryData) => {
    try {
      if (isNew) {
        // Crear nueva categoría
        console.log("Creando nueva categoría:", categoryData);
        setData((prev) => [...prev, categoryData]);
        
        await showSuccessAlert(
          "Categoría creada",
          "La categoría deportiva ha sido registrada exitosamente."
        );
      } else {
        // Actualizar categoría existente
        console.log("Actualizando categoría:", categoryData);
        setData((prev) => 
          prev.map((cat) => {
            if (cat.id && selectedCategory.id) {
              return cat.id === selectedCategory.id ? { ...categoryData, id: selectedCategory.id } : cat;
            }
            return cat.Nombre === selectedCategory.Nombre ? { ...categoryData } : cat;
          })
        );
        
        await showSuccessAlert(
          "Categoría actualizada",
          "La categoría deportiva ha sido actualizada exitosamente."
        );
      }
    } catch (error) {
      console.error("Error al guardar categoría:", error);
    }
  };

  // Función para cerrar modal de edición/creación
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setIsNew(true);
  };

  // Función para cerrar modal de detalle
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setCategoryToView(null);
  };

  /* =====================
        Render
  ===================== */
  return (
    <div className="p-6 font-questrial">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categoría Deportiva
        </h1>

        {/* Buscador + Botones */}
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoría..."
          />

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
              <IoMdDownload size={22} className="text-primary-purple" />
              Generar reporte
            </button>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* Tabla con funciones completas */}
      <Table
        thead={{
          titles: ["Nombre", "Edad mínima", "Edad máxima", "Estado", "Acciones"],
          state: true,
        }}
        tbody={{
          data: filteredData,
          dataPropertys: ["Nombre", "EdadMinima", "EdadMaxima"],
          state: true,
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onList={handleList}
        rowsPerPage={rowsPerPage}
        paginationFrom={8}
      />

      {/* Modal de edición/creación */}
      {isModalOpen && (
        <SportsCategoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          category={selectedCategory}
          isNew={isNew}
        />
      )}

      {/* Modal de detalle */}
      {isDetailModalOpen && (
        <SportsCategoryDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          category={categoryToView}
        />
      )}
    </div>
  );
};

export default SportsCategory;