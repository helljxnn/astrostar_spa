// SportsCategory.jsx
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";

import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import SportsCategoryModal from "./components/SportsCategoryModal";
import SportsCategoryDetailModal from "./components/SportsCategoryDetailModal";
import AthletesListModal from "./components/AthletesListModal";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import sportsCategoryService from "./services/sportsCategoryService";

import { useSportsCategories } from "./hooks/useSportsCategories";
import {
  showErrorAlert,
  showConfirmAlert,
} from "../../../../../../../shared/utils/alerts.js";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig";

const MODULE_NAME = "sportsCategory";

const parseCount = (value) => {
  if (Array.isArray(value)) return value.length;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getAssociationMeta = (item = {}) => {
  const associations =
    item.associations ?? item.asociaciones ?? item._count ?? {};
  const inscriptions = parseCount(
    item.inscriptionsCount ??
      item.inscripcionesCount ??
      associations.inscriptions ??
      associations.inscripciones ??
      item.inscriptions ??
      item.inscripciones,
  );
  const participants = parseCount(
    item.participantsCount ??
      item.participantesCount ??
      associations.participants ??
      associations.participantes ??
      item.participants ??
      item.participantes,
  );
  const services = parseCount(
    item.servicesCount ??
      item.serviciosCount ??
      item.serviceSportsCategoriesCount ??
      associations.serviceSportsCategories ??
      associations.services ??
      item.serviceSportsCategories,
  );
  const total = inscriptions + participants + services;
  const isAssociated =
    item.isAssociated ??
    item.asociada ??
    item.asociado ??
    item.tieneAsociaciones ??
    total > 0;

  return {
    inscriptions,
    participants,
    services,
    total,
    isAssociated: Boolean(isAssociated),
  };
};

const buildAssociationDetails = (association) => {
  const details = [];
  if (association.inscriptions)
    details.push(`${association.inscriptions} inscripción(es)`);
  if (association.participants)
    details.push(`${association.participants} participante(s)`);
  if (association.services) details.push(`${association.services} evento(s)`);
  return details;
};

const SportsCategory = () => {
  const { hasPermission } = usePermissions();

  // Hook para obtener datos completos para reportes
  const { getReportData } = useReportDataWithService(
    sportsCategoryService.getAllForReport.bind(sportsCategoryService)
  );

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
  const rowsPerPage = PAGINATION_CONFIG.ROWS_PER_PAGE;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isNew, setIsNew] = useState(true);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  const [isAthletesModalOpen, setIsAthletesModalOpen] = useState(false);
  const [categoryForAthletes, setCategoryForAthletes] = useState(null);
  const [athletesData, setAthletesData] = useState([]);

  const canCreate = hasPermission(MODULE_NAME, "Crear");
  const canEdit = hasPermission(MODULE_NAME, "Editar");
  const canDelete = hasPermission(MODULE_NAME, "Eliminar");
  const canView = hasPermission(MODULE_NAME, "Ver");
  const canListAthletes = hasPermission(MODULE_NAME, "Listar deportistas");

  const reportData = sportsCategories.map((cat) => ({
    nombre: cat.nombre || "",
    descripcion: cat.descripcion || "",
    edadMinima: cat.edadMinima ?? "",
    edadMaxima: cat.edadMaxima ?? "",
    estado: cat.estado || "",
    publicar: cat.publicar ? "Si" : "No",
    fechaCreacion: cat.createdAt || "",
    fechaActualizacion: cat.updatedAt || "",
  }));

  // Funciï¿½n para obtener todos los datos para reporte
  const getCompleteReportData = async () => {
    return await getReportData(
      { search: searchTerm }, // Filtros actuales
      (categories) => categories.map((cat) => ({ // Mapper de datos
        nombre: cat.nombre || cat.name || "",
        descripcion: cat.descripcion || cat.description || "",
        edadMinima: cat.edadMinima ?? cat.minAge ?? "",
        edadMaxima: cat.edadMaxima ?? cat.maxAge ?? "",
        estado: cat.estado || cat.status || "",
        publicar: (cat.publicar ?? cat.publish) ? "Si" : "No",
        fechaCreacion: cat.createdAt || "",
        fechaActualizacion: cat.updatedAt || "",
      }))
    );
  };

  const reportColumns = [
    { header: "Nombre", accessor: "nombre" },
    { header: "Descripción", accessor: "descripcion" },
    { header: "Edad mínima", accessor: "edadMinima" },
    { header: "Edad máxima", accessor: "edadMaxima" },
    { header: "Estado", accessor: "estado" },
    { header: "Publicar", accessor: "publicar" },
    { header: "Fecha creación", accessor: "fechaCreacion" },
    { header: "Fecha actualización", accessor: "fechaActualizacion" },
  ];

  // Cargar categorías cuando cambia la página o el término de búsqueda
  useEffect(() => {
    fetchSportsCategories({
      page: currentPage,
      limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
      search: searchTerm, // Enviar búsqueda al backend
    }).catch((err) => {
// El error ya se maneja en el hook, no necesitamos hacer nada aquí
    });
  }, [currentPage, searchTerm, fetchSportsCategories]);

  // Usar datos del servidor directamente (ya vienen filtrados y paginados)
  const totalRows = pagination.total;
  const paginatedData = sportsCategories;

  const getFetchParams = () => {
    return {
      page: currentPage,
      limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
      search: searchTerm,
    };
  };

  const handleCreate = () => {
    if (!canCreate) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para crear categorías deportivas",
      );
      return;
    }
    setSelectedCategory(null);
    setIsNew(true);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    if (!canEdit) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar categorías deportivas",
      );
      return;
    }
    setSelectedCategory(item);
    setIsNew(false);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    fetchSportsCategories(getFetchParams()).catch(() => {});
  };

  const handleDelete = async (item) => {
    if (!canDelete) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar categorías deportivas",
      );
      return;
    }

    const association = getAssociationMeta(item);
    if (association.isAssociated) {
      const details = buildAssociationDetails(association);

      showErrorAlert(
        "No se puede eliminar",
        details.length
          ? `La categoría está asociada a ${details.join(", ")}.`
          : "La categoría está asociada y no puede eliminarse.",
      );
      return;
    }

    try {
      const result = await showConfirmAlert(
        "¿Eliminar categoría?",
        `Se eliminará la categoría "${item.nombre ?? item.name}".`,
        {
          confirmButtonText: "Sí, eliminar",
        },
      );
      if (!result.isConfirmed) return;

      await deleteSportsCategory(item.id, {
        ...getFetchParams(),
      });
    } catch (err) {
}
  };

  const handleView = async (item) => {
    if (!canView) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver detalles de categorías deportivas",
      );
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
    if (!canListAthletes) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para listar deportistas de categorias deportivas",
      );
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
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="p-6 font-montserrat">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categorías Deportivas
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
            <PermissionGuard module={MODULE_NAME} action="Ver">
              <ReportButton
                dataProvider={getCompleteReportData}
                fileName="CategoriasDeportivas"
                columns={reportColumns}
              />
            </PermissionGuard>

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
          <p className="font-medium">Error al cargar categorías</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && totalRows === 0 && searchTerm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <div className="text-6xl mb-4">...</div>
          <p className="text-gray-700 font-medium mb-2">
            No se encontraron categorías
          </p>
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

      {!loading && totalRows === 0 && !searchTerm && (
        <div className="text-center py-12 text-gray-500">
          <p>No hay categorías registradas.</p>
        </div>
      )}

      {!loading && totalRows > 0 && (
        <>
          <Table
            thead={{
                titles: ["Nombre", "Descripción", "Edad mínima", "Edad máxima"],
                state: true,
              }}
            tbody={{
                data: paginatedData,
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
            onEdit={canEdit ? handleEdit : null}
            onDelete={canDelete ? handleDelete : null}
            onView={canView ? handleView : null}
            onList={canListAthletes ? handleList : null}
            buttonConfig={{
                view: () => ({
                  show: canView,
                  disabled: false,
                  title: "Ver detalles de la categoría",
                }),
                edit: () => ({
                  show: canEdit,
                  disabled: false,
                  title: "Editar categoría",
                }),
                delete: (item) => {
                  const association = getAssociationMeta(item);
                  const details = buildAssociationDetails(association);
                  const blocked = association.isAssociated;

                  return {
                    show: canDelete,
                    disabled: blocked,
                    title: blocked
                      ? details.length
                        ? `No se puede eliminar: asociada a ${details.join(", ")}`
                        : "No se puede eliminar: categoría asociada"
                      : "Eliminar categoría",
                  };
                },
              }}
            />
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


