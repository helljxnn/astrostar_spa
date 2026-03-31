import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaPlus,
  FaMinusCircle,
  FaExchangeAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import MaterialModal from "./components/MaterialModal";
import MaterialViewModal from "./components/MaterialViewModal";
import MaterialDischargeModal from "./components/MaterialDischargeModal";
import TransferModal from "./components/TransferModal";
import MaterialAssignmentsModal from "./components/MaterialAssignmentsModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import {
  showSuccessAlert,
  showErrorAlert,
  showDeleteAlert,
} from "../../../../../../../shared/utils/alerts.js";
import { fixMojibake } from "../../../../../../../shared/utils/textEncoding.js";
import materialsService from "./services/MaterialsService";
import { formatNumber } from "../../../../../../../shared/utils/numberFormat";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig";

const MaterialsCatalog = () => {
  const { hasPermission } = usePermissions();

  // Estabilizar la referencia para que useCallback del hook no se recree en cada render
  const getAllForReport = useCallback(
    (params) => materialsService.getAllForReport(params),
    [],
  );

  // Hook para obtener datos completos para reportes
  const { getReportData } = useReportDataWithService(getAllForReport);

  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, searchTerm]); // Recargar cuando cambia la página o la búsqueda

  const fetchMaterials = async () => {
    try {
      setLoading(true);

      const response = await materialsService.getMaterials({
        page: currentPage,
        limit: PAGINATION_CONFIG.ROWS_PER_PAGE,
        search: searchTerm,
      });

      if (response.success) {
        setMaterials(response.data || []);
        const total =
          parseInt(response.pagination?.total) || response.data?.length || 0;
        setTotalRows(total);
      }
    } catch (error) {
      setMaterials([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Usar datos directamente del backend (ya filtrados y paginados)
  const displayData = materials;
  const getOriginalMaterial = (materialLike) =>
    materials.find((m) => m.id === materialLike?.id) || materialLike;

  const handleCreate = () => {
    if (!hasPermission("materials", "Crear")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para crear materiales",
      );
      return;
    }
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (material) => {
    if (!hasPermission("materials", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar materiales",
      );
      return;
    }
    setSelectedMaterial(getOriginalMaterial(material));
    setIsModalOpen(true);
  };

  const handleSave = async (materialData, materialId = null) => {
    const isEditing = !!materialId;

    if (!hasPermission("materials", isEditing ? "Editar" : "Crear")) {
      showErrorAlert(
        "Sin permisos",
        `No tienes permisos para ${isEditing ? "editar" : "crear"} materiales`,
      );
      return false;
    }

    try {
      const response = isEditing
        ? await materialsService.updateMaterial(materialId, materialData)
        : await materialsService.createMaterial(materialData);

      if (response.success) {
        showSuccessAlert(
          isEditing ? "Material Actualizado" : "Material Creado",
          `El material "${materialData.nombre}" fue ${isEditing ? "actualizado" : "creado"} correctamente.`,
        );
        setIsModalOpen(false);
        fetchMaterials();
        return true;
      } else {
        showErrorAlert(
          "Error",
          response.message ||
            `No se pudo ${isEditing ? "actualizar" : "crear"} el material`,
        );
        return false;
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.message ||
          `Error al ${isEditing ? "actualizar" : "crear"} el material en el servidor`,
      );
      return false;
    }
  };

  const handleView = (material) => {
    if (!hasPermission("materials", "Ver")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver detalles de materiales",
      );
      return;
    }
    setSelectedMaterial(getOriginalMaterial(material));
    setIsViewModalOpen(true);
  };

  const handleDelete = async (material) => {
    if (!hasPermission("materials", "Eliminar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para eliminar materiales",
      );
      return;
    }

    // Verificar si tiene stock
    const hasStock = (material.stockTotalNumeric || 0) > 0;

    // Verificar si tiene movimientos históricos
    const hasMovements = material.hasMovements || false;

    if (hasStock) {
      showErrorAlert(
        "No se puede eliminar",
        `Este material tiene stock registrado (${material.stockTotal} unidades). No se puede eliminar.`,
      );
      return;
    }

    if (hasMovements) {
      showErrorAlert(
        "No se puede eliminar",
        'Este material tiene movimientos históricos registrados. Para mantener la integridad del historial, márcalo como "Inactivo" en lugar de eliminarlo.',
      );
      return;
    }

    const confirmResult = await showDeleteAlert(
      "¿Estás seguro?",
      `Se eliminará el material "${material.nombre}". Esta acción no se puede deshacer.`,
      { confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar" },
    );

    if (!confirmResult.isConfirmed) return;

    try {
      const response = await materialsService.deleteMaterial(material.id);

      if (response.success) {
        showSuccessAlert(
          "Material Eliminado",
          `El material "${material.nombre}" fue eliminado correctamente.`,
        );
        fetchMaterials();
      } else {
        showErrorAlert(
          "Error",
          response.message || "No se pudo eliminar el material",
        );
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        error.message || "Error al eliminar el material en el servidor",
      );
    }
  };

  const handleDischarge = (material) => {
    if (!hasPermission("materials", "Registrar Baja de Material")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para registrar bajas de materiales",
      );
      return;
    }
    // Buscar el material original sin formatear
    setSelectedMaterial(getOriginalMaterial(material));
    setIsDischargeModalOpen(true);
  };

  const handleSaveDischarge = async (dischargeData) => {
    if (!hasPermission("materials", "Registrar Baja de Material")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para registrar bajas de materiales",
      );
      return false;
    }

    try {
      const response = await materialsService.registerDischarge(
        selectedMaterial.id,
        dischargeData,
      );

      if (response.success) {
        showSuccessAlert(
          "Baja Registrada",
          `Se registró la baja de ${dischargeData.cantidad} unidades del material "${selectedMaterial.nombre}".`,
        );
        setIsDischargeModalOpen(false);
        fetchMaterials();
        return true;
      } else {
        showErrorAlert(
          "Error",
          fixMojibake(response.message || "No se pudo registrar la baja"),
        );
        return false;
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        fixMojibake(
          error.message || "Error al registrar la baja en el servidor",
        ),
      );
      return false;
    }
  };

  const handleTransfer = (material) => {
    if (!hasPermission("materials", "Transferir Stock")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para transferir stock",
      );
      return;
    }
    setSelectedMaterial(getOriginalMaterial(material));
    setIsTransferModalOpen(true);
  };

  const handleSaveTransfer = async (transferData) => {
    if (!hasPermission("materials", "Transferir Stock")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para transferir stock",
      );
      return false;
    }

    try {
      const response = await materialsService.transferStock(
        selectedMaterial.id,
        transferData,
      );

      if (response.success) {
        showSuccessAlert(
          "Transferencia Exitosa",
          `Se transfirieron ${transferData.cantidad} unidades de "${selectedMaterial.nombre}" desde ${transferData.from === "FUNDACION" ? "Fundación" : "Eventos"} hacia ${transferData.to === "FUNDACION" ? "Fundación" : "Eventos"}.`,
        );
        setIsTransferModalOpen(false);
        fetchMaterials();
        return true;
      } else {
        showErrorAlert(
          "Error",
          fixMojibake(
            response.message || "No se pudo realizar la transferencia",
          ),
        );
        return false;
      }
    } catch (error) {
      showErrorAlert(
        "Error",
        fixMojibake(error.message || "Error al transferir stock"),
      );
      return false;
    }
  };

  const handleViewAssignments = (material) => {
    if (!hasPermission("materials", "Ver Asignaciones del Material")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver asignaciones",
      );
      return;
    }

    setSelectedMaterial(getOriginalMaterial(material));
    setIsAssignmentsModalOpen(true);
  };

  // Preparar datos para tabla con truncado - SIMPLE: 3 columnas
  const tableData = displayData.map((m) => {
    const stockFundacion = m.stockFundacion || 0;
    const stockEventos = m.stockEventos || 0;
    const stockTotal = m.stockTotal || stockFundacion + stockEventos;

    return {
      ...m,
      nombreTruncated:
        m.nombre.length > 30 ? m.nombre.substring(0, 30) + "..." : m.nombre,
      categoriaTruncated:
        m.categoria.length > 30
          ? m.categoria.substring(0, 30) + "..."
          : m.categoria,
      stockFundacionDisplay: formatNumber(stockFundacion),
      stockEventosDisplay: formatNumber(stockEventos),
      stockTotalDisplay: formatNumber(stockTotal),
      // Preservar valores numéricos originales para validaciones
      stockTotalNumeric: stockTotal,
      stockEventosNumeric: stockEventos,
      hasMovements: m.hasMovements,
      movementsCount: m.movementsCount,
      hasActiveAssignments: m.hasActiveAssignments || false,
      activeAssignmentsCount: m.activeAssignmentsCount || 0,
    };
  });

  // Función para obtener todos los datos para reporte
  const getCompleteReportData = async () => {
    return await getReportData(
      { search: searchTerm }, // Filtros actuales
      (materials) =>
        materials.map((m) => {
          // Mapper de datos
          const stockFundacion = m.stockFundacion || 0;
          const stockEventos = m.stockEventos || 0;
          const stockTotal = m.stockTotal || stockFundacion + stockEventos;

          return {
            nombre: m.nombre,
            categoria: m.categoria,
            stockFundacion: stockFundacion,
            stockEventos: stockEventos,
            stockTotal: stockTotal,
            estado: m.estado,
            descripcion: m.descripcion || "N/A",
          };
        }),
    );
  };

  return (
    <div className="p-6 font-montserrat">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Gestión de Materiales
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Siempre volver a la primera página al cambiar búsqueda
                if (currentPage !== 1) {
                  setCurrentPage(1);
                }
              }}
              placeholder="Buscar material"
            />
          </div>

          <div className="flex items-center gap-3">
            <PermissionGuard module="materials" action="Ver">
              <ReportButton
                dataProvider={getCompleteReportData}
                fileName="Reporte_Materiales"
                columns={[
                  { header: "Nombre", accessor: "nombre" },
                  { header: "Categoría", accessor: "categoria" },
                  { header: "Stock Fundación", accessor: "stockFundacion" },
                  { header: "Stock Eventos", accessor: "stockEventos" },
                  { header: "Stock Total", accessor: "stockTotal" },
                  { header: "Estado", accessor: "estado" },
                  { header: "Descripción", accessor: "descripcion" },
                ]}
              />
            </PermissionGuard>

            <PermissionGuard module="materials" action="Crear">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors"
              >
                <FaPlus /> Crear
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table
        thead={{
          titles: ["Nombre", "Categoría", "Fundación", "Eventos", "Total"],
          state: true,
          actions: true,
        }}
        tbody={{
          data: tableData,
          dataPropertys: [
            "nombreTruncated",
            "categoriaTruncated",
            "stockFundacionDisplay",
            "stockEventosDisplay",
            "stockTotalDisplay",
          ],
          state: true,
          stateMap: {
            Activo: "bg-green-100 text-green-800",
            Inactivo: "bg-red-100 text-red-800",
          },
        }}
        onView={hasPermission("materials", "Ver") ? handleView : null}
        onEdit={hasPermission("materials", "Editar") ? handleEdit : null}
        onDelete={hasPermission("materials", "Eliminar") ? handleDelete : null}
        customActions={
          hasPermission("materials", "Ver Asignaciones del Material") ||
          hasPermission("materials", "Transferir Stock") ||
          hasPermission("materials", "Registrar Baja de Material")
            ? [
                {
                  onClick: handleViewAssignments,
                  className:
                    "p-2 rounded-full bg-green-50 border border-green-200 text-green-600 hover:bg-green-100 hover:text-green-700 hover:border-green-300 transition-colors",
                  label: <FaCalendarAlt />,
                  title: "Ver Asignaciones a Eventos",
                  show: () =>
                    hasPermission("materials", "Ver Asignaciones del Material"),
                },
                {
                  onClick: handleTransfer,
                  className:
                    "p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors",
                  label: <FaExchangeAlt />,
                  title: "Transferir Stock",
                  show: () => hasPermission("materials", "Transferir Stock"),
                },
                {
                  onClick: handleDischarge,
                  className:
                    "p-2 rounded-full bg-[#f5ebe8] border border-[#f0e0da] text-[#c3a096] hover:text-[#a88a7f] hover:border-[#e5d5cf] transition-colors",
                  label: <FaMinusCircle />,
                  title: "Registrar Baja",
                  show: () =>
                    hasPermission("materials", "Registrar Baja de Material"),
                },
              ]
            : undefined
        }
        buttonConfig={{
          view: () => ({
            show: hasPermission("materials", "Ver"),
            disabled: false,
            title: "Ver detalles",
          }),
          edit: () => ({
            show: hasPermission("materials", "Editar"),
            disabled: false,
            title: "Editar material",
          }),
          delete: (material) => {
            const hasStock = (material.stockTotalNumeric || 0) > 0;
            const hasMovements = material.hasMovements || false;

            return {
              show: hasPermission("materials", "Eliminar"),
              disabled: hasStock || hasMovements,
              title: hasStock
                ? "Tiene stock registrado"
                : hasMovements
                  ? "Tiene movimientos históricos"
                  : "Eliminar material",
            };
          },
          customActions: {
            0: (material) => {
              // Botón de asignaciones (índice 0 en customActions)
              const hasActiveAssignments =
                material.hasActiveAssignments === true;

              // El botón está habilitado si tiene asignaciones activas
              // (ya sean consumibles o reutilizables)
              const isEnabled = hasActiveAssignments;

              // Mensajes más claros y específicos
              let tooltipMessage = "Ver Asignaciones a Eventos";

              if (!hasActiveAssignments) {
                tooltipMessage = "Sin eventos asignados actualmente";
              }

              return {
                disabled: !isEnabled,
                title: tooltipMessage,
              };
            },
          },
        }}
        serverPagination={true}
        currentPage={parseInt(currentPage)}
        totalRows={parseInt(totalRows)}
        rowsPerPage={PAGINATION_CONFIG.ROWS_PER_PAGE}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Modales */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSave={handleSave}
        material={selectedMaterial}
      />

      <MaterialViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMaterial(null);
        }}
        material={selectedMaterial}
        onEdit={handleEdit}
        canEdit={hasPermission("materials", "Editar")}
      />

      <MaterialDischargeModal
        isOpen={isDischargeModalOpen}
        onClose={() => {
          setIsDischargeModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSave={handleSaveDischarge}
        material={selectedMaterial}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedMaterial(null);
        }}
        onSave={handleSaveTransfer}
        material={selectedMaterial}
      />

      <MaterialAssignmentsModal
        isOpen={isAssignmentsModalOpen}
        onClose={() => {
          setIsAssignmentsModalOpen(false);
          setSelectedMaterial(null);
        }}
        material={selectedMaterial}
      />
    </div>
  );
};

export default MaterialsCatalog;
