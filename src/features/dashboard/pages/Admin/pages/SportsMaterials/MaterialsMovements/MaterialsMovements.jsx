﻿import { useState, useEffect, useRef } from "react";
import { FaPlus, FaFilter } from "react-icons/fa";
import MovementModal from "./components/MovementModal";
import MovementViewModal from "./components/MovementViewModal";
import Table from "../../../../../../../shared/components/Table/table";
import SearchInput from "../../../../../../../shared/components/SearchInput";
import ReportButton from "../../../../../../../shared/components/ReportButton";
import PermissionGuard from "../../../../../../../shared/components/PermissionGuard";
import { usePermissions } from "../../../../../../../shared/hooks/usePermissions";
import { useReportDataWithService } from "../../../../../../../shared/hooks/useReportData";
import {
  showSuccessAlert,
  showErrorAlert,
} from "../../../../../../../shared/utils/alerts.js";
import movementsService from "./services/MovementsService";
import { useMovements } from "./hooks/useMovements";
import { formatDate, formatDateTime } from "../shared/utils/stockCalculations";
import { formatStock } from "../../../../../../../shared/utils/numberFormat";
import { getTipoBajaLabel } from "../shared/utils/tipoBajaLabels";
import { PAGINATION_CONFIG } from "../../../../../../../shared/constants/paginationConfig";

