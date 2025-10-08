import React, { useState, useMemo } from "react";
import { FaPlus } from "react-icons/fa";

/* ---------- Componentes ---------- */
import Table from "./components/table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
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

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isNew, setIsNew] = useState(true);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  const [isAthletesModalOpen, setIsAthletesModalOpen] = useState(false);
  const [categoryForAthletes, setCategoryForAthletes] = useState(null);
  const [athletesData] = useState(MockAthletesData);

  const rowsPerPage = 5;

  /* ==================== FILTRADO ==================== */
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      item.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

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
    <div className="p-6 font-questrial w-full max-w-full">
      {/* ---------- ENCABEZADO ---------- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categoría Deportiva
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          {/* Buscador */}
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoría..."
            />
          </div>

          {/* Botón de reporte y crear */}
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
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg shadow hover:opacity-90 transition whitespace-nowrap"
            >
              <FaPlus /> Crear
            </button>
          </div>
        </div>
      </div>

      {/* ---------- TABLA ---------- */}
      {filteredData.length > 0 ? (
        <div className="w-full overflow-x-auto bg-white rounded-lg">
          <Table
            thead={{
              titles: [
                "Nombre",
                "Descripción",
                "Edad mínima",
                "Edad máxima",
                "Estado",
                "Acciones",
              ],
              state: true,
            }}
            tbody={{
              data: filteredData, // 🔹 Se pasa todo y Table se encarga de paginar
              dataPropertys: ["Nombre", "Descripcion", "EdadMinima", "EdadMaxima"],
              state: true,
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onList={handleList}
            rowsPerPage={rowsPerPage}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10 py-8 bg-white rounded-2xl shadow border border-gray-200">
          No hay categorías registradas.
        </div>
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
