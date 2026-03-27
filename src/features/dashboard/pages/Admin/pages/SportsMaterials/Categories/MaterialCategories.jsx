import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import CategoryModal from "./components/CategoryModal";
import CategoryViewModal from "./components/CategoryViewModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";
import categoriesService from "../shared/services/CategoriesService";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import ReportButton from "../../../../../../../shared/components/ReportButton";

const MaterialCategories = () => {
  const { hasPermission } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  // Hook para reportes
  const { getReportData } = useReportDataWithService(
    (params) => categoriesService.getAllForReport(params)
  );

  // Detectar si se debe abrir el modal de crear al llegar desde otra página
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setIsModalOpen(true);
      // Limpiar el state para que no se abra de nuevo si se recarga
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm]); // Recargar cuando cambia la página o la búsqueda

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await categoriesService.getCategories({
        page: currentPage,
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: searchTerm, // Enviar búsqueda al backend
      });

      if (response.success) {
        setCategories(response.data || []);
        setTotalRows(response.pagination?.total || response.data?.length || 0);
      }
    } catch (error) {
      setCategories([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Usar datos directamente del backend (ya filtrados y paginados)
  const displayData = categories;

  // Función para obtener datos completos del reporte
  const getCompleteReportData = async () => {
    return await getReportData(
      {
        search: searchTerm,
      },
      (data) => data.map(category => ({
        nombre: category.nombre || '',
        descripcion: category.descripcion || 'Sin descripción',
        estado: category.estado || '',
        materialesAsociados: category.materialsCount || 0,
        fechaCreacion: category.createdAt ? new Date(category.createdAt).toLocaleDateString('es-ES') : '',
      }))
    );
  };

  const handleCreate = () => {
    if (!hasPermission("materialCategories", "Crear")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para crear categorías",
      );
      return;
    }
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    if (!hasPermission("materialCategories", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar categorías",
      );
      return;
    }
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSave = async (categoryData, categoryId = null) => {
    const isEditing = !!categoryId;

    if (!hasPermission("materialCategories", isEditing ? "Editar" : "Crear")) {
      showErrorAlert(
        "Sin permisos",
        `No tienes permisos para ${isEditing ? "editar" : "crear"} categorías`,
      );
      return false;
    }

    try {
      const response = isEditing
        ? await categoriesService.updateCategory(categoryId, categoryData)
        : await categoriesService.createCategory(categoryData);

      if (response.success) {
        showSuccessAlert(
          isEditing ? "Categoría Actualizada" : "Categoría Creada",
          `La categoría "${categoryData.nombre}" fue ${isEditing ? "actualizada" : "creada"} correctamente.`,
        );
        setIsModalOpen(false);
        fetchCategories();
        return true;
      } else {
        showErrorAlert(
          "Error",
          response.message ||
            `No se pudo ${isEditing ? "actualizar" : "crear"} la categoría`,
        );
        return false;
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.message ||
          `Error al ${isEditing ? "actualizar" : "crear"} la categoría en el servidor`,
      );
      return false;
    }
  };

  const handleView = (category) => {
    if (!hasPermission("materialCategories", "Ver")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver detalles de categorías",
      );
      return;
    }
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (category) => {
    if (!hasPermission("materialCategories", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar categorías",
      );
      return;
    }

    // Verificar si tiene materiales asociados
    if (category.materialsCount > 0) {
      showErrorAlert(
        "No se puede eliminar",
        `Esta categoría tiene ${category.materialsCount} material(es) asociado(s). No se puede eliminar.`,
      );
      return;
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará la categoría "${category.nombre}". Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" },
    );

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await categoriesService.deleteCategory(category.id);

      if (response.success) {
        showSuccessAlert(
          "Categoría Eliminada",
          `La categoría "${category.nombre}" fue eliminada correctamente.`,
        );
        fetchCategories();
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo eliminar la categoría",
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.message || "Error al eliminar la categoría en el servidor",
      );
    }
  };

  // Preparar datos para tabla
  const tableData = displayData.map((c) => ({
    ...c,
    nombreTruncated:
      c.nombre.length > 50 ? c.nombre.substring(0, 50) + "..." : c.nombre,
    descripcionTruncated: c.descripcion
      ? c.descripcion.length > 80
        ? c.descripcion.substring(0, 80) + "..."
        : c.descripcion
      : "Sin descripción",
  }));

  return (
    <div className="p-6 font-montserrat">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Categorías de Materiales
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Si hay búsqueda, resetear a página 1 pero no recargar del servidor
                if (!e.target.value) {
                  setCurrentPage(1);
                }
              }}
              placeholder="Buscar categoría"
            />
          </div>

          <PermissionGuard module="materialCategories" action="Ver">
            <ReportButton
              dataProvider={getCompleteReportData}
              fileName="categorias_materiales"
              columns={[
                { header: 'Nombre', accessor: 'nombre' },
                { header: 'Descripción', accessor: 'descripcion' },
                { header: 'Estado', accessor: 'estado' },
                { header: 'Materiales Asociados', accessor: 'materialesAsociados' },
                { header: 'Fecha Creación', accessor: 'fechaCreacion' },
              ]}
            />
          </PermissionGuard>

          <PermissionGuard module="materialCategories" action="Crear">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
            >
              <FaPlus /> Crear
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Tabla */}
      <Table
        serverPagination={true}
        currentPage={currentPage}
        totalRows={totalRows}
        rowsPerPage={PAGINATION_CONFIG.ROWS_PER_PAGE}
        onPageChange={(page) => setCurrentPage(page)}
        thead={{
          titles: ["Nombre", "Descripción", "Materiales"],
          state: true,
          actions: true,
        }}
        tbody={{
          data: tableData,
          dataPropertys: ["nombreTruncated", "descripcionTruncated", "materialsCount"],
          state: true,
          stateMap: {
            Activo: "bg-green-100 text-green-800",
            Inactivo: "bg-red-100 text-red-800",
          },
        }}
        onView={hasPermission("materialCategories", "Ver") ? handleView : null}
        onEdit={
          hasPermission("materialCategories", "Editar") ? handleEdit : null
        }
        onDelete={
          hasPermission("materialCategories", "Eliminar") ? handleDelete : null
        }
        buttonConfig={{
          view: () => ({
            show: hasPermission("materialCategories", "Ver"),
            disabled: false,
            title: "Ver detalles",
          }),
          edit: () => ({
            show: hasPermission("materialCategories", "Editar"),
            disabled: false,
            title: "Editar categoría",
          }),
          delete: (category) => ({
            show: hasPermission("materialCategories", "Eliminar"),
            disabled: category.materialsCount > 0,
            title:
              category.materialsCount > 0
                ? "Tiene materiales asociados"
                : "Eliminar categoría",
          }),
        }}
      />

      {/* Modales */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onSave={handleSave}
        category={selectedCategory}
      />

      <CategoryViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onEdit={handleEdit}
        canEdit={hasPermission("materialCategories", "Editar")}
      />
    </div>
  );
};

export default MaterialCategories;