const MaterialsMovements = () => {
  const { hasPermission } = usePermissions();
  const {
    movements,
    pagination,
    loadMovements,
    changePage,
  } = useMovements();

  // Hook para obtener datos completos para reportes
  const { getReportData } = useReportDataWithService(
    movementsService.getAllForReport.bind(movementsService)
  );

  // Estado para pestañas
  const [activeTab, setActiveTab] = useState("ingresos"); // 'ingresos' | 'salidas'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const isInitialLoadRef = useRef(true);
  const [filters, setFilters] = useState({
    tipoSalida: "",
    inventarioDestino: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadMovements({
      page: pagination.page,
      limit: pagination.limit,
      search: debouncedSearchTerm,
      tipo: activeTab === "ingresos" ? "entrada" : activeTab === "salidas" ? "salida" : "",
      dateFrom: filters.fechaDesde,
      dateTo: filters.fechaHasta,
      inventarioDestino: activeTab === "ingresos" ? filters.inventarioDestino : "",
      tipoSalida: activeTab === "salidas" ? filters.tipoSalida : "",
      skipLoader: !isInitialLoadRef.current,
    });

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
    }
  }, [
    pagination.page,
    pagination.limit,
    activeTab,
    filters.fechaDesde,
    filters.fechaHasta,
    filters.inventarioDestino,
    filters.tipoSalida,
    debouncedSearchTerm,
    loadMovements,
  ]);

  const displayData = movements;
  const totalRows = pagination.total;

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalRows / pagination.limit));

    if (pagination.page > totalPages) {
      changePage(1);
    }
  }, [pagination.page, pagination.limit, totalRows, changePage]);

  const handleRegister = () => {
    if (!hasPermission("materialsRegistry", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para registrar movimientos",
      );
      return;
    }
    setIsEditing(false);
    setSelectedMovement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (movement) => {
    if (!hasPermission("materialsRegistry", "Editar")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para editar movimientos",
      );
      return;
    }
    setIsEditing(true);
    setSelectedMovement(movement);
    setIsModalOpen(true);
  };

  const handleSave = async (movementData) => {
    if (isEditing) {
      if (!hasPermission("materialsRegistry", "Editar")) {
        showErrorAlert(
          "Sin permisos",
          "No tienes permisos para editar movimientos",
        );
        return false;
      }

      try {
        const response = await movementsService.updateMovement(
          selectedMovement.id,
          movementData,
        );

        if (response.success) {
          showSuccessAlert(
            "Ingreso Actualizado",
            "Los cambios fueron guardados correctamente",
          );
          setIsModalOpen(false);
          setIsEditing(false);
          setSelectedMovement(null);
          loadMovements({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm,
            tipo: activeTab === "ingresos" ? "entrada" : activeTab === "salidas" ? "salida" : "",
            dateFrom: filters.fechaDesde,
            dateTo: filters.fechaHasta,
            inventarioDestino: activeTab === "ingresos" ? filters.inventarioDestino : "",
            tipoSalida: activeTab === "salidas" ? filters.tipoSalida : "",
          });
          return true;
        } else {
          showErrorAlert(
            "Error",
            response.message || "No se pudo actualizar el ingreso",
          );
          return false;
        }
      } catch (error) {
        showErrorAlert(
          "Error",
          error.message || "No se pudo actualizar el ingreso",
        );
        return false;
      }
    } else {
      if (!hasPermission("materialsRegistry", "Editar")) {
        showErrorAlert(
          "Sin permisos",
          "No tienes permisos para registrar movimientos",
        );
        return false;
      }

      try {
        const response = await movementsService.createMovement(movementData);

        if (response.success) {
          showSuccessAlert(
            "Ingreso Registrado",
            "El ingreso de material fue registrado correctamente",
          );
          setIsModalOpen(false);
          loadMovements({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm,
            tipo: activeTab === "ingresos" ? "entrada" : activeTab === "salidas" ? "salida" : "",
            dateFrom: filters.fechaDesde,
            dateTo: filters.fechaHasta,
            inventarioDestino: activeTab === "ingresos" ? filters.inventarioDestino : "",
            tipoSalida: activeTab === "salidas" ? filters.tipoSalida : "",
          });
          return true;
        } else {
          showErrorAlert(
            "Error",
            response.message || "No se pudo registrar el ingreso",
          );
          return false;
        }
      } catch (error) {
        showErrorAlert(
          "Error",
          error.message || "No se pudo registrar el ingreso",
        );
        return false;
      }
    }
  };

  const handleView = (movement) => {
    if (!hasPermission("materialsRegistry", "Ver")) {
      showErrorAlert(
        "Sin permisos",
        "No tienes permisos para ver detalles de movimientos",
      );
      return;
    }
    setSelectedMovement(movement);
    setIsViewModalOpen(true);
  };

  // Preparar datos para tabla de INGRESOS con truncado
  const ingresosTableData = displayData.map((m) => {
    const tipoMovimiento = m.tipoMovimiento || m.tipo_movimiento || "";
    const observaciones = m.observaciones || "";
    const origin = (m.origen || "").toLowerCase();
    const isDonationEntry =
      m.donacionId ||
      m.referenceType === "DONACION" ||
      origin === "donacion" ||
      origin === "donación" ||
      observaciones.toLowerCase().includes("donación") ||
      observaciones.toLowerCase().includes("donacion");

    // Identificar si es un movimiento automático del sistema
    // Incluye: movimientos con tipos específicos O movimientos de reversión detectados por observaciones
    const isSystemMovement =
      [
        "ASIGNACION_EVENTO",
        "REVERSION_ASIGNACION",
        "TRANSFERENCIA",
        "Salida",
        "Baja",
      ].includes(tipoMovimiento) ||
      observaciones.includes("[REVERSION]") ||
      observaciones.includes("Reverted assignment from event") ||
      observaciones.includes("Reversión de asignación al evento") ||
      observaciones.includes("Asignado al evento");

    return {
      ...m,
      fechaFormatted: formatDate(m.fechaIngreso || m.fecha),
      materialNombreTruncated:
        m.materialNombre && m.materialNombre.length > 35
          ? m.materialNombre.substring(0, 35) + "..."
          : m.materialNombre || "",
      categoriaTruncated:
        m.categoria && m.categoria.length > 25
          ? m.categoria.substring(0, 25) + "..."
          : m.categoria || "",
      cantidadFormatted: formatStock(m.cantidad),
      proveedorDisplay: m.proveedor || (isDonationEntry ? "Donación" : "Sin proveedor"),
      isSystemMovement, // Agregar flag para identificar movimientos del sistema
    };
  });

  // Preparar datos para tabla de SALIDAS con truncado
  const salidasTableData = displayData.map((m) => {
    const tipoMovimiento = m.tipoMovimiento || m.tipo_movimiento || "";

    // Determinar el tipo de salida - normalizar todos los valores posibles
    let tipoDisplay = "Otro";

    if (tipoMovimiento === "Baja" || tipoMovimiento === "BAJA" || m.tipo_baja) {
      tipoDisplay = "Baja";
    } else if (tipoMovimiento === "TRANSFERENCIA") {
      tipoDisplay = "Transferencia";
    } else if (
      tipoMovimiento === "SALIDA_EVENTO" ||
      tipoMovimiento === "ASIGNACION_EVENTO"
    ) {
      tipoDisplay = "Salida por Evento";
    } else if (tipoMovimiento === "Salida") {
      tipoDisplay = "Salida";
    }

    return {
      ...m,
      fechaFormatted: formatDate(m.fechaIngreso || m.fecha),
      materialNombreTruncated:
        m.materialNombre && m.materialNombre.length > 35
          ? m.materialNombre.substring(0, 35) + "..."
          : m.materialNombre || "",
      categoriaTruncated:
        m.categoria && m.categoria.length > 25
          ? m.categoria.substring(0, 25) + "..."
          : m.categoria || "",
      cantidadFormatted: formatStock(m.cantidad),
      tipoDisplay,
    };
  });

  // Función para obtener todos los datos para reporte
  const getCompleteReportData = async () => {
    const currentFilters = {
      search: searchTerm,
      tipo: activeTab === "ingresos" ? "entrada" : "salida",
      dateFrom: filters.fechaDesde,
      dateTo: filters.fechaHasta,
      inventarioDestino:
        activeTab === "ingresos" ? filters.inventarioDestino : "",
      tipoSalida: activeTab === "salidas" ? filters.tipoSalida : "",
    };

    return await getReportData(
      currentFilters, // Filtros actuales
      (movements) => movements.map((m) => { // Mapper de datos
        const baseData = {
          fecha: formatDateTime(m.fechaIngreso || m.fecha),
          material: m.materialNombre,
          categoria: m.categoria,
          cantidad: m.cantidad,
          stockAnterior: m.stockAnterior,
          stockNuevo: m.stockNuevo,
        };
        const origin = (m.origen || "").toLowerCase();
        const isDonationEntry =
          m.donacionId ||
          m.referenceType === "DONACION" ||
          origin === "donacion" ||
          origin === "donación" ||
          (m.observaciones || "").toLowerCase().includes("donación") ||
          (m.observaciones || "").toLowerCase().includes("donacion");

        if (activeTab === "ingresos") {
          return {
            ...baseData,
            proveedor: m.proveedor || (isDonationEntry ? "Donación" : "Sin proveedor"),
            destino: m.inventario_destino || m.inventarioDestino || "N/A",
            observaciones: m.observaciones || "N/A",
          };
        } else {
          // Salidas
          const tipoMovimiento = m.tipoMovimiento || m.tipo_movimiento || "";
          let tipo = "Otro";
          let detalles = "";

          if (
            tipoMovimiento === "Baja" ||
            tipoMovimiento === "BAJA" ||
            m.tipo_baja
          ) {
            tipo = "Baja";
            const tipoBaja = getTipoBajaLabel(m.tipo_baja || m.tipoBaja);
            const origen = m.inventario_origen || m.inventarioOrigen || "";
            detalles = `${tipoBaja} - Origen: ${origen} - ${m.descripcion || m.observaciones || "Sin descripción"}`;
          } else if (tipoMovimiento === "TRANSFERENCIA") {
            tipo = "Transferencia";
            const desde = m.inventario_origen || m.inventarioOrigen || "N/A";
            const hacia = m.inventario_destino || m.inventarioDestino || "N/A";
            detalles = `De ${desde} a ${hacia}${m.observaciones ? " - " + m.observaciones : ""}`;
          } else if (
            tipoMovimiento === "SALIDA_EVENTO" ||
            tipoMovimiento === "ASIGNACION_EVENTO"
          ) {
            tipo = "Salida por Evento";
            detalles = m.evento_nombre || m.eventoNombre || "Evento finalizado";
          } else if (tipoMovimiento === "Salida") {
            tipo = "Salida";
            detalles = m.observaciones || "Salida de material";
          }

          return {
            ...baseData,
            tipo,
            detalles,
          };
        }
      })
    );
  };

  return (
    <div className="p-4 sm:p-6 font-montserrat w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Movimientos de Materiales
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                changePage(1);
              }}
              placeholder={`Buscar por fecha, material, categoría${activeTab === "ingresos" ? ", proveedor" : ", tipo"}...`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium transition-all ${
              showFilters
                ? "bg-primary-blue text-white border-primary-blue"
                : "border-gray-300 text-gray-700 hover:border-primary-blue hover:text-primary-blue"
            }`}
          >
            <FaFilter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          <div className="flex flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <PermissionGuard module="materialsRegistry" action="Ver">
              <ReportButton
                dataProvider={getCompleteReportData}
                fileName={`Reporte_${activeTab === "ingresos" ? "Ingresos" : "Salidas"}_Materiales`}
                columns={
                  activeTab === "ingresos"
                    ? [
                        { header: "Fecha", accessor: "fecha" },
                        { header: "Material", accessor: "material" },
                        { header: "Categoría", accessor: "categoria" },
                        { header: "Cantidad", accessor: "cantidad" },
                        { header: "Destino", accessor: "destino" },
                        { header: "Proveedor", accessor: "proveedor" },
                        { header: "Observaciones", accessor: "observaciones" },
                        { header: "Stock Anterior", accessor: "stockAnterior" },
                        { header: "Stock Nuevo", accessor: "stockNuevo" },
                      ]
                    : [
                        { header: "Fecha", accessor: "fecha" },
                        { header: "Material", accessor: "material" },
                        { header: "Categoría", accessor: "categoria" },
                        { header: "Cantidad", accessor: "cantidad" },
                        { header: "Tipo", accessor: "tipo" },
                        { header: "Detalles", accessor: "detalles" },
                        { header: "Stock Anterior", accessor: "stockAnterior" },
                        { header: "Stock Nuevo", accessor: "stockNuevo" },
                      ]
                }
              />
            </PermissionGuard>

            {activeTab === "ingresos" && (
              <PermissionGuard module="materialsRegistry" action="Editar">
                <button
                  onClick={handleRegister}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg shadow hover:bg-primary-purple transition-colors whitespace-nowrap"
                >
                  <FaPlus /> Registrar Ingreso
                </button>
              </PermissionGuard>
            )}
          </div>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
            <button
              onClick={() => {
                setFilters({
                  tipoSalida: "",
                  inventarioDestino: "",
                  fechaDesde: "",
                  fechaHasta: "",
                });
                setShowFilters(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por Rango de Fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => {
                  setFilters({ ...filters, fechaDesde: e.target.value });
                  changePage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => {
                  setFilters({ ...filters, fechaHasta: e.target.value });
                  changePage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              />
            </div>

            {/* Filtro por Inventario Destino (solo ingresos) */}
            {activeTab === "ingresos" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inventario Destino
                </label>
                <select
                  value={filters.inventarioDestino}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      inventarioDestino: e.target.value,
                    });
                    changePage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Todos los destinos</option>
                  <option value="FUNDACION">Fundación</option>
                  <option value="EVENTOS">Eventos</option>
                </select>
              </div>
            )}

            {/* Filtro por Tipo de Salida (solo salidas) */}
            {activeTab === "salidas" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Salida
                </label>
                <select
                  value={filters.tipoSalida}
                  onChange={(e) => {
                    setFilters({ ...filters, tipoSalida: e.target.value });
                    changePage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  <option value="Baja">Baja</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="SALIDA_EVENTO">Salida por Evento</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("ingresos");
            changePage(1);
            setSearchTerm("");
            setFilters({
              tipoSalida: "",
              inventarioDestino: "",
              fechaDesde: "",
              fechaHasta: "",
            });
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "ingresos"
              ? "text-primary-blue border-b-2 border-primary-blue"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Ingresos
        </button>
        <button
          onClick={() => {
            setActiveTab("salidas");
            changePage(1);
            setSearchTerm("");
            setFilters({
              tipoSalida: "",
              inventarioDestino: "",
              fechaDesde: "",
              fechaHasta: "",
            });
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === "salidas"
              ? "text-primary-blue border-b-2 border-primary-blue"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Salidas
        </button>
      </div>

      {/* Tabla de INGRESOS */}
      {activeTab === "ingresos" && (
        <Table
          thead={{
            titles: ["Fecha", "Material", "Categoría", "Cantidad", "Proveedor"],
            state: false,
            actions: true,
          }}
          tbody={{
            data: ingresosTableData,
            dataPropertys: [
              "fechaFormatted",
              "materialNombreTruncated",
              "categoriaTruncated",
              "cantidadFormatted",
              "proveedorDisplay",
            ],
            state: false,
          }}
          onView={hasPermission("materialsRegistry", "Ver") ? handleView : null}
          onEdit={
            hasPermission("materialsRegistry", "Editar") ? handleEdit : null
          }
          buttonConfig={{
            view: () => ({
              show: hasPermission("materialsRegistry", "Ver"),
              disabled: false,
              title: "Ver detalles",
            }),
            edit: (movement) => ({
              show: hasPermission("materialsRegistry", "Editar"),
              disabled: movement.isSystemMovement,
              title: movement.isSystemMovement
                ? "No se pueden editar movimientos automáticos del sistema"
                : "Editar ingreso",
            }),
            delete: () => ({
              show: false,
            }),
          }}
          serverPagination={true}
          currentPage={pagination.page}
          totalRows={totalRows}
          rowsPerPage={pagination.limit}
          onPageChange={changePage}
        />
      )}

      {/* Tabla de SALIDAS */}
      {activeTab === "salidas" && (
        <Table
          thead={{
            titles: ["Fecha", "Material", "Categoría", "Cantidad", "Tipo"],
            state: false,
            actions: true,
          }}
          tbody={{
            data: salidasTableData,
            dataPropertys: [
              "fechaFormatted",
              "materialNombreTruncated",
              "categoriaTruncated",
              "cantidadFormatted",
              "tipoDisplay",
            ],
            state: false,
          }}
          onView={hasPermission("materialsRegistry", "Ver") ? handleView : null}
          buttonConfig={{
            view: () => ({
              show: hasPermission("materialsRegistry", "Ver"),
              disabled: false,
              title: "Ver detalles",
            }),
            edit: () => ({
              show: false,
            }),
            delete: () => ({
              show: false,
            }),
          }}
          serverPagination={true}
          currentPage={pagination.page}
          totalRows={totalRows}
          rowsPerPage={pagination.limit}
          onPageChange={changePage}
        />
      )}

      {/* Modales */}
      <MovementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setSelectedMovement(null);
        }}
        onSave={handleSave}
        movement={isEditing ? selectedMovement : null}
        isEditing={isEditing}
      />

      <MovementViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMovement(null);
        }}
        movement={selectedMovement}
      />
    </div>
  );
};

export default MaterialsMovements;
